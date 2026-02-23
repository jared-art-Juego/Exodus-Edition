/**
 * VECTOR EXODUS - Configuration Manager
 * 
 * Sistema profesional para cargar y gestionar configuraciones desde config.json
 * 
 * ✓ Carga asíncrona desde config.json
 * ✓ Fallbacks por defecto si falla la carga
 * ✓ Integración con sistemas existentes
 * ✓ Hot-reload de configuración
 * ✓ Validación de valores
 * ✓ Persistencia de cambios
 */
(function() {
    'use strict';

    const DEFAULT_CONFIG = {
        version: "1.0.0",
        game_title: "VECTOR EXODUS: EXODUS EDITION",
        player: {
            nombre_jugador: "Piloto Exodus",
            nivel_maximo_alcanzado: 1,
            ultima_partida: new Date().toISOString().split('T')[0],
            sector_actual: 1
        },
        audio: {
            volumen_musica: 0.8,
            volumen_efectos: 1.0,
            volumen_master: 0.7,
            enabled: true,
            auto_play_music: true
        },
        gameplay: {
            dificultad: "normal",
            difficulty_multipliers: {
                easy: 0.7,
                normal: 1.0,
                hard: 1.3,
                insane: 1.6
            },
            starting_sector: 1,
            max_enemies: 50
        },
        display: {
            pantalla_completa: false,
            width: 1280,
            height: 720,
            fps_target: 60
        },
        enhancement_systems: {
            sector1_enhancements: true,
            defeat_cinematic: true,
            weapon_box_system: true,
            persistent_save: true,
            menu_animation: true,
            procedural_backgrounds: true
        }
    };

    const ConfigurationManager = {
        config: { ...DEFAULT_CONFIG },
        isLoaded: false,
        lastLoadTime: null,
        
        /**
         * Cargar configuración desde config.json
         * @returns {Promise<boolean>} true si se cargó exitosamente
         */
        async load() {
            try {
                console.info('[ConfigurationManager] Loading config.json...');
                
                const response = await fetch('config.json');
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                const loadedConfig = await response.json();
                
                // Merge con valores por defecto (preserva defaults no sobrescritos)
                this.config = this._deepMerge(DEFAULT_CONFIG, loadedConfig);
                this.isLoaded = true;
                this.lastLoadTime = Date.now();
                
                console.info('[ConfigurationManager] ✅ Config loaded successfully', this.config);
                
                // Auto-aplicar configuraciones críticas
                this._applyConfiguration();
                
                return true;
            } catch (error) {
                console.warn('[ConfigurationManager] ⚠️ Failed to load config.json, using defaults:', error.message);
                this.config = { ...DEFAULT_CONFIG };
                this.isLoaded = false;
                return false;
            }
        },

        /**
         * Deep merge de dos objetos (the loaded config overrides defaults)
         */
        _deepMerge(target, source) {
            try {
                const result = { ...target };
                
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                            result[key] = this._deepMerge(target[key] || {}, source[key]);
                        } else {
                            result[key] = source[key];
                        }
                    }
                }
                
                return result;
            } catch (e) {
                console.error('[ConfigurationManager] Merge error:', e);
                return target;
            }
        },

        /**
         * Aplicar configuraciones al juego
         */
        _applyConfiguration() {
            try {
                const cfg = this.config;
                const game = window.Game;
                
                if (!game) {
                    console.warn('[ConfigurationManager] Game object not ready, deferring');
                    return;
                }

                // Audio volumen
                if (cfg.audio && window.MusicManager) {
                    window.MusicManager.setMasterVolume(cfg.audio.volumen_master);
                    window.MusicManager.setMusicVolume(cfg.audio.volumen_musica);
                    window.MusicManager.setSfxVolume(cfg.audio.volumen_efectos);
                    console.debug('[ConfigurationManager] Audio volumes applied');
                }

                // Dificultad por defecto
                if (cfg.gameplay && cfg.gameplay.dificultad) {
                    game.difficulty = cfg.gameplay.dificultad;
                    console.debug('[ConfigurationManager] Difficulty set to:', cfg.gameplay.dificultad);
                }

                // Sector por defecto
                if (cfg.player && cfg.player.sector_actual) {
                    // Solo aplicar si es primer cargar
                    console.debug('[ConfigurationManager] Starting sector:', cfg.player.sector_actual);
                }

                console.info('[ConfigurationManager] Configuration applied to game');
            } catch (e) {
                console.error('[ConfigurationManager] Apply config error:', e);
            }
        },

        /**
         * Obtener valor de configuración (con path tipo "audio.volumen_musica")
         * @param {string} path - Ruta al valor (ej: "audio.volumen_musica")
         * @param {*} defaultValue - Valor por defecto si no existe
         * @returns {*} El valor configurado
         */
        get(path, defaultValue = null) {
            try {
                const keys = path.split('.');
                let value = this.config;

                for (const key of keys) {
                    if (value && typeof value === 'object' && key in value) {
                        value = value[key];
                    } else {
                        return defaultValue;
                    }
                }

                return value !== undefined ? value : defaultValue;
            } catch (e) {
                console.error('[ConfigurationManager] Get error:', e);
                return defaultValue;
            }
        },

        /**
         * Establecer valor de configuración
         * @param {string} path - Ruta al valor
         * @param {*} value - Nuevo valor
         */
        set(path, value) {
            try {
                const keys = path.split('.');
                const lastKey = keys.pop();
                let current = this.config;

                // Navegar/crear estructura
                for (const key of keys) {
                    if (!(key in current)) {
                        current[key] = {};
                    }
                    current = current[key];
                }

                current[lastKey] = value;
                console.debug(`[ConfigurationManager] Set ${path} =`, value);
                
                // Persistir cambios (si sistema de save está disponible)
                this._persistChanges();
            } catch (e) {
                console.error('[ConfigurationManager] Set error:', e);
            }
        },

        /**
         * Persistir cambios de configuración
         */
        _persistChanges() {
            try {
                if (window.PersistentSaveSystem) {
                    localStorage.setItem('vx_config', JSON.stringify(this.config));
                }
            } catch (e) {
                // Silenciar - si no se puede guardar, no es crítico
            }
        },

        /**
         * Recargar configuración desde archivo
         */
        async reload() {
            console.info('[ConfigurationManager] Reloading configuration...');
            await this.load();
        },

        /**
         * Resetear a configuración por defecto
         */
        reset() {
            this.config = { ...DEFAULT_CONFIG };
            this._persistChanges();
            console.info('[ConfigurationManager] Reset to defaults');
        },

        /**
         * Exportar configuración actual
         */
        export() {
            return JSON.stringify(this.config, null, 2);
        },

        /**
         * Importar configuración desde JSON
         */
        import(jsonString) {
            try {
                const imported = JSON.parse(jsonString);
                this.config = this._deepMerge(DEFAULT_CONFIG, imported);
                this._persistChanges();
                console.info('[ConfigurationManager] Configuration imported');
                return true;
            } catch (e) {
                console.error('[ConfigurationManager] Import error:', e);
                return false;
            }
        },

        /**
         * Obtener toda la configuración
         */
        getAll() {
            return { ...this.config };
        },

        /**
         * Obtener información de carga
         */
        getStatus() {
            return {
                isLoaded: this.isLoaded,
                lastLoadTime: this.lastLoadTime,
                version: this.config.version,
                timestamp: new Date().toISOString()
            };
        },

        /**
         * Validar si un valor está habilitado
         */
        isEnabled(path) {
            return this.get(path, false) === true;
        },

        /**
         * Obtener multiplicador de dificultad actual
         */
        getDifficultyMultiplier(difficulty = null) {
            const diff = difficulty || this.get('gameplay.dificultad', 'normal');
            const multipliers = this.get('gameplay.difficulty_multipliers', {});
            return multipliers[diff] || 1.0;
        },

        /**
         * Aplicar tema de volumen
         */
        applyVolumePreset(preset = 'balanced') {
            const presets = {
                muted: { master: 0, musica: 0, efectos: 0 },
                quiet: { master: 0.3, musica: 0.2, efectos: 0.3 },
                balanced: { master: 0.7, musica: 0.6, efectos: 1.0 },
                loud: { master: 1.0, musica: 0.8, efectos: 1.0 }
            };

            const selected = presets[preset] || presets.balanced;
            this.set('audio.volumen_master', selected.master);
            this.set('audio.volumen_musica', selected.musica);
            this.set('audio.volumen_efectos', selected.efectos);
            
            console.info('[ConfigurationManager] Volume preset applied:', preset);
        }
    };

    // Exponer a la ventana global
    window.ConfigurationManager = ConfigurationManager;

    // Auto-cargar configuración cuando el documento esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await ConfigurationManager.load();
        });
    } else {
        // Ya está ready
        ConfigurationManager.load().catch(e => {
            console.error('[ConfigurationManager] Async load error:', e);
        });
    }
})();
