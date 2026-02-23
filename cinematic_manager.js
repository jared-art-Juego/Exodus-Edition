/**
 * VECTOR EXODUS - CinematicManager
 * Cinemáticas de victoria (Sector 1) y derrota.
 * Modular, no modifica sistemas existentes.
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_cinematic_v1';

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

    const CinematicManager = {
        game: null,
        _origBossDefeated: null,
        _origShowDefeatScreen: null,

        init(game) {
            try {
                this.game = game;
                this._patch();
                this._createElements();
            } catch (e) { console.warn('[CinematicManager] init:', e); }
        },

        _patch() {
            const g = this.game;
            if (!g) return;
            const self = this;

            this._origBossDefeated = g.bossDefeated && g.bossDefeated.bind(g);
            if (this._origBossDefeated) {
                g.bossDefeated = function() {
                    self._onBossDefeated();
                };
            }

            this._origShowDefeatScreen = g.showDefeatScreen && g.showDefeatScreen.bind(g);
            if (this._origShowDefeatScreen) {
                g.showDefeatScreen = function() {
                    self._onDefeat();
                };
            }
        },

        _createElements() {
            if (document.getElementById('cinematic-victory')) return;
            const div = document.createElement('div');
            div.id = 'cinematic-overlays';
            div.innerHTML = `
                <div id="cinematic-victory" style="display:none;position:absolute;inset:0;z-index:280;pointer-events:none;">
                    <div class="cine-bars" style="position:absolute;left:0;right:0;height:60px;background:#000;transition:height 0.5s;"></div>
                    <div class="cine-bars" style="position:absolute;left:0;right:0;bottom:0;height:60px;background:#000;transition:height 0.5s;"></div>
                    <div id="cine-victory-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:var(--blue);font-size:2.5rem;font-weight:900;text-shadow:0 0 30px var(--blue);opacity:0;transition:opacity 1s;">SECTOR 1 COMPLETADO</div>
                </div>
                <div id="cinematic-defeat" style="display:none;position:absolute;inset:0;z-index:280;pointer-events:none;">
                    <div id="cine-defeat-blackhole" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,#333 0%,#000 70%);opacity:0;"></div>
                    <div id="cine-defeat-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:var(--red);font-size:3rem;font-weight:900;text-shadow:0 0 40px var(--red);opacity:0;">PERDISTE</div>
                </div>
            `;
            document.body.appendChild(div);
        },

        _onBossDefeated() {
            try {
                if (this.game.sector === 1 && !this._victoryPlayed()) {
                    this._doBossDefeatedLogic();
                    this._playVictoryCinematic();
                    return;
                }
            } catch (e) {}
            this._origBossDefeated && this._origBossDefeated();
        },

        _doBossDefeatedLogic() {
            const g = this.game;
            if (!g.boss) return;
            g.createExplosion(g.boss.x, g.boss.y, 50, '#ff0044');
            g.explosions.push({ x: g.boss.x, y: g.boss.y, r: 100, life: 60, maxLife: 60 });
            g.boss = null;
            g.score += 5000;
            g.unlocked = Math.min(6, g.sector + 1);
        },

        _victoryPlayed() {
            const d = load();
            return !!d.sector1VictorySeen;
        },

        _playVictoryCinematic() {
            const g = this.game;
            g.state = 'VICTORY_CINE';
            if (window.MusicManager) MusicManager.briefSilence(800);
            const overlay = document.getElementById('cinematic-victory');
            const text = document.getElementById('cine-victory-text');
            const bars = overlay && overlay.querySelectorAll('.cine-bars');
            if (overlay) overlay.style.display = 'block';
            if (bars) bars.forEach(b => { b.style.height = '80px'; });

            let t = 0;
            const duration = 4000;
            const self = this;

            const finish = () => {
                save({ ...load(), sector1VictorySeen: true });
                if (overlay) overlay.style.display = 'none';
                if (bars) bars.forEach(b => { b.style.height = '60px'; });
                if (window.AdvancedSystems && window.AdvancedSystems.runBossDefeatedHooks) {
                    try { window.AdvancedSystems.runBossDefeatedHooks(); } catch (e) {}
                }
                g.state = 'MENU';
                g.wave = 1;
                g.waveBatch = 1;
                g.totalKillsInWave = 0;
                document.getElementById('menu').classList.remove('hidden');
                document.getElementById('hud').style.display = 'none';
                g.drawSectors && g.drawSectors();
                if (window.MusicManager) MusicManager.playMenu();
            };

            const anim = () => {
                if (g.state !== 'VICTORY_CINE') return;
                t += 16;
                const p = Math.min(1, t / duration);
                if (text) text.style.opacity = p > 0.5 ? (p - 0.5) * 2 : 0;
                if (t >= duration) {
                    finish();
                    return;
                }
                requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);

            const skipBtn = document.createElement('div');
            skipBtn.style.cssText = 'position:absolute;bottom:20px;right:20px;color:#666;cursor:pointer;font-size:0.8rem;z-index:290;pointer-events:auto;';
            skipBtn.textContent = 'OMITIR';
            skipBtn.onclick = () => {
                g.state = 'PLAY';
                if (overlay) overlay.style.display = 'none';
                finish();
            };
            if (overlay) overlay.appendChild(skipBtn);
            setTimeout(() => { if (skipBtn.parentNode) skipBtn.remove(); }, duration);
        },

        _onDefeat() {
            try {
                this._playDefeatCinematic();
            } catch (e) {
                this._origShowDefeatScreen && this._origShowDefeatScreen();
            }
        },

        _playDefeatCinematic() {
            const g = this.game;
            g.state = 'DEFEAT_CINE';
            if (window.MusicManager) MusicManager.playDefeat();

            const overlay = document.getElementById('cinematic-defeat');
            const bh = document.getElementById('cine-defeat-blackhole');
            const text = document.getElementById('cine-defeat-text');
            if (overlay) overlay.style.display = 'block';

            const defeatScreen = document.getElementById('defeat-screen');
            if (defeatScreen) defeatScreen.style.display = 'none';

            let t = 0;
            const phase1 = 1500;
            const phase2 = 2500;
            const total = 4500;

            const anim = () => {
                if (g.state !== 'DEFEAT_CINE') return;
                t += 16;
                if (t < phase1) {
                    const p = t / phase1;
                    if (bh) {
                        bh.style.width = (20 + p * 150) + 'px';
                        bh.style.height = (20 + p * 150) + 'px';
                        bh.style.opacity = p;
                    }
                } else if (t < phase2) {
                    const p = (t - phase1) / (phase2 - phase1);
                    if (text) text.style.opacity = p;
                } else if (t < total) {
                    const p = (t - phase2) / (total - phase2);
                    if (overlay) overlay.style.background = `rgba(0,0,0,${p})`;
                } else {
                    if (overlay) overlay.style.display = 'none';
                    overlay.style.background = 'transparent';
                    g.state = 'DEFEAT';
                    if (defeatScreen) defeatScreen.style.display = 'flex';
                    this._origShowDefeatScreen && this._origShowDefeatScreen();
                    return;
                }
                requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);
        }
    };

    window.CinematicManager = CinematicManager;
})();
