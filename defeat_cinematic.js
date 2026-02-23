/**
 * VECTOR EXODUS - Defeat Cinematic System
 * 
 * ✓ Ship stops when defeated
 * ✓ Black hole appears
 * ✓ Ship shows "sad" animation
 * ✓ Ship enters black hole
 * ✓ "YOU LOST" screen appears
 * ✓ Fade to black with retry option
 * 
 * Professional cinematic sequence handler
 */
(function() {
    'use strict';

    const DefeatCinematic = {
        game: null,
        isActive: false,
        phase: 0, // 0=idle, 1=stop, 2=hole_appear, 3=sad_anim, 4=hole_entry, 5=lost_screen
        phaseTimer: 0,
        
        // Visual elements
        blackHole: {
            x: 0,
            y: 0,
            radius: 20,
            maxRadius: 150,
            finalRadius: 200
        },
        
        shipSadScale: 1,
        shipRotation: 0,
        lostScreenOpacity: 0,
        
        /**
         * Initialize the defeat cinematic system
         * @param {Object} game - Reference to the main game object
         */
        init(game) {
            try {
                this.game = game;
                this._patchGameForDefeat();
                console.info('[DefeatCinematic] Initialized successfully');
            } catch (e) {
                console.error('[DefeatCinematic] Init failed:', e);
            }
        },

        /**
         * Patches the game's death/defeat logic
         */
        _patchGameForDefeat() {
            const self = this;
            const g = this.game;

            // Patch gameOver or defeat logic
            const origGameOver = g.gameOver && g.gameOver.bind(g);
            if (origGameOver) {
                g.gameOver = function() {
                    if (self.isActive) return; // Prevent double-trigger
                    self.triggerDefeatCinematic();
                    // Call original later after cinematic
                };
            }

            // Alternative: Patch damagePlayer to detect death
            const origDamagePlayer = g.damagePlayer && g.damagePlayer.bind(g);
            if (origDamagePlayer) {
                g.damagePlayer = function(amount) {
                    origDamagePlayer.call(this, amount);
                    if (this.player && this.player.hp <= 0 && !self.isActive) {
                        self.triggerDefeatCinematic();
                    }
                };
            }

            // Patch update to run cinematic logic
            const origUpdate = g.update && g.update.bind(g);
            if (origUpdate) {
                g.update = function() {
                    if (!self.isActive) {
                        origUpdate.call(this);
                    } else {
                        self._updateCinematic();
                    }
                };
            }

            // Patch draw to render cinematic
            const origDraw = g.draw && g.draw.bind(g);
            if (origDraw) {
                g.draw = function() {
                    if (self.isActive) {
                        self._drawCinematic();
                    } else {
                        origDraw.call(this);
                    }
                };
            }
        },

        /**
         * Trigger the defeat cinematic sequence
         */
        triggerDefeatCinematic() {
            try {
                this.isActive = true;
                this.phase = 1;
                this.phaseTimer = 0;

                const g = this.game;
                
                // Stop all sounds
                if (window.MusicManager) {
                    window.MusicManager.playDefeat();
                }

                // Hide HUD
                const hud = document.getElementById('hud');
                if (hud) hud.style.display = 'none';

                // Initialize black hole at center screen
                this.blackHole.x = g.w / 2;
                this.blackHole.y = g.h / 2;
                this.blackHole.radius = 20;

                console.info('[DefeatCinematic] Sequence triggered');
            } catch (e) {
                console.error('[DefeatCinematic] Trigger failed:', e);
            }
        },

        /**
         * Update cinematic animation frame by frame
         */
        _updateCinematic() {
            try {
                const g = this.game;
                this.phaseTimer += 16; // ~60 FPS

                switch (this.phase) {
                    case 1: // STOP - Ship stops moving
                        if (this.phaseTimer >= 500) {
                            this.phase = 2;
                            this.phaseTimer = 0;
                        }
                        break;

                    case 2: // BLACK HOLE APPEARS
                        if (this.phaseTimer < 1500) {
                            this.blackHole.radius = 20 + (this.phaseTimer / 1500) * (this.blackHole.maxRadius - 20);
                        } else {
                            this.blackHole.radius = this.blackHole.maxRadius;
                            this.phase = 3;
                            this.phaseTimer = 0;
                        }
                        break;

                    case 3: // SAD ANIMATION - Ship reacts
                        if (this.phaseTimer < 1200) {
                            const t = this.phaseTimer / 1200;
                            this.shipSadScale = 1 - (t * 0.15);
                            this.shipRotation = Math.sin(t * Math.PI * 3) * 0.1;
                        } else {
                            this.phase = 4;
                            this.phaseTimer = 0;
                        }
                        break;

                    case 4: // HOLE ENTRY - Ship enters black hole
                        if (this.phaseTimer < 1500) {
                            const t = this.phaseTimer / 1500;
                            
                            // Move ship toward hole
                            const deltaX = (this.blackHole.x - g.player.x) * t;
                            const deltaY = (this.blackHole.y - g.player.y) * t;
                            g.player.x += deltaX * 0.05;
                            g.player.y += deltaY * 0.05;

                            // Scale down ship
                            this.shipSadScale = 1 - (t * 0.8);

                            // Rotate ship
                            this.shipRotation += 0.1;

                            // Expand black hole slightly
                            this.blackHole.radius = this.blackHole.maxRadius + (t * 50);
                        } else {
                            this.phase = 5;
                            this.phaseTimer = 0;
                        }
                        break;

                    case 5: // LOST SCREEN - Final screen
                        if (this.phaseTimer < 3000) {
                            this.lostScreenOpacity = Math.min(1, this.phaseTimer / 1000);
                        } else {
                            this.lostScreenOpacity = 1;
                            // Show the defeat screen and retry button
                            this._showDefeatScreen();
                        }
                        break;
                }
            } catch (e) {
                console.error('[DefeatCinematic] Update failed:', e);
            }
        },

        /**
         * Draw the cinematic scene
         */
        _drawCinematic() {
            try {
                const g = this.game;
                const ctx = g.ctx;

                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, g.w, g.h);

                // Draw background stars (if available)
                this._drawStarfield();

                // Draw black hole
                this._drawBlackHole();

                // Draw ship (with sad animation in phase 3-4)
                this._drawShipCinematic();

                // Draw event text based on phase
                this._drawPhaseText();

                // Draw final lost screen
                if (this.phase === 5) {
                    this._drawLostScreen();
                }
            } catch (e) {
                console.error('[DefeatCinematic] Draw failed:', e);
            }
        },

        /**
         * Draw starfield background
         */
        _drawStarfield() {
            const g = this.game;
            const ctx = g.ctx;

            ctx.fillStyle = '#fff';
            for (let i = 0; i < 50; i++) {
                const x = (i * 97 + this.phaseTimer * 0.1) % g.w;
                const y = (i * 127) % g.h;
                const size = Math.sin(i) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        },

        /**
         * Draw the black hole with gravity effect
         */
        _drawBlackHole() {
            const g = this.game;
            const ctx = g.ctx;
            const bh = this.blackHole;

            // Outer glow (accretion disk)
            const grad = ctx.createRadialGradient(bh.x, bh.y, bh.radius * 0.5, bh.x, bh.y, bh.radius * 2);
            grad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            grad.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bh.x, bh.y, bh.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Event horizon (black center)
            ctx.fillStyle = '#000';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glow edge
            ctx.strokeStyle = 'rgba(255, 100, 0, 0.9)';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Swirling particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + (this.phaseTimer * 0.005);
                const dist = bh.radius * 1.5;
                const px = bh.x + Math.cos(angle) * dist;
                const py = bh.y + Math.sin(angle) * dist;

                ctx.fillStyle = `rgba(255, ${100 + Math.sin(angle) * 50}, 0, 0.6)`;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        },

        /**
         * Draw ship with cinematic effects
         */
        _drawShipCinematic() {
            const g = this.game;
            const ctx = g.ctx;

            ctx.save();
            ctx.translate(g.player.x, g.player.y);
            ctx.rotate(this.shipRotation);
            ctx.scale(this.shipSadScale, this.shipSadScale);

            // Draw simple ship silhouette
            ctx.fillStyle = '#00f2ff';
            ctx.globalAlpha = 0.8 - (this.phase >= 4 ? 0.5 : 0);

            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(10, 15);
            ctx.lineTo(0, 10);
            ctx.lineTo(-10, 15);
            ctx.closePath();
            ctx.fill();

            // Add glow
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

            ctx.restore();
        },

        /**
         * Draw phase-specific text
         */
        _drawPhaseText() {
            const g = this.game;
            const ctx = g.ctx;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.7;

            let text = '';
            switch (this.phase) {
                case 2:
                    text = 'GRAVITATIONAL ANOMALY DETECTED';
                    break;
                case 3:
                    text = 'SYSTEMS FAILING...';
                    break;
                case 4:
                    text = 'HULL INTEGRITY: CRITICAL';
                    break;
            }

            if (text) {
                ctx.fillText(text, g.w / 2, g.h / 2 - 100);
            }

            ctx.globalAlpha = 1;
        },

        /**
         * Draw the "YOU LOST" screen
         */
        _drawLostScreen() {
            const g = this.game;
            const ctx = g.ctx;

            // Semi-transparent black overlay
            ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * this.lostScreenOpacity})`;
            ctx.fillRect(0, 0, g.w, g.h);

            // "YOU LOST" text
            ctx.globalAlpha = this.lostScreenOpacity;
            ctx.fillStyle = '#ff0044';
            ctx.font = 'bold 80px Orbitron';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0044';
            ctx.fillText('YOU LOST', g.w / 2, g.h / 2);

            // Subtitle
            ctx.fillStyle = '#fff';
            ctx.font = '24px Orbitron';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText('Sector ' + g.sector + ' - Mission Failed', g.w / 2, g.h / 2 + 80);

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        },

        /**
         * Show the defeat screen with retry button
         */
        _showDefeatScreen() {
            try {
                const defeatScreen = document.getElementById('defeat-screen');
                if (defeatScreen) {
                    defeatScreen.style.display = 'flex';

                    // Add event listeners if not already present
                    const retryBtn = defeatScreen.querySelector('.btn');
                    if (retryBtn && !retryBtn.dataset.listenerAdded) {
                        retryBtn.onclick = () => {
                            this._closeDefeatScreen();
                            this.game.selectSector(this.game.sector);
                        };
                        retryBtn.dataset.listenerAdded = 'true';
                    }

                    const menuBtn = defeatScreen.querySelector('.btn-secondary');
                    if (menuBtn && !menuBtn.dataset.listenerAdded) {
                        menuBtn.onclick = () => {
                            this._closeDefeatScreen();
                            this.game.returnToMenu();
                        };
                        menuBtn.dataset.listenerAdded = 'true';
                    }
                }
            } catch (e) {
                console.error('[DefeatCinematic] Failed to show defeat screen:', e);
            }
        },

        /**
         * Close the defeat screen
         */
        _closeDefeatScreen() {
            try {
                this.isActive = false;
                this.phase = 0;
                this.phaseTimer = 0;

                const defeatScreen = document.getElementById('defeat-screen');
                if (defeatScreen) {
                    defeatScreen.style.display = 'none';
                }

                const hud = document.getElementById('hud');
                if (hud) {
                    hud.style.display = 'block';
                }
            } catch (e) {
                console.error('[DefeatCinematic] Failed to close defeat screen:', e);
            }
        }
    };

    // Export to window
    window.DefeatCinematic = DefeatCinematic;
})();
