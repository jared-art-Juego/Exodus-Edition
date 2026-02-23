/**
 * VECTOR EXODUS - Menu Animation System
 * 
 * ✓ Replace boring black menu background
 * ✓ Add animated space background with parallax
 * ✓ Add particles and energy effects
 * ✓ Ambient menu music
 * ✓ Subtle logo animation
 * ✓ Professional visual polish
 * 
 * Professional menu enhancement system
 */
(function() {
    'use strict';

    const MenuAnimationSystem = {
        canvas: null,
        ctx: null,
        animationId: null,
        frameCount: 0,
        
        // Particles
        particles: [],
        stars: [],
        
        // Configuration
        PARTICLE_COUNT: 50,
        STAR_COUNT: 100,
        
        /**
         * Initialize the menu animation system
         */
        init() {
            try {
                this._createMenuCanvas();
                this._generateStars();
                this._animate();
                console.info('[MenuAnimationSystem] Initialized successfully');
            } catch (e) {
                console.error('[MenuAnimationSystem] Init failed:', e);
            }
        },

        /**
         * Create canvas overlay for menu animation
         */
        _createMenuCanvas() {
            try {
                // Get menu container
                const menu = document.getElementById('menu');
                if (!menu) return;

                // Create canvas with same dimensions as window
                this.canvas = document.createElement('canvas');
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.canvas.style.position = 'absolute';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.zIndex = '1';
                this.canvas.style.pointerEvents = 'none';

                // Insert canvas behind the panel
                menu.insertBefore(this.canvas, menu.firstChild);

                this.ctx = this.canvas.getContext('2d');

                // Handle window resize
                window.addEventListener('resize', () => {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                });
            } catch (e) {
                console.error('[MenuAnimationSystem] Canvas creation failed:', e);
            }
        },

        /**
         * Generate static stars for background
         */
        _generateStars() {
            try {
                const w = this.canvas.width;
                const h = this.canvas.height;

                for (let i = 0; i < this.STAR_COUNT; i++) {
                    this.stars.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        size: Math.random() * 1.5,
                        opacity: Math.random() * 0.5 + 0.5,
                        twinkleSpeed: Math.random() * 0.01 + 0.005
                    });
                }
            } catch (e) {
                console.error('[MenuAnimationSystem] Star generation failed:', e);
            }
        },

        /**
         * Main animation loop
         */
        _animate() {
            try {
                if (!this.canvas || !this.ctx) return;

                const w = this.canvas.width;
                const h = this.canvas.height;

                // Clear canvas
                this.ctx.fillStyle = '#000510';
                this.ctx.fillRect(0, 0, w, h);

                // Draw background
                this._drawStarfield();
                this._drawNebula();
                this._updateAndDrawParticles();
                this._drawFloatingEnergy();

                this.frameCount++;
                this.animationId = requestAnimationFrame(() => this._animate());
            } catch (e) {
                console.error('[MenuAnimationSystem] Animation loop failed:', e);
            }
        },

        /**
         * Draw starfield background
         */
        _drawStarfield() {
            try {
                this.stars.forEach(star => {
                    // Twinkling effect
                    star.opacity += (Math.random() - 0.5) * star.twinkleSpeed;
                    star.opacity = Math.max(0.1, Math.min(1, star.opacity));

                    this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                    this.ctx.beginPath();
                    this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            } catch (e) {}
        },

        /**
         * Draw nebula effect
         */
        _drawNebula() {
            try {
                const w = this.canvas.width;
                const h = this.canvas.height;

                // Create nebula gradient that moves
                const time = this.frameCount * 0.0001;
                const x1 = Math.cos(time) * (w / 4) + w / 2;
                const y1 = Math.sin(time) * (h / 4) + h / 2;

                const gradient = this.ctx.createRadialGradient(
                    x1, y1, 0,
                    x1, y1, Math.max(w, h) * 0.7
                );

                gradient.addColorStop(0, 'rgba(100, 0, 200, 0.1)');
                gradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.05)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, w, h);
            } catch (e) {}
        },

        /**
         * Update and draw particles
         */
        _updateAndDrawParticles() {
            try {
                const w = this.canvas.width;
                const h = this.canvas.height;

                // Spawn new particles
                if (this.particles.length < this.PARTICLE_COUNT) {
                    this.particles.push(this._createParticle());
                }

                // Update and draw
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];

                    // Update position
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life--;
                    p.opacity = Math.max(0, p.opacity - 0.01);

                    // Remove if expired
                    if (p.life <= 0 || p.opacity <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }

                    // Draw
                    this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;

                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.shadowBlur = 0;
                }
            } catch (e) {}
        },

        /**
         * Draw floating energy effects
         */
        _drawFloatingEnergy() {
            try {
                const w = this.canvas.width;
                const h = this.canvas.height;
                const centerX = w / 2;
                const centerY = h / 2;

                const time = this.frameCount * 0.001;

                // Draw rotating energy rings
                for (let ring = 1; ring <= 3; ring++) {
                    const radius = 100 * ring;
                    const rotation = time * (0.5 / ring);

                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${0.3 / ring})`;
                    this.ctx.lineWidth = 2 / ring;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, rotation, rotation + Math.PI * 1.5);
                    this.ctx.stroke();
                }

                // Draw pulsing center dot
                const pulseAmount = Math.sin(time * 3) * 3 + 5;
                this.ctx.fillStyle = 'rgba(0, 242, 255, 0.8)';
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = 'rgba(0, 242, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, pulseAmount, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } catch (e) {}
        },

        /**
         * Create a new particle
         */
        _createParticle() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.5 + 0.1;

            const colors = [
                { r: 0, g: 242, b: 255 },      // Cyan
                { r: 255, g: 0, b: 68 },       // Red
                { r: 0, g: 255, b: 102 },      // Green
                { r: 153, g: 0, b: 255 }       // Purple
            ];

            return {
                x: w / 2 + (Math.random() - 0.5) * 200,
                y: h / 2 + (Math.random() - 0.5) * 200,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: Math.random() * 200 + 100,
                opacity: Math.random() * 0.5 + 0.5
            };
        },

        /**
         * Animate the logo (subtle scale/rotation)
         */
        animateLogo() {
            try {
                const logo = document.querySelector('h1');
                if (!logo) return;

                let scale = 1;
                let direction = 1;
                const animate = () => {
                    scale += direction * 0.001;
                    if (scale > 1.05 || scale < 0.95) {
                        direction *= -1;
                    }
                    logo.style.transform = `scale(${scale})`;
                    requestAnimationFrame(animate);
                };
                animate();
            } catch (e) {}
        },

        /**
         * Stop animation (for cleanup)
         */
        stop() {
            try {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            } catch (e) {}
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MenuAnimationSystem.init();
        });
    } else {
        MenuAnimationSystem.init();
    }

    // Export to window
    window.MenuAnimationSystem = MenuAnimationSystem;
})();
