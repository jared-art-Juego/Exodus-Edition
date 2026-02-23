/**
 * EPIC CLIPS SYSTEM
 * =================
 * Detecta momentos épicos sin grabar video real
 * Solo muestra texto grande y registra internamente
 * 
 * Detecta:
 * - Multi kill
 * - Jefe perfecto
 * - Evento extremo superado
 */

const EpicClipsSystem = {
    activeClips: [],
    clipHistory: [],

    clipTypes: {
        multi_kill: {
            id: 'multi_kill',
            name: 'MULTI-KILL',
            minKills: 3,
            timeWindow: 3000, // 3 segundos
            textColor: '#ff0044',
            magnitude: 1
        },
        mega_kill: {
            id: 'mega_kill',
            name: 'MEGA-KILL',
            minKills: 5,
            timeWindow: 2000,
            textColor: '#ff6600',
            magnitude: 2
        },
        perfect_boss: {
            id: 'perfect_boss',
            name: 'COMBATE PERFECTO',
            condition: 'noDamageDealt',
            textColor: '#00ff66',
            magnitude: 2
        },
        wave_completed: {
            id: 'wave_completed',
            name: 'ONDA COMPLETADA',
            textColor: '#00f2ff',
            magnitude: 0.5
        },
        extreme_event: {
            id: 'extreme_event',
            name: 'EVENTO EXTREMO',
            textColor: '#9900ff',
            magnitude: 1.5
        },
        boss_defeated: {
            id: 'boss_defeated',
            name: 'JEFE DERROTADO',
            textColor: '#ff00ff',
            magnitude: 2
        }
    },

    /**
     * Registra un kill para detección de multi-kills
     */
    recordKill(time) {
        if (!this.activeClips.find(c => c.type === 'multi_kill')) {
            this.activeClips.push({
                type: 'multi_kill',
                startTime: time,
                kills: 1,
                lastKillTime: time
            });
        } else {
            const multiKill = this.activeClips.find(c => c.type === 'multi_kill');
            multiKill.kills++;
            multiKill.lastKillTime = time;
        }
    },

    /**
     * Detecta y crea clip de multi-kill
     */
    detectMultiKill(kills, timeWindow = 3000) {
        if (kills >= 5) {
            return this.triggerClip('mega_kill', { kills });
        } else if (kills >= 3) {
            return this.triggerClip('multi_kill', { kills });
        }
        return null;
    },

    /**
     * Detecta combate perfecto contra jefe
     */
    detectPerfectBoss(bossName, difficulty) {
        return this.triggerClip('perfect_boss', { bossName, difficulty });
    },

    /**
     * Detecta evento extremo superado
     */
    detectExtremeEvent(eventType, details) {
        return this.triggerClip('extreme_event', { eventType, ...details });
    },

    /**
     * Detecta onda completada
     */
    detectWaveCompleted(waveNumber) {
        if (waveNumber % 5 === 0) { // Cada 5 ondas
            return this.triggerClip('wave_completed', { waveNumber });
        }
        return null;
    },

    /**
     * Detecta derrota de jefe
     */
    detectBossDefeated(bossName, phase, timeSpent) {
        return this.triggerClip('boss_defeated', { bossName, phase, timeSpent });
    },

    /**
     * Activa un clip épico
     */
    triggerClip(clipTypeId, data = {}) {
        const clipDef = this.clipTypes[clipTypeId];
        if (!clipDef) return null;

        const clip = {
            id: clipTypeId,
            name: clipDef.name,
            startTime: Date.now(),
            duration: 3000, // 3 segundos mostrado
            textColor: clipDef.textColor,
            magnitude: clipDef.magnitude,
            data: data,
            alpha: 1
        };

        this.activeClips.push(clip);
        this.clipHistory.push(clip);

        // Limitar historial a últimos 50 clips
        if (this.clipHistory.length > 50) {
            this.clipHistory.shift();
        }

        console.log(`🎬 CLIP ÉPICO: ${clip.name}`, data);

        return clip;
    },

    /**
     * Actualiza clips activos (duración y alpha)
     */
    updateClips() {
        const now = Date.now();
        this.activeClips = this.activeClips.filter(clip => {
            const elapsed = now - clip.startTime;
            return elapsed < clip.duration;
        });

        // Calcular alpha con fade-out en últimos 500ms
        this.activeClips.forEach(clip => {
            const elapsed = now - clip.startTime;
            const fadeStart = clip.duration - 500;
            if (elapsed > fadeStart) {
                clip.alpha = 1 - ((elapsed - fadeStart) / 500);
            }
        });
    },

    /**
     * Dibuja clips en pantalla
     */
    drawClips(ctx, canvasWidth, canvasHeight) {
        this.updateClips();

        this.activeClips.forEach((clip, index) => {
            ctx.save();
            ctx.globalAlpha = clip.alpha;

            // Posición: centro de pantalla, con offset para múltiples clips
            const y = (canvasHeight / 2) - (index * 100);

            // Sombra de texto
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = `bold ${Math.floor(80 * clip.magnitude)}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 20;
            ctx.shadowColor = clip.textColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Texto principal
            ctx.fillStyle = clip.textColor;
            ctx.strokeStyle = clip.textColor;
            ctx.lineWidth = 3;
            ctx.strokeText(clip.name, canvasWidth / 2, y);
            ctx.fillText(clip.name, canvasWidth / 2, y);

            // Sub-texto con datos
            if (Object.keys(clip.data).length > 0) {
                ctx.font = `12px Orbitron`;
                ctx.fillStyle = clip.textColor + '99';
                let subtext = '';

                if (clip.data.kills) subtext += `${clip.data.kills} kills `;
                if (clip.data.bossName) subtext += `${clip.data.bossName} `;
                if (clip.data.waveNumber) subtext += `Onda ${clip.data.waveNumber} `;

                if (subtext) {
                    ctx.fillText(subtext, canvasWidth / 2, y + 40);
                }
            }

            ctx.restore();
        });
    },

    /**
     * Obtiene historial de clips
     */
    getHistory() {
        return this.clipHistory;
    },

    /**
     * Obtiene clips por tipo
     */
    getClipsByType(clipTypeId) {
        return this.clipHistory.filter(c => c.id === clipTypeId);
    },

    /**
     * Obtiene estadísticas de clips
     */
    getStatistics() {
        const stats = {};
        this.clipHistory.forEach(clip => {
            stats[clip.id] = (stats[clip.id] || 0) + 1;
        });
        return {
            totalClips: this.clipHistory.length,
            byType: stats
        };
    },

    /**
     * Exporta clips para sharing (formato de texto)
     */
    exportClipsAsText() {
        let text = '=== EXODUS CLIPS HIGHLIGHTS ===\n\n';

        this.clipHistory.slice(-20).forEach((clip, idx) => {
            const date = new Date(clip.startTime);
            text += `${idx + 1}. [${date.toLocaleTimeString()}] ${clip.name}\n`;
            if (clip.data.kills) text += `   Kills: ${clip.data.kills}\n`;
            if (clip.data.bossName) text += `   Boss: ${clip.data.bossName}\n`;
            text += '\n';
        });

        return text;
    },

    /**
     * Resetea sistema
     */
    reset() {
        this.activeClips = [];
        this.clipHistory = [];
    }
};

if (typeof window !== 'undefined') {
    window.EpicClipsSystem = EpicClipsSystem;
}
