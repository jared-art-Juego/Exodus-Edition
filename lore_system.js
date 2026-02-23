/**
 * VECTOR EXODUS - Lore System
 * Sistema de fragmentos de historia entre sectores
 * Preguntas que generan intriga
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_lore_v1';

    /**
     * Fragmentos de lore global
     */
    const LORE_FRAGMENTS = {
        intro: [
            'Registration begins. The final transmission received before silence.',
            'Earth defense protocols: OMEGA ENGAGED',
            'All hope rests on EXODUS.'
        ],
        sector_1: [
            'Log 01: "The alien structures... they\'re not attacking. They\'re searching."',
            '"What are they looking for? What did we do to provoke this?"',
            'Sector 1 Analysis: Probable forward base. Multiple contacts detected, highly coordinated.'
        ],
        sector_2: [
            'Log 02: "The patterns repeat. Wave after wave, like a test."',
            '"They\'re assessing our capabilities. Or... herding us."',
            'Sector 2 Signature: Energy signature 7x stronger than Sector 1. This is intentional.'
        ],
        sector_3: [
            'Log 03: "There\'s something beneath. Buried deep in the black hole\'s gravity well."',
            '"We shouldn\'t wake it. We NEED to wake it. I don\'t know which."',
            'Sector 3 Priority: Unknown artifact detected in anomaly. Classification: OMEGA-LEVEL THREAT.'
        ],
        sector_4: [
            'Log 04: "Transmission intercepted from the other side. They speak of \'The Caller\'."',
            '"Is that us? Are we calling to them, or are they calling to us?"',
            'Sector 4 Reality Check: The invasions were never random. They came BECAUSE we sent signals.'
        ],
        sector_5: [
            'Log 05: "The final position. The nexus. This is where it ends, or where it begins."',
            '"I understand now. We\'re not defending Earth. We\'re keeping it closed. Sealed."',
            'Sector 5 Conclusion: The elder intelligence doesn\'t attack. It CORRECTS. The universe corrected.'
        ],
        sector_6: [
            'Final Transmission: "This entity... it\'s ancient. Older than stars."',
            '"It will not stop until the signal is gone. Until we are gone."',
            'Sector 6 Endgame: The Exodus. Not escape. Sacrifice. The final stand.'
        ],
        season_2_unlock: [
            'New Transmission Detected: "That was only the beginning."',
            '"The sealed gateway is opening again. But this time... from the other side."',
            'New Era Begins: SEASON 2 - THE OPENING'
        ]
    };

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    const LoreSystem = {
        game: null,
        seenFragments: {},
        currentFragment: null,
        fragmentDisplayTime: 0,

        init(game) {
            try {
                this.game = game;
                this.seenFragments = load();
                this._patchGame();
            } catch (e) {
                console.error('[LoreSystem] init error:', e);
            }
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            // Mostrar lore al cambiar sector
            const origCheckWaveProgress = g.checkWaveProgress && g.checkWaveProgress.bind(g);
            if (origCheckWaveProgress) {
                g.checkWaveProgress = () => {
                    const oldSector = g.sector;
                    origCheckWaveProgress();
                    
                    // Si cambió sector, mostrar lore
                    if (g.sector > oldSector) {
                        self.showSectorLore(g.sector);
                    }
                };
            }
        },

        /**
         * Muestra lore para un sector
         */
        showSectorLore(sector) {
            try {
                const sectorKey = `sector_${sector}`;
                if (!LORE_FRAGMENTS[sectorKey]) return;

                const fragments = LORE_FRAGMENTS[sectorKey];
                const randomFragment = fragments[Math.floor(Math.random() * fragments.length)];

                // Evitar mostrar el mismo fragmento dos veces
                if (this.seenFragments[sectorKey]?.includes(randomFragment)) {
                    return;
                }

                if (!this.seenFragments[sectorKey]) {
                    this.seenFragments[sectorKey] = [];
                }
                this.seenFragments[sectorKey].push(randomFragment);

                this._displayLoreOverlay(randomFragment, sector);
                this.save();
            } catch (e) {
                console.error('[LoreSystem] showSectorLore error:', e);
            }
        },

        /**
         * Muestra lore de intro
         */
        showIntroLore() {
            try {
                const fragments = LORE_FRAGMENTS.intro;
                for (const fragment of fragments) {
                    this._displayLoreOverlay(fragment, 0, 2000 + Math.random() * 1000);
                }
            } catch (e) {
                console.error('[LoreSystem] showIntroLore error:', e);
            }
        },

        /**
         * Muestra overlay de lore
         */
        _displayLoreOverlay(text, sector, delay = 0) {
            try {
                setTimeout(() => {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 250;
                        font-family: 'Courier New', monospace;
                        pointer-events: auto;
                        animation: fadeIn 0.5s ease-out;
                    `;

                    const content = document.createElement('div');
                    content.style.cssText = `
                        background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 50, 100, 0.95));
                        border: 2px solid #00bfff;
                        border-radius: 8px;
                        padding: 30px;
                        max-width: 600px;
                        color: #00ff88;
                        font-size: 1rem;
                        line-height: 1.6;
                        text-shadow: 0 0 10px #00ff88;
                        text-align: center;
                    `;

                    content.innerHTML = `
                        <div style="font-size: 0.9rem; color: #00bfff; margin-bottom: 15px; letter-spacing: 2px;">
                            LOG ENTRY ${sector > 0 ? '- SECTOR ' + sector : ''}
                        </div>
                        <div style="font-size: 1.1rem; margin-bottom: 20px; line-height: 1.8;">
                            "${text}"
                        </div>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 20px;">
                            [Click para continuar]
                        </div>
                    `;

                    overlay.appendChild(content);
                    document.body.appendChild(overlay);

                    // Agregar animación CSS
                    if (!document.getElementById('lore-animations')) {
                        const style = document.createElement('style');
                        style.id = 'lore-animations';
                        style.textContent = `
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes fadeOut {
                                from { opacity: 1; }
                                to { opacity: 0; }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    // Auto-cierre después de 8 segundos o click
                    const close = () => {
                        overlay.style.animation = 'fadeOut 0.3s ease-out';
                        setTimeout(() => overlay.remove(), 300);
                    };

                    setTimeout(close, 8000);
                    overlay.onclick = close;
                }, delay);
            } catch (e) {
                console.error('[LoreSystem] _displayLoreOverlay error:', e);
            }
        },

        /**
         * Obtiene todos los fragmentos vistos
         */
        getSeenLore() {
            return this.seenFragments;
        },

        /**
         * Obtiene progreso de lore (% de fragmentos vistos)
         */
        getLoreProgress() {
            let seen = 0;
            let total = 0;

            for (const key of Object.keys(LORE_FRAGMENTS)) {
                if (key.startsWith('sector_')) {
                    const fragments = LORE_FRAGMENTS[key];
                    total += fragments.length;
                    if (this.seenFragments[key]) {
                        seen += Math.min(this.seenFragments[key].length, fragments.length);
                    }
                }
            }

            return total > 0 ? Math.floor((seen / total) * 100) : 0;
        },

        save() {
            save(this.seenFragments);
        }
    };

    window.LoreSystem = LoreSystem;
})();
