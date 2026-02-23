/**
 * VECTOR EXODUS - Season 2 & Extreme Mode Manager
 * Gestiona desbloqueo de Season 2 y Extreme Mode
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_game_modes_v1';

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    const GameModesManager = {
        game: null,
        
        // Season 2
        season2Unlocked: false,
        season2Active: false,
        
        // Extreme Mode
        extremeModeUnlocked: false,
        extremeModeActive: false,
        
        // Progreso
        sectorsCompleted: 0,
        allSectorsCompleted: false,

        init(game) {
            try {
                this.game = game;
                const saved = load();
                
                this.season2Unlocked = saved.season2Unlocked || false;
                this.extremeModeUnlocked = saved.extremeModeUnlocked || false;
                this.season2Active = saved.season2Active || false;
                this.extremeModeActive = saved.extremeModeActive || false;
                this.sectorsCompleted = saved.sectorsCompleted || 0;

                this._patchGame();
                this._updateMenuOptions();
            } catch (e) {
                console.error('[GameModesManager] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Detectar cuando se completa todos los sectores
            const origBossDefeated = g.bossDefeated && g.bossDefeated.bind(g);
            if (origBossDefeated) {
                g.bossDefeated = () => {
                    if (g.sector === 6) {
                        self.sectorsCompleted = 6;
                        self.allSectorsCompleted = true;
                        self._checkUnlocks();
                    }
                    origBossDefeated();
                };
            }
        },

        /**
         * Verifica qué se desbloqueó
         */
        _checkUnlocks() {
            try {
                if (this.allSectorsCompleted) {
                    if (!this.season2Unlocked) {
                        this.season2Unlocked = true;
                        this._showSeason2Unlock();
                    }
                    
                    // Extreme mode se desbloquea después de completar Season 1
                    if (!this.extremeModeUnlocked) {
                        this.extremeModeUnlocked = true;
                        this._showExtremeModeUnlock();
                    }
                }
                
                this.save();
                this._updateMenuOptions();
            } catch (e) {
                console.error('[GameModesManager] _checkUnlocks error:', e);
            }
        },

        /**
         * Muestra notificación de Season 2 desbloqueada
         */
        _showSeason2Unlock() {
            try {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 300;
                    font-family: 'Orbitron', monospace;
                `;

                const content = document.createElement('div');
                content.style.cssText = `
                    text-align: center;
                    color: #00bfff;
                    animation: scaleIn 0.5s ease-out;
                `;

                content.innerHTML = `
                    <div style="font-size: 2rem; margin-bottom: 20px;">🌌</div>
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 10px;">SEASON 2 UNLOCKED</div>
                    <div style="font-size: 1.1rem; color: #00ff88; margin-bottom: 20px; letter-spacing: 2px;">THE OPENING</div>
                    <div style="font-size: 0.9rem; color: #666; line-height: 1.6; max-width: 400px; margin: 0 auto; margin-bottom: 30px;">
                        New transmission detected from beyond the sealed gateway.<br/>
                        Something is awakening on the other side.<br/>
                        Prepare for Season 2.
                    </div>
                    <button onclick="this.parentElement.parentElement.remove();" style="
                        background: #00bfff;
                        border: none;
                        color: #000;
                        padding: 10px 30px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 5px;
                        font-family: 'Orbitron', monospace;
                    ">CONTINUE</button>
                `;

                overlay.appendChild(content);
                document.body.appendChild(overlay);

                // Agregar animación
                if (!document.getElementById('modes-animations')) {
                    const style = document.createElement('style');
                    style.id = 'modes-animations';
                    style.textContent = `
                        @keyframes scaleIn {
                            from { opacity: 0; transform: scale(0.8); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } catch (e) {
                console.error('[GameModesManager] _showSeason2Unlock error:', e);
            }
        },

        /**
         * Muestra notificación de Extreme Mode desbloqueado
         */
        _showExtremeModeUnlock() {
            try {
                console.log('🔥 EXTREME MODE UNLOCKED!');
                // Similar a Season 2, pero con tema más agresivo
            } catch (e) {
                console.error('[GameModesManager] _showExtremeModeUnlock error:', e);
            }
        },

        /**
         * Activa Season 2
         */
        activateSeason2() {
            try {
                if (!this.season2Unlocked) return false;
                
                this.season2Active = true;
                this.game.state = 'MENU';
                
                // Cambiar background/aesthetic
                document.body.style.background = 'linear-gradient(135deg, #0a0520, #1a0a40)';
                
                // Cambiar música tema
                if (window.MusicManager) {
                    window.MusicManager.playSeason2Menu();
                }
                
                this.save();
                return true;
            } catch (e) {
                console.error('[GameModesManager] activateSeason2 error:', e);
                return false;
            }
        },

        /**
         * Activa Extreme Mode
         */
        activateExtremeMode() {
            try {
                if (!this.extremeModeUnlocked) return false;
                
                this.extremeModeActive = true;
                
                // Ajustes de Extreme Mode
                this.game.difficulty = 'insane';
                this.game.difficultyMultipliers.insane = 3; // Triple difficulty
                
                // Sin cajas
                this.game._extremeMode_noCrates = true;
                
                // Cosméticos exclusivos desbloqueados
                if (window.CosmeticManager) {
                    this.game.cosmetics.owned.shot.push('dark');
                    this.game.cosmetics.owned.trail.push('glitch');
                }
                
                this.save();
                return true;
            } catch (e) {
                console.error('[GameModesManager] activateExtremeMode error:', e);
                return false;
            }
        },

        /**
         * Actualiza opciones del menú
         */
        _updateMenuOptions() {
            try {
                // Mostrar/ocultar botones de Season 2 y Extreme Mode
                const season2Btn = document.getElementById('btn-season2');
                const extremeBtn = document.getElementById('btn-extreme');
                
                if (season2Btn) {
                    season2Btn.style.display = this.season2Unlocked ? 'block' : 'none';
                }
                
                if (extremeBtn) {
                    extremeBtn.style.display = this.extremeModeUnlocked ? 'block' : 'none';
                }
            } catch (e) {
                console.error('[GameModesManager] _updateMenuOptions error:', e);
            }
        },

        /**
         * Obtiene estado de modos
         */
        getState() {
            return {
                season2Unlocked: this.season2Unlocked,
                season2Active: this.season2Active,
                extremeModeUnlocked: this.extremeModeUnlocked,
                extremeModeActive: this.extremeModeActive,
                allSectorsCompleted: this.allSectorsCompleted
            };
        },

        /**
         * Obtiene multiplicadores de Extreme Mode
         */
        getExtremeModeDifficulty() {
            if (!this.extremeModeActive) return 1;
            
            return {
                enemySpeed: 2,
                enemyHealth: 1.8,
                enemySpawnRate: 1.5,
                bossHealth: 2,
                noCrates: true,
                exclusiveCosmetics: true
            };
        },

        save() {
            save({
                season2Unlocked: this.season2Unlocked,
                season2Active: this.season2Active,
                extremeModeUnlocked: this.extremeModeUnlocked,
                extremeModeActive: this.extremeModeActive,
                sectorsCompleted: this.sectorsCompleted
            });
        }
    };

    window.GameModesManager = GameModesManager;
})();
