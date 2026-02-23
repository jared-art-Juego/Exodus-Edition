/**
 * RANKING SYSTEM
 * ==============
 * Guarda en ranking.json:
 * - Mejores carreras (bestRuns)
 * - Total de kills
 * - Jefes derrotados
 */

const RankingSystem = {
    filename: 'ranking.json',
    
    data: {
        bestRuns: [],
        totalKills: 0,
        totalBossesDefeated: 0,
        sessionsPlayed: 0,
        totalPlaytime: 0,
        averageScore: 0,
        personalBest: 0,
        lastUpdated: null
    },

    /**
     * Registra una carrera completada
     */
    recordRun(runData) {
        const run = {
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
            sector: runData.sector,
            wave: runData.wave,
            score: runData.score,
            kills: runData.kills,
            bossesDefeated: runData.bossesDefeated || 0,
            playtime: runData.playtime,
            difficulty: runData.difficulty,
            survived: runData.survived || false,
            finalHP: runData.finalHP || 0,
            weaponUsed: runData.weaponUsed
        };

        this.data.bestRuns.push(run);
        
        // Ordenar por score descendente y mantener top 50
        this.data.bestRuns.sort((a, b) => b.score - a.score);
        this.data.bestRuns = this.data.bestRuns.slice(0, 50);

        // Actualizar estadísticas
        this.data.totalKills += runData.kills;
        this.data.totalBossesDefeated += (runData.bossesDefeated || 0);
        this.data.sessionsPlayed++;
        this.data.totalPlaytime += (runData.playtime || 0);
        this.data.lastUpdated = new Date().toISOString();

        // Actualizar promedios y récord
        const avgScore = this.data.bestRuns.reduce((a, b) => a + b.score, 0) / 
                        this.data.bestRuns.length;
        this.data.averageScore = Math.floor(avgScore);
        this.data.personalBest = this.data.bestRuns[0].score;

        this.save();
        return run;
    },

    /**
     * Obtiene top N carreras
     */
    getTopRuns(count = 10) {
        return this.data.bestRuns.slice(0, count);
    },

    /**
     * Obtiene carreras por sector
     */
    getRunsBySector(sector) {
        return this.data.bestRuns.filter(r => r.sector === sector);
    },

    /**
     * Obtiene carreras por dificultad
     */
    getRunsByDifficulty(difficulty) {
        return this.data.bestRuns.filter(r => r.difficulty === difficulty);
    },

    /**
     * Obtiene estadísticas generales
     */
    getStatistics() {
        const totalRuns = this.data.sessionsPlayed;
        const survivalRate = this.data.bestRuns.filter(r => r.survived).length / totalRuns * 100;

        return {
            totalSessions: totalRuns,
            totalKills: this.data.totalKills,
            bossesDefeated: this.data.totalBossesDefeated,
            averageScore: this.data.averageScore,
            personalBest: this.data.personalBest,
            averagePlaytime: Math.floor(this.data.totalPlaytime / totalRuns),
            survivalRate: survivalRate.toFixed(1),
            playtimeHours: (this.data.totalPlaytime / 3600000).toFixed(1)
        };
    },

    /**
     * Obtiene récord personal
     */
    getPersonalBest() {
        return this.data.personalBest;
    },

    /**
     * Obtiene posición en ranking de una puntuación
     */
    getRankPosition(score) {
        const position = this.data.bestRuns.findIndex(r => r.score <= score);
        return position === -1 ? this.data.bestRuns.length + 1 : position + 1;
    },

    /**
     * Guarda datos en localStorage
     */
    save() {
        try {
            localStorage.setItem('exodus_ranking', JSON.stringify(this.data));
        } catch (e) {
            console.warn('No se pudo guardar ranking:', e);
        }
    },

    /**
     * Carga datos de localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('exodus_ranking');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudo cargar ranking:', e);
        }
    },

    /**
     * Resetea ranking (solo en dev)
     */
    reset() {
        this.data = {
            bestRuns: [],
            totalKills: 0,
            totalBossesDefeated: 0,
            sessionsPlayed: 0,
            totalPlaytime: 0,
            averageScore: 0,
            personalBest: 0,
            lastUpdated: null
        };
        this.save();
    }
};

// Cargar al inicializar
if (typeof window !== 'undefined') {
    window.RankingSystem = RankingSystem;
    // Auto-load on creation
    RankingSystem.load();
}
