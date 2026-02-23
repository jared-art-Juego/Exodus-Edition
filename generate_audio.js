#!/usr/bin/env node

/**
 * VECTOR EXODUS - Audio WAV Generator (Node.js)
 * 
 * Genera archivos WAV para todos los sectores
 * Ejecutar: node generate_audio.js
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1; // Mono

class AudioGenerator {
    constructor() {
        this.mediaDir = path.join(__dirname, '..', 'media');
        this.ensureMediaDir();
    }
    
    ensureMediaDir() {
        if (!fs.existsSync(this.mediaDir)) {
            fs.mkdirSync(this.mediaDir, { recursive: true });
            console.log(`✓ Directorio media/ creado`);
        }
    }
    
    // =============================================
    // UTILIDADES DE SÍNTESIS
    // =============================================
    
    sawtooth(phase) {
        return ((phase % (2 * Math.PI)) / Math.PI) - 1;
    }
    
    triangle(phase) {
        const sawtooth = this.sawtooth(phase);
        return (2 * Math.abs(sawtooth)) - 1;
    }
    
    // =============================================
    // GENERADORES DE AUDIO
    // =============================================
    
    generateMenuMusic() {
        console.log('  ↳ Generando menu.wav...');
        const duration = 8;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 55;
            const modFreq = 0.5;
            const freq = baseFreq * (1 + 0.3 * Math.sin(2 * Math.PI * modFreq * t));
            
            const bass = Math.sign(Math.sin(2 * Math.PI * freq * t));
            const envelope = Math.exp(-t / (duration * 0.8));
            const layer2 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.5;
            const lfo = Math.sin(2 * Math.PI * 0.3 * t) * 0.2 + 0.8;
            
            buffer[i] = (bass * 0.4 + layer2 * 0.2) * envelope * lfo * 0.5;
        }
        
        return { buffer, duration, name: 'menu.wav' };
    }
    
    generateSector1Ambient() {
        console.log('  ↳ Generando sector1.wav...');
        const duration = 12;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const mainFreq = 110;
            const pad1 = Math.sin(2 * Math.PI * mainFreq * t);
            const pad2 = Math.sin(2 * Math.PI * (mainFreq * 2) * t) * 0.5;
            const freqMod = Math.sin(2 * Math.PI * (0.1 * t)) * 0.1;
            const envelope = Math.min(1, t / 2) * Math.exp(-t / duration);
            const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t);
            
            buffer[i] = (pad1 * (1 + freqMod) + pad2 * freqMod) * envelope * tremolo * 0.4;
        }
        
        return { buffer, duration, name: 'sector1.wav' };
    }
    
    generateBossPhase1() {
        console.log('  ↳ Generando boss_sector1_phase1.wav...');
        const duration = 20;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const freq1 = 220;
            const saw = this.sawtooth(2 * Math.PI * freq1 * t);
            const subFreq = freq1 / 2;
            const sub = Math.sin(2 * Math.PI * subFreq * t);
            const envelope = Math.min(1, t / 0.5) * Math.exp(-t / (duration * 0.5));
            const modulator = Math.sin(2 * Math.PI * 5 * t);
            const modulated = saw * (1 + modulator * 0.3);
            
            buffer[i] = (modulated * 0.6 + sub * 0.3) * envelope * 0.8;
        }
        
        return { buffer, duration, name: 'boss_sector1_phase1.wav' };
    }
    
    generateBossPhase2() {
        console.log('  ↳ Generando boss_sector1_phase2.wav...');
        const duration = 20;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const startFreq = 220;
            const endFreq = 110;
            const freq = startFreq - (startFreq - endFreq) * (t / duration);
            const osc = Math.sin(2 * Math.PI * freq * t);
            const square = Math.sign(Math.sin(2 * Math.PI * (freq * 0.5) * t));
            const envelope = Math.exp(-t / (duration * 1.5));
            const vibrato = 1 + 0.2 * Math.sin(2 * Math.PI * 5 * t);
            
            buffer[i] = (osc * 0.6 + square * 0.2) * envelope * vibrato * 0.5;
        }
        
        return { buffer, duration, name: 'boss_sector1_phase2.wav' };
    }
    
    generateBossPhase3() {
        console.log('  ↳ Generando boss_sector1_phase3.wav...');
        const duration = 20;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 55;
            const drone = Math.sin(2 * Math.PI * baseFreq * t);
            const harmonic = Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.1;
            const envelope = 0.3 * Math.exp(-Math.abs(t - duration / 2) / (duration * 2));
            const slowMod = Math.sin(2 * Math.PI * 0.2 * t) * 0.1;
            
            buffer[i] = (drone + harmonic) * (envelope + 0.05) * (1 + slowMod) * 0.2;
        }
        
        return { buffer, duration, name: 'boss_sector1_phase3.wav' };
    }
    
    generateSector2() {
        console.log('  ↳ Generando sector2.wav...');
        const duration = 10;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const freq = 195.99;
            const osc1 = Math.sin(2 * Math.PI * freq * t);
            const osc2 = this.triangle(2 * Math.PI * (freq * 1.5) * t);
            const mod = Math.sin(2 * Math.PI * 3.3 * t) * 100;
            const modulated = Math.sin(2 * Math.PI * (freq + mod) * t);
            const envelope = Math.min(1, t / 1) * Math.exp(-t / duration);
            const lfo = Math.sin(2 * Math.PI * 2 * t) * 0.3 + 0.7;
            
            buffer[i] = (osc1 * 0.4 + osc2 * 0.3 + modulated * 0.2) * envelope * lfo * 0.6;
        }
        
        return { buffer, duration, name: 'sector2.wav' };
    }
    
    generateSector3() {
        console.log('  ↳ Generando sector3.wav...');
        const duration = 12;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 246.94;
            const fundamental = Math.sin(2 * Math.PI * baseFreq * t);
            const harmonic2 = Math.sin(2 * Math.PI * (baseFreq * 2) * t) * 0.5;
            const harmonic3 = Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.3;
            const combined = fundamental + harmonic2 + harmonic3;
            const envelope = Math.exp(-t / (duration * 0.7));
            const pitchBend = Math.sin(2 * Math.PI * 0.5 * t) * 0.05;
            
            buffer[i] = combined * envelope * (1 + pitchBend) * 0.35;
        }
        
        return { buffer, duration, name: 'sector3.wav' };
    }
    
    generateSector4() {
        console.log('  ↳ Generando sector4.wav...');
        const duration = 14;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 146.83;
            const square = Math.sign(Math.sin(2 * Math.PI * baseFreq * t));
            const pulse = Math.sign(Math.sin(2 * Math.PI * (baseFreq * 0.75) * t));
            const chaos = Math.sin(2 * Math.PI * 7 * t) * Math.cos(2 * Math.PI * 11 * t);
            const envelope = Math.exp(-t / (duration * 0.8));
            const distorted = Math.tanh((square + pulse) * chaos);
            
            buffer[i] = distorted * envelope * 0.4;
        }
        
        return { buffer, duration, name: 'sector4.wav' };
    }
    
    generateSector5() {
        console.log('  ↳ Generando sector5.wav...');
        const duration = 11;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 164.81;
            const sine1 = Math.sin(2 * Math.PI * baseFreq * t);
            const sine2 = Math.sin(2 * Math.PI * (baseFreq * 1.25) * t);
            const drift = Math.sin(2 * Math.PI * 0.3 * t) * 30;
            const drifted = Math.sin(2 * Math.PI * (baseFreq + drift) * t);
            const envelope = Math.min(1, t / 1.5) * Math.exp(-t / (duration * 1.2));
            const swell = Math.sin(2 * Math.PI * 1 * t) * 0.2 + 0.8;
            
            buffer[i] = (sine1 * 0.4 + sine2 * 0.3 + drifted * 0.2) * envelope * swell * 0.4;
        }
        
        return { buffer, duration, name: 'sector5.wav' };
    }
    
    generateSector6() {
        console.log('  ↳ Generando sector6.wav...');
        const duration = 15;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const baseFreq = 110;
            const sub = Math.sin(2 * Math.PI * baseFreq * t);
            const pulse = Math.sign(Math.sin(2 * Math.PI * baseFreq * t * 2)) * 0.5;
            const freq_sweep = baseFreq * Math.exp(t / (duration * 2));
            const converging = Math.sin(2 * Math.PI * freq_sweep * t) * 0.3;
            const envelope = Math.exp(-t / duration);
            const pulse_envelope = Math.sin(2 * Math.PI * 2 * t) * 0.3 + 0.7;
            
            buffer[i] = (sub + pulse + converging) * envelope * pulse_envelope * 0.5;
        }
        
        return { buffer, duration, name: 'sector6.wav' };
    }
    
    generateDefeatMusic() {
        console.log('  ↳ Generando defeat.wav...');
        const duration = 5;
        const samples = Math.floor(SAMPLE_RATE * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / SAMPLE_RATE;
            const startFreq = 220;
            const endFreq = 55;
            const freq = startFreq * Math.exp(Math.log(endFreq / startFreq) * (t / duration));
            const sine = Math.sin(2 * Math.PI * freq * t);
            const envelope = Math.exp(-t / (duration * 0.8));
            const vibrato = 1 + 0.3 * Math.sin(2 * Math.PI * 2 * t);
            
            buffer[i] = sine * envelope * vibrato * 0.6;
        }
        
        return { buffer, duration, name: 'defeat.wav' };
    }
    
    // =============================================
    // CONVERSIÓN Y ESCRITURA
    // =============================================
    
    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return int16Array;
    }
    
    createWAVHeader(dataLength) {
        const header = Buffer.alloc(44);
        
        // "RIFF" header
        header.write('RIFF');
        header.writeUInt32LE(36 + dataLength * 2, 4);
        header.write('WAVE', 8);
        
        // "fmt " subchunk
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16); // Subchunk1Size
        header.writeUInt16LE(1, 20);  // AudioFormat: PCM
        header.writeUInt16LE(CHANNELS, 22); // NumChannels
        header.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
        header.writeUInt32LE(SAMPLE_RATE * CHANNELS * 2, 28); // ByteRate
        header.writeUInt16LE(CHANNELS * 2, 32); // BlockAlign
        header.writeUInt16LE(16, 34); // BitsPerSample
        
        // "data" subchunk
        header.write('data', 36);
        header.writeUInt32LE(dataLength * 2, 40);
        
        return header;
    }
    
    saveWAVFile(audioData) {
        const header = this.createWAVHeader(audioData.buffer.length);
        const int16 = this.float32ToInt16(audioData.buffer);
        const int16Buffer = Buffer.from(int16);
        
        const filePath = path.join(this.mediaDir, audioData.name);
        const fileContent = Buffer.concat([header, int16Buffer]);
        
        fs.writeFileSync(filePath, fileContent);
        console.log(`      ✓ ${audioData.name} (${(fileContent.length / 1024).toFixed(1)}KB)`);
    }
    
    // =============================================
    // GENERACIÓN COMPLETA
    // =============================================
    
    generateAll() {
        console.log('🎵 Generando música para VECTOR EXODUS...\n');
        
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
        
        console.log('\n  ↓ Guardando archivos...\n');
        files.forEach(file => this.saveWAVFile(file));
        
        console.log(`\n✓ ${files.length} archivos generados en media/`);
        console.log('✓ Listo para npm run dist\n');
    }
}

// Ejecutar
const generator = new AudioGenerator();
generator.generateAll();
