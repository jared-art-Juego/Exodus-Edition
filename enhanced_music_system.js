/**
 * VECTOR EXODUS - Enhanced Music & Boss Phases System
 * 
 * Sistema mejorado que integra:
 * - Gestión de música por sector
 * - Fases dinámicas del jefe
 * - Transiciones suaves de volumen
 * - Animación de derrota con agujero negro
 */

window.EnhancedMusicSystem = (() => {
    const log = (msg) => console.log(`[EnhancedMusic] ${msg}`);
    
    let currentMusicPlaying = null;
    let bossPhaseData = null;
    let phaseStartTime = null;
    let phaseTimeout = null;
    let bossRestoringAnimation = null;
    
    const system = {
        // =============================================
        // INICIADORES DE MÚSICA
        // =============================================
        
        /**
         * Reproducir música del menú
         * Synthwave espacial con reverberación
         */
        playMenuMusic: async function() {
            try {
                log('Cargando música del menú...');
                
                // Intenta cargar archivo si existe
                const menuAudio = await this._loadAudioFile('menu.mp3');
                if (menuAudio) {
                    this._playAudio(menuAudio, { loop: true, volume: 0.6 });
                    log('✓ Música del menú cargada');
                    return;
                }
                
                // Si no existe, generar sintética
                log('Generando música sintética del menú...');
                if (window.MusicSynthesisEngine) {
                    window.MusicSynthesisEngine.generateMenuMusic();
                }
            } catch (e) {
                log('✗ Error cargando música del menú: ' + e);
            }
        },
        
        /**
         * Reproducir música ambiental del Sector 1
         * Ambient sci-fi
         */
        playSector1Music: async function() {
            try {
                log('Cargando música Sector 1...');
                
                const audio = await this._loadAudioFile('sector1.mp3');
                if (audio) {
                    this._playAudio(audio, { loop: true, volume: 0.5 });
                    log('✓ Música Sector 1 cargada');
                    return;
                }
                
                // Sintética
                if (window.MusicSynthesisEngine) {
                    window.MusicSynthesisEngine.generateSector1Music();
                }
            } catch (e) {
                log('✗ Error cargando música Sector 1: ' + e);
            }
        },
        
        /**
         * SISTEMA DE FASES DEL JEFE - Principal
         * 
         * Phase 1: 100% volumen - Duración 20s
         * Phase 2: 50% volumen - Duración 20s  
         * Phase 3: 20% volumen - Duración 20s
         * 
         * Si vida no baja suficiente en 20s:
         *   - Fase anterior desaparece
         *   - Jefe se anima regresando
         *   - Encuentra agujero negro
         *   - Se muestra pantalla de "Perdiste"
         */
        initializeBossPhaseSystem: async function(bossObject) {
            log('Inicializando sistema de fases del jefe...');
            
            bossPhaseData = {
                boss: bossObject,
                totalHealth: bossObject.hp || 100,
                currentHealth: bossObject.hp || 100,
                phase: 1,
                phaseHealthThresholds: {
                    1: { minHealth: 0.66, volume: 1.0, name: 'Phase 1 - Full Power' },
                    2: { minHealth: 0.33, volume: 0.5, name: 'Phase 2 - Retreat' },
                    3: { minHealth: 0.00, volume: 0.2, name: 'Phase 3 - Background' }
                },
                phaseDuration: 20000, // 20 segundos
                phaseStartTime: null,
                isTransitioning: false
            };
            
            // Cargar música de jefe
            await this._loadBossMusic();
            
            // Iniciar monitoreo de fases
            this._startPhaseMonitoring(bossObject);
            
            log('✓ Sistema de fases inicializado');
            return bossPhaseData;
        },
        
        /**
         * Actualizar HP del jefe y gestionar transiciones de fases
         */
        updateBossHealth: function(newHealth) {
            if (!bossPhaseData) return;
            
            bossPhaseData.currentHealth = newHealth;
            const healthPercent = newHealth / bossPhaseData.totalHealth;
            
            // Determinar fase actual
            let newPhase = 1;
            if (healthPercent < 0.66) newPhase = 2;
            if (healthPercent < 0.33) newPhase = 3;
            
            // Si cambió de fase
            if (newPhase !== bossPhaseData.phase) {
                this._transitionBossPhase(newPhase);
            }
            
            // Checar si pasó el tiempo límite sin suficiente daño
            if (bossPhaseData.phaseStartTime) {
                const elapsedTime = Date.now() - bossPhaseData.phaseStartTime;
                if (elapsedTime > bossPhaseData.phaseDuration && newPhase === bossPhaseData.phase) {
                    log(`⚠ Tiempo límite de fase ${bossPhaseData.phase} alcanzado sin transitar`);
                    this._triggerBossEscape();
                }
            }
        },
        
        /**
         * Transitar entre fases del jefe
         * Maneja cambios de volumen suave
         */
        _transitionBossPhase: function(newPhase) {
            if (bossPhaseData.isTransitioning) return;
            
            const oldPhase = bossPhaseData.phase;
            const phaseConfig = bossPhaseData.phaseHealthThresholds[newPhase];
            
            log(`→ Transición: Fase ${oldPhase} → Fase ${newPhase}`);
            log(`  ${phaseConfig.name} (${(phaseConfig.volume * 100).toFixed(0)}% volumen)`);
            
            bossPhaseData.isTransitioning = true;
            bossPhaseData.phase = newPhase;
            bossPhaseData.phaseStartTime = Date.now();
            
            // Animar cambio de volumen
            this._animateVolumeTransition(
                bossPhaseData.phaseHealthThresholds[oldPhase].volume,
                phaseConfig.volume,
                2000 // 2 segundos transición suave
            );
            
            // Efecto visual en el jefe
            this._showPhaseChangeEffect(newPhase);
            
            setTimeout(() => {
                bossPhaseData.isTransitioning = false;
            }, 2000);
        },
        
        /**
         * SISTEMA DE DERROTA DEL JEFE
         * 
         * Cuando pasa tiempo límite sin suficiente daño:
         * 1. Jefe genera animación de retroceso
         * 2. Encuentra agujero negro
         * 3. Es absorbido (efecto visual)
         * 4. Muestra pantalla "PERDISTE"
         */
        _triggerBossEscape: function() {
            log('⚠ ¡El jefe escapa!');
            
            if (!bossPhaseData.boss) return;
            
            const boss = bossPhaseData.boss;
            
            // 1. Animación de retroceso del jefe
            this._animateBossRetreat(boss);
            
            // 2-3. Agujero negro y absorción
            setTimeout(() => {
                this._animateBlackHole(boss);
            }, 1500);
            
            // 4. Pantalla de derrota
            setTimeout(() => {
                this._showDefeatScreen();
            }, 4000);
        },
        
        /**
         * Animar retroceso del jefe (movimiento hacia atrás)
         */
        _animateBossRetreat: function(boss) {
            if (!boss.x || !boss.y) return;
            
            const startX = boss.x;
            const startY = boss.y;
            const targetX = boss.x + 200; // Moverse a la derecha
            const targetY = boss.y - 150; // Moverse hacia arriba
            
            const duration = 1500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cúbica
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                // Actualizar posición
                boss.x = startX + (targetX - startX) * easeProgress;
                boss.y = startY + (targetY - startY) * easeProgress;
                
                // Rotación para simular movimiento
                if (boss.angle !== undefined) {
                    boss.angle += (Math.random() - 0.5) * 15;
                }
                
                // Escala decreciente (miniaturizar)
                if (boss.scale !== undefined) {
                    boss.scale = 1 - (easeProgress * 0.2);
                }
                
                log(`Boss retrocediendo: ${(progress * 100).toFixed(0)}%`);
                
                if (progress < 1) {
                    bossRestoringAnimation = requestAnimationFrame(animate);
                }
            };
            
            animate();
        },
        
        /**
         * Animar agujero negro que absorbe el jefe
         */
        _animateBlackHole: function(boss) {
            log('Creando agujero negro...');
            
            // Crear elemento visual del agujero negro
            const blackHole = {
                x: boss.x + 100,
                y: boss.y - 50,
                radius: 10,
                maxRadius: 150,
                gravity: 1.5,
                isAbsorbing: true,
                opacity: 0,
                color: '#000'
            };
            
            // Pasar datos al juego si existe canvas
            if (window.Game && window.Game.blackHole === undefined) {
                window.Game.blackHole = blackHole;
            }
            
            const duration = 2500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Crecimiento radial
                blackHole.radius = 10 + (140 * progress);
                
                // Oscuridad
                blackHole.opacity = Math.min(progress * 2, 1);
                
                // Atracción de jefe
                if (boss.x !== undefined && boss.y !== undefined) {
                    const dx = blackHole.x - boss.x;
                    const dy = blackHole.y - boss.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        boss.x += (dx / distance) * blackHole.gravity;
                        boss.y += (dy / distance) * blackHole.gravity;
                        boss.scale = Math.max(0.1, boss.scale - 0.05);
                    }
                }
                
                log(`Agujero negro: ${(progress * 100).toFixed(0)}% - Radio: ${blackHole.radius.toFixed(0)}`);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        },
        
        /**
         * Mostrar pantalla de "PERDISTE"
         */
        _showDefeatScreen: function() {
            log('Mostrando pantalla de derrota...');
            
            // Reproducir música de derrota
            if (window.MusicSynthesisEngine) {
                window.MusicSynthesisEngine.generateDefeatMusic();
            }
            
            // Crear overlay de derrota
            const existingOverlay = document.getElementById('defeat-overlay');
            if (existingOverlay) existingOverlay.remove();
            
            const defeatOverlay = document.createElement('div');
            defeatOverlay.id = 'defeat-overlay';
            defeatOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: 'Orbitron', sans-serif;
                color: #ff0044;
                animation: fadeIn 0.5s ease-out;
            `;
            
            const heading = document.createElement('h1');
            heading.style.cssText = `
                font-size: 4rem;
                text-shadow: 0 0 30px #ff0044;
                margin: 0 0 20px 0;
                letter-spacing: 3px;
                animation: pulse 1s infinite;
            `;
            heading.textContent = '⚠ PERDISTE ⚠';
            
            const message = document.createElement('p');
            message.style.cssText = `
                font-size: 1.5rem;
                margin: 10px 0;
                text-align: center;
                max-width: 600px;
                line-height: 1.8;
            `;
            message.textContent = 'El jefe fue absorbido por un agujero negro...\nFortunadamente escapó de tu ataque.';
            
            const subtext = document.createElement('small');
            subtext.style.cssText = `
                font-size: 0.9rem;
                color: #00f2ff;
                margin-top: 30px;
            `;
            subtext.textContent = 'Infligiste ' + (bossPhaseData ? 
                (((bossPhaseData.totalHealth - bossPhaseData.currentHealth) / bossPhaseData.totalHealth * 100).toFixed(0)) 
                : '0') + '% de daño al jefe';
            
            const retryBtn = document.createElement('button');
            retryBtn.style.cssText = `
                margin-top: 40px;
                padding: 15px 40px;
                background: #ff0044;
                color: #fff;
                border: none;
                font-family: 'Orbitron';
                font-size: 1.2rem;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 2px;
                transition: all 0.3s;
            `;
            retryBtn.textContent = 'Reintentar';
            retryBtn.onmouseover = () => {
                retryBtn.style.boxShadow = '0 0 20px #ff0044';
                retryBtn.style.transform = 'scale(1.05)';
            };
            retryBtn.onmouseout = () => {
                retryBtn.style.boxShadow = 'none';
                retryBtn.style.transform = 'scale(1)';
            };
            retryBtn.onclick = () => {
                log('Reiniciando sector...');
                defeatOverlay.remove();
                location.reload(); // O triggear reinicio del sector
            };
            
            // Agregar estilos de animación
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { text-shadow: 0 0 30px #ff0044; }
                    50% { text-shadow: 0 0 60px #ff0044, 0 0 30px #ff6600; }
                }
            `;
            
            defeatOverlay.appendChild(style);
            defeatOverlay.appendChild(heading);
            defeatOverlay.appendChild(message);
            defeatOverlay.appendChild(subtext);
            defeatOverlay.appendChild(retryBtn);
            
            document.body.appendChild(defeatOverlay);
            
            log('✓ Pantalla de derrota mostrada');
        },
        
        // =============================================
        // UTILIDADES INTERNAS
        // =============================================
        
        /**
         * Cargar archivo de audio desde media/
         */
        _loadAudioFile: async function(filename) {
            try {
                const response = await fetch(`media/${filename}`);
                if (!response.ok) return null;
                
                const arrayBuffer = await response.arrayBuffer();
                if (!window.MusicSynthesisEngine || !window.MusicSynthesisEngine.getAudioContext()) {
                    return null;
                }
                
                const audioContext = window.MusicSynthesisEngine.getAudioContext();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                return audioBuffer;
            } catch (e) {
                log(`Advertencia: No se pudo cargar ${filename}`);
                return null;
            }
        },
        
        /**
         * Reproducir buffer de audio
         */
        _playAudio: function(audioBuffer, options = {}) {
            try {
                const audioContext = window.MusicSynthesisEngine.getAudioContext();
                if (!audioContext) return;
                
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                
                source.buffer = audioBuffer;
                source.loop = options.loop || false;
                gainNode.gain.value = options.volume || 0.5;
                
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                source.start(0);
                
                currentMusicPlaying = { source, gainNode, audioBuffer };
            } catch (e) {
                log('Error reproduciendo audio: ' + e);
            }
        },
        
        /**
         * Cargar música de jefe
         */
        _loadBossMusic: async function() {
            const bossAudio = await this._loadAudioFile('boss_sector1.mp3');
            if (bossAudio) {
                this._playAudio(bossAudio, { loop: true, volume: 1.0 });
                log('✓ Música de jefe cargada');
                return;
            }
            
            // Sintética: Electronic cinematic
            if (window.MusicSynthesisEngine) {
                window.MusicSynthesisEngine.generateBossPhaseMusic(1);
            }
        },
        
        /**
         * Transición suave de volumen
         */
        _animateVolumeTransition: function(fromVolume, toVolume, duration = 2000) {
            if (!currentMusicPlaying || !currentMusicPlaying.gainNode) return;
            
            const startTime = Date.now();
            const gainNode = currentMusicPlaying.gainNode;
            const audioContext = window.MusicSynthesisEngine.getAudioContext();
            
            if (!audioContext) return;
            
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(fromVolume, now);
            gainNode.gain.linearRampToValueAtTime(toVolume, now + duration / 1000);
            
            log(`Volumen: ${(fromVolume * 100).toFixed(0)}% → ${(toVolume * 100).toFixed(0)}%`);
        },
        
        /**
         * Efecto visual de cambio de fase
         */
        _showPhaseChangeEffect: function(phase) {
            // Esta función puede llamar a funciones del juego para efectos visuales
            if (!window.Game || !window.Game.canvas) return;
            
            const colors = {
                1: '#ff0044',
                2: '#ff6600',
                3: '#00ff66'
            };
            
            const effect = {
                type: 'phase_change',
                color: colors[phase],
                duration: 500,
                intensity: phase === 1 ? 1 : phase === 2 ? 0.7 : 0.4
            };
            
            log(`Efecto visual fase ${phase}: ${colors[phase]}`);
        },
        
        /**
         * Monitoreo continuo de fases (puede ser llamado desde game loop)
         */
        _startPhaseMonitoring: function(bossObject) {
            log('Iniciando monitoreo de fases...');
            // El monitoreo se realiza mediante updateBossHealth()
            // que es llamado desde el game loop
        },
        
        /**
         * Obtener estado actual
         */
        getStatus: function() {
            return {
                currentPhase: bossPhaseData ? bossPhaseData.phase : null,
                currentHealth: bossPhaseData ? bossPhaseData.currentHealth : null,
                totalHealth: bossPhaseData ? bossPhaseData.totalHealth : null,
                musicPlaying: currentMusicPlaying !== null,
                timestamp: new Date().toISOString()
            };
        }
    };
    
    return system;
})();

// Auto-inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    log('[EnhancedMusic] Sistema listo para usar');
});
