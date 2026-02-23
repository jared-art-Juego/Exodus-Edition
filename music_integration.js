/**
 * VECTOR EXODUS - Integración de MusicManager
 * Conecta MusicManager con el flujo del juego sin modificar lógica existente.
 */
(function() {
    'use strict';

    function integrate() {
        const g = window.Game;
        if (!g || !window.MusicManager) return;

        const mm = window.MusicManager;
        mm.init(g);

        const origStartIntro = g.startIntro && g.startIntro.bind(g);
        if (origStartIntro) {
            g.startIntro = function() {
                mm.transitionToGameplay();
                origStartIntro();
            };
        }

        const origStartGameplay = g.startGameplay && g.startGameplay.bind(g);
        if (origStartGameplay) {
            g.startGameplay = function() {
                mm.transitionToGameplay();
                origStartGameplay();
            };
        }

        const origSpawnBoss = g.spawnBoss && g.spawnBoss.bind(g);
        if (origSpawnBoss) {
            g.spawnBoss = function() {
                origSpawnBoss();
                mm.playBoss(g.sector, g.boss ? g.boss.hp / g.boss.maxHp : 1);
            };
        }

        const origReturnToMenu = g.returnToMenu && g.returnToMenu.bind(g);
        if (origReturnToMenu) {
            g.returnToMenu = function() {
                mm.stopAll();
                mm.playMenu();
                origReturnToMenu();
            };
        }

        const origLoop = g.loop && g.loop.bind(g);
        let _lastState = '';
        if (origLoop) {
            g.loop = function() {
                if (g.state === 'PLAY') {
                    if (_lastState !== 'PLAY') mm.playSector(g.sector);
                    if (g.boss && g.sector === 1) {
                        try { mm.updateBossLayers(g.boss.hp / g.boss.maxHp); } catch (e) {}
                    }
                } else if (g.state === 'MENU' && _lastState !== 'MENU') {
                    mm.stopAll();
                    mm.playMenu();
                }
                _lastState = g.state;
                origLoop();
            };
        }

        mm.playMenu();

        const volMusic = document.getElementById('vol-music');
        const volSfx = document.getElementById('vol-sfx');
        if (volMusic) volMusic.value = Math.round((mm.volume.music || 0.6) * 100);
        if (volSfx) volSfx.value = Math.round((mm.volume.sfx || 1) * 100);
    }

    if (window.Game) {
        integrate();
    } else {
        window.addEventListener('load', integrate);
    }
})();
