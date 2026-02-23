/**
 * VECTOR EXODUS - Ship Evolution System
 * Mejoras visuales permanentes a la nave
 * No afecta balance, solo visual
 * 
 * Reactor más grande
 * Núcleo brillante
 * Armadura más compleja
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_ship_evolution_v1';

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

    const ShipEvolutionManager = {
        game: null,
        
        // Progreso de evolución (0-100)
        reactorLevel: 0,
        coreLevel: 0,
        armorLevel: 0,
        
        // Thresholds para evolución (basado en sesiones/kills totales)
        evolutionThresholds: {
            reactor: [25, 50, 75, 100],
            core: [30, 60, 90, 120],
            armor: [20, 50, 80, 110]
        },

        init(game, aiDirector) {
            try {
                this.game = game;
                this.aiDirector = aiDirector;
                
                const saved = load();
                if (saved) {
                    this.reactorLevel = saved.reactorLevel || 0;
                    this.coreLevel = saved.coreLevel || 0;
                    this.armorLevel = saved.armorLevel || 0;
                }
                
                this._patchGame();
            } catch (e) {
                console.error('[ShipEvolutionManager] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Aumentar evolución según muertes/sesiones
            const origReturnToMenu = g.returnToMenu && g.returnToMenu.bind(g);
            if (origReturnToMenu) {
                g.returnToMenu = () => {
                    self._updateProgress();
                    origReturnToMenu();
                };
            }
        },

        /**
         * Actualiza progreso de evolución
         */
        _updateProgress() {
            try {
                // Basado en kills y sesiones del AI Director
                if (this.aiDirector && this.aiDirector.history) {
                    const sessions = this.aiDirector.history.sessionsPlayed;
                    const kills = Math.floor(this.aiDirector.history.totalKills / 100); // Cada 100 kills = 1 punto
                    
                    this.reactorLevel = Math.min(100, sessions + kills);
                    this.coreLevel = Math.min(100, kills * 2 + Math.floor(sessions * 0.5));
                    this.armorLevel = Math.min(100, sessions * 0.8 + kills);
                }
                
                this.save();
                this._checkEvolutionMilestones();
            } catch (e) {
                console.error('[ShipEvolutionManager] _updateProgress error:', e);
            }
        },

        /**
         * Verifica si se completó evolución
         */
        _checkEvolutionMilestones() {
            try {
                // Notificar cuando se completa cada fase
                for (let i = 0; i < 4; i++) {
                    const threshold = this.evolutionThresholds.reactor[i];
                    if (this.reactorLevel >= threshold && !this._hasNotified('reactor', i)) {
                        console.log(`⚡ Reactor evolved to phase ${i + 1}`);
                    }
                }
            } catch (e) {
                console.error('[ShipEvolutionManager] _checkEvolutionMilestones error:', e);
            }
        },

        _hasNotified(type, phase) {
            // Implementaría caché de notificaciones
            return false;
        },

        /**
         * Obtiene multiplicador visual para reactor
         */
        getReactorVisualScale() {
            // Escala del 1.0 a 2.5
            return 1.0 + (this.reactorLevel / 100) * 1.5;
        },

        /**
         * Obtiene brillo del núcleo
         */
        getCoreGlowIntensity() {
            // Brillo de 1.0 a 3.0
            return 1.0 + (this.coreLevel / 100) * 2.0;
        },

        /**
         * Obtiene cantidad de detalles de armadura
         */
        getArmorComplexity() {
            // Número de detalles extra: 0 a 5
            return Math.floor((this.armorLevel / 100) * 5);
        },

        /**
         * Dibuja evolución en HUD
         */
        drawEvolutionStatus(ctx, x, y) {
            try {
                ctx.save();
                ctx.font = '0.7rem Orbitron';
                ctx.fillStyle = '#00ff88';
                
                const statusLines = [
                    `REACTOR: ${Math.floor(this.reactorLevel)}%`,
                    `CORE:    ${Math.floor(this.coreLevel)}%`,
                    `ARMOR:   ${Math.floor(this.armorLevel)}%`
                ];
                
                for (let i = 0; i < statusLines.length; i++) {
                    ctx.fillText(statusLines[i], x, y + (i * 12));
                }
                
                ctx.restore();
            } catch (e) {
                console.error('[ShipEvolutionManager] drawEvolutionStatus error:', e);
            }
        },

        /**
         * Dibuja efectos de evolución en la nave
         */
        drawEvolutionEffects(ctx, playerX, playerY) {
            try {
                // Reactor glow
                const glowIntensity = this.getCoreGlowIntensity();
                ctx.save();
                ctx.globalAlpha = (this.coreLevel / 100) * 0.7;
                ctx.fillStyle = 'rgba(0, 255, 150, 0.8)';
                ctx.beginPath();
                ctx.arc(playerX, playerY, 15 * glowIntensity, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Armor details
                const armorComplexity = this.getArmorComplexity();
                if (armorComplexity > 0) {
                    this._drawArmorDetails(ctx, playerX, playerY, armorComplexity);
                }
            } catch (e) {
                console.error('[ShipEvolutionManager] drawEvolutionEffects error:', e);
            }
        },

        /**
         * Dibuja detalles de armadura
         */
        _drawArmorDetails(ctx, x, y, complexity) {
            try {
                ctx.save();
                ctx.strokeStyle = '#00ccff';
                ctx.lineWidth = 0.5;
                
                for (let i = 0; i < complexity; i++) {
                    const angle = (i / complexity) * Math.PI * 2;
                    const distance = 12 + i * 2;
                    
                    ctx.beginPath();
                    ctx.arc(
                        x + Math.cos(angle) * distance,
                        y + Math.sin(angle) * distance,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.stroke();
                }
                
                ctx.restore();
            } catch (e) {
                console.error('[ShipEvolutionManager] _drawArmorDetails error:', e);
            }
        },

        save() {
            save({
                reactorLevel: this.reactorLevel,
                coreLevel: this.coreLevel,
                armorLevel: this.armorLevel
            });
        }
    };

    window.ShipEvolutionManager = ShipEvolutionManager;
})();
