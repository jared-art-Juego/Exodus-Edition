/**
 * VECTOR EXODUS - Audio-Reactive Cosmetics Manager
 * Cosmetics reaccionar a BPM, bass intensity, drops, boss HP
 * Modular - se integra con MusicManager y CosmeticManager
 */
(function() {
    'use strict';

    const AudioReactiveCosmeticsManager = {
        game: null,
        musicManager: null,
        cosmeticManager: null,
        
        // Estado del audio
        audioState: {
            bpm: 120,
            bassIntensity: 0,
            isDrop: false,
            isKick: false,
            inEpic: false,
            bossHpPercent: 1,
            sector: 1
        },
        
        // Cache de análisis
        kickBuffer: [],
        bassBuffer: [],
        epicSectionThreshold: 0.7,
        
        init(game, musicManager, cosmeticManager) {
            try {
                this.game = game;
                this.musicManager = musicManager;
                this.cosmeticManager = cosmeticManager;
                
                // Patch del loop del juego para actualizar efectos
                const origLoop = game.loop && game.loop.bind(game);
                if (origLoop) {
                    game.loop = () => {
                        this.update();
                        origLoop();
                    };
                }
                
                // Patch del draw para aplicar efectos visuales
                const origUpdateHUD = game.updateHUD && game.updateHUD.bind(game);
                if (origUpdateHUD) {
                    game.updateHUD = () => {
                        origUpdateHUD();
                        this.drawReactiveEffects();
                    };
                }
            } catch (e) {
                console.error('[AudioReactiveCosmeticsManager] init error:', e);
            }
        },
        
        /**
         * Actualiza el estado de análisis de audio
         */
        update() {
            try {
                if (!this.musicManager || !this.game) return;
                
                const mm = this.musicManager;
                
                // Detectar BPM (default 120)
                this.audioState.bpm = mm.currentBPM || 120;
                
                // Analizar intensidad del bajo
                this._analyzeBassIntensity();
                
                // Detectar drops (cambios súbitos en intensidad)
                this._detectDrops();
                
                // Detectar kicks (picos de audio)
                this._detectKicks();
                
                // Secciones épicas (vida del jefe baja)
                if (this.game.boss && this.game.boss.hp) {
                    this.audioState.bossHpPercent = Math.max(0, this.game.boss.hp / this.game.boss.maxHp);
                    this.audioState.inEpic = this.audioState.bossHpPercent < 0.25;
                } else {
                    this.audioState.bossHpPercent = 1;
                    this.audioState.inEpic = false;
                }
                
                this.audioState.sector = this.game.sector || 1;
            } catch (e) {
                console.error('[AudioReactiveCosmeticsManager] update error:', e);
            }
        },
        
        /**
         * Analiza la intensidad del bajo (0-1)
         */
        _analyzeBassIntensity() {
            // Simulación de análisis de audio
            // En una versión real, usarías AnalyserNode de Web Audio API
            // Para ahora, basamos en el BPM y fase de la música
            
            const mm = this.musicManager;
            const now = Date.now();
            
            // Patrón simple: intensidad sube hacia drops cada 4 beats
            const bpm = this.audioState.bpm;
            const beatDuration = (60 / bpm) * 1000; // ms por beat
            const position = now % (beatDuration * 4);
            const phase = position / (beatDuration * 4);
            
            // Intensidad sube progresivamente
            this.audioState.bassIntensity = Math.min(1, phase * 1.3);
            
            // Si está en jefe, la intensidad aumenta según la vida baja
            if (this.game.boss && this.audioState.bossHpPercent < 0.5) {
                this.audioState.bassIntensity = Math.min(1, this.audioState.bassIntensity + (1 - this.audioState.bossHpPercent));
            }
        },
        
        /**
         * Detecta drops (cambios de intensidad)
         */
        _detectDrops() {
            const intensidad = this.audioState.bassIntensity;
            const wasHigh = this.audioState.lastBassIntensity > 0.7;
            const isLow = intensidad < 0.3;
            
            // Drop detect: transición de alta a baja intensidad
            this.audioState.isDrop = wasHigh && isLow;
            this.audioState.lastBassIntensity = intensidad;
        },
        
        /**
         * Detecta kicks (picos rítmicos)
         */
        _detectKicks() {
            const bpm = this.audioState.bpm;
            const beatDuration = (60 / bpm) * 1000;
            const now = Date.now();
            
            // Kick cada beat
            const position = now % beatDuration;
            const kickWindow = beatDuration * 0.1; // ventana de kick 10% del beat
            
            this.audioState.isKick = position < kickWindow;
        },
        
        /**
         * Aplica efectos visuales reactivos al cosmético activo
         */
        drawReactiveEffects() {
            try {
                if (!this.game || !this.cosmeticManager) return;
                
                const ctx = this.game.ctx;
                if (!ctx) return;
                
                const activeTrail = this.cosmeticManager.getActive('trail');
                const activeSkin = this.cosmeticManager.getActive('shot');
                
                // Efecto de brillo en drops (Skins)
                if (this.audioState.isDrop) {
                    this._applyDropGlintEffect(ctx);
                }
                
                // Cambio de tonalidad según sector
                if (activeTrail.id !== 'none') {
                    this._applySectorTint(ctx);
                }
                
                // Pulso al ritmo del kick
                if (this.audioState.isKick) {
                    this._applyKickPulse(ctx);
                }
                
                // Efectos para trails
                if (activeTrail.id === 'glitch') {
                    this._applyGlitchEffect(ctx);
                }
            } catch (e) {
                console.error('[AudioReactiveCosmeticsManager] drawReactiveEffects error:', e);
            }
        },
        
        /**
         * Efecto de brillo en drops
         */
        _applyDropGlintEffect(ctx) {
            try {
                const g = this.game;
                if (!g.player) return;
                
                // Aura brillante alrededor del jugador
                ctx.save();
                ctx.fillStyle = 'rgba(0, 255, 200, 0.3)';
                ctx.beginPath();
                ctx.arc(g.player.x, g.player.y, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } catch (e) {}
        },
        
        /**
         * Cambio de tonalidad según sector
         */
        _applySectorTint(ctx) {
            try {
                const sector = this.audioState.sector;
                const tints = {
                    1: 'rgba(0, 180, 255, 0.08)',   // Cyan
                    2: 'rgba(255, 100, 0, 0.08)',   // Orange
                    3: 'rgba(100, 0, 255, 0.08)',   // Purple
                    4: 'rgba(0, 255, 100, 0.08)',   // Green
                    5: 'rgba(255, 0, 100, 0.08)',   // Pink
                    6: 'rgba(255, 200, 0, 0.08)'    // Gold
                };
                
                const tint = tints[sector] || tints[1];
                ctx.save();
                ctx.fillStyle = tint;
                ctx.fillRect(0, 0, this.game.w, this.game.h);
                ctx.restore();
            } catch (e) {}
        },
        
        /**
         * Pulso al ritmo del kick
         */
        _applyKickPulse(ctx) {
            try {
                const g = this.game;
                if (!g.player) return;
                
                // Escala ligeramente el jugador en el kick
                const scale = 1.15;
                ctx.save();
                ctx.translate(g.player.x, g.player.y);
                ctx.scale(scale, scale);
                ctx.translate(-g.player.x, -g.player.y);
                
                // El resto del draweo ya está hecho, este es visual overlay
                
                ctx.restore();
            } catch (e) {}
        },
        
        /**
         * Efecto glitch en trails legendarios en drops
         */
        _applyGlitchEffect(ctx) {
            try {
                if (!this.audioState.isDrop) return;
                
                const g = this.game;
                const glitchAmount = 3;
                
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#00ff00';
                
                // Distorsión glitch pequeña
                ctx.fillRect(
                    Math.random() * g.w,
                    Math.random() * g.h,
                    Math.random() * 50,
                    Math.random() * 50
                );
                
                ctx.restore();
            } catch (e) {}
        },
        
        /**
         * Obtiene el multiplicador visual basado en audio
         */
        getVisualMultiplier() {
            let mult = 1;
            
            // Mayor brillo en drops
            if (this.audioState.isDrop) mult *= 1.5;
            
            // Mayor escala en kicks
            if (this.audioState.isKick) mult *= 1.1;
            
            // Mayor intensidad en secciones épicas
            if (this.audioState.inEpic) mult *= 1.3;
            
            return Math.min(2, mult);
        },
        
        /**
         * Modifica duración de trails según intensidad de música
         */
        modifyTrailDuration(baseDuration) {
            return baseDuration * (1 + this.audioState.bassIntensity * 0.5);
        },
        
        /**
         * Modifica color de trails según contexto
         */
        getModifiedTrailColor(baseColor) {
            if (this.audioState.inEpic) {
                // Cambio a tonos más cálidos/rojos en momentos críticos
                return baseColor.replace('rgba(', 'rgba(255, ').replace(/,(\s?\d+),/, ', 50,');
            }
            return baseColor;
        }
    };
    
    window.AudioReactiveCosmeticsManager = AudioReactiveCosmeticsManager;
})();
