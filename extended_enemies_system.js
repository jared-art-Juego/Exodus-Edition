/**
 * EXTENDED ENEMIES AND BOSS SYSTEM
 * ================================
 * Nuevos tipos de enemigos por sector
 * Jefes únicos con 2+ fases y patrones distintos
 * 
 * Sector 2: Escudos regenerativos
 * Sector 3: Ataques eléctricos en cadena
 * Sector 4: Alteración gravitacional de balas
 * Sector 5: Invocadores
 * Sector 6: IA grupal coordinada
 */

const ExtendedEnemiesSystem = {
    // DEFINICIONES DE ENEMIGOS
    enemyTypes: {
        shielded_regenerative: {
            name: 'ESCUDO REGENERATIVO',
            sector: 2,
            health: 120,
            speed: 1.2,
            size: 16,
            shield: 50,
            shieldRegenRate: 5,
            shieldRegenDelay: 2000,
            color: '#0f94f2',
            attackType: 'none',
            description: 'Regenera escudo si no recibe daño'
        },

        chain_electric: {
            name: 'CONDUCTOR ELÉCTRICO',
            sector: 3,
            health: 100,
            speed: 1.8,
            size: 14,
            color: '#ffff00',
            attackType: 'chain',
            chainRange: 150,
            chainDamage: 12,
            chainTargets: 3,
            description: 'Ataca en cadena a enemigos cercanos'
        },

        gravity_distorter: {
            name: 'DISTORSIONADOR',
            sector: 4,
            health: 140,
            speed: 1.5,
            size: 18,
            color: '#9900ff',
            attackType: 'gravity',
            gravityRadius: 200,
            gravityPullStrength: 0.3,
            description: 'Altera trayectoria de balas'
        },

        invoker: {
            name: 'INVOCADOR',
            sector: 5,
            health: 160,
            speed: 0.8,
            size: 20,
            color: '#ff00ff',
            attackType: 'summon',
            summonRate: 5000,
            summonCount: 2,
            summonType: 'kamikaze',
            description: 'Invoca refuerzos'
        },

        coordinated_swarm: {
            name: 'ENJAMBRE COORDINADO',
            sector: 6,
            health: 80,
            speed: 2.5,
            size: 12,
            color: '#ff0066',
            attackType: 'swarm',
            swarmBehavior: 'formation',
            formationLeader: null,
            description: 'Se mueve en formaciones coordinadas'
        }
    },

    /**
     * Crea instancia de enemigo mejorado
     */
    createEnemy(enemyType, x, y, healthMultiplier = 1) {
        const def = this.enemyTypes[enemyType];
        if (!def) return null;

        const enemy = {
            x, y,
            type: enemyType,
            hp: def.health * healthMultiplier,
            maxHp: def.health * healthMultiplier,
            speed: def.speed,
            size: def.size,
            color: def.color,
            createdAt: Date.now(),
            
            // Shield system
            shield: def.shield ? def.shield * healthMultiplier : 0,
            maxShield: def.shield ? def.shield * healthMultiplier : 0,
            shieldRegenRate: def.shieldRegenRate || 0,
            lastDamageTakenTime: Date.now(),
            
            // Attack system
            attackType: def.attackType,
            lastAttackTime: Date.now(),
            attackCooldown: def.attackType === 'chain' ? 3000 : 2000,
            
            // Específico por tipo
            chainRange: def.chainRange,
            chainDamage: def.chainDamage,
            gravityRadius: def.gravityRadius,
            summonRate: def.summonRate,
            lastSummonTime: Date.now()
        };

        return enemy;
    },

    /**
     * Actualiza comportamiento de enemigo mejorado
     */
    updateEnemy(enemy, game) {
        // Regenerar escudo si hay
        if (enemy.shield < enemy.maxShield) {
            const timeSinceDamage = Date.now() - enemy.lastDamageTakenTime;
            if (timeSinceDamage > enemy.shieldRegenDelay) {
                enemy.shield = Math.min(enemy.maxShield, 
                    enemy.shield + enemy.shieldRegenRate);
            }
        }

        // Ataque según tipo
        switch (enemy.type) {
            case 'chain_electric':
                this.updateChainElectric(enemy, game);
                break;
            case 'gravity_distorter':
                this.updateGravityDistorter(enemy, game);
                break;
            case 'invoker':
                this.updateInvoker(enemy, game);
                break;
            case 'coordinated_swarm':
                this.updateCoordinatedSwarm(enemy, game);
                break;
        }
    },

    /**
     * Enemigo con ataque en cadena eléctrica
     */
    updateChainElectric(enemy, game) {
        const now = Date.now();
        if (now - enemy.lastAttackTime < enemy.attackCooldown) return;

        // Encontrar enemigos cercanos
        const nearby = game.enemies.filter(e => 
            e !== enemy && 
            Math.hypot(e.x - enemy.x, e.y - enemy.y) < enemy.chainRange
        ).slice(0, enemy.chainTargets);

        // Dibujar cadenas y aplicar daño
        nearby.forEach(target => {
            game.ctx.save();
            game.ctx.strokeStyle = '#ffff00';
            game.ctx.lineWidth = 2;
            game.ctx.globalAlpha = 0.6;
            game.ctx.beginPath();
            game.ctx.moveTo(enemy.x, enemy.y);
            game.ctx.lineTo(target.x, target.y);
            game.ctx.stroke();
            game.ctx.restore();

            target.hp -= enemy.chainDamage * 0.5;
        });

        enemy.lastAttackTime = now;
    },

    /**
     * Enemigo que distorsiona la gravedad
     */
    updateGravityDistorter(enemy, game) {
        // Afectar trayectoria de balas
        game.bullets.forEach(bullet => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < enemy.gravityRadius) {
                const angle = Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x);
                bullet.vx += Math.cos(angle) * enemy.gravityPullStrength;
                bullet.vy += Math.sin(angle) * enemy.gravityPullStrength;
            }
        });

        // Visualización
        game.ctx.save();
        game.ctx.strokeStyle = 'rgba(153, 0, 255, 0.2)';
        game.ctx.lineWidth = 1;
        game.ctx.beginPath();
        game.ctx.arc(enemy.x, enemy.y, enemy.gravityRadius, 0, Math.PI * 2);
        game.ctx.stroke();
        game.ctx.restore();
    },

    /**
     * Enemigo que invoca refuerzos
     */
    updateInvoker(enemy, game) {
        const now = Date.now();
        if (now - enemy.lastSummonTime < enemy.summonRate) return;

        if (game.enemies.length < game.MAX_ENEMIGOS) {
            for (let i = 0; i < enemy.summonCount; i++) {
                const angle = (Math.PI * 2 / enemy.summonCount) * i;
                const x = enemy.x + Math.cos(angle) * 80;
                const y = enemy.y + Math.sin(angle) * 80;

                const summoned = this.createEnemy(enemy.summonType, x, y);
                if (summoned) {
                    summoned.summoned = true;
                    summoned.summonedBy = enemy;
                    game.enemies.push(summoned);
                    game.playKamikazeSound();
                }
            }
        }

        enemy.lastSummonTime = now;
    },

    /**
     * Enjambre coordinado
     */
    updateCoordinatedSwarm(enemy, game) {
        const swarmmates = game.enemies.filter(e => 
            e.type === 'coordinated_swarm' && e !== enemy
        );

        if (swarmmates.length > 0) {
            // Mantener formación con líderes cercanos
            const leader = swarmmates[0];
            const dist = Math.hypot(enemy.x - leader.x, enemy.y - leader.y);
            
            if (dist > 100) {
                // Moverse hacia formación
                const angle = Math.atan2(leader.y - enemy.y, leader.x - enemy.x);
                enemy.vx = Math.cos(angle) * enemy.speed;
                enemy.vy = Math.sin(angle) * enemy.speed;
            }
        }
    },

    /**
     * Aplica daño a enemigo con sistema de escudo
     */
    damage(enemy, amount) {
        if (enemy.shield > 0) {
            const shieldDamage = Math.min(amount, enemy.shield);
            enemy.shield -= shieldDamage;
            enemy.lastDamageTakenTime = Date.now();
            return amount - shieldDamage; // Daño residual
        } else {
            enemy.hp -= amount;
            enemy.lastDamageTakenTime = Date.now();
            return 0;
        }
    },

    /**
     * Dibuja enemigo mejorado
     */
    drawEnemy(ctx, enemy, assets) {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Dibujar enemigo base
        if (assets.enemy_boss && enemy.size > 15) {
            ctx.drawImage(assets.enemy_boss, -enemy.size, -enemy.size, 
                         enemy.size * 2, enemy.size * 2);
        } else {
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Escudo visual
        if (enemy.shield > 0) {
            const shieldPercent = enemy.shield / enemy.maxShield;
            ctx.strokeStyle = `rgba(0, 150, 255, ${shieldPercent})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.size + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Barra de vida
        if (enemy.hp < enemy.maxHp) {
            const hpPercent = enemy.hp / enemy.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-enemy.size - 2, -enemy.size - 12, 
                        (enemy.size + 2) * 2, 4);
            ctx.fillStyle = hpPercent > 0.5 ? '#00ff66' : '#ff0044';
            ctx.fillRect(-enemy.size - 2, -enemy.size - 12,
                        ((enemy.size + 2) * 2) * hpPercent, 4);
        }

        ctx.restore();
    }
};

// UNIQUE BOSSES POR SECTOR
const UniqueBossSystem = {
    bosses: {
        sector3: {
            name: 'ELECTRO-SOVEREIGN',
            phase1: { health: 800, attacks: ['chain', 'laser'] },
            phase2: { health: 600, attacks: ['chain', 'laser', 'spawn'] },
            phase3: { health: 400, attacks: ['chain', 'laser', 'spawn', 'emp'] }
        },
        sector4: {
            name: 'GRAVITON OVERLORD',
            phase1: { health: 1000, attacks: ['gravity', 'laser'] },
            phase2: { health: 800, attacks: ['gravity', 'laser', 'warp'] },
            phase3: { health: 600, attacks: ['gravity', 'laser', 'warp', 'black_hole'] }
        },
        sector5: {
            name: 'THE INVOKER NEXUS',
            phase1: { health: 1200, attacks: ['summon', 'laser'] },
            phase2: { health: 1000, attacks: ['summon', 'laser', 'burst'] },
            phase3: { health: 800, attacks: ['summon', 'laser', 'burst', 'cascade'] }
        },
        sector6: {
            name: 'COORDINATED SENTINEL',
            phase1: { health: 1400, attacks: ['formation', 'laser'] },
            phase2: { health: 1200, attacks: ['formation', 'laser', 'swarm'] },
            phase3: { health: 1000, attacks: ['formation', 'laser', 'swarm', 'hivemind'] }
        }
    },

    /**
     * Obtiene configuración de jefe único
     */
    getBossConfig(sector) {
        return this.bosses[`sector${sector}`] || null;
    },

    /**
     * Crea instancia de jefe únido
     */
    createBoss(sector, x, y, difficultyMultiplier = 1) {
        const config = this.getBossConfig(sector);
        if (!config) return null;

        return {
            x: x,
            y: y,
            sector: sector,
            name: config.name,
            phase: 1,
            hp: config.phase1.health * difficultyMultiplier,
            maxHp: config.phase1.health * difficultyMultiplier,
            size: 60,
            color: '#ff0044',
            targetY: 150,
            config: config,
            lastAttackTime: Date.now(),
            attackCooldown: 2000,
            spawnedEnemies: []
        };
    }
};

if (typeof window !== 'undefined') {
    window.ExtendedEnemiesSystem = ExtendedEnemiesSystem;
    window.UniqueBossSystem = UniqueBossSystem;
}
