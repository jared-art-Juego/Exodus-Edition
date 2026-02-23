/**
 * NEW GAME MECHANICS SYSTEM
 * =========================
 * Sistemas nuevos que NO son solo disparar:
 * 1. Energy System - Armas especiales consumen energía
 * 2. Dynamic Objectives - Defender punto, sobrevivir tiempo, destruir objetivo
 * 3. Mini Challenges - Desafíos temporales
 * 4. Risk/Reward System - Recompensas basadas en riesgo
 */

const GameMechanicsSystem = {
    // ENERGY SYSTEM
    energy: {
        current: 100,
        max: 100,
        regenerationRate: 2,  // por frame
        regenerationDelay: 500, // ms sin usar energía
        lastUsedTime: 0,

        reset() {
            this.current = this.max;
            this.lastUsedTime = 0;
        },

        consume(amount) {
            this.current = Math.max(0, this.current - amount);
            this.lastUsedTime = Date.now();
            return this.current;
        },

        regenerate(deltaTime) {
            const now = Date.now();
            const timeSinceUsed = now - this.lastUsedTime;

            if (timeSinceUsed > this.regenerationDelay) {
                this.current = Math.min(this.max, this.current + this.regenerationRate);
            }
        },

        hasEnergy(amount) {
            return this.current >= amount;
        },

        getPercent() {
            return (this.current / this.max) * 100;
        }
    },

    // DYNAMIC OBJECTIVES
    objectives: {
        active: null,
        completed: [],
        timer: 0,

        types: {
            defend_point: {
                name: 'DEFENDER PUNTO',
                description: 'Mantén tu nave en el punto azul por 30s',
                duration: 30000,
                point: { x: 0, y: 0 },
                radius: 80,
                reward: 500,
                difficulty: 1.0
            },

            survive_time: {
                name: 'SOBREVIVIR',
                description: 'Sobrevive 45 segundos sin recibir daño',
                duration: 45000,
                reward: 750,
                difficulty: 1.5,
                canTakeDamage: false
            },

            destroy_target: {
                name: 'DESTRUIR OBJETIVO',
                description: 'Destruye el enemigo especial',
                targetType: 'special',
                reward: 1000,
                difficulty: 2.0,
                targetHealth: 200
            },

            multi_kill: {
                name: 'MULTI-KILL',
                description: 'Mata 5 enemigos en 10 segundos',
                duration: 10000,
                targetKills: 5,
                reward: 600,
                difficulty: 1.2
            }
        },

        start(objectiveType) {
            if (!this.types[objectiveType]) return;

            this.active = {
                type: objectiveType,
                ...this.types[objectiveType],
                startedAt: Date.now(),
                expiresAt: Date.now() + this.types[objectiveType].duration,
                progress: 0,
                completed: false,
                kills: 0,
                timeInZone: 0
            };

            return this.active;
        },

        update(game) {
            if (!this.active) return null;

            const now = Date.now();
            const timeLeft = this.active.expiresAt - now;

            if (timeLeft <= 0) {
                // Falló el objetivo
                const failed = this.active;
                this.active = null;
                return { failed, reward: 0 };
            }

            // Actualizar según tipo
            switch (this.active.type) {
                case 'defend_point':
                    this.updateDefendPoint(game);
                    break;
                case 'survive_time':
                    this.updateSurviveTime(game);
                    break;
                case 'multi_kill':
                    this.updateMultiKill(game);
                    break;
                case 'destroy_target':
                    this.updateDestroyTarget(game);
                    break;
            }

            return this.active;
        },

        updateDefendPoint(game) {
            const dist = Math.hypot(
                game.player.x - this.active.point.x,
                game.player.y - this.active.point.y
            );

            if (dist < this.active.radius) {
                this.active.timeInZone += 16;
                this.active.progress = Math.min(100, (this.active.timeInZone / this.active.duration) * 100);

                if (this.active.timeInZone >= this.active.duration) {
                    this.active.completed = true;
                    return this.active.reward;
                }
            } else {
                this.active.timeInZone = 0;
            }
        },

        updateSurviveTime(game) {
            const now = Date.now();
            const elapsed = now - this.active.startedAt;
            this.active.progress = (elapsed / this.active.duration) * 100;

            if (elapsed >= this.active.duration) {
                this.active.completed = true;
                return this.active.reward;
            }
        },

        updateMultiKill(game) {
            const now = Date.now();
            const elapsed = now - this.active.startedAt;

            if (elapsed >= this.active.duration) {
                this.active.completed = false;
                return 0;
            }

            this.active.progress = (this.active.kills / this.active.targetKills) * 100;

            if (this.active.kills >= this.active.targetKills) {
                this.active.completed = true;
                return this.active.reward;
            }
        },

        updateDestroyTarget(game) {
            if (this.active.targetKilled) {
                this.active.completed = true;
                return this.active.reward;
            }
            this.active.progress = ((1 - this.active.targetHealth / this.types.destroy_target.targetHealth) * 100);
        },

        getProgress() {
            return this.active ? this.active.progress : 0;
        },

        complete(reward) {
            if (this.active) {
                this.completed.push({
                    type: this.active.type,
                    reward,
                    completedAt: Date.now()
                });
            }
        },

        reset() {
            this.active = null;
            this.completed = [];
            this.timer = 0;
        }
    },

    // MINI CHALLENGES
    miniChallenges: {
        active: [],
        pool: [
            {
                id: 'no_shoot_10s',
                name: 'Silencio',
                description: 'No dispares durante 10 segundos',
                duration: 10000,
                condition: () => false, // Actualizado en update
                reward: 200,
                failureReward: 0
            },
            {
                id: 'take_no_damage_20s',
                name: 'Invulnerable',
                description: 'No recibas daño durante 20 segundos',
                duration: 20000,
                condition: () => false,
                reward: 300,
                failureReward: 50
            },
            {
                id: 'get_5_kills_15s',
                name: 'Carnicería',
                description: 'Mata 5 enemigos en 15 segundos',
                duration: 15000,
                targetKills: 5,
                reward: 250,
                failureReward: 0
            },
            {
                id: 'destroy_all_enemies',
                name: 'Limpieza Total',
                description: 'Destruye todos los enemigos actuales',
                duration: 60000,
                reward: 400,
                failureReward: 0
            }
        ],

        start(challengeId) {
            const template = this.pool.find(c => c.id === challengeId);
            if (!template) return;

            const challenge = {
                ...template,
                startedAt: Date.now(),
                expiresAt: Date.now() + template.duration,
                progress: 0,
                completed: false,
                kills: 0,
                damageTaken: 0
            };

            this.active.push(challenge);
            return challenge;
        },

        update(game) {
            const now = Date.now();

            this.active = this.active.filter(challenge => {
                const timeLeft = challenge.expiresAt - now;

                if (timeLeft <= 0) {
                    // Challenge expiró
                    return false;
                }

                // Actualizar progreso según tipo
                switch (challenge.id) {
                    case 'no_shoot_10s':
                        // Tracked en shoot()
                        break;
                    case 'take_no_damage_20s':
                        // Tracked en damagePlayer()
                        break;
                    case 'get_5_kills_15s':
                        challenge.progress = (challenge.kills / challenge.targetKills) * 100;
                        if (challenge.kills >= challenge.targetKills) {
                            challenge.completed = true;
                        }
                        break;
                }

                return true;
            });
        },

        recordKill() {
            this.active.forEach(ch => {
                ch.kills++;
            });
        },

        recordDamage(amount) {
            this.active.forEach(ch => {
                ch.damageTaken += amount;
                if (ch.id === 'take_no_damage_20s' && ch.damageTaken > 0) {
                    ch.completed = false; // Falló
                }
            });
        },

        recordShot() {
            this.active.forEach(ch => {
                if (ch.id === 'no_shoot_10s') {
                    ch.completed = false; // Falló
                }
            });
        },

        reset() {
            this.active = [];
        }
    },

    // RISK/REWARD SYSTEM
    riskReward: {
        active: [],

        createWave(sector, wave, baseReward) {
            const risk = 0.5 + (sector * 0.1) + (wave * 0.05);
            const multiplier = 1 + (risk * 0.5);

            return {
                baseReward,
                risk: Math.min(1, risk),
                multiplier,
                totalReward: Math.floor(baseReward * multiplier),
                bonuses: {
                    noHit: baseReward * 0.5,
                    speedKill: baseReward * 0.3,
                    perfectWave: baseReward * 1.0
                }
            };
        },

        calculateWaveReward(sector, wave, playerDamage1, killTime, perfectWave) {
            const riskReward = this.createWave(sector, wave, 1000);

            let bonus = 0;
            if (playerDamage1 === 0) bonus += riskReward.bonuses.noHit;
            if (killTime < 20000) bonus += riskReward.bonuses.speedKill;
            if (perfectWave) bonus += riskReward.bonuses.perfectWave;

            return riskReward.totalReward + bonus;
        }
    },

    // METODOS PRINCIPALES
    initializeGameMechanics() {
        this.energy.reset();
        this.objectives.reset();
        this.miniChallenges.reset();
    },

    updateMechanics(game, deltaTime) {
        // Actualizar energía
        this.energy.regenerate(deltaTime);

        // Actualizar objetivos
        if (this.objectives.active) {
            this.objectives.update(game);
        }

        // Actualizar desafíos
        if (this.miniChallenges.active.length > 0) {
            this.miniChallenges.update(game);
        }
    },

    drawEnergyBar(ctx, x, y, width, height) {
        const percent = this.energy.getPercent() / 100;

        // Fondo
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);

        // Barra energía
        const color = percent > 0.5 ? '#00ff66' : percent > 0.25 ? '#f8ff00' : '#ff0044';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * percent, height);

        // Borde
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    },

    drawObjectiveUI(ctx, y) {
        if (!this.objectives.active) return;

        const obj = this.objectives.active;
        const x = 20;

        ctx.fillStyle = '#f8ff00';
        ctx.font = 'bold 12px Orbitron';
        ctx.fillText(obj.name, x, y);

        ctx.fillStyle = '#aaa';
        ctx.font = '10px Orbitron';
        ctx.fillText(obj.description, x, y + 15);

        // Barra de progreso
        const barWidth = 200;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y + 25, barWidth, 6);
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(x, y + 25, (barWidth * obj.progress) / 100, 6);
    },

    reset() {
        this.energy.reset();
        this.objectives.reset();
        this.miniChallenges.reset();
    }
};

if (typeof window !== 'undefined') {
    window.GameMechanicsSystem = GameMechanicsSystem;
}
