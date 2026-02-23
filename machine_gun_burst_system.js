/**
 * MACHINE GUN AK47 BURST SYSTEM (MEJORADO)
 * ==========================================
 * Disparo estilo AK47 automática controlada
 * 
 * Comportamiento EXACTO:
 * - 2 ráfagas de 10 balas cada una
 * - 80-100ms entre balas dentro de cada ráfaga (rápido controlado)
 * - Pequeña pausa entre ráfagas (150ms)
 * - Cooldown 3000ms total DESPUÉS de ambas
 * - NO permite disparo manual durante secuencia
 * - Cada bala en su propio frame (no 20 en 1 frame)
 */

const MachineGunBurstSystem = {
    // Estado del sistema
    state: {
        active: false,
        burstPhase: 0,           // 0 (espera), 1 (ráfaga 1), 2 (pausa), 3 (ráfaga 2)
        bulletsInPhase: 0,       // Cuántas balas en esta ráfaga
        lastBulletTime: 0,       // Último disparo
        burstStartTime: 0,       // Cuándo empezó la secuencia
        nextAllowedShot: 0       // Cuándo se permite siguiente bala
    },

    // Configuración
    config: {
        bulletsPerBurst: 10,
        timeBetweenBullets: 90,  // 90ms (dentro del rango 80-100ms)
        pauseBetweenBursts: 150, // 150ms pausa entre ráfagas
        cooldownAfterAll: 3000,  // 3000ms cooldown TOTAL
        damage: 20,
        speed: 20,
        color: '#00f2ff',
        spread: 0.12
    },

    /**
     * Verificar si puede empezar nueva ráfaga
     */
    canActivate() {
        return !this.state.active && (Date.now() >= this.state.nextAllowedShot);
    },

    /**
     * Activar secuencia de disparo
     */
    activate(game) {
        if (!this.canActivate()) return false;

        this.state.active = true;
        this.state.burstPhase = 1;         // Empezar ráfaga 1
        this.state.bulletsInPhase = 0;
        this.state.burstStartTime = Date.now();
        this.state.lastBulletTime = Date.now() - this.config.timeBetweenBullets; // Para disparar inmediatamente
        
        console.log('🔫 AK47 Burst activated - Phase 1');
        return true;
    },

    /**
     * Actualizar sistema (llamar en cada frame)
     * Retorna true si se disparó una bala
     */
    update(game) {
        if (!this.state.active) return false;

        const now = Date.now();

        // Fase 1: Ráfaga 1 (10 balas)
        if (this.state.burstPhase === 1) {
            if (now >= this.state.lastBulletTime + this.config.timeBetweenBullets) {
                this.fireBullet(game);
                this.state.bulletsInPhase++;
                this.state.lastBulletTime = now;

                // Completamos ráfaga 1 → ir a pausa
                if (this.state.bulletsInPhase >= this.config.bulletsPerBurst) {
                    this.state.burstPhase = 2;
                    this.state.bulletsInPhase = 0;
                    console.log('⏸ Pause between bursts');
                    return true;
                }
                return true;
            }
        }

        // Fase 2: Pausa entre ráfagas
        if (this.state.burstPhase === 2) {
            if (now >= this.state.lastBulletTime + this.config.pauseBetweenBursts) {
                this.state.burstPhase = 3;
                console.log('🔫 Phase 2 activated');
                return false;
            }
        }

        // Fase 3: Ráfaga 2 (10 balas)
        if (this.state.burstPhase === 3) {
            if (now >= this.state.lastBulletTime + this.config.timeBetweenBullets) {
                this.fireBullet(game);
                this.state.bulletsInPhase++;
                this.state.lastBulletTime = now;

                // Completamos ráfaga 2 → fin
                if (this.state.bulletsInPhase >= this.config.bulletsPerBurst) {
                    this.state.active = false;
                    this.state.burstPhase = 0;
                    this.state.nextAllowedShot = now + this.config.cooldownAfterAll;
                    console.log('✓ AK47 Burst complete - cooldown 3000ms');
                    return true;
                }
                return true;
            }
        }

        return false;
    },

    /**
     * Disparar una sola bala
     */
    fireBullet(game) {
        if (!game || !game.player) return;

        const player = game.player;
        const spread = (Math.random() - 0.5) * this.config.spread;

        if (game.fire) {
            game.fire(
                player.x,
                player.y,
                player.ang + spread,
                this.config.speed,
                this.config.color,
                this.config.damage * (player.damageMultiplier || 1)
            );
        }
    },

    /**
     * Verificar si está activo
     */
    isActive() {
        return this.state.active;
    },

    /**
     * Obtener estado
     */
    getStatus() {
        return {
            active: this.state.active,
            phase: this.state.burstPhase,
            bulletsInPhase: this.state.bulletsInPhase,
            progress: (this.state.bulletsInPhase / this.config.bulletsPerBurst) * 100
        };
    },

    /**
     * Reiniciar sistema
     */
    reset() {
        this.state.active = false;
        this.state.burstPhase = 0;
        this.state.bulletsInPhase = 0;
        this.state.lastBulletTime = 0;
        this.state.nextAllowedShot = 0;
    }
};

// Exportar globalmente
window.MachineGunBurstSystem = MachineGunBurstSystem;
console.log('✓ Machine Gun AK47 Burst System loaded');

