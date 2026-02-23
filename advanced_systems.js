/**
 * VECTOR EXODUS - Sistemas Avanzados (Modular)
 * Casi Muerte, Logros Secretos, Historia Fragmentada, Evento Raro, Animaciones
 * No modifica sistemas existentes. Todo con try/catch. Fallo = juego sigue.
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'vx_advanced_v1';
    const CASI_MUERTE_TEXTS = ['NO AHORA', 'SIGUE', 'NO TERMINA ASÍ'];
    const STORY_FRAGMENTS = [
        'Registro 02: "El núcleo no estaba vacío..."',
        'Señal detectada fuera del mapa conocido.',
        'No debimos activarlo.',
        'Los patrones se repiten. Siempre.',
        'Algo observa desde el vacío.',
        'La transmisión se cortó. No fue un fallo.'
    ];

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

    const AdvancedSystems = {
        game: null,
        data: { hiddenAchievementsUnlocked: [], storyFragmentsSeen: [], sectorIntroPlayed: [] },

        init(game) {
            try {
                this.game = game;
                const loaded = load();
                this.data.hiddenAchievementsUnlocked = loaded.hiddenAchievementsUnlocked || [];
                this.data.storyFragmentsSeen = loaded.storyFragmentsSeen || [];
                this.data.sectorIntroPlayed = loaded.sectorIntroPlayed || [];
                this._patchGame();
                this._createOverlays();
                this._resetSession();
            } catch (e) { console.warn('[AdvancedSystems] init:', e); }
        },

        _resetSession() {
            this.casiMuerteActive = false;
            this.casiMuerteEndAt = 0;
            this.casiMuerteLastAt = 0;
            this.timeScale = 1;
            this.dodgeCount = 0;
            this.dodgeWindowStart = 0;
            this.nearBullets = new Set();
            this.almostDeathCount = 0;
            this.shotsThisPhase = 0;
            this.lastWave = 0;
            this.phase2Checked = false;
            this.phaseStartKills = 0;
            this.lowHpStartAt = 0;
            this.miniBossNoDamage = true;
            this.rareEventActive = false;
            this.rareEnemy = null;
        },

        _patchGame() {
            const g = this.game;
            if (!g) return;
            const self = this;

            const origDamagePlayer = g.damagePlayer && g.damagePlayer.bind(g);
            if (origDamagePlayer) {
                g.damagePlayer = function(amount) {
                    self._onDamagePlayer(amount);
                    origDamagePlayer(amount);
                };
            }

            const origStartGameplay = g.startGameplay && g.startGameplay.bind(g);
            if (origStartGameplay) {
                self._origStartGameplay = function() {
                    self._resetSession();
                    origStartGameplay();
                };
                g.startGameplay = function() {
                    self._onStartGameplay();
                };
            }

            const origBossDefeated = g.bossDefeated && g.bossDefeated.bind(g);
            if (origBossDefeated) {
                g.bossDefeated = function() {
                    self._onBossDefeated(origBossDefeated);
                };
            }

            const origCheckWaveProgress = g.checkWaveProgress && g.checkWaveProgress.bind(g);
            if (origCheckWaveProgress) {
                g.checkWaveProgress = function() {
                    self._onCheckWaveProgress(origCheckWaveProgress);
                };
            }

            const origShoot = g.shoot && g.shoot.bind(g);
            if (origShoot) {
                g.shoot = function() {
                    self.shotsThisPhase = (self.shotsThisPhase || 0) + 1;
                    origShoot();
                };
            }
        },

        _createOverlays() {
            if (document.getElementById('advanced-overlays')) return;
            const div = document.createElement('div');
            div.id = 'advanced-overlays';
            div.innerHTML = `
                <div id="casi-muerte-overlay" class="advanced-overlay" style="display:none;pointer-events:none;">
                    <div class="casi-muerte-vignette"></div>
                    <div class="casi-muerte-text"></div>
                </div>
                <div id="achievement-overlay" class="advanced-overlay" style="display:none;pointer-events:none;">
                    <div class="achievement-darken"></div>
                    <div class="achievement-text">LOGRO DESCUBIERTO</div>
                </div>
                <div id="story-fragment-overlay" class="advanced-overlay" style="display:none;pointer-events:none;">
                    <div class="story-fragment-box">
                        <div class="story-fragment-title">TRANSMISIÓN INTERCEPTADA</div>
                        <div class="story-fragment-text"></div>
                    </div>
                </div>
                <div id="rare-event-overlay" style="display:none;position:absolute;inset:0;z-index:60;pointer-events:none;background:linear-gradient(135deg,rgba(100,0,150,0.15),rgba(50,0,100,0.1));"></div>
                <div id="sector-intro-container" style="display:none;position:absolute;inset:0;z-index:350;pointer-events:none;"></div>
            `;
            const style = document.createElement('style');
            style.textContent = `
                .advanced-overlay{position:absolute;inset:0;z-index:250;display:flex;align-items:center;justify-content:center;}
                .casi-muerte-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 30%, rgba(80,0,0,0.6) 100%);pointer-events:none;}
                .casi-muerte-text{font-size:3rem;font-weight:900;color:#ff0044;text-shadow:0 0 30px #ff0044;animation:pulse 0.5s ease-in-out infinite;}
                .achievement-darken{position:absolute;inset:0;background:rgba(0,0,0,0.8);}
                .achievement-text{font-size:2.5rem;color:var(--yellow);text-shadow:0 0 20px var(--yellow);z-index:1;}
                .story-fragment-box{background:rgba(0,10,30,0.95);border:2px solid var(--blue);padding:30px;max-width:500px;text-align:center;}
                .story-fragment-title{color:var(--blue);font-size:1rem;margin-bottom:15px;}
                .story-fragment-text{color:#ccc;font-size:0.95rem;line-height:1.5;}
            `;
            document.head.appendChild(style);
            document.body.appendChild(div);
        },

        _onDamagePlayer(amount) {
            try {
                this.miniBossNoDamage = false;
                this.damageThisFrame = true;
            } catch (e) {}
        },

        _onStartGameplay() {
            try {
                const orig = this._origStartGameplay;
                if (!orig) return;
                if (this.rareEventCheck()) return;
                if (this.sectorIntroNeeded()) return;
                orig();
            } catch (e) { this._origStartGameplay && this._origStartGameplay(); }
        },

        _onBossDefeated(orig) {
            try {
                this.runBossDefeatedHooks();
            } catch (e) {}
            orig();
        },

        runBossDefeatedHooks() {
            try {
                this._checkBossAchievements();
                this._maybeStoryFragment();
                if (this.rareEventActive && this.rareEnemy) this._onRareEnemyDefeated();
            } catch (e) {}
        },

        _onCheckWaveProgress(orig) {
            try {
                if (this.game.wave !== this.lastWave) {
                    this.shotsThisPhase = 0;
                    this.lastWave = this.game.wave;
                    this.phase2Checked = false;
                }
            } catch (e) {}
            orig();
            try {
                this._checkAchievements();
            } catch (e) {}
        },

        update(dt) {
            try {
                if (!this.game || this.game.state !== 'PLAY') return;
                this.damageThisFrame = false;
                this._updateCasiMuerte(dt);
                this._updateDodgeTracking();
                this._updateRareEvent(dt);
                this._updateSectorIntro(dt);
            } catch (e) {}
        },

        getTimeScale() {
            try {
                return this.casiMuerteActive ? 0.6 : 1;
            } catch (e) { return 1; }
        },

        getCameraOffset() {
            try {
                if (!this.casiMuerteActive || !this.game) return { x: 0, y: 0, zoom: 1 };
                const t = Math.min(1, (Date.now() - (this.casiMuerteEndAt - 700)) / 700);
                const zoom = 1 + t * 0.15;
                const p = this.game.player;
                const cx = this.game.w / 2;
                const cy = this.game.h / 2;
                return { x: (p.x - cx) * (zoom - 1) * 0.3, y: (p.y - cy) * (zoom - 1) * 0.3, zoom };
            } catch (e) { return { x: 0, y: 0, zoom: 1 }; }
        },

        drawOverlays(ctx) {
            try {
                if (!ctx) return;
                if (this.casiMuerteActive) {
                    const el = document.getElementById('casi-muerte-overlay');
                    if (el) el.style.display = 'flex';
                } else {
                    const el = document.getElementById('casi-muerte-overlay');
                    if (el) el.style.display = 'none';
                }
            } catch (e) {}
        },

        _updateCasiMuerte(dt) {
            const g = this.game;
            if (!g || !g.player) return;
            const p = g.player;
            const hpPercent = p.hp / p.maxHp;

            if (this.casiMuerteActive) {
                if (Date.now() >= this.casiMuerteEndAt) {
                    this.casiMuerteActive = false;
                    const el = document.getElementById('casi-muerte-overlay');
                    if (el) el.style.display = 'none';
                }
                return;
            }

            if (Date.now() - this.casiMuerteLastAt < 15000) return;

            let trigger = false;
            if (hpPercent <= 0.1 || p.hp <= 1) trigger = true;
            if (this.dodgeCount >= 8) trigger = true;

            if (trigger) {
                this.casiMuerteActive = true;
                this.casiMuerteEndAt = Date.now() + 700;
                this.casiMuerteLastAt = Date.now();
                this.almostDeathCount++;
                this.dodgeCount = 0;

                const textEl = document.querySelector('.casi-muerte-text');
                if (textEl) textEl.textContent = CASI_MUERTE_TEXTS[Math.floor(Math.random() * CASI_MUERTE_TEXTS.length)];

                const overlay = document.getElementById('casi-muerte-overlay');
                if (overlay) overlay.style.display = 'flex';

                this._playHeartbeat();
            }
        },

        _playHeartbeat() {
            try {
                const g = this.game;
                if (!g.audioCtx) g.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const ctx = g.audioCtx;
                const now = ctx.currentTime;
                [0, 0.25, 0.5].forEach((t, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(55, now + t);
                    gain.gain.setValueAtTime(0.15, now + t);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.15);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + t);
                    osc.stop(now + t + 0.15);
                });
            } catch (e) {}
        },

        _updateDodgeTracking() {
            const g = this.game;
            if (!g || !g.enemyBullets) return;
            const now = Date.now();
            if (now - this.dodgeWindowStart > 3000) {
                this.dodgeCount = 0;
                this.dodgeWindowStart = now;
            }

            const near = new Set();
            g.enemyBullets.forEach((b, i) => {
                const dist = Math.hypot(b.x - g.player.x, b.y - g.player.y);
                if (dist < 30) near.add(i);
            });

            this.nearBullets.forEach(i => {
                if (!near.has(i) && !this.damageThisFrame) {
                    this.dodgeCount++;
                    this.dodgeWindowStart = now;
                }
            });
            this.nearBullets = near;
        },

        _checkAchievements() {
            const g = this.game;
            if (!g) return;
            const p = g.player;
            const unlocked = this.data.hiddenAchievementsUnlocked;

            if (p.hp <= 1 && !unlocked.includes('survive_1hp')) {
                this.lowHpStartAt = this.lowHpStartAt || Date.now();
                if (Date.now() - this.lowHpStartAt >= 10000) {
                    unlocked.push('survive_1hp');
                    this._unlockAchievement('survive_1hp');
                }
            } else this.lowHpStartAt = 0;

            if (this.almostDeathCount >= 3 && !unlocked.includes('almost_death_3')) {
                unlocked.push('almost_death_3');
                this._unlockAchievement('almost_death_3');
            }

            if (g.waveBatch === 2 && !this.phase2Checked && this.shotsThisPhase === 0 && !unlocked.includes('no_shoot_phase')) {
                this.phase2Checked = true;
                unlocked.push('no_shoot_phase');
                this._unlockAchievement('no_shoot_phase');
            }
        },

        _checkBossAchievements() {
            const unlocked = this.data.hiddenAchievementsUnlocked;
            if (this.miniBossNoDamage && !unlocked.includes('boss_no_damage')) {
                unlocked.push('boss_no_damage');
                this._unlockAchievement('boss_no_damage');
            }
        },

        _unlockAchievement(id) {
            const el = document.getElementById('achievement-overlay');
            if (el) {
                el.style.display = 'flex';
                setTimeout(() => { if (el) el.style.display = 'none'; }, 500);
            }
            if (this.game && this.game.cosmetics) {
                this.game.cosmetics.premiumCoins = (this.game.cosmetics.premiumCoins || 0) + 1;
                this.game.cosmetics.syncGame && this.game.cosmetics.syncGame();
                this.game.cosmetics.save && this.game.cosmetics.save();
            }
            save(this.data);
        },

        _maybeStoryFragment() {
            if (Math.random() > 0.2) return;
            const frags = this.data.storyFragmentsSeen;
            const available = STORY_FRAGMENTS.filter((_, i) => !frags.includes(i));
            if (available.length === 0) return;
            const idx = STORY_FRAGMENTS.indexOf(available[Math.floor(Math.random() * available.length)]);
            if (idx < 0) return;
            frags.push(idx);
            save(this.data);

            const el = document.getElementById('story-fragment-overlay');
            const textEl = el && el.querySelector('.story-fragment-text');
            if (textEl) textEl.textContent = STORY_FRAGMENTS[idx];
            if (el) {
                el.style.display = 'flex';
                setTimeout(() => { if (el) el.style.display = 'none'; }, 3000);
            }
        },

        rareEventCheck() {
            if (Math.random() > 0.01) return false;
            this.rareEventActive = true;
            this._showRareEventIntro();
            return true;
        },

        _showRareEventIntro() {
            document.getElementById('intro-cinematic').style.display = 'none';
            const cont = document.getElementById('sector-intro-container');
            if (!cont) return;
            cont.style.display = 'block';
            cont.innerHTML = '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;"><div style="color:#9900ff;font-size:1.5rem;">...</div></div>';
            setTimeout(() => {
                cont.style.display = 'none';
                this._origStartGameplay && this._origStartGameplay();
                this._spawnRareEnemy();
            }, 1500);
        },

        _spawnRareEnemy() {
            try {
                const rareEl = document.getElementById('rare-event-overlay');
                if (rareEl) rareEl.style.display = 'block';
                const g = this.game;
                if (!g || !g.enemies) return;
                g.enemies.push({
                    x: g.w / 2,
                    y: -80,
                    hp: 200,
                    max: 200,
                    spd: 1.5,
                    size: 35,
                    isBig: true,
                    type: 'normal',
                    rareEvent: true
                });
                this.rareEnemy = g.enemies[g.enemies.length - 1];
            } catch (e) {}
        },

        _updateRareEvent(dt) {
            if (!this.rareEventActive) return;
            const g = this.game;
            if (!g || !g.enemies) return;
            const rare = g.enemies.find(e => e.rareEvent);
            if (!rare && this.rareEnemy) {
                this._onRareEnemyDefeated();
                return;
            }
            this.rareEnemy = rare;
        },

        _onRareEnemyDefeated() {
            this.rareEventActive = false;
            this.rareEnemy = null;
            const rareEl = document.getElementById('rare-event-overlay');
            if (rareEl) rareEl.style.display = 'none';
            this._maybeStoryFragment();
            if (this.game && this.game.cosmetics) {
                this.game.cosmetics.premiumCoins = (this.game.cosmetics.premiumCoins || 0) + 2;
                this.game.cosmetics.syncGame && this.game.cosmetics.syncGame();
                this.game.cosmetics.save && this.game.cosmetics.save();
            }
        },

        sectorIntroNeeded() {
            const s = this.game && this.game.sector;
            if (!s || s < 2) return false;
            if (this.data.sectorIntroPlayed.includes(s)) return false;
            this._playSectorIntro(s);
            return true;
        },

        _playSectorIntro(sector) {
            const introEl = document.getElementById('intro-cinematic');
            if (introEl) introEl.style.display = 'none';
            const cont = document.getElementById('sector-intro-container');
            if (!cont) {
                this._origStartGameplay && this._origStartGameplay();
                return;
            }
            cont.style.display = 'block';
            this.sectorIntroActive = true;
            this.sectorIntroSector = sector;
            this.sectorIntroStart = Date.now();
            this.data.sectorIntroPlayed.push(sector);
            save(this.data);

            const durations = { 2: 10000, 3: 8000, 4: 10000, 5: 12500, 6: 25000 };
            const dur = durations[sector] || 8000;

            cont.innerHTML = `
                <div class="sector-intro-skip" onclick="AdvancedSystems.skipSectorIntro()" style="position:absolute;bottom:20px;right:20px;color:#666;cursor:pointer;font-size:0.8rem;z-index:10;pointer-events:auto;">OMITIR</div>
                <canvas id="sector-intro-canvas" width="${window.innerWidth}" height="${window.innerHeight}"></canvas>
            `;

            this._runSectorIntroAnimation(sector, dur, cont);
        },

        _runSectorIntroAnimation(sector, dur, cont) {
            const self = this;
            const canvas = document.getElementById('sector-intro-canvas');
            if (!canvas) {
                self._finishSectorIntro();
                return;
            }
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            let start = Date.now();

            function tick() {
                if (!self.sectorIntroActive) return;
                const t = (Date.now() - start) / dur;
                if (t >= 1) {
                    self._finishSectorIntro();
                    return;
                }
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);

                if (sector === 2) {
                    const zoom = 1 - t * 0.3;
                    ctx.save();
                    ctx.translate(w/2, h/2);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-w/2, -h/2);
                    ctx.fillStyle = 'rgba(0,200,255,0.3)';
                    for (let i = 0; i < 5; i++) {
                        const x = w/2 + (i-2)*80 + Math.sin(t*5)*20;
                        const y = h*0.3 + i*15;
                        ctx.fillRect(x-10, y-5, 20, 10);
                    }
                    if (t > 0.3) ctx.fillStyle = 'rgba(255,0,0,0.5)';
                    ctx.fillRect(w/2-15, h*0.4-8, 30, 16);
                    ctx.restore();
                } else if (sector === 3) {
                    ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + Math.sin(t*20)*0.05) + ')';
                    for (let i = 0; i < 100; i++) {
                        const x = (i*37 % w) + Math.sin(t*3)*50;
                        const y = (i*73 % h);
                        ctx.fillRect(x, y, 2, 2);
                    }
                    ctx.fillStyle = 'rgba(100,0,255,0.3)';
                    ctx.font = '20px Orbitron';
                    ctx.fillText('...', w/2-20, h/2);
                } else if (sector === 4) {
                    ctx.strokeStyle = 'rgba(255,200,0,0.4)';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.moveTo(0, h*0.3 + i*80 + Math.sin(t*4+i)*20);
                        ctx.lineTo(w, h*0.3 + i*80 + Math.sin(t*4+i+1)*20);
                        ctx.stroke();
                    }
                } else if (sector === 5) {
                    ctx.fillStyle = 'rgba(255,100,0,0.2)';
                    ctx.fillRect(0, 0, w, h);
                    const shipY = h*0.5 + t * h*0.4;
                    ctx.fillStyle = '#00f2ff';
                    ctx.fillRect(w/2-20, shipY-15, 40, 30);
                    ctx.fillStyle = 'rgba(255,100,0,0.6)';
                    for (let i = 0; i < 3; i++) ctx.fillRect(w/2-5+i*15, shipY+10, 5, 10);
                } else if (sector === 6) {
                    const camX = t * w * 0.5;
                    ctx.save();
                    ctx.translate(-camX, 0);
                    ctx.fillStyle = 'rgba(255,0,0,0.2)';
                    ctx.fillRect(w, 0, w*2, h);
                    ctx.fillStyle = '#00f2ff';
                    ctx.fillRect(w/2 + camX - 15, h/2 - 20, 30, 40);
                    ctx.fillStyle = 'rgba(255,0,0,0.5)';
                    ctx.fillRect(w*1.5 - 50, h/2 - 60, 100, 120);
                    ctx.restore();
                }
                requestAnimationFrame(tick);
            }
            tick();
        },

        skipSectorIntro() {
            this.sectorIntroActive = false;
            this._finishSectorIntro();
        },

        _finishSectorIntro() {
            this.sectorIntroActive = false;
            const cont = document.getElementById('sector-intro-container');
            if (cont) cont.style.display = 'none';
            this._origStartGameplay && this._origStartGameplay();
        },

        _updateSectorIntro(dt) {}
    };

    window.AdvancedSystems = AdvancedSystems;
})();
