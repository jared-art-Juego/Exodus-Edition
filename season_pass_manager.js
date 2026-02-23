/**
 * VECTOR EXODUS - Season Pass System
 * Niveles 1-50 con XP, recompensas exclusivas
 * Modular, almacenamiento local
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_season_v1';
    const MAX_SEASON_LEVEL = 50;
    const XP_PER_LEVEL_BASE = 100;
    
    /**
     * Tabla de recompensas por nivel
     */
    const SEASON_REWARDS = {
        5: { type: 'cosmetic', category: 'trail', id: 'clean', name: 'Clean Trail' },
        10: { type: 'cosmetic', category: 'shot', id: 'plasma', name: 'Plasma Shot' },
        15: { type: 'cosmetic', category: 'thruster', id: 'red', name: 'Red Thruster' },
        20: { type: 'music', id: 'alt_boss_1', name: 'Alternative Boss Theme' },
        25: { type: 'cosmetic', category: 'trail', id: 'reactor', name: 'Reactor Trail' },
        30: { type: 'death_effect', id: 'supernova', name: 'Supernova Death IFX' },
        35: { type: 'cosmetic', category: 'shot', id: 'electric', name: 'Electric Shot' },
        40: { type: 'cosmetic', category: 'idle', id: 'pulse', name: 'Pulse Idle' },
        45: { type: 'music', id: 'alt_sector_6', name: 'Sector 6 Alternate Soundtrack' },
        50: { type: 'cosmetic', category: 'trail', id: 'glitch', name: 'Glitch Trail (Legendary)' }
    };

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    const SeasonPassManager = {
        game: null,
        data: {
            currentLevel: 1,
            currentXp: 0,
            totalXp: 0,
            unlockedRewards: new Set(),
            claimedRewards: new Set(),
            seasonNumber: 1,
            maxSeason: 1
        },

        init(game) {
            try {
                this.game = game;
                const saved = load();
                
                if (saved) {
                    this.data = {
                        ...saved,
                        unlockedRewards: new Set(saved.unlockedRewards || []),
                        claimedRewards: new Set(saved.claimedRewards || [])
                    };
                } else {
                    this.data.maxSeason = 1;
                    this.save();
                }

                this._patchGame();
            } catch (e) {
                console.error('[SeasonPassManager] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Patch bossDefeated para agregar XP
            const origBossDefeated = g.bossDefeated && g.bossDefeated.bind(g);
            if (origBossDefeated) {
                g.bossDefeated = () => {
                    self.addXp(500); // 500 XP al derrotar jefe
                    origBossDefeated();
                };
            }

            // Patch checkWaveProgress para completar sector
            const origCheckWave = g.checkWaveProgress && g.checkWaveProgress.bind(g);
            if (origCheckWave) {
                g.checkWaveProgress = () => {
                    origCheckWave();
                    // XP al completar sector (detectar cuando se cambia de sector)
                    if (g.sector > (g._lastSeasonSector || 0)) {
                        self.addXp(300); // 300 XP por sector
                    }
                    g._lastSeasonSector = g.sector;
                };
            }
        },

        /**
         * Agrega XP y maneja level ups
         */
        addXp(amount) {
            try {
                if (!amount || amount < 0) return;

                this.data.currentXp += amount;
                this.data.totalXp += amount;

                // Calcular XP requerido para siguiente nivel
                const xpNeeded = this._getXpForLevel(this.data.currentLevel + 1);

                // Level up
                while (this.data.currentXp >= xpNeeded && this.data.currentLevel < MAX_SEASON_LEVEL) {
                    this.data.currentXp -= xpNeeded;
                    this.data.currentLevel += 1;
                    this._onLevelUp();
                }

                this.save();
            } catch (e) {
                console.error('[SeasonPassManager] addXp error:', e);
            }
        },

        /**
         * Calcula XP requerido para un nivel
         */
        _getXpForLevel(level) {
            // Escala cuadrática: cada nivel cuesta más
            return Math.floor(XP_PER_LEVEL_BASE * level * (level * 0.5 + 1));
        },

        /**
         * Manejador de level up
         */
        _onLevelUp() {
            try {
                const level = this.data.currentLevel;
                
                // Mostrar notificación
                console.log(`🎉 SEASON LEVEL UP: ${level}/${MAX_SEASON_LEVEL}`);

                // Verificar si hay recompensa a desbloquear
                if (SEASON_REWARDS[level]) {
                    this.data.unlockedRewards.add(level);
                    this._showRewardUnlock(level);
                }
            } catch (e) {
                console.error('[SeasonPassManager] _onLevelUp error:', e);
            }
        },

        /**
         * Muestra overlay de recompensa desbloqueada
         */
        _showRewardUnlock(level) {
            try {
                const reward = SEASON_REWARDS[level];
                if (!reward) return;

                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 500;
                    font-family: 'Orbitron', monospace;
                    animation: fadeInScale 0.5s ease-out;
                `;

                const content = document.createElement('div');
                content.style.cssText = `
                    text-align: center;
                    color: #00bfff;
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-shadow: 0 0 20px #00bfff;
                `;

                content.innerHTML = `
                    <div style="font-size: 3rem; margin-bottom: 20px;">🎁</div>
                    <div>SEASON LEVEL ${level}</div>
                    <div style="font-size: 0.9rem; margin-top: 10px; color: #00ff88;">${reward.name}</div>
                    <div style="font-size: 0.7rem; margin-top: 20px; color: #666;">Click para continuar</div>
                `;

                overlay.appendChild(content);
                document.body.appendChild(overlay);

                // Auto-remove después de 4 segundos o con click
                const remove = () => {
                    overlay.style.animation = 'fadeOutScale 0.3s ease-out';
                    setTimeout(() => overlay.remove(), 300);
                };

                setTimeout(remove, 4000);
                overlay.onclick = remove;

                // Agregar animación CSS si no existe
                if (!document.getElementById('season-animations')) {
                    const style = document.createElement('style');
                    style.id = 'season-animations';
                    style.textContent = `
                        @keyframes fadeInScale {
                            from { opacity: 0; transform: scale(0.8); }
                            to { opacity: 1; transform: scale(1); }
                        }
                        @keyframes fadeOutScale {
                            from { opacity: 1; transform: scale(1); }
                            to { opacity: 0; transform: scale(0.8); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } catch (e) {
                console.error('[SeasonPassManager] _showRewardUnlock error:', e);
            }
        },

        /**
         * Obtiene progreso visual para HUD
         */
        getProgressInfo() {
            const xpNeeded = this._getXpForLevel(this.data.currentLevel + 1);
            const progressPercent = Math.floor((this.data.currentXp / xpNeeded) * 100);

            return {
                level: this.data.currentLevel,
                maxLevel: MAX_SEASON_LEVEL,
                currentXp: this.data.currentXp,
                xpNeeded: xpNeeded,
                progressPercent: progressPercent,
                isMaxLevel: this.data.currentLevel >= MAX_SEASON_LEVEL
            };
        },

        /**
         * Obtiene recompensas desbloqueadas pero no reclamadas
         */
        getUnclaimedRewards() {
            const unclaimed = [];
            for (const level of this.data.unlockedRewards) {
                if (!this.data.claimedRewards.has(level) && SEASON_REWARDS[level]) {
                    unclaimed.push({
                        level: level,
                        ...SEASON_REWARDS[level]
                    });
                }
            }
            return unclaimed;
        },

        /**
         * Reclama una recompensa
         */
        claimReward(level) {
            try {
                if (!this.data.unlockedRewards.has(level)) return false;
                if (this.data.claimedRewards.has(level)) return false;

                const reward = SEASON_REWARDS[level];
                if (!reward) return false;

                this.data.claimedRewards.add(level);

                // Aplicar recompensa según tipo
                if (reward.type === 'cosmetic' && this.game.cosmetics) {
                    this.game.cosmetics.owned[reward.category].push(reward.id);
                    this.game.cosmetics.save();
                }

                this.save();
                console.log(`✓ Recompensa reclamada: ${reward.name}`);
                return true;
            } catch (e) {
                console.error('[SeasonPassManager] claimReward error:', e);
                return false;
            }
        },

        /**
         * Renderiza batalla visual del pase
         */
        renderSeasonPass(containerId) {
            try {
                const cont = document.getElementById(containerId);
                if (!cont) return;

                const info = this.getProgressInfo();
                const unclaimed = this.getUnclaimedRewards();

                let html = `
                    <div style="padding: 20px; color: #00bfff; font-family: 'Orbitron', monospace;">
                        <div style="font-size: 1.5rem; margin-bottom: 20px; font-weight: bold;">
                            🎟 SEASON PASS - Nivel ${info.level}/${info.maxLevel}
                        </div>
                        <div style="margin-bottom: 10px; font-size: 0.9rem;">
                            XP: ${info.currentXp}/${info.xpNeeded}
                        </div>
                        <div style="background: #111; border: 1px solid #00bfff; height: 20px; position: relative; margin-bottom: 20px;">
                            <div style="background: linear-gradient(90deg, #00bfff, #00ff88); height: 100%; width: ${info.progressPercent}%; transition: width 0.3s;"></div>
                            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #000; font-weight: bold;">
                                ${info.progressPercent}%
                            </div>
                        </div>
                `;

                // Mostrar recompensas disponibles
                if (unclaimed.length > 0) {
                    html += `
                        <div style="background: #1a1a1a; border: 1px solid #ff6600; padding: 10px; margin: 10px 0; border-radius: 4px;">
                            <div style="color: #ff6600; margin-bottom: 10px; font-weight: bold;">🎁 RECOMPENSAS DISPONIBLES (${unclaimed.length})</div>
                    `;
                    for (const reward of unclaimed) {
                        html += `
                            <div style="background: #0a0a0a; padding: 8px; margin: 5px 0; border-radius: 3px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 0.8rem; color: #00ff88;">Nivel ${reward.level}</div>
                                    <div style="font-size: 0.9rem;">${reward.name}</div>
                                </div>
                                <button onclick="window.Game.seasonPass.claimReward(${reward.level}); window.Game.renderCosmetics();" style="background: #00ff88; color: #000; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-weight: bold;">RECLAMAR</button>
                            </div>
                        `;
                    }
                    html += '</div>';
                }

                // Mostrar todos los niveles disponibles
                html += `
                    <div style="margin-top: 20px;">
                        <div style="color: #00bfff; margin-bottom: 10px; font-weight: bold;">📊 LÍNEA DE RECOMPENSAS</div>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                `;

                for (let i = 5; i <= MAX_SEASON_LEVEL; i += 5) {
                    const reward = SEASON_REWARDS[i];
                    const isUnlocked = this.data.unlockedRewards.has(i);
                    const isClaimed = this.data.claimedRewards.has(i);
                    const isUnder = i <= info.level;

                    const bgColor = isClaimed ? '#00ff88' : (isUnlocked ? '#ff6600' : (isUnder ? '#00bfff' : '#333'));
                    const textColor = isClaimed || isUnlocked ? '#000' : '#999';

                    html += `
                        <div style="
                            background: ${bgColor};
                            border: 1px solid ${bgColor};
                            border-radius: 4px;
                            padding: 10px;
                            text-align: center;
                            font-size: 0.8rem;
                            color: ${textColor};
                            font-weight: bold;
                            cursor: pointer;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Nivel ${i}
                        </div>
                    `;
                }

                html += '</div></div></div>';
                cont.innerHTML = html;
            } catch (e) {
                console.error('[SeasonPassManager] renderSeasonPass error:', e);
            }
        },

        save() {
            const data = {
                currentLevel: this.data.currentLevel,
                currentXp: this.data.currentXp,
                totalXp: this.data.totalXp,
                unlockedRewards: Array.from(this.data.unlockedRewards),
                claimedRewards: Array.from(this.data.claimedRewards),
                seasonNumber: this.data.seasonNumber,
                maxSeason: this.data.maxSeason
            };
            save(data);
        }
    };

    window.SeasonPassManager = SeasonPassManager;
})();
