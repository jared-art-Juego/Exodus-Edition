/**
 * VECTOR EXODUS - Enhanced Boss System
 * Especialmente Sector 6: 3 fases con música dinámica y ataques únicos
 */
(function() {
    'use strict';

    const BOSS_CONFIGS = {
        6: {
            phases: 3,
            phase1: {
                hpPercent: 100,
                name: 'PHASE 1: AWAKENING',
                description: 'The entity manifests',
                attackPattern: 'wave_and_orbit',
                speed: 1.2,
                attackFrequency: 2.5,
                music: 'boss_sector6_phase1'
            },
            phase2: {
                hpPercent: 66,
                name: 'PHASE 2: CONVERGENCE',
                description: 'Patterns align. Reality fractures.',
                attackPattern: 'spiral_burst',
                speed: 1.5,
                attackFrequency: 4,
                music: 'boss_sector6_phase2'
            },
            phase3: {
                hpPercent: 33,
                name: 'PHASE 3: TRANSCENDENCE',
                description: 'The final stand',
                attackPattern: 'hex_bombardment',
                speed: 2,
                attackFrequency: 6,
                music: 'boss_sector6_phase3',
                extraEffect: 'screen_glitch'
            }
        }
    };

    const EnhancedBossSystem = {
        game: null,
        musicManager: null,
        
        currentPhase: 1,
        phaseTransitionActive: false,
        phaseTransitionProgress: 0,
        bossAttackPattern: 0,
        bossAttackTimer: 0,

        init(game, musicManager) {
            try {
                this.game = game;
                this.musicManager = musicManager;
                this._patchGame();
            } catch (e) {
                console.error('[EnhancedBossSystem] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Patch spawnBoss para sector 6
            const origSpawnBoss = g.spawnBoss && g.spawnBoss.bind(g);
            if (origSpawnBoss) {
                g.spawnBoss = () => {
                    if (g.sector === 6) {
                        self._spawnSector6Boss();
                    } else {
                        origSpawnBoss();
                    }
                };
            }

            // Patch updateBoss
            const origUpdateBoss = g.updateBoss && g.updateBoss.bind(g);
            if (origUpdateBoss) {
                g.updateBoss = () => {
                    if (g.sector === 6 && g.boss) {
                        self._updateSector6Boss();
                    } else {
                        origUpdateBoss();
                    }
                };
            }
        },

        /**
         * Spawnea el boss de Sector 6 con tratamiento especial
         */
        _spawnSector6Boss() {
            try {
                const g = this.game;
                
                g.boss = {
                    x: g.w / 2,
                    y: 80,
                    vx: 0,
                    vy: 0,
                    hp: 2000,
                    maxHp: 2000,
                    size: 35,
                    phase: 1,
                    lastPhaseCheck: Date.now(),
                    attackCooldown: 0,
                    glitchAmount: 0,
                    spinAngle: 0
                };

                this.currentPhase = 1;
                
                // Música fase 1
                if (this.musicManager) {
                    this.musicManager.playBoss(6, 1);
                }

                console.log('🌟 SECTOR 6 BOSS SPAWNED: Phase 1 Awakening');
            } catch (e) {
                console.error('[EnhancedBossSystem] _spawnSector6Boss error:', e);
            }
        },

        /**
         * Actualiza boss de Sector 6 cada frame
         */
        _updateSector6Boss() {
            try {
                const g = this.game;
                if (!g.boss) return;

                // Detectar cambios de fase
                this._checkPhaseTransition();

                // Aplicar ataque según patrón
                this._executeBossAttack();

                // Movimiento base
                this._updateBossMovement();

                // Aplicar glitch si está en fase 3
                if (this.currentPhase === 3) {
                    g.boss.glitchAmount = 0.3 + Math.sin(Date.now() / 100) * 0.2;
                }

                // Dibujar
                this._drawSector6Boss();
            } catch (e) {
                console.error('[EnhancedBossSystem] _updateSector6Boss error:', e);
            }
        },

        /**
         * Verifica si debe transicionar a otra fase
         */
        _checkPhaseTransition() {
            try {
                const g = this.game;
                if (!g.boss) return;

                const config = BOSS_CONFIGS[6];
                const hpPercent = g.boss.hp / g.boss.maxHp;

                let newPhase = this.currentPhase;
                
                if (hpPercent <= 0.33 && this.currentPhase < 3) {
                    newPhase = 3;
                } else if (hpPercent <= 0.66 && this.currentPhase < 2) {
                    newPhase = 2;
                }

                if (newPhase !== this.currentPhase) {
                    this._transitionPhase(newPhase, config);
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _checkPhaseTransition error:', e);
            }
        },

        /**
         * Transiciona a nueva fase
         */
        _transitionPhase(newPhase, config) {
            try {
                const phaseConfig = config['phase' + newPhase];
                
                console.log(`🔥 PHASE TRANSITION: ${this.currentPhase} → ${newPhase}`);
                console.log(`   ${phaseConfig.name}`);
                
                this.currentPhase = newPhase;
                this.phaseTransitionActive = true;
                this.phaseTransitionProgress = 0;

                // Cambiar música
                if (this.musicManager) {
                    this.musicManager.playBoss(6, (100 - newPhase * 30) / 100);
                }

                // Destello visual
                if (this.game.boss) {
                    this.game.boss.glitchAmount = 1;
                }

                // Partículas de transición
                this._spawnPhaseTransitionParticles();
            } catch (e) {
                console.error('[EnhancedBossSystem] _transitionPhase error:', e);
            }
        },

        /**
         * Spawn partículas de transición de fase
         */
        _spawnPhaseTransitionParticles() {
            try {
                const g = this.game;
                if (!g.boss) return;

                for (let i = 0; i < 30; i++) {
                    const angle = (i / 30) * Math.PI * 2;
                    const speed = 4 + Math.random() * 3;

                    g.particles.push({
                        x: g.boss.x,
                        y: g.boss.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 40,
                        maxLife: 40,
                        size: 3,
                        color: '#ff00ff',
                        alpha: 0.9,
                        type: 'phase_transition'
                    });
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _spawnPhaseTransitionParticles error:', e);
            }
        },

        /**
         * Ejecuta ataque según el patrón de fase
         */
        _executeBossAttack() {
            try {
                const g = this.game;
                if (!g.boss) return;

                const phaseConfig = BOSS_CONFIGS[6]['phase' + this.currentPhase];
                
                g.boss.attackCooldown -= 1;

                if (g.boss.attackCooldown <= 0) {
                    const pattern = phaseConfig.attackPattern;
                    
                    if (pattern === 'wave_and_orbit') {
                        this._attack_waveAndOrbit();
                    } else if (pattern === 'spiral_burst') {
                        this._attack_spiralBurst();
                    } else if (pattern === 'hex_bombardment') {
                        this._attack_hexBombardment();
                    }

                    g.boss.attackCooldown = 60 * phaseConfig.attackFrequency;
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _executeBossAttack error:', e);
            }
        },

        /**
         * Ataque 1: Wave and Orbit
         */
        _attack_waveAndOrbit() {
            try {
                const g = this.game;
                
                // Crear onda de proyectiles
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    g.fire(
                        g.boss.x,
                        g.boss.y,
                        angle,
                        2,
                        'rgba(255, 0, 100, 0.7)',
                        'enemy'
                    );
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _attack_waveAndOrbit error:', e);
            }
        },

        /**
         * Ataque 2: Spiral Burst
         */
        _attack_spiralBurst() {
            try {
                const g = this.game;
                
                // Espiral de proyectiles
                const spirals = 3;
                for (let s = 0; s < spirals; s++) {
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2 + (s * Math.PI * 0.66);
                        g.fire(
                            g.boss.x,
                            g.boss.y,
                            angle,
                            2.5,
                            'rgba(0, 255, 150, 0.7)',
                            'enemy'
                        );
                    }
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _attack_spiralBurst error:', e);
            }
        },

        /**
         * Ataque 3: Hex Bombardment
         */
        _attack_hexBombardment() {
            try {
                const g = this.game;
                
                // Patrón hexagonal denso
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    g.fire(
                        g.boss.x,
                        g.boss.y,
                        angle,
                        3,
                        'rgba(255, 100, 255, 0.8)',
                        'enemy'
                    );
                }
            } catch (e) {
                console.error('[EnhancedBossSystem] _attack_hexBombardment error:', e);
            }
        },

        /**
         * Actualiza movimiento del boss
         */
        _updateBossMovement() {
            try {
                const g = this.game;
                if (!g.boss) return;

                const phaseConfig = BOSS_CONFIGS[6]['phase' + this.currentPhase];
                
                // Movimiento oscilante
                g.boss.spinAngle += 0.05;
                g.boss.x = g.w / 2 + Math.cos(g.boss.spinAngle) * 100;
                g.boss.y = 100 + Math.sin(g.boss.spinAngle * 0.7) * 50;
            } catch (e) {
                console.error('[EnhancedBossSystem] _updateBossMovement error:', e);
            }
        },

        /**
         * Dibuja el boss de Sector 6
         */
        _drawSector6Boss() {
            try {
                const g = this.game;
                const ctx = g.ctx;
                if (!g.boss || !ctx) return;

                const boss = g.boss;
                const phaseColors = {
                    1: '#0099ff',
                    2: '#00ffaa',
                    3: '#ff00ff'
                };

                ctx.save();
                ctx.translate(boss.x, boss.y);

                // Aplicar glitch en fase 3
                if (boss.glitchAmount > 0) {
                    ctx.globalAlpha = 1 - boss.glitchAmount * 0.3;
                }

                // Cuerpo principal
                ctx.fillStyle = phaseColors[this.currentPhase];
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + boss.spinAngle;
                    const x = Math.cos(angle) * boss.size;
                    const y = Math.sin(angle) * boss.size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();

                // Núcleo
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(0, 0, boss.size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Aura pulsante
                const pulsePhase = (Date.now() % 1000) / 1000;
                const auraRadius = boss.size * (1 + pulsePhase * 0.5);
                ctx.strokeStyle = `rgba(${this.currentPhase === 3 ? '255, 0, 255' : phaseColors[this.currentPhase]}, ${0.5 - pulsePhase * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();

                // Dibujar info de fase
                this._drawPhaseInfo(ctx);
            } catch (e) {
                console.error('[EnhancedBossSystem] _drawSector6Boss error:', e);
            }
        },

        /**
         * Dibuja información de fase
         */
        _drawPhaseInfo(ctx) {
            try {
                const g = this.game;
                if (!g.boss) return;

                const phaseConfig = BOSS_CONFIGS[6]['phase' + this.currentPhase];
                const hpPercent = Math.floor((g.boss.hp / g.boss.maxHp) * 100);

                ctx.save();
                ctx.font = 'bold 0.9rem Orbitron';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#00bfff';
                ctx.shadowColor = '#00bfff';
                ctx.shadowBlur = 10;

                ctx.fillText(phaseConfig.name, g.w / 2, 40);
                ctx.fillText(`HP: ${hpPercent}%`, g.w / 2, 60);

                ctx.restore();
            } catch (e) {
                console.error('[EnhancedBossSystem] _drawPhaseInfo error:', e);
            }
        },

        /**
         * Maneja derrota del boss sector 6
         */
        onSector6BossDefeated() {
            try {
                const g = this.game;
                
                // Cinemática especial
                if (window.CinematicManager) {
                    window.CinematicManager._playVictoryCinematic();
                }

                // Sonido especial
                console.log('🏆 SECTOR 6 VICTORY');
            } catch (e) {
                console.error('[EnhancedBossSystem] onSector6BossDefeated error:', e);
            }
        }
    };

    window.EnhancedBossSystem = EnhancedBossSystem;
})();
