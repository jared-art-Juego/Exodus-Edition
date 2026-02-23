/**
 * VECTOR EXODUS - AI Director / Dynamic Difficulty
 * Ajusta dificultad basado en rendimiento del jugador
 * 
 * Si juegas bien → aumenta agresividad
 * Si mueres mucho → reduce dificultad
 * Si haces streaks perfectas → eventos especiales
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_ai_director_v1';

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

    const AiDirector = {
        game: null,
        
        // Estado del director
        adaptiveDifficulty: 1.0, // 0.5 a 2.0
        deathCount: 0,
        perfectWaveCount: 0,
        playerSkillLevel: 0.5, // 0 a 1
        isActivatedSpecialEvents: false,
        
        // Sesión actual
        wavePerfectRuns: 0,
        damageTakenThisWave: 0,
        waveStartEnemy: 0,
        streakBonus: 0,
        
        // Histórico
        history: {
            sessionsPlayed: 0,
            totalKills: 0,
            totalDeaths: 0,
            averageWaveSurvivalTime: 0
        },

        init(game, combatFlowManager) {
            try {
                this.game = game;
                this.combatFlowManager = combatFlowManager;
                
                const saved = load();
                if (saved) {
                    this.history = saved;
                }
                
                this._patchGame();
            } catch (e) {
                console.error('[AiDirector] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Patrón: al comenzar una onda, calcular dificultad de enemigos
            const origCheckWaveProgress = g.checkWaveProgress && g.checkWaveProgress.bind(g);
            if (origCheckWaveProgress) {
                g.checkWaveProgress = () => {
                    // Antes de actualizar onda, calcular nueva dificultad
                    self._calculateAdaptiveDifficulty();
                    self._adjustEnemySpawning();
                    origCheckWaveProgress();
                };
            }

            // Al tomar daño
            const origDamagePlayer = g.damagePlayer && g.damagePlayer.bind(g);
            if (origDamagePlayer) {
                g.damagePlayer = function(amount) {
                    self.damageTakenThisWave += amount;
                    origDamagePlayer(amount);
                };
            }

            // Al morir
            const origReturnToMenu = g.returnToMenu && g.returnToMenu.bind(g);
            if (origReturnToMenu) {
                g.returnToMenu = () => {
                    self._onGameOver();
                    origReturnToMenu();
                };
            }

            // Al empezar partida
            const origStartGameplay = g.startGameplay && g.startGameplay.bind(g);
            if (origStartGameplay) {
                g.startGameplay = () => {
                    self._onGameplayStart();
                    origStartGameplay();
                };
            }
        },

        /**
         * Llamado al iniciar gameplay
         */
        _onGameplayStart() {
            try {
                this.damageTakenThisWave = 0;
                this.wavePerfectRuns = 0;
                this.history.sessionsPlayed += 1;
                this.waveStartEnemy = this.game.wave || 1;
            } catch (e) {
                console.error('[AiDirector] _onGameplayStart error:', e);
            }
        },

        /**
         * Llamado al game over
         */
        _onGameOver() {
            try {
                this.deathCount += 1;
                this.history.totalDeaths += 1;
                
                // Si mueres mucho
                if (this.deathCount > 3) {
                    console.log('📉 Too many deaths, reducing difficulty...');
                    this.adaptiveDifficulty = Math.max(0.5, this.adaptiveDifficulty - 0.1);
                }
                
                this.save();
            } catch (e) {
                console.error('[AiDirector] _onGameOver error:', e);
            }
        },

        /**
         * Calcula dificultad adaptativa cada onda
         */
        _calculateAdaptiveDifficulty() {
            try {
                const g = this.game;
                if (!g) return;

                // Factor 1: Daño recibido en onda anterior
                // Si no recibiste daño, aumentar dificultad
                const healthPenalty = this.damageTakenThisWave > 0 ? 0 : 0.15;

                // Factor 2: Streak del jugador (si está en DOMINANCE o UNSTOPPABLE)
                const streakBonus = this.combatFlowManager 
                    ? this.combatFlowManager.streakKills / 50 * 0.1
                    : 0;

                // Factor 3: Muertes en sesión
                const deathPenalty = Math.min(0.3, this.deathCount * 0.05);

                // Factor 4: Número de onda (a más onda, más dificultad base)
                const waveMultiplier = 1 + ((g.wave || 1) - 1) * 0.1;

                // Calcular dificultad
                let newDifficulty = this.adaptiveDifficulty;
                newDifficulty += healthPenalty; // Aumentar si oasis
                newDifficulty += streakBonus; // Aumentar si haces streaks
                newDifficulty -= deathPenalty; // Reducir si mueres mucho
                newDifficulty *= waveMultiplier;

                // Clampear entre 0.5 y 2.0
                this.adaptiveDifficulty = Math.max(0.5, Math.min(2.0, newDifficulty));

                // Calcular nivel de habilidad del jugador (0-1)
                const survivalRate = Math.max(0, 1 - (this.deathCount / 10));
                const streakRate = Math.min(1, (this.combatFlowManager?.streakKills || 0) / 30);
                this.playerSkillLevel = (survivalRate + streakRate) / 2;

                console.log(`AI: Difficulty=${this.adaptiveDifficulty.toFixed(2)}, SkillLevel=${this.playerSkillLevel.toFixed(2)}`);

                // Si skill level es alto, activar eventos especiales
                if (this.playerSkillLevel > 0.8 && !this.isActivatedSpecialEvents) {
                    this._triggerSpecialEvents();
                }

                this.damageTakenThisWave = 0; // Reset para siguiente onda
            } catch (e) {
                console.error('[AiDirector] _calculateAdaptiveDifficulty error:', e);
            }
        },

        /**
         * Ajusta el spawning de enemigos según dificultad
         */
        _adjustEnemySpawning() {
            try {
                const g = this.game;
                if (!g) return;

                // Multiplicar cantidad máxima de enemigos
                const baseMax = 3;
                const adjustedMax = Math.floor(baseMax + (this.adaptiveDifficulty - 0.5) * 3);

                // Aumentar velocidad de spawn
                const spawnMultiplier = 1 + (this.adaptiveDifficulty - 1) * 0.3;

                // Ajustar propiedades del juego
                g._aiEnemySpeedMultiplier = this.adaptiveDifficulty;
                g._aiSpawnRateMultiplier = spawnMultiplier;
                g._aiMaxEnemiesWave = adjustedMax;

                console.log(`🎯 Enemy spawn adjusted: Max=${adjustedMax}, SpeedMult=${this.adaptiveDifficulty.toFixed(2)}`);
            } catch (e) {
                console.error('[AiDirector] _adjustEnemySpawning error:', e);
            }
        },

        /**
         * Activa eventos especiales si el jugador es muy hábil
         */
        _triggerSpecialEvents() {
            try {
                if (this.isActivatedSpecialEvents) return;
                this.isActivatedSpecialEvents = true;

                console.log('⭐ SPECIAL EVENTS ACTIVATED (Player is skilled!)');

                // Esto podrían disparar:
                // - Eventos raros
                // - Jefes alternos
                // - Música remezclada
                // El AdvancedSystems manejará esto

                if (window.AdvancedSystems) {
                    window.AdvancedSystems.rareEventCheck();
                }
            } catch (e) {
                console.error('[AiDirector] _triggerSpecialEvents error:', e);
            }
        },

        /**
         * Obtiene multiplicador de velocidad enemiga
         */
        getEnemySpeedMultiplier() {
            return this.adaptiveDifficulty;
        },

        /**
         * Obtiene multiplicador de armadura/vida enemiga
         */
        getEnemyHealthMultiplier() {
            return Math.max(1, this.adaptiveDifficulty);
        },

        /**
         * Obtiene estado actual del AI Director
         */
        getState() {
            return {
                difficulty: this.adaptiveDifficulty,
                skillLevel: this.playerSkillLevel,
                deathCount: this.deathCount,
                specialEventsActive: this.isActivatedSpecialEvents
            };
        },

        save() {
            save(this.history);
        }
    };

    window.AiDirector = AiDirector;
})();
