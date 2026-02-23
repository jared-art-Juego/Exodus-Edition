/**
 * SISTEMA DE RANGOS DINÁMICOS
 * Calcula el rango final (S+, S, A, B, C, D) basado en:
 * - Precisión de disparos (20%)
 * - Daño recibido (30%)
 * - Combo máximo (25%)
 * - Tiempo de juego (15%)
 * - Jefes eliminados bonus (10%)
 */

const RankSystem = (() => {
    const RANK_THRESHOLDS = {
        'S+': 950,
        'S': 850,
        'A': 750,
        'B': 650,
        'C': 500,
        'D': 0
    };

    const RANK_COLORS = {
        'S+': '#FFD700', // Oro
        'S': '#00F2FF',  // Cian
        'A': '#00FF66',  // Verde
        'B': '#FF9500',  // Naranja
        'C': '#FF0044',  // Rojo
        'D': '#666666'   // Gris
    };

    const calculateScore = (gameStats) => {
        let score = 0;

        // Precisión (0-20 puntos) - % de disparos que dieron en el blanco
        const accuracyScore = (gameStats.accuracy || 0) * 0.2;
        score += accuracyScore;

        // Daño recibido (0-30 puntos) - Penaliza recibir mucho daño
        // Si no recibió daño = 30 puntos, si recibió 1000+ daño = 0 puntos
        const damageRatio = Math.max(0, 1 - (gameStats.damageReceived || 0) / 1000);
        const damageScore = damageRatio * 30;
        score += damageScore;

        // Combo máximo (0-25 puntos) - Bonus por combos altos
        const maxCombo = gameStats.maxCombo || 0;
        const comboScore = Math.min(25, (maxCombo / 50) * 25);
        score += comboScore;

        // Tiempo de juego (0-15 puntos) - Bonus por terminar rápido (300 seg max = 15 puntos)
        const playTime = gameStats.playTimeSeconds || 0;
        const timeScore = Math.max(0, (1 - playTime / 600) * 15);
        score += timeScore;

        // Jefes eliminados (0-10 puntos bonus)
        const bossKillBonus = (gameStats.bossesDefeated || 0) * 2;
        score += Math.min(10, bossKillBonus);

        const enemyKillBonus = Math.min(10, (gameStats.enemiesDefeated || 0) / 20);
        score += enemyKillBonus;

        return Math.min(1000, Math.max(0, score));
    };

    const getRankFromScore = (score) => {
        for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
            if (score >= threshold) return rank;
        }
        return 'D';
    };

    const calculateRank = (gameStats) => {
        const score = calculateScore(gameStats);
        const rank = getRankFromScore(score);

        return {
            rank,
            score: Math.round(score),
            color: RANK_COLORS[rank],
            stats: {
                accuracy: Math.round(gameStats.accuracy || 0),
                damageReceived: Math.round(gameStats.damageReceived || 0),
                maxCombo: gameStats.maxCombo || 0,
                playTimeSeconds: gameStats.playTimeSeconds || 0,
                enemiesDefeated: gameStats.enemiesDefeated || 0,
                bossesDefeated: gameStats.bossesDefeated || 0,
                shotsFired: gameStats.shotsFired || 0,
                shotsHit: gameStats.shotsHit || 0
            }
        };
    };

    const getGradeDescription = (rank) => {
        const descriptions = {
            'S+': '¡PERFECTO! Eres un legendario piloto de Exodus.',
            'S': '¡INCREÍBLE! Tu destreza en combate es excepcional.',
            'A': '¡MUY BIEN! Demostraste ser un valieno guerrero.',
            'B': 'Bien jugado. Sobreviviste a las adversidades.',
            'C': 'Luchaste con valor pero necesitas mejorar.',
            'D': 'Apenas sobreviviste. La próxima será mejor.'
        };
        return descriptions[rank] || 'Desconocido';
    };

    return {
        calculateRank,
        calculateScore,
        getRankFromScore,
        getGradeDescription,
        RANK_COLORS,
        RANK_THRESHOLDS
    };
})();

// Exportar para uso global
window.RankSystem = RankSystem;
