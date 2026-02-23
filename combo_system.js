/**
 * COMBO SYSTEM
 * ============
 * Multiplicador de puntaje basado en enemigos eliminados sin recibir daño.
 * 
 * - Inicia en x1
 * - +0.1 multiplicador por enemigo sin daño recibido
 * - Máximo x3
 * - Se resetea si recibe daño
 */

window.ComboSystem = {
    combo: 1.0,
    maxCombo: 3.0,
    comboIncrement: 0.1,
    lastPlayerHp: 100,
    comboKills: 0,

    /**
     * Inicializar sistema
     */
    init(game) {
        this.combo = 1.0;
        this.comboKills = 0;
        this.lastPlayerHp = game.player.maxHp;
        console.log('✅ Combo System initialized');
    },

    /**
     * Llamar en cada muerte de enemigo
     */
    onEnemyKilled(game) {
        // Verificar si el jugador recibió daño desde último combo
        if (game.player.hp < this.lastPlayerHp) {
            // Recibió daño, resetear combo
            this.resetCombo();
        } else {
            // Sin daño, incrementar combo
            this.comboKills++;
            this.combo = Math.min(this.maxCombo, this.combo + this.comboIncrement);
            console.log(`🔥 Combo x${this.combo.toFixed(1)} (+${this.comboIncrement})`);
        }

        this.lastPlayerHp = game.player.hp;
    },

    /**
     * Resetear combo (al recibir daño)
     */
    resetCombo() {
        if (this.combo > 1.0) {
            console.log(`❌ Combo roto! Volvió a x1`);
        }
        this.combo = 1.0;
        this.comboKills = 0;
    },

    /**
     * Obtener multiplicador actual
     */
    getMultiplier() {
        return this.combo;
    },

    /**
     * Aplicar multiplicador a puntaje
     */
    applyMultiplier(baseScore) {
        return Math.floor(baseScore * this.combo);
    },

    /**
     * Ver estado
     */
    getStatus() {
        return {
            combo: this.combo.toFixed(1),
            kills: this.comboKills,
            multiplier: `x${this.combo.toFixed(1)}`
        };
    }
};

console.log('✅ Combo System v1.0 loaded');
