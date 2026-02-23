/**
 * ADAPTIVE AI SYSTEM
 * ==================
 * IA que aprende del jugador y se adapta
 * NO funciona en Sector 1
 * 
 * Registra:
 * - Frecuencia de disparo
 * - Tipo de arma usado
 * - Patrón de movimiento
 * 
 * Ajusta spawn:
 * - Más escudos si disparo alto
 * - Más rápidos si usa lanzacohetes
 * - Predicción lateral si movimiento lateral alto
 */

const AdaptiveAISystem = {
    // Estado de aprendizaje
    isEnabled: true,
    sector: 1,
    
    playerStats: {
        shotFrequency: 0,              // Disparos por segundo
        shotFrequencyHistory: [],      // Últimas mediciones
        
        weaponUsage: {                 // Recuento de uso por arma
            'ion': 0,
            'mg': 0,
            'rocket': 0,
            'ak47': 0,
            'plasma': 0,
            'railgun': 0
        },
        preferredWeapon: null,
        
        movement: {
            lastX: 0,
            lastY: 0,
            totalDistance: 0,
            lateralMovement: 0,      // Movimiento horizontal/vertical
            verticalMovement: 0,
            movementVelocity: 0      // Velocidad de movimiento
        },
        
        positioning: {                 // Posición preferida
            avgX: 0,
            avgY: 0,
            staysCenter: false,
            staysEdges: false
        }
    },

    // Configuración de spawning adaptativo
    spawnAdjustments: {
        shieldMultiplier: 1.0,        // Cantidad de escudos
        speedMultiplier: 1.0,         // Velocidad enemigos
        bulletPrediction: 0,          // 0-1, qué tan preciso es enemigo
        evasionTendency: 0,           // probabilidad evasión
        swarmConfiguration: 'standard' // Configuración de enjambres
    },

    // Contadores de sesión
    sessionStats: {
        totalShots: 0,
        sessionStart: Date.now(),
        lastShotTime: Date.now(),
        totalKillsThisSession: 0
    },

    /**
     * Inicializa sistema de IA adaptativa
     */
    initialize(sector) {
        // NO inicializar en sector 1
        if (sector === 1) {
            this.isEnabled = false;
            return;
        }

        this.isEnabled = true;
        this.sector = sector;
        this.resetSession();
    },

    /**
     * Registra disparo del jugador
     */
    recordShot(game, weaponType) {
        if (!this.isEnabled) return;

        const now = Date.now();
        const timeSinceLastShot = now - this.sessionStats.lastShotTime;

        // Calcular frecuencia
        if (timeSinceLastShot > 0) {
            const frequency = 1000 / timeSinceLastShot; // shots per second
            this.playerStats.shotFrequencyHistory.push(frequency);
            if (this.playerStats.shotFrequencyHistory.length > 100) {
                this.playerStats.shotFrequencyHistory.shift();
            }
            this.playerStats.shotFrequency = this.calculateAverage(
                this.playerStats.shotFrequencyHistory
            );
        }

        // Registrar arma usada
        if (this.playerStats.weaponUsage[weaponType] !== undefined) {
            this.playerStats.weaponUsage[weaponType]++;
            this.updatePreferredWeapon();
        }

        this.sessionStats.totalShots++;
        this.sessionStats.lastShotTime = now;
    },

    /**
     * Registra movimiento del jugador
     */
    recordMovement(game, currentX, currentY) {
        if (!this.isEnabled) return;

        const lastX = this.playerStats.movement.lastX;
        const lastY = this.playerStats.movement.lastY;

        const dx = currentX - lastX;
        const dy = currentY - lastY;

        // Actualizar distancia total
        const distance = Math.hypot(dx, dy);
        this.playerStats.movement.totalDistance += distance;

        // Registrar movimiento lateral vs vertical
        if (Math.abs(dx) > Math.abs(dy)) {
            this.playerStats.movement.lateralMovement += Math.abs(dx);
        } else {
            this.playerStats.movement.verticalMovement += Math.abs(dy);
        }

        // Calcular velocidad
        this.playerStats.movement.movementVelocity = distance;

        // Actualizar posición promedio
        this.updateAveragePosition(currentX, currentY);

        this.playerStats.movement.lastX = currentX;
        this.playerStats.movement.lastY = currentY;
    },

    /**
     * Registra muerte/finalización de partida
     */
    recordGameEnd(game) {
        if (!this.isEnabled) return;

        this.calculateAdaptations();
    },

    /**
     * Calcula promedio de array
     */
    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b) / arr.length;
    },

    /**
     * Actualiza arma preferida
     */
    updatePreferredWeapon() {
        let max = 0;
        let preferred = null;

        for (const [weapon, count] of Object.entries(this.playerStats.weaponUsage)) {
            if (count > max) {
                max = count;
                preferred = weapon;
            }
        }

        this.playerStats.preferredWeapon = preferred;
    },

    /**
     * Actualiza posición promedio
     */
    updateAveragePosition(x, y) {
        const totalMeasurements = this.sessionStats.totalShots;
        if (totalMeasurements === 0) {
            this.playerStats.positioning.avgX = x;
            this.playerStats.positioning.avgY = y;
        } else {
            this.playerStats.positioning.avgX = 
                (this.playerStats.positioning.avgX * totalMeasurements + x) / (totalMeasurements + 1);
            this.playerStats.positioning.avgY = 
                (this.playerStats.positioning.avgY * totalMeasurements + y) / (totalMeasurements + 1);
        }
    },

    /**
     * Determina si jugador tiende a estar en centro
     */
    isPlayerCentered(gameWidth, gameHeight) {
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        const dist = Math.hypot(
            this.playerStats.positioning.avgX - centerX,
            this.playerStats.positioning.avgY - centerY
        );
        return dist < Math.min(gameWidth, gameHeight) * 0.2;
    },

    /**
     * Determina si jugador tiende a estar en bordes
     */
    isPlayerEdgeFocused(gameWidth, gameHeight) {
        const avgX = this.playerStats.positioning.avgX;
        const avgY = this.playerStats.positioning.avgY;
        const margin = Math.min(gameWidth, gameHeight) * 0.25;

        const nearHorizontalEdge = avgX < margin || avgX > gameWidth - margin;
        const nearVerticalEdge = avgY < margin || avgY > gameHeight - margin;

        return nearHorizontalEdge || nearVerticalEdge;
    },

    /**
     * Calcula adaptaciones basadas en patrón del jugador
     */
    calculateAdaptations() {
        // Resetear multiplicadores
        this.spawnAdjustments.shieldMultiplier = 1.0;
        this.spawnAdjustments.speedMultiplier = 1.0;
        this.spawnAdjustments.bulletPrediction = 0;
        this.spawnAdjustments.evasionTendency = 0;

        // 1. FRECUENCIA DE DISPARO
        // Si dispara muy rápido (>5 shots/s), agregar más escudos
        if (this.playerStats.shotFrequency > 5) {
            this.spawnAdjustments.shieldMultiplier = 1.5;
        } else if (this.playerStats.shotFrequency > 3) {
            this.spawnAdjustments.shieldMultiplier = 1.2;
        }

        // 2. ARMA PREFERIDA
        if (this.playerStats.preferredWeapon === 'rocket') {
            // Si usa cohetes, enemigos más rápidos para esquivar
            this.spawnAdjustments.speedMultiplier = 1.3;
            this.spawnAdjustments.evasionTendency = 0.4;
        } else if (this.playerStats.preferredWeapon === 'railgun') {
            // Si usa railgun, enemigos con predicción
            this.spawnAdjustments.bulletPrediction = 0.6;
        } else if (this.playerStats.preferredWeapon === 'mg') {
            // Si usa metralladora, más enemigos pequeños y rápidos
            this.spawnAdjustments.speedMultiplier = 1.2;
        }

        // 3. PATRÓN DE MOVIMIENTO
        const lateralRatio = this.playerStats.movement.lateralMovement / 
                            (this.playerStats.movement.totalDistance || 1);

        if (lateralRatio > 0.6) {
            // Se mueve mucho lateralmente
            this.spawnAdjustments.bulletPrediction = 0.5;
        }

        if (this.playerStats.movement.movementVelocity > 5) {
            // Se mueve rápido
            this.spawnAdjustments.speedMultiplier *= 0.9;
        }
    },

    /**
     * Obtiene ajuste de spawn para enemigos
     */
    getSpawnAdjustment(adjustmentType) {
        return this.spawnAdjustments[adjustmentType] || 1.0;
    },

    /**
     * Obtiene multiplicador de escudos adaptativo
     */
    getShieldMultiplier() {
        return this.spawnAdjustments.shieldMultiplier;
    },

    /**
     * Obtiene multiplicador de velocidad adaptativo
     */
    getSpeedMultiplier() {
        return this.spawnAdjustments.speedMultiplier;
    },

    /**
     * Obtiene tendencia de predicción de balas (0-1)
     */
    getBulletPrediction() {
        return this.spawnAdjustments.bulletPrediction;
    },

    /**
     * Obtiene tendencia de evasión (0-1)
     */
    getEvasionTendency() {
        return this.spawnAdjustments.evasionTendency;
    },

    /**
     * Reinicia sesión
     */
    resetSession() {
        this.playerStats.shotFrequency = 0;
        this.playerStats.shotFrequencyHistory = [];
        this.playerStats.weaponUsage = {
            'ion': 0, 'mg': 0, 'rocket': 0, 
            'ak47': 0, 'plasma': 0, 'railgun': 0
        };
        this.playerStats.preferredWeapon = null;
        
        this.playerStats.movement = {
            lastX: 0, lastY: 0, totalDistance: 0,
            lateralMovement: 0, verticalMovement: 0,
            movementVelocity: 0
        };
        
        this.playerStats.positioning = {
            avgX: 0, avgY: 0,
            staysCenter: false, staysEdges: false
        };

        this.sessionStats = {
            totalShots: 0,
            sessionStart: Date.now(),
            lastShotTime: Date.now(),
            totalKillsThisSession: 0
        };
    },

    /**
     * Obtiene informe de IA para debugging
     */
    getDebugReport() {
        return {
            isEnabled: this.isEnabled,
            sector: this.sector,
            shotFrequency: this.playerStats.shotFrequency.toFixed(2),
            preferredWeapon: this.playerStats.preferredWeapon,
            totalShots: this.sessionStats.totalShots,
            totalDistance: this.playerStats.movement.totalDistance.toFixed(0),
            
            adaptations: {
                shieldMultiplier: this.spawnAdjustments.shieldMultiplier.toFixed(2),
                speedMultiplier: this.spawnAdjustments.speedMultiplier.toFixed(2),
                bulletPrediction: this.spawnAdjustments.bulletPrediction.toFixed(2),
                evasionTendency: this.spawnAdjustments.evasionTendency.toFixed(2)
            }
        };
    }
};

if (typeof window !== 'undefined') {
    window.AdaptiveAISystem = AdaptiveAISystem;
}
