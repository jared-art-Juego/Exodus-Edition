/**
 * OVERHEATING SYSTEM
 * ==================
 * Control de calentamiento de armas.
 * 
 * - Cada disparo suma 20% heat
 * - Si heat >= 100%, bloquea disparo 2 segundos
 * - Heat baja 15% por segundo
 * - Obliga a controlar ritmo de fuego
 */

window.OverheatingSystem = {
    heat: 0,
    maxHeat: 100,
    heatPerShot: 20,
    heatCooldown: 15,  // % por segundo
    isOverheated: false,
    overheatEndTime: 0,
    overheatDuration: 2000,  // 2 segundos en ms

    /**
     * Inicializar sistema
     */
    init() {
        this.heat = 0;
        this.isOverheated = false;
        this.overheatEndTime = 0;
        console.log('✅ Overheating System initialized');
    },

    /**
     * Registrar disparo
     */
    onShoot() {
        if (this.isOverheated) {
            console.log('❌ Arma sobrecalentada! Espera 2s');
            return false;  // No disparar
        }

        this.heat += this.heatPerShot;
        
        if (this.heat >= this.maxHeat) {
            this.triggerOverheat();
            return false;  // No disparar este frame
        }

        return true;  // Disparar normalmente
    },

    /**
     * Activar sobrecalentamiento
     */
    triggerOverheat() {
        this.isOverheated = true;
        this.overheatEndTime = Date.now() + this.overheatDuration;
        this.heat = this.maxHeat;
        console.log('🔴 ¡SOBRECALENTAMIENTO! Bloqueado 2s');
    },

    /**
     * Actualizar cada frame
     */
    update() {
        // Verificar si el sobrecalentamiento terminó
        if (this.isOverheated && Date.now() >= this.overheatEndTime) {
            this.isOverheated = false;
            this.heat = this.maxHeat * 0.5;  // Empieza a bajar desde 50%
            console.log('✅ Arma lista nuevamente');
        }

        // Bajar calor gradualmente (15% por segundo = 0.15 per frame ~16.6ms)
        if (!this.isOverheated && this.heat > 0) {
            const perFrame = (this.heatCooldown / 100) * 16.6;  // 16.6ms per frame
            this.heat = Math.max(0, this.heat - perFrame);
        }
    },

    /**
     * Obtener porcentaje actual
     */
    getHeatPercent() {
        return Math.min(100, Math.max(0, this.heat));
    },

    /**
     * Ver estado
     */
    getStatus() {
        return {
            heat: Math.floor(this.getHeatPercent()),
            isOverheated: this.isOverheated,
            timeLeft: this.isOverheated ? Math.max(0, this.overheatEndTime - Date.now()) : 0
        };
    }
};

console.log('✅ Overheating System v1.0 loaded');
