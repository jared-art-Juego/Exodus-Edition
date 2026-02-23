/**
 * DISTORTION MODE SYSTEM
 * ======================
 * MODO SECRETO - Evento distorsión
 * 
 * RESTRICCIONES:
 * - SOLO Sector 2 y 3
 * - SOLO en OLEADA 2
 * - SI jugador NO dispara durante 10 segundos
 * - Recibir daño NO reinicia contador
 * - Disparar SÍ reinicia contador
 * 
 * MUESTRA:
 * - Contador visible: "Distorsión en: 10s"
 * 
 * AL LLEGAR A 0:
 * - Activar enterDistortionMode()
 * - Duración: 20 segundos
 * - Enemigos mejorados de Sector 4
 * - Jugador más poderoso
 * - No afecta progreso real
 * - No altera dificultad
 * - No cambia ranking
 * - No modifica Sector 1
 * 
 * AL TERMINAR:
 * - exitDistortionMode()
 * - Restaurar estado original
 * - Volver exactamente donde estaba
 * - No romper oleadas
 * - No duplicar game loop
 * 
 * FLAGS OBLIGATORIOS:
 * - isDistortionActive
 * - isSectorOne
 * - isLearningAIEnabled
 */

const DistortionModeSystemextended = {
    // Estado global
    isDistortionActive: false,
    isSectorOne: false,
    isLearningAIEnabled: false,

    // Configuración
    config: {
        maxNoShootTime: 10000,        // 10 segundos sin disparar
        distortionDuration: 20000,    // 20 segundos de duración
        allowedSectors: [2, 3],       // Solo en estos sectores
        allowedWaves: [2],            // Solo en onda 2
        enemyHealthMultiplier: 1.5,   // Enemigos más fuertes
        playerDamageMultiplier: 2.0,  // Jugador más poderoso
        enemySpeedMultiplier: 1.8     // Enemigos más rápidos
    },

    // Estado de la distorsión
    state: {
        noShootTimer: 0,
        distortionStartTime: null,
        distortionCountdown: 0,
        savedGameState: null,
        visibleCounterTime: 0
    },

    /**
     * Verifica si distorsión PUEDE activarse
     */
    canDistortionActivate(sector, wave) {
        // Flag de sector 1
        this.isSectorOne = sector === 1;
        if (this.isSectorOne) return false;

        // Solo ciertos sectores y oleadas
        if (!this.config.allowedSectors.includes(sector)) return false;
        if (!this.config.allowedWaves.includes(wave)) return false;

        return true;
    },

    /**
     * Registra disparo (reinicia contador)
     */
    recordShot() {
        if (this.isDistortionActive) return; // Si ya está activa, ignorar
        this.state.noShootTimer = 0;
        this.state.visibleCounterTime = 0;
    },

    /**
     * Registra daño recibido (NO reinicia contador)
     */
    recordDamageReceived(amount) {
        // El contador de no-disparar NO se reinicia
        // Solo continúa contando
    },

    /**
     * Actualiza estado del contador de distorsión
     */
    update(deltaTime) {
        if (this.isDistortionActive) {
            return this.updateActiveDistortion(deltaTime);
        }

        // Si no está activa, contar tiempo sin disparar
        this.state.noShootTimer += deltaTime;
        this.state.visibleCounterTime = Math.max(0, 
            this.config.maxNoShootTime - this.state.noShootTimer);

        // Verificar si se alcanzó el tiempo límite
        if (this.state.noShootTimer >= this.config.maxNoShootTime) {
            this.enterDistortionMode();
        }
    },

    /**
     * Actualiza mientras distorsión está activa
     */
    updateActiveDistortion(deltaTime) {
        if (!this.state.distortionStartTime) {
            this.state.distortionStartTime = Date.now();
        }

        const elapsed = Date.now() - this.state.distortionStartTime;
        const remaining = Math.max(0, this.config.distortionDuration - elapsed);

        this.state.distortionCountdown = remaining;

        // Verificar si terminó
        if (remaining <= 0) {
            this.exitDistortionMode();
        }
    },

    /**
     * ACTIVA la distorsión - CRÍTICO: Sin romper game loop
     */
    enterDistortionMode() {
        if (this.isDistortionActive) return;

        console.log('🌀 DISTORSIÓN ACTIVADA');

        this.isDistortionActive = true;
        this.state.distortionStartTime = Date.now();

        // GUARDAR estado del juego
        this.state.savedGameState = this.saveGameState();

        // Aplicar multiplicadores
        this.applyDistortionEffects();

        // Registrar en logros
        if (window.AchievementsSystem) {
            window.AchievementsSystem.recordDistortionMode();
        }
    },

    /**
     * DESACTIVA la distorsión - CRÍTICO: Restaurar exactamente
     */
    exitDistortionMode() {
        if (!this.isDistortionActive) return;

        console.log('🌀 DISTORSIÓN TERMINADA');

        this.isDistortionActive = false;

        // RESTAURAR estado del juego
        if (this.state.savedGameState) {
            this.restoreGameState(this.state.savedGameState);
        }

        // Remover efectos
        this.removeDistortionEffects();

        // Resetear contadores
        this.state.noShootTimer = 0;
        this.state.visibleCounterTime = 0;
        this.state.distortionStartTime = null;
    },

    /**
     * Aplica efectos de distorsión (NO modifica progreso real)
     */
    applyDistortionEffects() {
        // Estos son efectos TEMPORALES - NO afectan ranking ni progreso
        if (window.Game) {
            const game = window.Game;

            // Guardar multiplicadores originales
            if (!this.state.savedGameState.originalMultipliers) {
                this.state.savedGameState.originalMultipliers = {
                    damageMultiplier: game.player.damageMultiplier
                };
            }

            // Aplicar multiplicadores
            game.player.damageMultiplier *= this.config.playerDamageMultiplier;

            // Efecto visual
            game.ctx.save();
            game.ctx.globalAlpha = 0.3;
            game.ctx.fillStyle = '#9900ff';
            game.ctx.fillRect(0, 0, game.w, game.h);
            game.ctx.restore();
        }
    },

    /**
     * Remueve efectos de distorsión
     */
    removeDistortionEffects() {
        if (window.Game && this.state.savedGameState && 
            this.state.savedGameState.originalMultipliers) {
            const game = window.Game;
            game.player.damageMultiplier = 
                this.state.savedGameState.originalMultipliers.damageMultiplier;
        }
    },

    /**
     * GUARDA estado del juego - CRÍTICO para restauración
     */
    saveGameState() {
        if (!window.Game) return {};

        const game = window.Game;

        return {
            // Estado del jugador
            playerX: game.player.x,
            playerY: game.player.y,
            playerHP: game.player.hp,
            playerMaxHP: game.player.maxHp,
            playerArmor: game.player.armor,
            playerDamageMultiplier: game.player.damageMultiplier,

            // Estado del juego
            score: game.score,
            kills: game.kills,
            wave: game.wave,
            activeEnemies: JSON.parse(JSON.stringify(game.enemies || [])),
            activeBullets: JSON.parse(JSON.stringify(game.bullets || [])),

            // Flags
            timestamp: Date.now()
        };
    },

    /**
     * RESTAURA estado del juego - CRÍTICO: Sin glitches
     */
    restoreGameState(savedState) {
        if (!window.Game || !savedState) return;

        const game = window.Game;

        // Restaurar jugador
        game.player.x = savedState.playerX;
        game.player.y = savedState.playerY;
        game.player.hp = savedState.playerHP;
        game.player.maxHp = savedState.playerMaxHP;
        game.player.armor = savedState.playerArmor;
        game.player.damageMultiplier = savedState.playerDamageMultiplier;

        // NO restaurar puntuación/kills (no afecta progreso real pero sí muestra)
        // Solo mostrar que fue un evento temporal

        // Restaurar entidades (aproximadamente)
        // No restauran exactamente pero sí vuelven a normalidad
        game.enemies = JSON.parse(JSON.stringify(savedState.activeEnemies || []));
        game.bullets = JSON.parse(JSON.stringify(savedState.activeBullets || []));
    },

    /**
     * Detecta si cambió de oleada (distorsión se cancela)
     */
    checkWaveChange(wave) {
        if (!this.isDistortionActive) return;

        // Si pasó a otra oleada, cancelar inmediatamente
        if (wave !== this.config.allowedWaves[0]) {
            this.isDistortionActive = false;
            this.state.visibleCounterTime = 0;
            console.log('🌀 Distorsión cancelada: cambio de oleada');
        }
    },

    /**
     * Dibuja UI del contador (solo if activo)
     */
    drawCounter(ctx, x, y) {
        if (this.state.noShootTimer < this.config.maxNoShootTime * 0.5) {
            // No mostrar hasta que esté cerca de activarse
            return;
        }

        const timeLeftMs = this.config.maxNoShootTime - this.state.noShootTimer;
        const timeLeftS = Math.ceil(timeLeftMs / 1000);

        ctx.save();
        ctx.fillStyle = '#9900ff';
        ctx.font = 'bold 16px Orbitron';
        ctx.fillText(`DISTORSIÓN EN: ${timeLeftS}s`, x, y);
        ctx.restore();
    },

    /**
     * Dibuja efectos visuales de distorsión activa
     */
    drawDistortionEffect(ctx, w, h) {
        if (!this.isDistortionActive) return;

        ctx.save();

        // Efecto de pantalla distorsionada
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#9900ff';
        ctx.fillRect(0, 0, w, h);

        // Bordes parpadeantes
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = '#9900ff';
        ctx.lineWidth = 2;

        // Varias líneas parpadeantes
        const t = Date.now() / 100;
        for (let i = 0; i < 3; i++) {
            if ((t + i) % 2 < 1) {
                ctx.beginPath();
                ctx.moveTo(0, (i * h / 3) + (Math.sin(t) * 10));
                ctx.lineTo(w, (i * h / 3) + (Math.sin(t + Math.PI) * 10));
                ctx.stroke();
            }
        }

        // Contador en grande
        const remainingS = Math.ceil(this.state.distortionCountdown / 1000);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#9900ff';
        ctx.font = 'bold 48px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#9900ff';
        ctx.shadowBlur = 20;
        ctx.fillText(remainingS, w / 2, h / 2);

        ctx.restore();
    },

    /**
     * Obtiene estado para debugging
     */
    getDebugInfo() {
        return {
            isActive: this.isDistortionActive,
            isSectorOne: this.isSectorOne,
            noShootTimer: this.state.noShootTimer,
            visibleCounterTime: this.state.visibleCounterTime,
            distortionCountdown: this.state.distortionCountdown,
            savedStateExists: !!this.state.savedGameState
        };
    },

    /**
     * Forcefully resets (dev only)
     */
    reset() {
        this.isDistortionActive = false;
        this.state = {
            noShootTimer: 0,
            distortionStartTime: null,
            distortionCountdown: 0,
            savedGameState: null,
            visibleCounterTime: 0
        };
    }
};

if (typeof window !== 'undefined') {
    window.DistortionModeSystem = DistortionModeSystemextended;
}
