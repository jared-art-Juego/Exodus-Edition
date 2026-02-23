/**
 * ENHANCED WEAPONS SYSTEM
 * =======================
 * Mejoras a armas existentes y nuevos comportamientos
 * 
 * AMETRALLADORA (MG):
 * - 2 ráfagas consecutivas
 * - 10 balas por ráfaga
 * - 30-50ms entre balas
 * - Cooldown normal después
 * 
 * LANZACOHETES (ROCKET):
 * - Cooldown fijo: 4 segundos
 * - Explosión mejorada con daño en área
 * - Efectos visuales mejorados
 */

const EnhancedWeaponsSystem = {
    // Configuración de armas
    weaponConfigs: {
        ion: {
            name: 'ION CANNON',
            damage: 30,
            cooldown: 800,
            speed: 15,
            color: '#fff',
            burstCount: 1,
            projectilesPerShot: 1,
            spread: 0,
            description: 'Arma base. Disparo simple y directo.'
        },

        mg: {
            name: 'MACHINE GUN',
            damage: 20,
            cooldown: 3000,           // Cooldown DESPUÉS de ambas ráfagas
            speed: 20,
            color: '#00f2ff',
            burstCount: 2,            // 2 ráfagas
            bulletsPerBurst: 10,      // 10 balas por ráfaga
            burstSpacing: 30,         // 30-50ms entre balas
            spreadPerBullet: 0.16,
            description: '2 ráfagas de 10 balas cada una'
        },

        rocket: {
            name: 'ROCKET LAUNCHER',
            damage: 65,
            cooldown: 4000,           // Cooldown fijo
            speed: 9,
            color: '#ff0044',
            burstCount: 1,
            projectilesPerShot: 5,
            spread: 0.35,
            hasAreaDamage: true,
            blastRadius: 55,
            hasImprovedVisuals: true,
            description: 'Cohetes con explosión en área. Cooldown fijo: 4s'
        },

        ak47: {
            name: 'AK-47',
            damage: 32,
            cooldown: 3000,
            speed: 18,
            color: '#ff6600',
            burstCount: 1,
            projectilesPerShot: 5,
            spread: 0.25,
            lineSpacing: 30,
            description: '5 proyectiles alineados con espaciamiento'
        },

        plasma: {
            name: 'PLASMA CANNON',
            damage: 75,
            cooldown: 3000,
            speed: 14,
            color: '#9900ff',
            burstCount: 1,
            projectilesPerShot: 8,
            spread: 0.45,
            energyCost: 20,           // Requiere energía
            description: '8 proyectiles en spread amplio'
        },

        railgun: {
            name: 'RAILGUN',
            damage: 90,
            cooldown: 3000,
            speed: 18,
            color: '#f8ff00',
            burstCount: 1,
            projectilesPerShot: 10,
            spread: 0.55,
            isPrecise: true,          // Precisión mejorada
            energyCost: 30,           // Requiere energía
            description: '10 proyectiles energía con precisión'
        }
    },

    /**
     * Obtiene configuración de arma
     */
    getWeaponConfig(weaponType) {
        return this.weaponConfigs[weaponType] || this.weaponConfigs['ion'];
    },

    /**
     * Ejecuta disparo de arma con nuevos comportamientos
     */
    fireWeapon(game, weaponType) {
        const config = this.getWeaponConfig(weaponType);
        const player = game.player;

        // Si el arma requiere energía, verificar disponibilidad
        if (config.energyCost && game.energySystem) {
            if (!game.energySystem.hasEnergy(config.energyCost)) {
                return false; // Falló por falta de energía
            }
            game.energySystem.consumeEnergy(config.energyCost);
        }

        switch (weaponType) {
            case 'mg':
                this.fireMachineGun(game, config);
                break;

            case 'rocket':
                this.fireRocket(game, config);
                break;

            case 'ak47':
                this.fireAK47(game, config);
                break;

            case 'plasma':
                this.fireSpread(game, config);
                break;

            case 'railgun':
                this.fireRailgun(game, config);
                break;

            default:
                this.fireStandard(game, config);
        }

        return true;
    },

    /**
     * Disparo estándar (ION)
     */
    fireStandard(game, config) {
        game.fire(game.player.x, game.player.y, game.player.ang, 
                  config.speed, config.color, config.damage * game.player.damageMultiplier);
    },

    /**
     * Ametralladora: 2 ráfagas de 10 balas
     */
    fireMachineGun(game, config) {
        if (game.ak47BurstActive) return;
        
        game.ak47BurstActive = true;

        // Primera ráfaga
        for (let i = 0; i < config.bulletsPerBurst; i++) {
            setTimeout(() => {
                if (game.state !== 'PLAY') return;
                game.fire(game.player.x, game.player.y, 
                         game.player.ang + (Math.random() - 0.5) * config.spreadPerBullet,
                         config.speed, config.color, 
                         config.damage * game.player.damageMultiplier);
            }, config.burstSpacing * i);
        }

        // Segunda ráfaga (después de la primera)
        const delayBetweenBursts = config.burstSpacing * config.bulletsPerBurst + 50;
        for (let i = 0; i < config.bulletsPerBurst; i++) {
            setTimeout(() => {
                if (game.state !== 'PLAY') return;
                game.fire(game.player.x, game.player.y,
                         game.player.ang + (Math.random() - 0.5) * config.spreadPerBullet,
                         config.speed, config.color,
                         config.damage * game.player.damageMultiplier);
            }, delayBetweenBursts + config.burstSpacing * i);
        }

        // Restableceder flag y aplicar cooldown después de ambas ráfagas
        const totalDuration = delayBetweenBursts + (config.burstSpacing * config.bulletsPerBurst);
        setTimeout(() => {
            game.ak47BurstActive = false;
            game.setReload(config.cooldown);
        }, totalDuration);
    },

    /**
     * Lanzacohetes: Cooldown fijo de 4s, explosión mejorada
     */
    fireRocket(game, config) {
        const player = game.player;
        const count = config.projectilesPerShot;
        const spread = config.spread;

        // Disparar múltiples cohetes en spread
        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
            const angle = player.ang + (t * spread);

            game.fire(player.x, player.y, angle, config.speed, config.color,
                     config.damage * player.damageMultiplier,
                     false, // No homing
                     false, // No precise
                     config.blastRadius); // Area damage
        }

        // Cooldown fijo
        game.setReload(config.cooldown);

        // Efecto visual mejorado
        this.createRocketVisualEffect(game, player);
    },

    /**
     * AK-47: 5 proyectiles alineados
     */
    fireAK47(game, config) {
        const player = game.player;
        const spacing = config.lineSpacing;
        const px = -Math.sin(player.ang);
        const py = Math.cos(player.ang);

        for (let i = -2; i <= 2; i++) {
            const ox = px * spacing * i;
            const oy = py * spacing * i;
            game.fire(player.x + ox, player.y + oy, player.ang, 
                     config.speed, config.color,
                     config.damage * player.damageMultiplier);
        }

        game.setReload(config.cooldown);
    },

    /**
     * Disparo spread (Plasma, Railgun)
     */
    fireSpread(game, config) {
        const player = game.player;
        const count = config.projectilesPerShot;
        const spread = config.spread;

        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
            const angle = player.ang + (t * spread);
            game.fire(player.x, player.y, angle, config.speed, config.color,
                     config.damage * player.damageMultiplier,
                     false, false, 0);
        }

        game.setReload(config.cooldown);
    },

    /**
     * Railgun: Precisión mejorada
     */
    fireRailgun(game, config) {
        const player = game.player;
        const count = config.projectilesPerShot;
        const spread = config.spread;

        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
            const angle = player.ang + (t * spread);
            game.fire(player.x, player.y, angle, config.speed, config.color,
                     config.damage * player.damageMultiplier,
                     false,        // No homing
                     config.isPrecise, // Precise=true
                     0);
        }

        game.setReload(config.cooldown);
    },

    /**
     * Crea efecto visual mejorado para cohetes
     */
    createRocketVisualEffect(game, player) {
        if (game.audioCtx) {
            const osc = game.audioCtx.createOscillator();
            const g = game.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, game.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, game.audioCtx.currentTime + 0.2);
            g.gain.setValueAtTime(0.2, game.audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, game.audioCtx.currentTime + 0.2);
            osc.connect(g);
            g.connect(game.audioCtx.destination);
            osc.start();
            osc.stop(game.audioCtx.currentTime + 0.2);
        }
    },

    /**
     * Obtiene descripción del arma
     */
    getWeaponDescription(weaponType) {
        const config = this.getWeaponConfig(weaponType);
        return {
            name: config.name,
            description: config.description,
            damage: config.damage,
            cooldown: config.cooldown,
            cost: config.energyCost || 0
        };
    },

    /**
     * Obtiene información progresiva del arma por sector
     */
    getProgressiveWeaponUpgrade(weaponType, sector, wave) {
        const config = this.getWeaponConfig(weaponType);
        const baseConfig = JSON.parse(JSON.stringify(config));

        // Mejoras progresivas por ola
        if (sector >= 3 && wave >= 5) {
            baseConfig.damage *= 1.15;
            baseConfig.cooldown *= 0.95;
        }
        if (sector >= 4 && wave >= 7) {
            baseConfig.damage *= 1.25;
            baseConfig.speed *= 1.1;
        }
        if (sector >= 5 && wave >= 8) {
            baseConfig.damage *= 1.35;
            baseConfig.cooldown *= 0.85;
        }

        return baseConfig;
    },

    /**
     * Valida que el arma sea permitida en el sector
     */
    isWeaponAllowed(weaponType, sector) {
        if (!this.weaponConfigs[weaponType]) return false;

        const allowedBySector = {
            1: ['ion'],
            2: ['ion', 'mg', 'rocket', 'ak47'],
            3: ['ion', 'mg', 'rocket', 'ak47', 'plasma'],
            4: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun'],
            5: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun'],
            6: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun']
        };

        return (allowedBySector[sector] || []).includes(weaponType);
    }
};

if (typeof window !== 'undefined') {
    window.EnhancedWeaponsSystem = EnhancedWeaponsSystem;
}
