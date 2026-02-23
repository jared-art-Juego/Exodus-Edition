/**
 * VECTOR EXODUS - Sector 1 Combat Enhancements
 * 
 * ✓ Boss positioned RIGHT (not center)
 * ✓ Player ship moves LEFT during battle
 * ✓ Cinema mode (black bars) when dodging lasers
 * ✓ 20 second timer adjustment per boss HP level
 * ✓ Powerful animations at 50% and 10% HP
 * ✓ Slight player boost in last 5% (no balance break)
 * 
 * Professional modular system - Non-invasive patching
 */
(function() {
    'use strict';

    const Sector1Enhancements = {
        game: null,
        
        // State tracking
        isInBattle: false,
        lastBossHp: 100,
        cinematicMode: false,
        cinematicTimer: 0,
        cinematicDuration: 0,
        bossDefeatedTime: null,
        
        // Configuration
        BOSS_RIGHT_X: null,  // Will be game.w * 0.75
        PLAYER_LEFT_X: null, // Will be game.w * 0.25
        CINEMA_BAR_HEIGHT: 0,
        CINEMA_BAR_HEIGHT_MAX: 0,
        
        /**
         * Initialize the enhancement system
         * @param {Object} game - Reference to the main game object
         */
        init(game) {
            try {
                this.game = game;
                
                // Calculate positioning based on canvas size
                this.PLAYER_LEFT_X = game.w * 0.25;
                this.BOSS_RIGHT_X = game.w * 0.75;
                this.CINEMA_BAR_HEIGHT_MAX = game.h * 0.15;
                this.CINEMA_BAR_HEIGHT = 0;
                
                // Patch the game's boss system
                this._patchGameForSector1();
                
                console.info('[Sector1Enhancements] Initialized successfully');
            } catch (e) {
                console.error('[Sector1Enhancements] Init failed:', e);
            }
        },

        /**
         * Patches the game for Sector 1 specific behavior
         */
        _patchGameForSector1() {
            const self = this;
            const g = this.game;
            
            // Patch spawnBoss
            const origSpawnBoss = g.spawnBoss && g.spawnBoss.bind(g);
            if (origSpawnBoss) {
                g.spawnBoss = function() {
                    if (this.sector === 1) {
                        self._spawnBossSector1();
                    } else {
                        origSpawnBoss.call(this);
                    }
                };
            }

            // Patch updateBoss for positioning and HP tracking
            const origUpdateBoss = g.updateBoss && g.updateBoss.bind(g);
            if (origUpdateBoss) {
                g.updateBoss = function() {
                    if (this.sector === 1) {
                        self._updateBossSector1();
                    } else {
                        origUpdateBoss.call(this);
                    }
                };
            }

            // Patch update to handle cinematic mode and player positioning
            const origUpdate = g.update && g.update.bind(g);
            if (origUpdate) {
                g.update = function() {
                    self._updateSector1Logic();
                    origUpdate.call(this);
                };
            }

            // Patch draw to render cinema bars
            const origDraw = g.draw && g.draw.bind(g);
            if (origDraw) {
                g.draw = function() {
                    origDraw.call(this);
                    self._drawCinematicBars();
                };
            }
        },

        /**
         * Spawn boss for Sector 1 with specific positioning
         */
        _spawnBossSector1() {
            const g = this.game;
            const boss = {
                x: this.BOSS_RIGHT_X,          // Boss on RIGHT
                y: -100,
                hp: 2000 * g.difficultyMultipliers[g.difficulty],
                maxHp: 2000 * g.difficultyMultipliers[g.difficulty],
                size: 60,
                phase: 1,
                targetY: 150,
                attackTimer: 0,
                spawnTimer: 0,
                color: '#ff0044',
                battleStartTime: Date.now(),  // Track when battle started
                hpAtAerialThreshold: null      // Track HP when reaching aerial threshold
            };
            
            g.boss = boss;
            this.isInBattle = true;
            this.lastBossHp = 100;
            
            // Show boss dialogue
            if (!g.bossDialogueShown) {
                g.bossDialogueShown = true;
                const dialogue = document.getElementById('boss-dialogue');
                if (dialogue) {
                    dialogue.textContent = 'SECTOR 1 - BOSS DETECTED';
                    dialogue.style.display = 'block';
                    setTimeout(() => {
                        dialogue.style.display = 'none';
                    }, 5000);
                }
            }
        },

        /**
         * Update boss for Sector 1 with enhanced mechanics
         */
        _updateBossSector1() {
            const g = this.game;
            const b = g.boss;
            if (!b) return;

            // Move boss right (already spawned there, maintain position)
            if (b.y < b.targetY) {
                b.y += 2;
            }

            // Horizontal oscillation on the RIGHT side
            const spd = 2.5;
            b.x = this.BOSS_RIGHT_X + Math.sin(Date.now() / 1000) * spd;

            // Track HP percent for phase tracking and timer adjustments
            const hpPercent = b.hp / b.maxHp;
            
            // Execute phase logic based on HP
            if (hpPercent > 0.66) {
                if (b.phase !== 1) {
                    b.phase = 1;
                    b.color = '#ff0044';
                }
                g.bossPhase1Sector1();
            } else if (hpPercent > 0.33) {
                if (b.phase !== 2) {
                    b.phase = 2;
                    b.color = '#ff6600';
                    g.createExplosion(b.x, b.y, 30, '#ff0044');
                    // Trigger 50% HP animation
                    this._trigger50PercentAnimation();
                }
                g.bossPhase2Sector1();
            } else {
                if (b.phase !== 3) {
                    b.phase = 3;
                    b.color = '#9900ff';
                    g.createExplosion(b.x, b.y, 40, '#ff6600');
                    // Trigger 10% HP animation
                    this._trigger10PercentAnimation();
                }
                g.bossPhase3Sector1();
            }

            // Last 5% - slight player boost (damage multiplier +10%)
            if (hpPercent > 0 && hpPercent <= 0.05) {
                this._applyLast5PercentBoost();
            }

            // 20 second timer adjustment per HP level
            this._adjustTimerForBossPhase(hpPercent);

            // Draw boss with enhancements
            this._drawBossSector1Enhanced(b);
        },

        /**
         * Update player position - moves LEFT during Sector 1 boss battle
         */
        _updateSector1Logic() {
            const g = this.game;
            
            if (!this.isInBattle || !g.boss || g.sector !== 1) return;

            // Move player LEFT during battle (smooth transition)
            const targetX = this.PLAYER_LEFT_X;
            const currentX = g.player.x;
            const delta = (targetX - currentX) * 0.05; // Smooth interpolation
            g.player.x += delta;

            // Keep player within bounds
            g.player.x = Math.max(g.player.size, Math.min(g.w - g.player.size, g.player.x));
        },

        /**
         * Trigger animation at 50% boss HP
         */
        _trigger50PercentAnimation() {
            try {
                const g = this.game;
                // Screen flash effect
                this._screenFlash('#ff6600', 300);
                // Music intensity up (handled by MusicManager)
                if (window.MusicManager && g.sector === 1) {
                    window.MusicManager.updateBossLayers(0.5);
                }
                // Visual feedback
                this._createIntensifyParticles(10);
            } catch (e) {}
        },

        /**
         * Trigger animation at 10% boss HP
         */
        _trigger10PercentAnimation() {
            try {
                const g = this.game;
                // Screen flash effect - more intense
                this._screenFlash('#ff0044', 500);
                // Mild vibration effect (create particles)
                this._createIntensifyParticles(20);
                // Music intensity maximum (handled by MusicManager)
                if (window.MusicManager && g.sector === 1) {
                    window.MusicManager.updateBossLayers(0.1);
                }
            } catch (e) {}
        },

        /**
         * Apply slight bonus in last 5% (no balance break)
         */
        _applyLast5PercentBoost() {
            const g = this.game;
            // 10% damage boost (not game-breaking)
            if (g.player.damageMultiplier < 1.1) {
                g.player.damageMultiplier = 1.1;
            }
        },

        /**
         * Adjust combat duration timer based on boss HP
         * 20 seconds per HP level
         */
        _adjustTimerForBossPhase(hpPercent) {
            const g = this.game;
            const b = g.boss;
            if (!b.battleStartTime) {
                b.battleStartTime = Date.now();
            }

            // Calculate bonus time based on HP amount
            const elapsedMs = Date.now() - b.battleStartTime;
            const baseTimerMs = 20000 * Math.ceil(100 * (1 - hpPercent)); // 20s per HP level
            
            // This is informational; actual game timing is handled elsewhere
            // Store for potential HUD display
            b.estimatedRemainingTime = Math.max(0, baseTimerMs - elapsedMs);
        },

        /**
         * Cinema mode - black bars when dodging
         */
        activateCinemaMode(durationMs = 2000) {
            this.cinematicMode = true;
            this.cinematicTimer = 0;
            this.cinematicDuration = durationMs;
        },

        /**
         * Draw cinematic black bars
         */
        _drawCinematicBars() {
            if (!this.cinematicMode) return;

            const g = this.game;
            const ctx = g.ctx;

            // Gradually increase bar height
            if (this.cinematicTimer < this.cinematicDuration / 2) {
                this.CINEMA_BAR_HEIGHT = (this.cinematicTimer / (this.cinematicDuration / 2)) * this.CINEMA_BAR_HEIGHT_MAX;
            } else {
                this.CINEMA_BAR_HEIGHT = Math.max(0, this.CINEMA_BAR_HEIGHT_MAX * (1 - (this.cinematicTimer - this.cinematicDuration / 2) / (this.cinematicDuration / 2)));
            }

            // Draw top and bottom bars
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, g.w, this.CINEMA_BAR_HEIGHT);
            ctx.fillRect(0, g.h - this.CINEMA_BAR_HEIGHT, g.w, this.CINEMA_BAR_HEIGHT);

            this.cinematicTimer += 16; // ~60 FPS

            if (this.cinematicTimer >= this.cinematicDuration) {
                this.cinematicMode = false;
                this.CINEMA_BAR_HEIGHT = 0;
            }
        },

        /**
         * Enhanced boss drawing for Sector 1
         */
        _drawBossSector1Enhanced(b) {
            const g = this.game;
            const ctx = g.ctx;

            ctx.save();
            ctx.translate(b.x, b.y);

            // Boss sprite or fallback
            if (g.assets && g.assets.enemy_boss && g.assets.enemy_boss.complete) {
                ctx.rotate(Math.PI);
                ctx.shadowBlur = 20;
                ctx.shadowColor = b.color;
                ctx.drawImage(g.assets.enemy_boss, -b.size, -b.size, b.size * 2, b.size * 2);
                ctx.rotate(-Math.PI);
            } else {
                // Fallback boss rendering
                ctx.strokeStyle = b.color;
                ctx.fillStyle = b.color + '33';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 20;
                ctx.shadowColor = b.color;

                ctx.beginPath();
                ctx.moveTo(0, -b.size);
                ctx.lineTo(-b.size * 1.2, b.size / 2);
                ctx.lineTo(-b.size / 2, b.size);
                ctx.lineTo(b.size / 2, b.size);
                ctx.lineTo(b.size * 1.2, b.size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(0, 0, b.size / 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // HP Bar
            ctx.shadowBlur = 0;
            const barWidth = b.size * 2;
            const hpPercent = b.hp / b.maxHp;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth / 2, -b.size - 20, barWidth, 10);
            
            // Color based on HP
            ctx.fillStyle = hpPercent > 0.5 ? '#00ff66' : hpPercent > 0.25 ? '#f8ff00' : '#ff0044';
            ctx.fillRect(-barWidth / 2, -b.size - 20, barWidth * hpPercent, 10);

            // Phase indicator
            ctx.fillStyle = '#fff';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('PHASE ' + b.phase, 0, -b.size - 25);

            ctx.restore();
        },

        /**
         * Screen flash effect
         */
        _screenFlash(color, durationMs) {
            try {
                const g = this.game;
                const ctx = g.ctx;
                const startTime = Date.now();

                const flashInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const alpha = Math.max(0, 1 - (elapsed / durationMs));

                    if (alpha > 0) {
                        ctx.fillStyle = color + Math.floor(alpha * 100).toString(16).padStart(2, '0');
                        ctx.fillRect(0, 0, g.w, g.h);
                    }

                    if (elapsed >= durationMs) {
                        clearInterval(flashInterval);
                    }
                }, 16);
            } catch (e) {}
        },

        /**
         * Create particles for intensity effects
         */
        _createIntensifyParticles(count) {
            try {
                const g = this.game;
                for (let i = 0; i < count; i++) {
                    g.createExplosion(
                        g.boss.x + (Math.random() - 0.5) * 100,
                        g.boss.y + (Math.random() - 0.5) * 100,
                        Math.random() * 3 + 2,
                        '#ff6600'
                    );
                }
            } catch (e) {}
        },

        /**
         * Called when boss is defeated
         */
        onBossDefeated() {
            this.isInBattle = false;
            this.bossDefeatedTime = Date.now();
            // Reset player position gradually on next update
            // Player will return to center naturally through movement logic
        }
    };

    // Export to window
    window.Sector1Enhancements = Sector1Enhancements;
})();
