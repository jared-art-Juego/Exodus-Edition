/**
 * VECTOR EXODUS - Music Synthesis Engine
 * 
 * Sistema profesional de síntesis de audio
 * Genera música procedural para todos los sectores
 */

window.MusicSynthesisEngine = (() => {
    const log = (msg) => console.log(`[MusicSynthesis] ${msg}`);
    
    // Contexto de audio global
    let audioContext = null;
    
    const engine = {
        // =============================================
        // INICIALIZACIÓN
        // =============================================
        init: function() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                log('✓ Web Audio API inicializada');
                return true;
            } catch (e) {
                log('✗ Error inicializando Web Audio: ' + e);
                return false;
            }
        },
        
        // =============================================
        // GENERADORES DE MÚSICA POR SECTOR
        // =============================================
        
        /**
         * SYNTHWAVE ESPACIAL - Para el Menú
         * Sintetización: Onda cuadrada 220Hz con reverberación leve
         */
        generateMenuMusic: function() {
            if (!audioContext) {
                log('✗ Audio context no inicializado');
                return null;
            }
            
            const now = audioContext.currentTime;
            const duration = 8; // 8 segundos
            
            try {
                // Crear canales de síntesis
                const osc = audioContext.createOscillator();
                const filt = audioContext.createBiquadFilter();
                const env = audioContext.createGain();
                const delay = audioContext.createDelay(5);
                const delayGain = audioContext.createGain();
                const masterGain = audioContext.createGain();
                
                // Configurar oscilador (synthwave bass)
                osc.type = 'square';
                osc.frequency.setValueAtTime(55, now); // Sub bass
                osc.frequency.exponentialRampToValueAtTime(110, now + duration);
                
                // Filtro (movimiento suave)
                filt.type = 'highpass';
                filt.frequency.setValueAtTime(200, now);
                filt.frequency.exponentialRampToValueAtTime(500, now + duration);
                
                // Envolvente (fade in/out suave)
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.3, now + 0.5);
                env.gain.linearRampToValueAtTime(0.25, now + duration - 1);
                env.gain.linearRampToValueAtTime(0, now + duration);
                
                // Delay/Reverberación
                delay.delayTime.value = 0.4;
                delayGain.gain.value = 0.2;
                
                // Master volumen
                masterGain.gain.value = 0.5;
                
                // Conectar cadena
                osc.connect(filt);
                filt.connect(env);
                env.connect(delay);
                delay.connect(delayGain);
                delayGain.connect(audioContext.destination);
                env.connect(audioContext.destination);
                masterGain.connect(audioContext.destination);
                
                // Iniciar
                osc.start(now);
                osc.stop(now + duration);
                
                log(`✓ Menu music generada (${duration}s)`);
                
                return {
                    type: 'menu',
                    duration: duration,
                    url: this.audioBufferToWav(osc, duration)
                };
            } catch (e) {
                log('✗ Error generando menu music: ' + e);
                return null;
            }
        },
        
        /**
         * AMBIENT SCI-FI - Para Sector 1 (ambiente)
         */
        generateSector1Music: function() {
            if (!audioContext) return null;
            
            const now = audioContext.currentTime;
            const duration = 12;
            
            try {
                // Capas de síntesis
                const synth1 = audioContext.createOscillator();
                const synth2 = audioContext.createOscillator();
                const env = audioContext.createGain();
                
                // Sintetizador 1: Pad ambiental
                synth1.type = 'sine';
                synth1.frequency.setValueAtTime(110, now);
                synth1.frequency.exponentialRampToValueAtTime(82.41, now + duration);
                
                // Sintetizador 2: Harmónico superior
                synth2.type = 'triangle';
                synth2.frequency.setValueAtTime(220, now);
                synth2.frequency.exponentialRampToValueAtTime(220, now + duration);
                
                // Envolvente suave
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.4, now + 2);
                env.gain.linearRampToValueAtTime(0.3, now + duration - 1);
                env.gain.linearRampToValueAtTime(0, now + duration);
                
                synth1.connect(env);
                synth2.connect(env);
                env.connect(audioContext.destination);
                
                synth1.start(now);
                synth2.start(now);
                synth1.stop(now + duration);
                synth2.stop(now + duration);
                
                log(`✓ Sector 1 ambient music generada (${duration}s)`);
                
                return {
                    type: 'sector1_ambient',
                    duration: duration
                };
            } catch (e) {
                log('✗ Error generando Sector 1 music: ' + e);
                return null;
            }
        },
        
        /**
         * ELECTRONIC CINEMATIC - Para jefe Sector 1
         * Tres fases con volumen dinámico
         */
        generateBossPhaseMusic: function(phase = 1) {
            if (!audioContext) return null;
            
            const now = audioContext.currentTime;
            const phaseData = {
                1: { duration: 20, freq: 220, volume: 1.0, desc: 'Phase 1 - 100% Volume' },
                2: { duration: 20, freq: 165, volume: 0.5, desc: 'Phase 2 - 50% Volume' },
                3: { duration: 20, freq: 110, volume: 0.2, desc: 'Phase 3 - 20% Volume (Fondo)' }
            };
            
            const config = phaseData[phase] || phaseData[1];
            
            try {
                const synth = audioContext.createOscillator();
                const env = audioContext.createGain();
                const filt = audioContext.createBiquadFilter();
                
                // Sintetizador electrónico
                synth.type = 'sawtooth';
                synth.frequency.setValueAtTime(config.freq, now);
                
                // Modular frecuencia
                synth.frequency.setValueAtTime(config.freq, now + 0.5);
                synth.frequency.exponentialRampToValueAtTime(config.freq * 0.8, now + config.duration * 0.5);
                synth.frequency.exponentialRampToValueAtTime(config.freq, now + config.duration);
                
                // Filtro resonante
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(3000, now);
                filt.frequency.exponentialRampToValueAtTime(1500, now + 10);
                filt.frequency.exponentialRampToValueAtTime(3000, now + config.duration);
                filt.Q.value = 5;
                
                // Envolvente
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(config.volume, now + 0.3);
                env.gain.linearRampToValueAtTime(config.volume * 0.7, now + config.duration - 1);
                env.gain.linearRampToValueAtTime(0, now + config.duration);
                
                synth.connect(filt);
                filt.connect(env);
                env.connect(audioContext.destination);
                
                synth.start(now);
                synth.stop(now + config.duration);
                
                log(`✓ ${config.desc} generada`);
                
                return {
                    type: 'boss_phase_' + phase,
                    duration: config.duration,
                    volume: config.volume
                };
            } catch (e) {
                log('✗ Error generando boss phase music: ' + e);
                return null;
            }
        },
        
        /**
         * SECTORES 2-6: Música procedural única para cada sector
         */
        generateSectorMusic: function(sectorNumber) {
            if (!audioContext) return null;
            
            const now = audioContext.currentTime;
            const sectorConfigs = {
                2: { name: 'Sector 2 - Plasma Storm', freq: 195.99, type: 'sine', duration: 10, color: '#ff3366' },
                3: { name: 'Sector 3 - Crystal Resonance', freq: 246.94, type: 'triangle', duration: 12, color: '#00ffff' },
                4: { name: 'Sector 4 - Quantum Void', freq: 146.83, type: 'square', duration: 14, color: '#9900ff' },
                5: { name: 'Sector 5 - Nebula Drift', freq: 164.81, type: 'sine', duration: 11, color: '#ff9900' },
                6: { name: 'Sector 6 - Void Convergence', freq: 110.00, type: 'sawtooth', duration: 15, color: '#00ff66' }
            };
            
            const config = sectorConfigs[sectorNumber];
            if (!config) {
                log(`✗ Sector ${sectorNumber} no válido`);
                return null;
            }
            
            try {
                const synth1 = audioContext.createOscillator();
                const synth2 = audioContext.createOscillator();
                const env = audioContext.createGain();
                const filt = audioContext.createBiquadFilter();
                
                // Oscilador principal
                synth1.type = config.type;
                synth1.frequency.setValueAtTime(config.freq, now);
                synth1.frequency.exponentialRampToValueAtTime(config.freq * 1.5, now + config.duration * 0.5);
                synth1.frequency.exponentialRampToValueAtTime(config.freq, now + config.duration);
                
                // Oscilador armónico
                synth2.type = 'sine';
                synth2.frequency.setValueAtTime(config.freq * 2, now);
                synth2.frequency.exponentialRampToValueAtTime(config.freq * 1.5, now + config.duration);
                
                // Filtro dinámico
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(2000 + (sectorNumber * 500), now);
                filt.frequency.exponentialRampToValueAtTime(1000 + (sectorNumber * 200), now + config.duration);
                
                // Envolvente
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.35, now + 0.5);
                env.gain.linearRampToValueAtTime(0.25, now + config.duration - 1);
                env.gain.linearRampToValueAtTime(0, now + config.duration);
                
                synth1.connect(filt);
                synth2.connect(filt);
                filt.connect(env);
                env.connect(audioContext.destination);
                
                synth1.start(now);
                synth2.start(now);
                synth1.stop(now + config.duration);
                synth2.stop(now + config.duration);
                
                log(`✓ ${config.name} generada`);
                
                return {
                    type: `sector_${sectorNumber}`,
                    name: config.name,
                    duration: config.duration,
                    freq: config.freq
                };
            } catch (e) {
                log('✗ Error generando sector music: ' + e);
                return null;
            }
        },
        
        /**
         * DEFEAT/GAMEOVER - Música de derrota
         */
        generateDefeatMusic: function() {
            if (!audioContext) return null;
            
            const now = audioContext.currentTime;
            const duration = 5;
            
            try {
                const synth = audioContext.createOscillator();
                const env = audioContext.createGain();
                
                // Descenso lúgubre
                synth.type = 'sine';
                synth.frequency.setValueAtTime(220, now);
                synth.frequency.exponentialRampToValueAtTime(55, now + duration);
                
                // Envolvente de derrota
                env.gain.setValueAtTime(0.4, now);
                env.gain.exponentialRampToValueAtTime(0, now + duration);
                
                synth.connect(env);
                env.connect(audioContext.destination);
                
                synth.start(now);
                synth.stop(now + duration);
                
                log(`✓ Defeat music generada`);
                
                return {
                    type: 'defeat',
                    duration: duration
                };
            } catch (e) {
                log('✗ Error generando defeat music: ' + e);
                return null;
            }
        },
        
        // =============================================
        // UTILIDADES
        // =============================================
        
        /**
         * Obtener contexto de audio actual
         */
        getAudioContext: function() {
            return audioContext;
        },
        
        /**
         * Reproducir frecuencia simple (para testing)
         */
        playTone: function(frequency, duration = 1, volume = 0.3, type = 'sine') {
            if (!audioContext) {
                log('✗ No audio context');
                return;
            }
            
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const env = audioContext.createGain();
            
            osc.type = type;
            osc.frequency.value = frequency;
            
            env.gain.setValueAtTime(volume, now);
            env.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.connect(env);
            env.connect(audioContext.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        },
        
        /**
         * Reproducir secuencia de notas
         */
        playMelody: function(notes, duration = 0.5, volume = 0.2) {
            if (!audioContext) return;
            
            let currentTime = audioContext.currentTime;
            
            notes.forEach(freq => {
                this.playTone(freq, duration, volume, 'sine');
                currentTime += duration;
            });
        },
        
        /**
         * Validar contexto de audio
         */
        getStatus: function() {
            return {
                initialized: audioContext !== null,
                contextState: audioContext ? audioContext.state : 'unknown',
                timestamp: new Date().toISOString()
            };
        }
    };
    
    return engine;
})();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (!window.MusicSynthesisEngine.init()) {
        console.warn('[MusicSynthesis] Inicialización falló - Audio puede no estar disponible');
    }
});
