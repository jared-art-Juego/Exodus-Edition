/**
 * VECTOR EXODUS - Combat Flow / Streak System
 * 5 → COMBAT FLOW
 * 15 → DOMINANCE
 * 30 → UNSTOPPABLE
 * 
 * Efectos: música más intensa, pantalla con efectos, trail más brillante
 */
(function() {
    'use strict';

    const STREAK_THRESHOLDS = {
        5: { name: 'COMBAT FLOW', color: '#00bfff', multiplier: 1.2 },
        15: { name: 'DOMINANCE', color: '#00ff88', multiplier: 1.5 },
        30: { name: 'UNSTOPPABLE', color: '#ff00ff', multiplier: 2.0 }
    };

    const CombatFlowManager = {
        game: null,
        musicManager: null,
        
        streakKills: 0,
        currentStreak: null,
        prevStreak: null,
        streakNotificationTime: 0,
        damageReceivedThisStreak: 0,
        streakStartTime: 0,
        screenShakeIntensity: 0,
        
        init(game, musicManager) {
            try {
                this.game = game;
                this.musicManager = musicManager;
                
                this._patchGame();
            } catch (e) {
                console.error('[CombatFlowManager] init error:', e);
            }
        },
        
        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Patch updateEnemies para detectar kills
            const origUpdateEnemies = g.updateEnemies && g.updateEnemies.bind(g);
            if (origUpdateEnemies) {
                g.updateEnemies = () => {
                    const enemyCountBefore = g.enemies.length;
                    origUpdateEnemies();
                    const enemyCountAfter = g.enemies.length;
                    
                    // Si murió un enemigo, aumentar streak
                    if (enemyCountAfter < enemyCountBefore) {
                        self.addKill();
                    }
                };
            }

            // Patch damagePlayer para resetear streak
            const origDamagePlayer = g.damagePlayer && g.damagePlayer.bind(g);
            if (origDamagePlayer) {
                g.damagePlayer = function(amount) {
                    self.resetStreak('hit');
                    origDamagePlayer(amount);
                };
            }

            // Patch update para dibujar efectos
            const origUpdate = g.update && g.update.bind(g);
            if (origUpdate) {
                g.update = () => {
                    origUpdate();
                    self.update();
                };
            }

            // Patch loop para dibujar overlay
            const origLoop = g.loop && g.loop.bind(g);
            if (origLoop) {
                g.loop = () => {
                    origLoop();
                    self.drawOverlay();
                };
            }
        },
        
        /**
         * Aumenta streak al matar enemigos
         */
        addKill() {
            try {
                this.streakKills += 1;
                
                // Detectar nuevos streaks
                for (const [threshold, info] of Object.entries(STREAK_THRESHOLDS)) {
                    const thr = Number(threshold);
                    if (this.streakKills === thr) {
                        this._triggerStreakLevel(thr, info);
                        break;
                    }
                }
            } catch (e) {
                console.error('[CombatFlowManager] addKill error:', e);
            }
        },
        
        /**
         * Resetea streak (cuando recibes daño)
         */
        resetStreak(reason) {
            try {
                if (this.streakKills > 0 && reason === 'hit') {
                    // Opcionalmente guardar estadísticas
                    console.log(`Streak roto: ${this.streakKills} kills`);
                }
                this.streakKills = 0;
                this.currentStreak = null;
                this.damageReceivedThisStreak = 0;
            } catch (e) {
                console.error('[CombatFlowManager] resetStreak error:', e);
            }
        },
        
        /**
         * Manejador de nivel de streak desbloqueado
         */
        _triggerStreakLevel(threshold, info) {
            try {
                this.currentStreak = info;
                this.prevStreak = threshold;
                this.streakNotificationTime = Date.now();
                this.streakStartTime = Date.now();
                
                console.log(`🔥 ${info.name}!`);
                
                // Efectos
                this._activateStreakEffects(info);
            } catch (e) {
                console.error('[CombatFlowManager] _triggerStreakLevel error:', e);
            }
        },
        
        /**
         * Activa efectos de streak
         */
        _activateStreakEffects(info) {
            try {
                // 1. Música más intensa
                if (this.musicManager) {
                    const intensity = (this.prevStreak / 30); // 0.17 a 1.0
                    // El MusicManager podría tener un boost de intensidad
                    console.log(`Music boost: ${intensity}`);
                }
                
                // 2. Screen shake
                this.screenShakeIntensity = Math.min(1, this.prevStreak / 30);
                
                // 3. Partículas brillantes
                if (this.game && this.game.player) {
                    this._spawnStreakParticles(info.color);
                }
            } catch (e) {
                console.error('[CombatFlowManager] _activateStreakEffects error:', e);
            }
        },
        
        /**
         * Genera partículas al activar streak
         */
        _spawnStreakParticles(color) {
            try {
                const g = this.game;
                if (!g || !g.player) return;
                
                // Crear 20 partículas en círculo
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 2;
                    const speed = 3 + Math.random() * 2;
                    
                    g.particles.push({
                        x: g.player.x,
                        y: g.player.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 30,
                        maxLife: 30,
                        size: 2,
                        color: color,
                        alpha: 0.8,
                        type: 'streak'
                    });
                }
            } catch (e) {
                console.error('[CombatFlowManager] _spawnStreakParticles error:', e);
            }
        },
        
        /**
         * Actualización del sistema
         */
        update() {
            try {
                // Reducir screen shake gradualmente
                if (this.screenShakeIntensity > 0) {
                    this.screenShakeIntensity *= 0.95;
                    if (this.screenShakeIntensity < 0.01) {
                        this.screenShakeIntensity = 0;
                    }
                }
            } catch (e) {
                console.error('[CombatFlowManager] update error:', e);
            }
        },
        
        /**
         * Dibuja overlay con información de streak
         */
        drawOverlay() {
            try {
                if (!this.game || !this.game.ctx) return;
                
                const ctx = this.game.ctx;
                const now = Date.now();
                
                // Aplicar screen shake
                if (this.screenShakeIntensity > 0) {
                    ctx.save();
                    const shake = this.screenShakeIntensity * 5;
                    ctx.translate(
                        (Math.random() - 0.5) * shake,
                        (Math.random() - 0.5) * shake
                    );
                }
                
                // Mostrar notificación de streak (primeros 3 segundos)
                if (this.currentStreak && now - this.streakNotificationTime < 3000) {
                    this._drawStreakNotification(ctx, now);
                }
                
                // Mostrar contador de kills actual
                if (this.streakKills > 0) {
                    this._drawStreakCounter(ctx);
                }
                
                if (this.screenShakeIntensity > 0) {
                    ctx.restore();
                }
            } catch (e) {
                console.error('[CombatFlowManager] drawOverlay error:', e);
            }
        },
        
        /**
         * Dibuja notificación de streak
         */
        _drawStreakNotification(ctx, now) {
            try {
                const elapsed = now - this.streakNotificationTime;
                const duration = 3000;
                const progress = elapsed / duration;
                
                // Fade out
                const alpha = Math.max(0, 1 - progress);
                
                // Scale animation
                const scale = 0.8 + progress * 0.4;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.font = 'bold 3rem Orbitron';
                ctx.textAlign = 'center';
                ctx.fillStyle = this.currentStreak.color;
                ctx.shadowColor = this.currentStreak.color;
                ctx.shadowBlur = 20;
                
                ctx.scale(scale, scale);
                ctx.fillText(
                    this.currentStreak.name,
                    this.game.w / (2 * scale),
                    this.game.h / (3 * scale)
                );
                
                ctx.restore();
            } catch (e) {
                console.error('[CombatFlowManager] _drawStreakNotification error:', e);
            }
        },
        
        /**
         * Dibuja contador de kills
         */
        _drawStreakCounter(ctx) {
            try {
                const info = this._getStreakInfo();
                
                ctx.save();
                ctx.font = 'bold 1.5rem Orbitron';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#00bfff';
                ctx.shadowColor = '#00bfff';
                ctx.shadowBlur = 10;
                
                ctx.fillText(
                    `KILLS: ${this.streakKills}`,
                    this.game.w - 20,
                    40
                );
                
                // Barra de progreso al siguiente milestone
                this._drawProgressBar(ctx);
                
                ctx.restore();
            } catch (e) {
                console.error('[CombatFlowManager] _drawStreakCounter error:', e);
            }
        },
        
        /**
         * Dibuja barra de progreso hacia siguiente milestone
         */
        _drawProgressBar(ctx) {
            try {
                const barY = 60;
                const barWidth = 150;
                const barHeight = 10;
                const barX = this.game.w - barWidth - 20;
                
                // Encontrar siguiente threshold
                let nextThreshold = 5;
                for (const [threshold] of Object.entries(STREAK_THRESHOLDS)) {
                    const thr = Number(threshold);
                    if (this.streakKills < thr) {
                        nextThreshold = thr;
                        break;
                    }
                }
                
                const lastThreshold = Object.keys(STREAK_THRESHOLDS)
                    .map(Number)
                    .filter(t => t < nextThreshold)
                    .pop() || 0;
                
                const progress = (this.streakKills - lastThreshold) / (nextThreshold - lastThreshold);
                
                // Dibujar fondo de barra
                ctx.fillStyle = 'rgba(0, 191, 255, 0.2)';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                // Dibujar progreso
                ctx.fillStyle = '#00bfff';
                ctx.fillRect(barX, barY, barWidth * Math.min(1, progress), barHeight);
                
                // Dibujar borde
                ctx.strokeStyle = '#00bfff';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
                
                // Mostrar: X / Y
                ctx.font = 'bold 0.7rem Orbitron';
                ctx.fillStyle = '#00ff88';
                ctx.textAlign = 'center';
                ctx.fillText(
                    `${this.streakKills} / ${nextThreshold}`,
                    barX + barWidth / 2,
                    barY + 20
                );
            } catch (e) {
                console.error('[CombatFlowManager] _drawProgressBar error:', e);
            }
        },
        
        /**
         * Obtiene información del streak actual
         */
        _getStreakInfo() {
            for (const [threshold, info] of Object.entries(STREAK_THRESHOLDS)) {
                if (this.streakKills >= Number(threshold)) {
                    return info;
                }
            }
            return null;
        },
        
        /**
         * Obtiene multiplicador de cosmético trail según streak
         */
        getTrailBrightnessMultiplier() {
            const info = this._getStreakInfo();
            return info ? info.multiplier : 1;
        },
        
        /**
         * Obtiene datos para UI
         */
        getStreakStats() {
            return {
                killCount: this.streakKills,
                currentLevel: this._getStreakInfo(),
                nextMilestone: this._getNextMilestone()
            };
        },
        
        _getNextMilestone() {
            for (const threshold of Object.keys(STREAK_THRESHOLDS).map(Number).sort((a, b) => a - b)) {
                if (this.streakKills < threshold) {
                    return threshold;
                }
            }
            return null;
        }
    };

    window.CombatFlowManager = CombatFlowManager;
})();
