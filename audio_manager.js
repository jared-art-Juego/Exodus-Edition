/**
 * AUDIO MANAGER CENTRAL
 * =====================
 * Gestiona toda la música y efectos de sonido localmente
 * 
 * Características:
 * - Música local desde assets/audio/music/
 * - No usa YouTube
 * - Control de volumen independiente
 * - Solo reproduce tras interacción del usuario
 * - Respeta config.json
 * - Previene duplicados
 */

const AudioManager = {
    // Estado
    state: {
        musicPlaying: false,
        currentTrack: null,
        currentSector: null,
        isInitialized: false,
        userInteracted: false,
        audioContext: null
    },

    // Pistas de música por sector
    tracks: {
        menu: 'menu_theme.mp3',
        sector1: 'sector1_music.mp3',
        sector2: 'sector2_music.mp3',
        sector3: 'sector3_music.mp3',
        victory: 'victory_theme.mp3',
        defeat: 'defeat_theme.mp3'
    },

    // Audio elements
    elements: {
        music: null,
        sfx: []
    },

    // Volúmenes
    volumes: {
        master: 0.7,
        music: 0.8,
        sfx: 1.0
    },

    /**
     * Inicializar AudioManager
     */
    init() {
        if (this.state.isInitialized) return;

        // Crear elemento de audio para música
        this.elements.music = new Audio();
        this.elements.music.volume = this.volumes.master * this.volumes.music;
        this.elements.music.loop = true;
        this.elements.music.crossOrigin = 'anonymous';

        // Cargar volúmenes desde config.json si está disponible
        if (window.ConfigurationManager) {
            const config = window.ConfigurationManager.getAll();
            if (config && config.audio) {
                this.volumes.master = config.audio.volumen_master || 0.7;
                this.volumes.music = config.audio.volumen_musica || 0.8;
                this.volumes.sfx = config.audio.volumen_efectos || 1.0;
            }
        }

        // Registrar que el usuario interactuó (primer click/keypress)
        document.addEventListener('click', () => this._handleUserInteraction(), { once: true });
        document.addEventListener('keydown', () => this._handleUserInteraction(), { once: true });

        this.state.isInitialized = true;
        console.log('✓ AudioManager initialized');
    },

    /**
     * Manejador de interacción del usuario
     */
    _handleUserInteraction() {
        this.state.userInteracted = true;
        console.log('✓ User interaction detected - audio can play');
        
        // Si hay música programada para reproducir, hazlo ahora
        if (this.state.currentTrack && !this.state.musicPlaying) {
            this.playMusic(this.state.currentTrack, true);
        }
    },

    /**
     * Reproducir música
     * @param {string} trackKey - Clave de pista (ej: 'sector1')
     * @param {boolean} force - Forzar reproducción incluso si ya está sonando
     */
    playMusic(trackKey, force = false) {
        // Si no hay usuario interactuó, programar para después
        if (!this.state.userInteracted) {
            this.state.currentTrack = trackKey;
            return;
        }

        // Si la misma pista ya está sonando y no forzamos, salir
        if (this.state.currentTrack === trackKey && this.state.musicPlaying && !force) {
            return;
        }

        // Detener música actual
        if (this.state.musicPlaying) {
            this.stopMusic();
        }

        const trackPath = `assets/audio/music/${this.tracks[trackKey] || trackKey}`;

        this.elements.music.src = trackPath;
        this.elements.music.volume = this.volumes.master * this.volumes.music;
        
        // Intentar reproducir
        const playPromise = this.elements.music.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.state.musicPlaying = true;
                    this.state.currentTrack = trackKey;
                    console.log(`🎵 Playing: ${trackKey}`);
                })
                .catch(error => {
                    console.warn(`⚠ Failed to play ${trackKey}:`, error);
                    // Reintentar si falló
                });
        }
    },

    /**
     * Detener música
     */
    stopMusic() {
        if (this.elements.music && this.state.musicPlaying) {
            this.elements.music.pause();
            this.elements.music.currentTime = 0;
            this.state.musicPlaying = false;
            console.log('⏹ Music stopped');
        }
    },

    /**
     * Pausar música
     */
    pauseMusic() {
        if (this.elements.music && this.state.musicPlaying) {
            this.elements.music.pause();
            this.state.musicPlaying = false;
            console.log('⏸ Music paused');
        }
    },

    /**
     * Reanudar música
     */
    resumeMusic() {
        if (this.elements.music && !this.state.musicPlaying && this.state.userInteracted) {
            this.elements.music.play()
                .then(() => {
                    this.state.musicPlaying = true;
                    console.log('▶ Music resumed');
                })
                .catch(error => console.warn('Resume failed:', error));
        }
    },

    /**
     * Establecer volumen de música
     * @param {number} volume - 0.0 a 1.0
     */
    setMusicVolume(volume) {
        this.volumes.music = Math.max(0, Math.min(1, volume));
        if (this.elements.music) {
            this.elements.music.volume = this.volumes.master * this.volumes.music;
        }
    },

    /**
     * Establecer volumen de efectos
     * @param {number} volume - 0.0 a 1.0
     */
    setSfxVolume(volume) {
        this.volumes.sfx = Math.max(0, Math.min(1, volume));
    },

    /**
     * Establecer volumen principal
     * @param {number} volume - 0.0 a 1.0
     */
    setMasterVolume(volume) {
        this.volumes.master = Math.max(0, Math.min(1, volume));
        if (this.elements.music) {
            this.elements.music.volume = this.volumes.master * this.volumes.music;
        }
    },

    /**
     * Reproducir música de sector
     * @param {number} sector - Número de sector (1-6)
     */
    playSectorMusic(sector) {
        const trackKey = `sector${sector}`;
        if (this.tracks[trackKey]) {
            this.playMusic(trackKey);
            this.state.currentSector = sector;
        } else {
            console.warn(`No music configured for sector ${sector}`);
        }
    },

    /**
     * Reproducir música de menú
     */
    playMenuMusic() {
        this.playMusic('menu');
    },

    /**
     * Reproducir sonido de victoria
     */
    playVictoryMusic() {
        this.playMusic('victory');
    },

    /**
     * Reproducir sonido de derrota
     */
    playDefeatMusic() {
        this.playMusic('defeat');
    },

    /**
     * Obtener estado del audio
     */
    getStatus() {
        return {
            isInitialized: this.state.isInitialized,
            userInteracted: this.state.userInteracted,
            musicPlaying: this.state.musicPlaying,
            currentTrack: this.state.currentTrack,
            currentSector: this.state.currentSector,
            volumes: this.volumes
        };
    }
};

// Auto-inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    console.log('AudioManager ready');
});

// Exportar para uso global
window.AudioManager = AudioManager;
