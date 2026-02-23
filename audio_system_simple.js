/**
 * AUDIO SYSTEM SIMPLE
 * ==================
 * Sistema simple de audio usando HTML5 nativo
 * Sin duplicación, sin síntesis, solo HTML5 Audio elements
 * 
 * ARCHIVOS REQUERIDOS EN ./media/:
 * - menu.mp3
 * - sector1.mp3
 * - sector2.mp3
 * - victory.mp3
 * - defeat.mp3
 */

window.AudioSystemSimple = {
    // Referencias a elementos de audio (se obtienen una sola vez)
    elements: {
        menu: null,
        sector1: null,
        sector2: null,
        victory: null,
        defeat: null
    },

    // Estado
    state: {
        initialized: false,
        userInteracted: false,
        currentlyPlaying: null,
        volume: 0.5
    },

    /**
     * Inicializar sistema de audio
     * Se llama automáticamente cuando carga el juego
     */
    init() {
        console.log('🎵 AudioSystemSimple: Inicializando...');

        // Obtener referencias a elementos
        this.elements.menu = document.getElementById('menuAudio');
        this.elements.sector1 = document.getElementById('sector1Audio');
        this.elements.sector2 = document.getElementById('sector2Audio');
        this.elements.victory = document.getElementById('victoryAudio');
        this.elements.defeat = document.getElementById('defeatAudio');

        // Verificar que todos existan
        if (!this.elements.menu) {
            console.error('❌ menuAudio element not found');
            return;
        }
        if (!this.elements.sector1) {
            console.error('❌ sector1Audio element not found');
            return;
        }
        if (!this.elements.sector2) {
            console.error('❌ sector2Audio element not found');
            return;
        }

        console.log('✅ Audio elements loaded');

        // Esperar interacción del usuario (click o tecla)
        // En Electron, es necesario para activar audio
        const self = this;
        document.addEventListener('click', function onFirstClick() {
            console.log('👆 User interaction detected, audio enabled');
            self.state.userInteracted = true;
            document.removeEventListener('click', onFirstClick);
        }, { once: true });

        this.state.initialized = true;
        console.log('✅ AudioSystemSimple initialized');
    },

    /**
     * Pausar TODA la música
     */
    stopAll() {
        Object.values(this.elements).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        this.state.currentlyPlaying = null;
        console.log('⏹️  All audio stopped');
    },

    /**
     * Reproducir música de menú
     */
    playMenu() {
        if (!this.state.userInteracted) {
            console.log('⏳ Waiting for user interaction before playing menu music');
            return;
        }

        console.log('▶️  Playing menu music...');
        this.stopAll();

        const audio = this.elements.menu;
        if (!audio) {
            console.error('❌ Menu audio element not found');
            return;
        }

        audio.volume = this.state.volume;
        audio.play().catch(err => {
            console.warn('⚠️  Could not play menu music:', err.message);
        });

        this.state.currentlyPlaying = 'menu';
    },

    /**
     * Reproducir música de Sector 1
     */
    playSector1() {
        if (!this.state.userInteracted) {
            console.log('⏳ Waiting for user interaction before playing sector1 music');
            return;
        }

        console.log('▶️  Playing sector 1 music...');
        this.stopAll();

        const audio = this.elements.sector1;
        if (!audio) {
            console.error('❌ Sector1 audio element not found');
            return;
        }

        audio.volume = this.state.volume;
        audio.play().catch(err => {
            console.warn('⚠️  Could not play sector1 music:', err.message);
        });

        this.state.currentlyPlaying = 'sector1';
    },

    /**
     * Reproducir música de Sector 2
     */
    playSector2() {
        if (!this.state.userInteracted) {
            console.log('⏳ Waiting for user interaction before playing sector2 music');
            return;
        }

        console.log('▶️  Playing sector 2 music...');
        this.stopAll();

        const audio = this.elements.sector2;
        if (!audio) {
            console.error('❌ Sector2 audio element not found');
            return;
        }

        audio.volume = this.state.volume;
        audio.play().catch(err => {
            console.warn('⚠️  Could not play sector2 music:', err.message);
        });

        this.state.currentlyPlaying = 'sector2';
    },

    /**
     * Reproducir música de victoria
     */
    playVictory() {
        if (!this.state.userInteracted) {
            console.log('⏳ Waiting for user interaction before playing victory music');
            return;
        }

        console.log('▶️  Playing victory music...');
        this.stopAll();

        const audio = this.elements.victory;
        if (!audio) {
            console.error('❌ Victory audio element not found');
            return;
        }

        audio.volume = this.state.volume;
        audio.play().catch(err => {
            console.warn('⚠️  Could not play victory music:', err.message);
        });

        this.state.currentlyPlaying = 'victory';
    },

    /**
     * Reproducir música de derrota
     */
    playDefeat() {
        if (!this.state.userInteracted) {
            console.log('⏳ Waiting for user interaction before playing defeat music');
            return;
        }

        console.log('▶️  Playing defeat music...');
        this.stopAll();

        const audio = this.elements.defeat;
        if (!audio) {
            console.error('❌ Defeat audio element not found');
            return;
        }

        audio.volume = this.state.volume;
        audio.play().catch(err => {
            console.warn('⚠️  Could not play defeat music:', err.message);
        });

        this.state.currentlyPlaying = 'defeat';
    },

    /**
     * Pausar música actual
     */
    pause() {
        Object.values(this.elements).forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
            }
        });
        console.log('⏸️  Audio paused');
    },

    /**
     * Reanudar música
     */
    resume() {
        if (this.state.currentlyPlaying) {
            const audio = this.elements[this.state.currentlyPlaying];
            if (audio) {
                audio.play().catch(err => {
                    console.warn('⚠️  Could not resume audio:', err.message);
                });
                console.log('▶️  Audio resumed');
            }
        }
    },

    /**
     * Establecer volumen (0.0 - 1.0)
     */
    setVolume(volume) {
        this.state.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.elements).forEach(audio => {
            if (audio) {
                audio.volume = this.state.volume;
            }
        });
        console.log(`🔊 Volume set to ${Math.round(this.state.volume * 100)}%`);
    },

    /**
     * Obtener estado actual del sistema
     */
    getStatus() {
        return {
            initialized: this.state.initialized,
            userInteracted: this.state.userInteracted,
            currentlyPlaying: this.state.currentlyPlaying,
            volume: this.state.volume,
            menuReady: !!this.elements.menu,
            sector1Ready: !!this.elements.sector1,
            sector2Ready: !!this.elements.sector2,
            victoryReady: !!this.elements.victory,
            defeatReady: !!this.elements.defeat
        };
    }
};

/**
 * ATAJOS GLOBALES PARA FÁCIL ACCESO
 */
window.playMenuMusic = () => AudioSystemSimple.playMenu();
window.playSector1Music = () => AudioSystemSimple.playSector1();
window.playSector2Music = () => AudioSystemSimple.playSector2();
window.playVictoryMusic = () => AudioSystemSimple.playVictory();
window.playDefeatMusic = () => AudioSystemSimple.playDefeat();
window.stopAllMusic = () => AudioSystemSimple.stopAll();
window.pauseMusic = () => AudioSystemSimple.pause();
window.resumeMusic = () => AudioSystemSimple.resume();
window.setMusicVolume = (vol) => AudioSystemSimple.setVolume(vol);

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AudioSystemSimple.init();
    });
} else {
    // El DOM ya está listo
    AudioSystemSimple.init();
}

console.log('✅ Audio System Simple v1.0 loaded');
