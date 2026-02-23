/**
 * VECTOR EXODUS - Audio Generator & Manager
 * 
 * Sistema para generar archivos de audio WAV
 * con música procedural para todos los sectores
 * 
 * Uso:
 *   AudioGenerator.generateAllSectorMusic();
 *   AudioGenerator.downloadAllAsWAV();
 */

window.AudioGenerator = (() => {
    const log = (msg) => console.log(`[AudioGenerator] ${msg}`);
    
    // Configuración de audio
    const SAMPLE_RATE = 44100; // CD Quality
    const BIT_DEPTH = 16;
    
    const generator = {
        /**
         * Generar todos los audios de música
         */
        generateAllSectorMusic: async function() {
            log('Iniciando generación de música para todos los sectores...');
            
            const files = {
                'menu': this.generateMenuMusic.bind(this),
                'sector1': this.generateSector1Ambient.bind(this),
                'boss_sector1_phase1': this.generateBossPhase1.bind(this),
                'boss_sector1_phase2': this.generateBossPhase2.bind(this),
                'boss_sector1_phase3': this.generateBossPhase3.bind(this),
                'sector2': this.generateSector2.bind(this),
                'sector3': this.generateSector3.bind(this),
                'sector4': this.generateSector4.bind(this),
                'sector5': this.generateSector5.bind(this),
                'sector6': this.generateSector6.bind(this),
                'defeat': this.generateDefeatMusic.bind(this)
            };
            
            for (const [name, generator] of Object.entries(files)) {
                try {
                    log(`↳ Generando ${name}...`);
                    const audio = generator();
                    log(`  ✓ ${name} generado (${audio.duration.toFixed(1)}s)`);
                } catch (e) {
                    log(`  ✗ Error generando ${name}: ${e}`);
                }
            }
            
            log('✓ Generación completada');
        },
        
        /**
         * Generar buffer de audio 16-bit PCM
         */
        generateAudioBuffer: function(duration, sampleCallback) {
            const samples = Math.floor(SAMPLE_RATE * duration);
            const buffer = new Float32Array(samples);
            
            for (let i = 0; i < samples; i++) {
                const t = i / SAMPLE_RATE;
                buffer[i] = sampleCallback(t);
            }
            
            return buffer;
        },
        
        /**
         * Convertir Float32 a Int16
         */
        float32ToInt16: function(float32Array) {
            const int16Array = new Int16Array(float32Array.length);
            for (let i = 0; i < float32Array.length; i++) {
                const s = Math.max(-1, Math.min(1, float32Array[i]));
                int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            return int16Array;
        },
        
        /**
         * Crear archivo WAV
         */
        createWAVFile: function(audioBuffer) {
            const int16Array = this.float32ToInt16(audioBuffer);
            const wavHeader = this.createWAVHeader(int16Array.length);
            
            const blob = new Blob([wavHeader, int16Array], { type: 'audio/wav' });
            return blob;
        },
        
        /**
         * Crear header WAV
         */
        createWAVHeader: function(dataLength) {
            const header = new ArrayBuffer(44);
            const view = new DataView(header);
            
            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };
            
            // "RIFF" header
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + dataLength * 2, true);
            writeString(8, 'WAVE');
            
            // "fmt " subchunk
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true); // Subchunk1Size
            view.setUint16(20, 1, true);  // AudioFormat: PCM
            view.setUint16(22, 1, true);  // NumChannels: Mono
            view.setUint32(24, SAMPLE_RATE, true); // SampleRate
            view.setUint32(28, SAMPLE_RATE * 2, true); // ByteRate
            view.setUint16(32, 2, true);  // BlockAlign
            view.setUint16(34, 16, true); // BitsPerSample
            
            // "data" subchunk
            writeString(36, 'data');
            view.setUint32(40, dataLength * 2, true);
            
            return header;
        },
        
        // =============================================
        // GENERADORES DE MÚSICA
        // =============================================
        
        /**
         * SYNTHWAVE ESPECIAL - Menú
         * Bajos sincopados con reverberación
         */
        generateMenuMusic: function() {
            const duration = 8;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Bass synth (oscillator cuadrado con modulación)
                const baseFreq = 55;
                const modFreq = 0.5; // Modular cada 2s
                const freq = baseFreq * (1 + 0.3 * Math.sin(2 * Math.PI * modFreq * t));
                
                // Oscilador cuadrado
                const bass = Math.sign(Math.sin(2 * Math.PI * freq * t));
                
                // Envolvente general
                const envelope = Math.exp(-t / (duration * 0.8));
                
                // Stereo layering (simular reverb)
                const layer2 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.5;
                
                // LFO en amplitud
                const lfo = Math.sin(2 * Math.PI * 0.3 * t) * 0.2 + 0.8;
                
                return (bass * 0.4 + layer2 * 0.2) * envelope * lfo * 0.5;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'menu.wav'
            };
        },
        
        /**
         * AMBIENT SCI-FI - Sector 1 (ambiente)
         * Pads suaves con tono descendente
         */
        generateSector1Ambient: function() {
            const duration = 12;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Pad suave principal
                const mainFreq = 110;
                const pad1 = Math.sin(2 * Math.PI * mainFreq * t);
                
                // Armónico superior
                const pad2 = Math.sin(2 * Math.PI * (mainFreq * 2) * t) * 0.5;
                
                // Descenso gradual
                const freqMod = Math.sin(2 * Math.PI * (0.1 * t)) * 0.1;
                
                // Envolvente de fade in/out
                const envelope = Math.min(1, t / 2) * Math.exp(-t / duration);
                
                // Trémolo
                const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t);
                
                return (pad1 * (1 + freqMod) + pad2 * freqMod) * envelope * tremolo * 0.4;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector1.wav'
            };
        },
        
        /**
         * JEFE SECTOR 1 - FASE 1 (100% volumen)
         * Electronic cinematic - Agresivo
         */
        generateBossPhase1: function() {
            const duration = 20;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Sawtooth agudo
                const freq1 = 220;
                const saw = this._sawtooth(2 * Math.PI * freq1 * t);
                
                // Sub bass
                const subFreq = freq1 / 2;
                const sub = Math.sin(2 * Math.PI * subFreq * t);
                
                // Filtro de barrido
                const filterFreq = 1000 + (t / duration) * 2000;
                const filtered = this._simpleLowpass(saw, filterFreq);
                
                // Envolvente de ataque
                const envelope = Math.min(1, t / 0.5) * Math.exp(-t / (duration * 0.5));
                
                // Modulación FM
                const modulator = Math.sin(2 * Math.PI * 5 * t);
                const modulated = saw * (1 + modulator * 0.3);
                
                return (modulated * 0.6 + sub * 0.3) * envelope * 0.8;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'boss_sector1_phase1.wav'
            };
        },
        
        /**
         * JEFE SECTOR 1 - FASE 2 (50% volumen)
         * Electronic cinematic - Retirada
         */
        generateBossPhase2: function() {
            const duration = 20;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Frecuencia descendente
                const startFreq = 220;
                const endFreq = 110;
                const freq = startFreq - (startFreq - endFreq) * (t / duration);
                
                const osc = Math.sin(2 * Math.PI * freq * t);
                
                // Square wave
                const square = Math.sign(Math.sin(2 * Math.PI * (freq * 0.5) * t));
                
                // Envolvente de retirada
                const envelope = Math.exp(-t / (duration * 1.5));
                
                // Vibrato
                const vibrato = 1 + 0.2 * Math.sin(2 * Math.PI * 5 * t);
                
                return (osc * 0.6 + square * 0.2) * envelope * vibrato * 0.5;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'boss_sector1_phase2.wav'
            };
        },
        
        /**
         * JEFE SECTOR 1 - FASE 3 (20% volumen - Fondo)
         * Electronic cinematic - Fondo minimalista
         */
        generateBossPhase3: function() {
            const duration = 20;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Tono muy grave
                const baseFreq = 55;
                
                const drone = Math.sin(2 * Math.PI * baseFreq * t);
                
                // Armónico sutilíssimo
                const harmonic = Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.1;
                
                // Envolvente de fondo
                const envelope = 0.3 * Math.exp(-Math.abs(t - duration / 2) / (duration * 2));
                
                // Modulación muy lenta
                const slowMod = Math.sin(2 * Math.PI * 0.2 * t) * 0.1;
                
                return (drone + harmonic) * (envelope + 0.05) * (1 + slowMod) * 0.2;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'boss_sector1_phase3.wav'
            };
        },
        
        /**
         * SECTOR 2 - Plasma Storm
         * Synthwave agresivo con frecuencias mutantes
         */
        generateSector2: function() {
            const duration = 10;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                const freq = 195.99; // Nota G3
                
                const osc1 = Math.sin(2 * Math.PI * freq * t);
                const osc2 = this._triangle(2 * Math.PI * (freq * 1.5) * t);
                
                // Modulación FM caótica
                const mod = Math.sin(2 * Math.PI * 3.3 * t) * 100;
                const modulated = Math.sin(2 * Math.PI * (freq + mod) * t);
                
                const envelope = Math.min(1, t / 1) * Math.exp(-t / duration);
                const lfo = Math.sin(2 * Math.PI * 2 * t) * 0.3 + 0.7;
                
                return (osc1 * 0.4 + osc2 * 0.3 + modulated * 0.2) * envelope * lfo * 0.6;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector2.wav'
            };
        },
        
        /**
         * SECTOR 3 - Crystal Resonance
         * Tonos claros y resonantes
         */
        generateSector3: function() {
            const duration = 12;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                const baseFreq = 246.94; // B3
                
                // Múltiples osciladores para resonancia
                const fundamental = Math.sin(2 * Math.PI * baseFreq * t);
                const harmonic2 = Math.sin(2 * Math.PI * (baseFreq * 2) * t) * 0.5;
                const harmonic3 = Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.3;
                
                const combined = fundamental + harmonic2 + harmonic3;
                
                // Envolvente de resonancia
                const envelope = Math.exp(-t / (duration * 0.7));
                
                // Efecto de cristal (pitch bend)
                const pitchBend = Math.sin(2 * Math.PI * 0.5 * t) * 0.05;
                
                return combined * envelope * (1 + pitchBend) * 0.35;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector3.wav'
            };
        },
        
        /**
         * SECTOR 4 - Quantum Void
         * Tonos discontinuos y pulsantes
         */
        generateSector4: function() {
            const duration = 14;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                const baseFreq = 146.83; // D3
                
                const square = Math.sign(Math.sin(2 * Math.PI * baseFreq * t));
                const pulse = Math.sign(Math.sin(2 * Math.PI * (baseFreq * 0.75) * t));
                
                // Modulación caótica
                const chaos = Math.sin(2 * Math.PI * 7 * t) * Math.cos(2 * Math.PI * 11 * t);
                
                const envelope = Math.exp(-t / (duration * 0.8));
                
                // Distorsión moderada
                const distorted = Math.tanh((square + pulse) * chaos);
                
                return distorted * envelope * 0.4;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector4.wav'
            };
        },
        
        /**
         * SECTOR 5 - Nebula Drift
         * Sintetización ambiental suave
         */
        generateSector5: function() {
            const duration = 11;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                const baseFreq = 164.81; // E3
                
                const sine1 = Math.sin(2 * Math.PI * baseFreq * t);
                const sine2 = Math.sin(2 * Math.PI * (baseFreq * 1.25) * t);
                
                // Movimiento ambiental lento
                const drift = Math.sin(2 * Math.PI * 0.3 * t) * 30;
                const drifted = Math.sin(2 * Math.PI * (baseFreq + drift) * t);
                
                const envelope = Math.min(1, t / 1.5) * Math.exp(-t / (duration * 1.2));
                const swell = Math.sin(2 * Math.PI * 1 * t) * 0.2 + 0.8;
                
                return (sine1 * 0.4 + sine2 * 0.3 + drifted * 0.2) * envelope * swell * 0.4;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector5.wav'
            };
        },
        
        /**
         * SECTOR 6 - Void Convergence
         * Grave profundo con pulsación
         */
        generateSector6: function() {
            const duration = 15;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                const baseFreq = 110; // A2
                
                const sub = Math.sin(2 * Math.PI * baseFreq * t);
                const pulse = Math.sign(Math.sin(2 * Math.PI * baseFreq * t * 2)) * 0.5;
                
                // Convergencia: frecuencia sube lentamente
                const freq_sweep = baseFreq * Math.exp(t / (duration * 2));
                const converging = Math.sin(2 * Math.PI * freq_sweep * t) * 0.3;
                
                const envelope = Math.exp(-t / duration);
                const pulse_envelope = Math.sin(2 * Math.PI * 2 * t) * 0.3 + 0.7;
                
                return (sub + pulse + converging) * envelope * pulse_envelope * 0.5;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'sector6.wav'
            };
        },
        
        /**
         * DERROTA - Descenso lúgubre
         */
        generateDefeatMusic: function() {
            const duration = 5;
            
            const buffer = this.generateAudioBuffer(duration, (t) => {
                // Descenso de frecuencia
                const startFreq = 220;
                const endFreq = 55;
                const freq = startFreq * Math.exp(Math.log(endFreq / startFreq) * (t / duration));
                
                const sine = Math.sin(2 * Math.PI * freq * t);
                
                // Envolvente de derrota
                const envelope = Math.exp(-t / (duration * 0.8));
                
                // Vibrato triste
                const vibrato = 1 + 0.3 * Math.sin(2 * Math.PI * 2 * t);
                
                return sine * envelope * vibrato * 0.6;
            });
            
            return {
                buffer: this.createWAVFile(buffer),
                duration: duration,
                name: 'defeat.wav'
            };
        },
        
        // =============================================
        // UTILIDADES DE SÍNTESIS
        // =============================================
        
        /**
         * Oscilador sawtooth (0 a 1)
         */
        _sawtooth: function(phase) {
            return ((phase % (2 * Math.PI)) / Math.PI) - 1;
        },
        
        /**
         * Oscilador triangular
         */
        _triangle: function(phase) {
            const sawtooth = this._sawtooth(phase);
            return (2 * Math.abs(sawtooth)) - 1;
        },
        
        /**
         * Filtro paso bajo simple
         */
        _simpleLowpass: function(input, freq) {
            const tau = 1 / (2 * Math.PI * freq);
            const dt = 1 / SAMPLE_RATE;
            const alpha = dt / (tau + dt);
            return input * alpha;
        },
        
        /**
         * Descargar todos los audios como ZIP
         */
        downloadAllAsWAV: function() {
            log('Preparando descarga de archivos WAV...');
            
            const files = [
                this.generateMenuMusic(),
                this.generateSector1Ambient(),
                this.generateBossPhase1(),
                this.generateBossPhase2(),
                this.generateBossPhase3(),
                this.generateSector2(),
                this.generateSector3(),
                this.generateSector4(),
                this.generateSector5(),
                this.generateSector6(),
                this.generateDefeatMusic()
            ];
            
            files.forEach(file => {
                const url = URL.createObjectURL(file.buffer);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                log(`  ↓ ${file.name} descargado`);
            });
            
            log('✓ Descargas completadas');
        },
        
        /**
         * Obtener todos los buffers para uso local
         */
        getAllBuffers: function() {
            return {
                menu: this.generateMenuMusic().buffer,
                sector1: this.generateSector1Ambient().buffer,
                boss_phase1: this.generateBossPhase1().buffer,
                boss_phase2: this.generateBossPhase2().buffer,
                boss_phase3: this.generateBossPhase3().buffer,
                sector2: this.generateSector2().buffer,
                sector3: this.generateSector3().buffer,
                sector4: this.generateSector4().buffer,
                sector5: this.generateSector5().buffer,
                sector6: this.generateSector6().buffer,
                defeat: this.generateDefeatMusic().buffer
            };
        }
    };
    
    return generator;
})();

// Usar en consola:
// AudioGenerator.generateAllSectorMusic();
// AudioGenerator.downloadAllAsWAV();
