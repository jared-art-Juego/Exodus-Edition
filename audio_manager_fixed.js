/**
 * AUDIO MANAGER - VERSIÓN MEJORADA
 * =================================
 * Control directo de etiquetas <audio> HTML
 * Sin duplicación, control centralizado
 * 
 * Gestiona:
 * - Música de menú
 * - Música de Sector 1
 * - Música de Sector 2
 * - Música de victoria
 * - Música de derrota
 */

const AudioManager = {
    // Referencias a elementos HTML
    elements: {
        menuAudio: null,
        sector1Audio: null,
        sector2Audio: null,
        victoryAudio: null,
        defeatAudio: null
    },

    // Estado
    state: {
        initialized: false,
        currentTrack: null,
        userInteracted: false,
        isPlaying: false,
        currentSector: null
    },

    // Configuración de pistas
    tracks: {
        menu: 'assets/audio/menu_music.mp3',
        sector1: 'assets/audio/sector1_music.mp3',
        sector2: 'assets/audio/sector2_music.mp3',
        victory: 'assets/audio/victory_music.mp3',
        defeat: 'assets/audio/defeat_music.mp3'
    },

    // Volúmenes
    volumes: {
        master: 0.7,
        music: 0.8
    },

    /**
     * Inicializar AudioManager
     */
    init() {
        if (this.state.initialized) return;

        try {
            // Obtener referencias a elementos
            this.elements.menuAudio = document.getElementById('menuAudio');
            this.elements.sector1Audio = document.getElementById('sector1Audio');
            this.elements.sector2Audio = document.getElementById('sector2Audio');
            this.elements.victoryAudio = document.getElementById('victoryAudio');
            this.elements.defeatAudio = document.getElementById('defeatAudio');

            // Cargar volúmenes desde config.json si está disponible
            if (window.ConfigurationManager) {
                const config = window.ConfigurationManager.getAll();
                if (config && config.audio) {
                    this.volumes.master = config.audio.volumen_master || 0.7;
                    this.volumes.music = config.audio.volumen_musica || 0.8;
                    this.updateAllVolumes();
                }
            }

            // Registrar primera interacción del usuario
            const enableAudio = () => {
                this.state.userInteracted = true;
                console.log('✓ AudioManager: User interaction detected');
                
                // Reproducir música de menú si está pendiente
                if (this.state.currentTrack === 'menu' && !this.state.isPlaying) {
                    this.playMenuMusic(true);
                }
                
                // Remover listeners
                document.removeEventListener('click', enableAudio);
                document.removeEventListener('keydown', enableAudio);
            };

            document.addEventListener('click', enableAudio);
            document.addEventListener('keydown', enableAudio);

            this.state.initialized = true;
            console.log('✓ AudioManager initialized');
        } catch (e) {
            console.error('Error initializing AudioManager:', e);
        }
    },

    /**
     * Pausar TODO el audio (excepto el especificado)
     */
    pauseAll(except = null) {
        try {
            Object.values(this.elements).forEach(element => {
                if (element && element !== except) {
                    element.pause();
                }
            });
        } catch (e) {
            console.warn('Error pausing audio:', e);
        }
    },

    /**
     * Reproducir música del menú
     */
    playMenuMusic(force = false) {
        if (!this.state.userInteracted && !force) {
            this.state.currentTrack = 'menu';
            return;
        }

        try {
            this.pauseAll(this.elements.menuAudio);
            
            this.elements.menuAudio.src = this.tracks.menu;
            this.elements.menuAudio.volume = this.volumes.master * this.volumes.music;
            
            const playPromise = this.elements.menuAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.state.isPlaying = true;
                        this.state.currentTrack = 'menu';
                        this.state.currentSector = null;
                        console.log('🎵 Playing: Menu Music');
                    })
                    .catch(error => {
                        console.warn('Could not play menu music:', error);
                    });
            }
        } catch (e) {
            console.error('Error playing menu music:', e);
        }
    },

    /**
     * Reproducir música de sector
     */
    playSectorMusic(sector) {
        if (!this.state.userInteracted) {
            this.state.currentTrack = `sector${sector}`;
            this.state.currentSector = sector;
            return;
        }

        try {
            const trackKey = `sector${sector}`;
            const trackUrl = this.tracks[trackKey];

            if (!trackUrl) {
                console.warn(`No track configured for sector ${sector}`);
                return;
            }

            // Pausar todos excepto el del sector correspondiente
            let audioElement = null;
            if (sector === 1) {
                audioElement = this.elements.sector1Audio;
            } else if (sector === 2) {
                audioElement = this.elements.sector2Audio;
            }

            if (!audioElement) {
                console.warn(`No audio element for sector ${sector}`);
                return;
            }

            this.pauseAll(audioElement);
            
            audioElement.src = trackUrl;
            audioElement.volume = this.volumes.master * this.volumes.music;
            
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.state.isPlaying = true;
                        this.state.currentTrack = trackKey;
                        this.state.currentSector = sector;
                        console.log(`🎵 Playing: Sector ${sector} Music`);
                    })
                    .catch(error => {
                        console.warn(`Could not play sector ${sector} music:`, error);
                    });
            }
        } catch (e) {
            console.error('Error playing sector music:', e);
        }
    },

    /**
     * Reproducir música de victoria
     */
    playVictoryMusic() {
        try {
            this.pauseAll(this.elements.victoryAudio);
            
            this.elements.victoryAudio.src = this.tracks.victory;
            this.elements.victoryAudio.volume = this.volumes.master * this.volumes.music;
            
            const playPromise = this.elements.victoryAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🎵 Playing: Victory Music');
                    })
                    .catch(error => {
                        console.warn('Could not play victory music:', error);
                    });
            }
        } catch (e) {
            console.error('Error playing victory music:', e);
        }
    },

    /**
     * Reproducir música de derrota
     */
    playDefeatMusic() {
        try {
            this.pauseAll(this.elements.defeatAudio);
            
            this.elements.defeatAudio.src = this.tracks.defeat;
            this.elements.defeatAudio.volume = this.volumes.master * this.volumes.music;
            
            const playPromise = this.elements.defeatAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🎵 Playing: Defeat Music');
                    })
                    .catch(error => {
                        console.warn('Could not play defeat music:', error);
                    });
            }
        } catch (e) {
            console.error('Error playing defeat music:', e);
        }
    },

    /**
     * Detener TODO el audio
     */
    stopAll() {
        try {
            this.pauseAll();
            this.state.isPlaying = false;
            console.log('⏹ All audio stopped');
        } catch (e) {
            console.error('Error stopping audio:', e);
        }
    },

    /**
     * Pausar música actual
     */
    pause() {
        try {
            this.pauseAll();
            this.state.isPlaying = false;
            console.log('⏸ Music paused');
        } catch (e) {
            console.error('Error pausing music:', e);
        }
    },

    /**
     * Reanudar música
     */
    resume() {
        try {
            if (this.state.currentTrack === 'menu') {
                this.playMenuMusic(true);
            } else if (this.state.currentSector) {
                this.playSectorMusic(this.state.currentSector);
            }
            console.log('▶ Music resumed');
        } catch (e) {
            console.error('Error resuming music:', e);
        }
    },

    /**
     * Establecer volumen de música
     */
    setMusicVolume(volume) {
        this.volumes.music = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    },

    /**
     * Establecer volumen maestro
     */
    setMasterVolume(volume) {
        this.volumes.master = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    },

    /**
     * Actualizar volúmenes en todos los elementos
     */
    updateAllVolumes() {
        const finalVolume = this.volumes.master * this.volumes.music;
        
        try {
            Object.values(this.elements).forEach(element => {
                if (element) {
                    element.volume = finalVolume;
                }
            });
        } catch (e) {
            console.warn('Error updating volumes:', e);
        }
    },

    /**
     * Obtener estado
     */
    getStatus() {
        return {
            initialized: this.state.initialized,
            userInteracted: this.state.userInteracted,
            isPlaying: this.state.isPlaying,
            currentTrack: this.state.currentTrack,
            currentSector: this.state.currentSector,
            volumes: {
                master: this.volumes.master,
                music: this.volumes.music,
                combined: this.volumes.master * this.volumes.music
            }
        };
    }
};

// Auto-inicializar cuando document esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco antes de inicializar (para que otros sistemas estén listos)
    setTimeout(() => {
        AudioManager.init();
    }, 100);
});

// Exportar globalmente
window.AudioManager = AudioManager;

console.log('✓ AudioManager (HTML5 Audio) loaded');
