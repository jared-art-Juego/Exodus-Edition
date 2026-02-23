/**
 * ENHANCED POWER-UP SYSTEM
 * =======================
 * Mejoras al sistema de cajas power-up:
 * - Desaparecen automáticamente a 15s
 * - Efecto parpadeo en últimos 3s
 * - Nuevo power-up: Reparar nave (30% vida)
 * - Sistema de tracking automático
 */

const EnhancedPowerUpSystem = {
    // Config de power-ups mejorada
    config: {
        crateLifeMs: 15000,  // 15 segundos
        blinkStartMs: 3000,  // Últimos 3 segundos
        blinkIntervalMs: 100, // Parpadeo cada 100ms
        repairAmount: 0.30,  // 30% de vida máxima
        crateSize: 20,
        crateColor: '#f8ff00',
        crateBorderColor: '#ff6600'
    },

    /**
     * Crea una nueva caja power-up con timer automático
     */
    createPowerUp(x, y) {
        const now = Date.now();
        return {
            x: x,
            y: y,
            hp: 2,
            maxHp: 2,
            createdAt: now,
            expiresAt: now + this.config.crateLifeMs,
            isBlinking: false,
            blinkState: true,
            type: 'crate'
        };
    },

    /**
     * Actualiza estado de power-ups (parpadeo y expiración)
     */
    updatePowerUps(powerUps, game) {
        const now = Date.now();
        const toRemove = [];

        powerUps.forEach((crate, index) => {
            const timeLeft = crate.expiresAt - now;

            // Verificar expiración
            if (timeLeft <= 0) {
                toRemove.push(index);
                return;
            }

            // Activar parpadeo en últimos 3 segundos
            if (timeLeft <= this.config.blinkStartMs) {
                crate.isBlinking = true;
                // Parpadeo 50/50 visibility
                crate.blinkState = (now % (this.config.blinkIntervalMs * 2)) < this.config.blinkIntervalMs;
            } else {
                crate.isBlinking = false;
                crate.blinkState = true;
            }
        });

        // Remover cajas expiradas (en reverso para mantener indices)
        toRemove.reverse().forEach(index => {
            powerUps.splice(index, 1);
        });

        return powerUps;
    },

    /**
     * Dibuja power-up con efecto parpadeo
     */
    drawPowerUp(ctx, crate, assets) {
        ctx.save();
        ctx.translate(crate.x, crate.y);

        // Si está parpadeando y blinkState es false, saltar dibujo
        if (crate.isBlinking && !crate.blinkState) {
            ctx.globalAlpha = 0.3; // Semi-transparente mientras parpadea
        }

        // Caja principal
        ctx.fillStyle = this.config.crateColor;
        ctx.fillRect(-this.config.crateSize, -this.config.crateSize, 
                      this.config.crateSize * 2, this.config.crateSize * 2);

        // Borde
        ctx.strokeStyle = this.config.crateBorderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.config.crateSize, -this.config.crateSize,
                        this.config.crateSize * 2, this.config.crateSize * 2);

        // Símbolo "?"
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        // Barra de vida/expiración
        const hpPercent = crate.hp / crate.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.config.crateSize, -this.config.crateSize - 10,
                      this.config.crateSize * 4, 6);
        ctx.fillStyle = hpPercent > 0.5 ? '#00ff66' : '#ff0044';
        ctx.fillRect(-this.config.crateSize, -this.config.crateSize - 10,
                      this.config.crateSize * 4 * hpPercent, 6);

        ctx.restore();
    },

    /**
     * Obtiene poder aleatorio según sector
     */
    getRandomPowerUp(sector) {
        // Todos los sectores pueden tener estos
        const basePowers = ['mg', 'rocket', 'ak47', 'repair'];

        // Sectores avanzados tienen más opciones
        if (sector >= 2) basePowers.push('plasma');
        if (sector >= 3) basePowers.push('railgun');

        return basePowers[Math.floor(Math.random() * basePowers.length)];
    },

    /**
     * Aplica poder-up al jugador
     */
    applyPowerUp(game, powerUpType) {
        const player = game.player;

        switch (powerUpType) {
            case 'mg':
                player.w = 'mg';
                break;

            case 'rocket':
                player.w = 'rocket';
                break;

            case 'ak47':
                player.w = 'ak47';
                break;

            case 'plasma':
                player.w = 'plasma';
                break;

            case 'railgun':
                player.w = 'railgun';
                break;

            case 'repair':
                // Reparar 30% de vida sin exceder máximo
                const healAmount = Math.floor(player.maxHp * this.config.repairAmount);
                player.hp = Math.min(player.hp + healAmount, player.maxHp);
                
                // Crear efectos visuales
                if (game.createExplosion) {
                    game.createExplosion(player.x, player.y, 15, '#00ff66');
                }
                break;

            default:
                break;
        }
    },

    /**
     * Obtiene información del poder-up para UI
     */
    getPowerUpInfo(powerUpType) {
        const info = {
            'mg': {
                name: 'METRALLADORA',
                description: '10 balas x2 ráfagas',
                color: '#00f2ff'
            },
            'rocket': {
                name: 'COHETES',
                description: 'Explosión en área',
                color: '#ff0044'
            },
            'ak47': {
                name: 'AK-47',
                description: '5 proyectiles spread',
                color: '#ff6600'
            },
            'plasma': {
                name: 'PLASMA',
                description: '8 proyectiles amplios',
                color: '#9900ff'
            },
            'railgun': {
                name: 'RAILGUN',
                description: '10 proyectiles energía',
                color: '#f8ff00'
            },
            'repair': {
                name: 'REPARACIÓN',
                description: '+30% vida nave',
                color: '#00ff66'
            }
        };

        return info[powerUpType] || info['mg'];
    },

    /**
     * Maneja colisión jugador-powerup
     */
    checkPowerUpCollision(game, playerX, playerY, playerSize) {
        const collectedIndices = [];

        game.crates.forEach((crate, index) => {
            const dist = Math.hypot(crate.x - playerX, crate.y - playerY);
            if (dist < playerSize + this.config.crateSize + 10) {
                collectedIndices.push(index);
            }
        });

        return collectedIndices;
    },

    /**
     * Obtiene tiempo de expiración restante en segundos
     */
    getTimeRemaining(crate) {
        const now = Date.now();
        const remaining = crate.expiresAt - now;
        return Math.max(0, Math.ceil(remaining / 1000));
    },

    /**
     * Obtiene información de tiempo en formato visual
     */
    getTimeDisplayText(crate) {
        const timeLeft = this.getTimeRemaining(crate);
        if (timeLeft <= 3) {
            return `${timeLeft}s`;
        } else if (timeLeft <= 10) {
            return `${timeLeft}s`;
        }
        return '';
    }
};

if (typeof window !== 'undefined') {
    window.EnhancedPowerUpSystem = EnhancedPowerUpSystem;
}
