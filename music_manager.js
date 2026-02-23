/**
 * VECTOR EXODUS - MusicManager
 * Sistema de música profesional modular.
 * 
 * Estructura de archivos: assets/audio/music/
 * - menu_theme.wav
 * - sector1_base.wav, sector1_boss_layer1.wav, sector1_boss_layer2.wav, sector1_boss_layer3.wav
 * - sector2_base.wav, sector2_boss.wav ... sector6_base.wav, sector6_boss.wav
 * 
 * Referencias royalty-free (solo comentario):
 * - https://pixabay.com/music/search/dark%20techno/
 * - https://pixabay.com/music/search/sci%20fi/
 * - https://itch.io/game-assets/tag-music
 * - https://opengameart.org/
 * 
 * Solo usa archivos locales. Si falta un archivo, fallback silencioso.
 */
(function() {
    'use strict';

    const BASE_PATH = 'assets/audio/music/';
    const FADE_DURATION_MS = 800;
    const CROSSFADE_DURATION_MS = 1200;
    const STORAGE_KEY = 'vx_music_v1';

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    function saveSettings(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    /**
     * Crea un elemento Audio con manejo de errores.
     * @param {string} src - Ruta del archivo
     * @returns {HTMLAudioElement|null}
     */
    function createAudio() {
        try {
            const a = new Audio();
            a.preload = 'auto';
            a.volume = 0;
            return a;
        } catch (e) { return null; }
    }

    /**
     * Valida si un archivo existe (intenta cargar).
     * @param {string} path
     * @returns {Promise<boolean>}
     */
    function validatePath(path) {
        return new Promise((resolve) => {
            const a = new Audio();
            a.oncanplaythrough = () => { resolve(true); a.src = ''; };
            a.onerror = () => { resolve(false); };
            a.src = path;
        });
    }

    const MusicManager = {
        game: null,
        volume: { master: 0.7, music: 0.6, sfx: 1 },
        current: { menu: null, combat: null, boss: null, layers: [] },
        pool: [],
        _fadeInterval: null,
        _lastBossHpPercent: 1,

        /**
         * Inicializa el MusicManager.
         * @param {Object} game - Referencia al juego
         */
        init(game) {
            try {
                this.game = game;
                const s = loadSettings();
                this.volume.master = typeof s.masterVolume === 'number' ? s.masterVolume : 0.7;
                this.volume.music = typeof s.musicVolume === 'number' ? s.musicVolume : 0.6;
                this.volume.sfx = typeof s.sfxVolume === 'number' ? s.sfxVolume : 1;
                this._applySfxVolume();
            } catch (e) { console.warn('[MusicManager] init:', e); }
        },

        _applySfxVolume() {
            try {
                if (this.game && this.game.audioCtx && this._sfxGain) {
                    this._sfxGain.gain.value = this.volume.master * this.volume.sfx;
                }
            } catch (e) {}
        },

        /**
         * Obtiene la ruta completa de un archivo.
         */
        _path(name) {
            return BASE_PATH + name;
        },

        /**
         * Obtiene un Audio del pool o crea uno nuevo.
         */
        _getAudio() {
            const a = this.pool.find(x => x.paused && x.readyState >= 2);
            if (a) {
                a.pause();
                a.currentTime = 0;
                a.volume = 0;
                return a;
            }
            const n = createAudio();
            if (n) this.pool.push(n);
            return n;
        },

        /**
         * Detiene y limpia todos los canales de música.
         */
        stopAll() {
            try {
                if (this._fadeInterval) {
                    clearInterval(this._fadeInterval);
                    this._fadeInterval = null;
                }
                [this.current.menu, this.current.combat, this.current.boss]
                    .concat(this.current.layers)
                    .filter(Boolean)
                    .forEach(a => {
                        a.pause();
                        a.currentTime = 0;
                        a.src = '';
                    });
                this.current = { menu: null, combat: null, boss: null, layers: [] };
            } catch (e) {}
        },

        /**
         * Fade out de un elemento Audio.
         */
        _fadeOut(audio, duration, onComplete) {
            if (!audio) { if (onComplete) onComplete(); return; }
            const startVol = audio.volume;
            const startTime = Date.now();
            if (this._fadeInterval) clearInterval(this._fadeInterval);
            this._fadeInterval = setInterval(() => {
                const t = Math.min(1, (Date.now() - startTime) / duration);
                audio.volume = Math.max(0, startVol * (1 - t));
                if (t >= 1) {
                    clearInterval(this._fadeInterval);
                    this._fadeInterval = null;
                    audio.pause();
                    audio.currentTime = 0;
                    audio.src = '';
                    if (onComplete) onComplete();
                }
            }, 50);
        },

        /**
         * Fade in de un elemento Audio.
         */
        _fadeIn(audio, targetVol, duration) {
            if (!audio) return;
            const vol = this.volume.master * this.volume.music * (targetVol || 1);
            audio.volume = 0;
            const startTime = Date.now();
            if (this._fadeInterval) clearInterval(this._fadeInterval);
            const iv = setInterval(() => {
                const t = Math.min(1, (Date.now() - startTime) / duration);
                audio.volume = vol * t;
                if (t >= 1) clearInterval(iv);
            }, 50);
        },

        /**
         * Reproduce música de menú.
         */
        playMenu() {
            try {
                this.stopAll();
                const a = this._getAudio();
                if (!a) return;
                a.loop = true;
                a.src = this._path('menu_theme.wav');
                a.volume = 0;
                a.play().catch(() => {});
                this.current.menu = a;
                this._fadeIn(a, 1, FADE_DURATION_MS);
            } catch (e) {}
        },

        /**
         * Transición suave de menú a partida (fade out menú).
         */
        transitionToGameplay() {
            try {
                this._fadeOut(this.current.menu, FADE_DURATION_MS, () => {
                    this.current.menu = null;
                });
            } catch (e) {}
        },

        /**
         * Reproduce música de combate base del sector.
         * @param {number} sector - 1 a 6
         */
        playSector(sector) {
            try {
                this._fadeOut(this.current.combat, 300);
                this.current.combat = null;
                const name = `sector${sector}_base.wav`;
                const a = this._getAudio();
                if (!a) return;
                a.loop = true;
                a.src = this._path(name);
                a.volume = 0;
                a.play().catch(() => {});
                a.addEventListener('error', () => { a.src = ''; }, { once: true });
                this.current.combat = a;
                this._fadeIn(a, 1, FADE_DURATION_MS);
            } catch (e) {}
        },

        /**
         * Reproduce música de jefe. Sector 1 usa capas dinámicas.
         * @param {number} sector
         * @param {number} hpPercent - 1 a 0 (solo Sector 1)
         */
        playBoss(sector, hpPercent) {
            try {
                this._fadeOut(this.current.combat, 400);
                this.current.combat = null;
                this._lastBossHpPercent = hpPercent !== undefined ? hpPercent : 1;

                if (sector === 1) {
                    this._playBossSector1(hpPercent);
                } else {
                    const a = this._getAudio();
                    if (!a) return;
                    a.loop = true;
                    a.src = this._path(`sector${sector}_boss.wav`);
                    a.volume = 0;
                    a.play().catch(() => {});
                    a.addEventListener('error', () => { a.src = ''; }, { once: true });
                    this.current.boss = a;
                    this._fadeIn(a, 1, FADE_DURATION_MS);
                }
            } catch (e) {}
        },

        /**
         * Sector 1: capas por vida del jefe.
         * 100%-51%: layer1 | 50%-11%: +layer2 | 10%-0%: +layer3
         */
        _playBossSector1(hpPercent) {
            const p = hpPercent !== undefined ? hpPercent : 1;
            const layers = [
                { file: 'sector1_boss_layer1.wav', active: p > 0.5 },
                { file: 'sector1_boss_layer2.wav', active: p > 0.1 && p <= 0.5 },
                { file: 'sector1_boss_layer3.wav', active: p <= 0.1 }
            ];
            layers.forEach((l, i) => {
                let a = this.current.layers[i];
                if (l.active) {
                    if (!a || a.src !== this._path(l.file)) {
                        if (a) { a.pause(); a.src = ''; }
                        a = this._getAudio();
                        if (!a) return;
                        a.loop = true;
                        a.src = this._path(l.file);
                        a.volume = 0;
                        a.play().catch(() => {});
                        a.addEventListener('error', () => { a.src = ''; }, { once: true });
                        this.current.layers[i] = a;
                        this._fadeIn(a, 0.9, 600);
                    }
                } else if (a) {
                    this._fadeOut(a, 500, () => { this.current.layers[i] = null; });
                }
            });
        },

        /**
         * Actualiza capas dinámicas por vida del jefe (Sector 1).
         * @param {number} hpPercent - 0 a 1
         */
        updateBossLayers(hpPercent) {
            try {
                if (this._lastBossHpPercent === hpPercent) return;
                this._lastBossHpPercent = hpPercent;
                if (this.current.boss || this.current.layers.length) {
                    this._playBossSector1(hpPercent);
                }
            } catch (e) {}
        },

        /**
         * Vuelve a música de combate (al derrotar jefe).
         */
        backToCombat(sector) {
            try {
                this._fadeOut(this.current.boss, 400);
                this.current.boss = null;
                this.current.layers.forEach(a => {
                    if (a) this._fadeOut(a, 400);
                });
                this.current.layers = [];
                this.playSector(sector);
            } catch (e) {}
        },

        /**
         * Música de victoria (cinemática Sector 1).
         */
        playVictory() {
            try {
                this.stopAll();
            } catch (e) {}
        },

        /**
         * Música oscura para derrota.
         */
        playDefeat() {
            try {
                this.stopAll();
                const a = this._getAudio();
                if (!a) return;
                a.loop = false;
                a.src = this._path('defeat_theme.wav');
                a.volume = 0;
                a.play().catch(() => {});
                a.addEventListener('error', () => { a.src = ''; }, { once: true });
                this.current.boss = a;
                this._fadeIn(a, 0.8, 1500);
            } catch (e) {}
        },

        /**
         * Silencio breve (para cinemáticas).
         */
        briefSilence(durationMs) {
            try {
                [this.current.menu, this.current.combat, this.current.boss]
                    .concat(this.current.layers)
                    .filter(Boolean)
                    .forEach(a => {
                        const v = a.volume;
                        a.volume = 0;
                        setTimeout(() => { if (a && !a.paused) a.volume = v; }, durationMs);
                    });
            } catch (e) {}
        },

        /**
         * Establece volumen maestro.
         */
        setMasterVolume(v) {
            this.volume.master = Math.max(0, Math.min(1, v));
            saveSettings({ ...loadSettings(), masterVolume: this.volume.master });
        },

        /**
         * Establece volumen de música.
         */
        setMusicVolume(v) {
            this.volume.music = Math.max(0, Math.min(1, v));
            saveSettings({ ...loadSettings(), musicVolume: this.volume.music });
        },

        /**
         * Establece volumen de efectos.
         */
        setSfxVolume(v) {
            this.volume.sfx = Math.max(0, Math.min(1, v));
            saveSettings({ ...loadSettings(), sfxVolume: this.volume.sfx });
            this._applySfxVolume();
        }
    };

    window.MusicManager = MusicManager;
})();
