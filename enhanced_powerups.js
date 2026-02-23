/**
 * ENHANCED POWER-UPS SYSTEM
 * Nuevos power-ups para agregar variedad y progresión
 */

window.EnhancedPowerups = {
    types: {
        // Power-ups existentes (mantener compatibilidad)
        armor: { name: 'Armadura', duration: null, effect: 'armor' },
        drone: { name: 'Dron', duration: null, effect: 'drone' },
        
        // Nuevos power-ups
        overdrive: { name: 'Overdrive', duration: 10000, effect: 'overdrive' },
        repair: { name: 'Reparación Avanzada', duration: null, effect: 'repair' },
        coldEnergy: { name: 'Energía Fría', duration: 5000, effect: 'coldEnergy' },
        comboBoost: { name: 'Multiplicador', duration: 8000, effect: 'comboBoost' }
    },
    
    activePowerups: {},
    
    init() {
        this.activePowerups = {};
    },
    
    /**
     * Activar power-up
     */
    activate(type, game) {
        const powerup = this.types[type];
        
        if (!powerup) {
            console.error(`Power-up desconocido: ${type}`);
            return;
        }
        
        console.log(`✨ Activado: ${powerup.name}`);
        
        // Registrar power-up activo
        if (powerup.duration) {
            this.activePowerups[type] = Date.now() + powerup.duration;
        }
        
        // Aplicar efectos específicos
        switch(type) {
            case 'overdrive':
                this.applyOverdrive(game);
                break;
            case 'repair':
                this.applyRepair(game);
                break;
            case 'coldEnergy':
                this.applyColdEnergy(game);
                break;
            case 'comboBoost':
                this.applyComboBoost(game);
                break;
        }
    },
    
    /**
     * Overdrive: +25% daño, +20% velocidad disparo (10s)
     */
    applyOverdrive(game) {
        game.player.overdrive = true;
        game.player.overdriveSince = Date.now();
        game.player.overdriveDuration = 10000;
    },
    
    isOverdriveActive(game) {
        if (!game.player.overdrive) return false;
        const elapsed = Date.now() - game.player.overdriveSince;
        if (elapsed > game.player.overdriveDuration) {
            game.player.overdrive = false;
            return false;
        }
        return true;
    },
    
    getOverdriveBonus() {
        return {
            damage: 0.25,      // +25% daño
            fireRate: 0.20     // +20% velocidad disparo
        };
    },
    
    /**
     * Reparación Avanzada: +40% vida
     */
    applyRepair(game) {
        const hpHeal = Math.ceil(game.player.maxHp * 0.4);
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + hpHeal);
        console.log(`Vida recuperada: +${hpHeal} (Total: ${game.player.hp})`);
    },
    
    /**
     * Energía Fría: Heat a 0, no genera heat 5s
     */
    applyColdEnergy(game) {
        if (window.OverheatingSystem) {
            window.OverheatingSystem.heat = 0;
            game.coldEnergyUntil = Date.now() + 5000;
            console.log(`⛄ Heat bloqueado por 5 segundos`);
        }
    },
    
    isColdEnergyActive(game) {
        return game.coldEnergyUntil && Date.now() < game.coldEnergyUntil;
    },
    
    /**
     * Multiplicador Instantáneo: Combo x3 (8s)
     */
    applyComboBoost(game) {
        if (window.ComboSystem) {
            game.comboBoostUntil = Date.now() + 8000;
            game.comboBoostActive = true;
            console.log(`🔥 Combo boost activado por 8 segundos`);
        }
    },
    
    isComboBoostActive(game) {
        if (!game.comboBoostActive) return false;
        if (Date.now() >= game.comboBoostUntil) {
            game.comboBoostActive = false;
            return false;
        }
        return true;
    },
    
    /**
     * Obtener multiplicador de combo mejorado
     */
    getComboBoostMultiplier(game) {
        if (this.isComboBoostActive(game)) {
            return 3.0;  // Combo fijo en x3.0
        }
        return 1.0;
    },
    
    /**
     * Actualizar power-ups activos
     */
    update(game) {
        // Verificar overdrive
        this.isOverdriveActive(game);
        
        // Verificar energía fría
        if (this.isColdEnergyActive(game)) {
            // Bloquear generación de heat - manejado en OverheatingSystem
        }
        
        // Verificar combo boost
        this.isComboBoostActive(game);
    },
    
    /**
     * Generar power-up aleatorio (20% probabilidad)
     * No genera si ya hay muchos crates en pantalla
     */
    trySpawnPowerup(x, y, game) {
        if (Math.random() > 0.20) return null;  // 20% probabilidad
        
        // No más de 3 crates en pantalla
        if (game.crates && game.crates.length >= 3) return null;
        
        // Seleccionar power-up aleatorio
        const powerupTypes = ['armor', 'drone', 'overdrive', 'repair', 'coldEnergy', 'comboBoost'];
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        return {
            x: x,
            y: y,
            type: type,
            spawnTime: Date.now(),
            disappearIn: 15000  // Desaparece después de 15s
        };
    },
    
    /**
     * Verificar si crate ha expirado
     */
    isCrateExpired(crate) {
        return Date.now() - crate.spawnTime > crate.disappearIn;
    },
    
    getStatus(game) {
        return {
            overdrive: this.isOverdriveActive(game),
            coldEnergy: this.isColdEnergyActive(game),
            comboBoost: this.isComboBoostActive(game)
        };
    }
};
