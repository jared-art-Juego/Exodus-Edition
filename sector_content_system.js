/**
 * SECTOR CONTENT SYSTEM
 * =====================
 * Manages content isolation by sector (1-6)
 * Ensures progression and prevents mixing content inappropriately
 * 
 * REGLAS GLOBALES:
 * - Sector 1: NO IA adaptativa, NO distorsión, NO enemigos avanzados
 * - Sectores 2-3: Pueden tener nuevos sistemas
 * - Sectores 4-6: Contenido completamente avanzado
 */

const SectorContentSystem = {
    // Definición de contenido por sector
    sectorContent: {
        1: {
            enemies: ['normal', 'fast'],
            maxEnemies: 6,
            mechanics: ['basic_shooting'],
            bossMechanics: ['simple_laser'],
            canUseAdaptiveAI: false,
            canUseDiastortion: false,
            allowedWeapons: ['ion'],
            difficulty: 0.5,
            description: 'Sector 1 - Learning Zone'
        },
        2: {
            enemies: ['normal', 'fast', 'tank', 'sniper', 'kamikaze', 'shielded_regenerative'],
            maxEnemies: 8,
            mechanics: ['base_spawning', 'dynamic_objectives', 'risk_reward', 'mini_challenges'],
            bossMechanics: ['laser_attacks', 'minion_spawning', 'phase_transitions'],
            canUseAdaptiveAI: true,
            canUseDistortion: true,
            allowedWeapons: ['ion', 'mg', 'rocket', 'ak47'],
            difficulty: 1.0,
            description: 'Sector 2 - Introduction to Advanced Combat'
        },
        3: {
            enemies: ['normal', 'fast', 'tank', 'sniper', 'kamikaze', 'shielded_regenerative', 'chain_electric'],
            maxEnemies: 8,
            mechanics: ['base_spawning', 'dynamic_objectives', 'mini_challenges', 'energy_system'],
            bossMechanics: ['laser_attacks', 'minion_spawning', 'phase_transitions', 'special_patterns'],
            canUseAdaptiveAI: true,
            canUseDistortion: true,
            allowedWeapons: ['ion', 'mg', 'rocket', 'ak47', 'plasma'],
            difficulty: 1.3,
            description: 'Sector 3 - Electrical Threats'
        },
        4: {
            enemies: ['normal', 'fast', 'tank', 'sniper', 'kamikaze', 'gravity_distorter', 'chain_electric'],
            maxEnemies: 10,
            mechanics: ['base_spawning', 'dynamic_objectives', 'energy_system', 'mini_challenges', 'gravity_mechanics'],
            bossMechanics: ['laser_attacks', 'minion_spawning', 'phase_transitions', 'gravity_distortion', 'special_patterns'],
            canUseAdaptiveAI: true,
            canUseDistortion: false,
            allowedWeapons: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun'],
            difficulty: 1.6,
            description: 'Sector 4 - Gravitational Anomalies'
        },
        5: {
            enemies: ['normal', 'fast', 'tank', 'sniper', 'kamikaze', 'gravity_distorter', 'chain_electric', 'invoker'],
            maxEnemies: 10,
            mechanics: ['base_spawning', 'dynamic_objectives', 'energy_system', 'mini_challenges', 'gravity_mechanics', 'wave_coordination'],
            bossMechanics: ['laser_attacks', 'minion_spawning', 'phase_transitions', 'gravity_distortion', 'special_patterns', 'invoker_spawning'],
            canUseAdaptiveAI: true,
            canUseDistortion: false,
            allowedWeapons: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun'],
            difficulty: 1.9,
            description: 'Sector 5 - The Invokers Rise'
        },
        6: {
            enemies: ['normal', 'fast', 'tank', 'sniper', 'kamikaze', 'gravity_distorter', 'chain_electric', 'invoker', 'coordinated_swarm'],
            maxEnemies: 12,
            mechanics: ['base_spawning', 'dynamic_objectives', 'energy_system', 'mini_challenges', 'gravity_mechanics', 'wave_coordination', 'ai_coordinated'],
            bossMechanics: ['laser_attacks', 'minion_spawning', 'phase_transitions', 'gravity_distortion', 'special_patterns', 'invoker_spawning', 'coordinated_swarm'],
            canUseAdaptiveAI: true,
            canUseDistortion: false,
            allowedWeapons: ['ion', 'mg', 'rocket', 'ak47', 'plasma', 'railgun'],
            difficulty: 2.5,
            description: 'Sector 6 - Coordinated Offensive'
        }
    },

    /**
     * Obtiene configuración de contenido para un sector
     */
    getSectorConfig(sector) {
        return this.sectorContent[sector] || this.sectorContent[1];
    },

    /**
     * Verifica si un enemigo puede aparecer en el sector
     */
    canSpawnEnemy(sector, enemyType) {
        const config = this.getSectorConfig(sector);
        return config.enemies.includes(enemyType);
    },

    /**
     * Obtiene lista de enemigos permitidos
     */
    getAllowedEnemies(sector) {
        const config = this.getSectorConfig(sector);
        return config.enemies;
    },

    /**
     * Verifica si se puede usar IA adaptativa
     */
    canUseAdaptiveAI(sector) {
        if (sector === 1) return false;
        return this.getSectorConfig(sector).canUseAdaptiveAI;
    },

    /**
     * Verifica si se puede activar modo distorsión
     */
    canUseDistortion(sector) {
        return this.getSectorConfig(sector).canUseDistortion;
    },

    /**
     * Obtiene el multiplicador de dificultad del sector
     */
    getDifficultyMultiplier(sector) {
        return this.getSectorConfig(sector).difficulty;
    },

    /**
     * Obtiene armas permitidas en sector
     */
    getAllowedWeapons(sector) {
        const config = this.getSectorConfig(sector);
        return config.allowedWeapons;
    },

    /**
     * Verifica si un arma es permitida en el sector
     */
    isWeaponAllowed(sector, weapon) {
        return this.getAllowedWeapons(sector).includes(weapon);
    },

    /**
     * Obtiene máximo de enemigos simultaneos
     */
    getMaxEnemies(sector) {
        return this.getSectorConfig(sector).maxEnemies;
    },

    /**
     * Genera descripción del sector
     */
    getSectorDescription(sector) {
        return this.getSectorConfig(sector).description;
    },

    /**
     * Obtiene mecánicas disponibles en sector
     */
    getAvailableMechanics(sector) {
        return this.getSectorConfig(sector).mechanics;
    },

    /**
     * Verifica si una mecánica está disponible
     */
    hasMechanic(sector, mechanic) {
        return this.getAvailableMechanics(sector).includes(mechanic);
    },

    /**
     * Obtiene restricciones de sector 1
     */
    isSectorOne(sector) {
        return sector === 1;
    },

    /**
     * Obtiene restricciones de sector temprano (1-2)
     */
    isEarlySector(sector) {
        return sector <= 2;
    },

    /**
     * Obtiene restricciones de sector tardío (4-6)
     */
    isLateSector(sector) {
        return sector >= 4;
    },

    /**
     * Genera configuración de spawning para ola
     */
    getWaveSpawningConfig(sector, wave) {
        const base = this.getSectorConfig(sector);
        const waveScalar = 1 + (wave * 0.1);

        return {
            maxEnemiesThisWave: Math.ceil(base.maxEnemies * waveScalar),
            baseSpawnRate: 1800 - (wave * 50), // En ms
            enemyHealthMultiplier: 1 + (wave * 0.15),
            enemySpeedMultiplier: 1 + (wave * 0.05),
            allowDifficultEnemies: wave >= 3,
            allowBossSpawn: wave === 10
        };
    },

    /**
     * Valida que contenido no cruce sectores
     */
    validateContentBoundaries(sector, content) {
        if (sector === 1) {
            // Sector 1 NO puede tener estos elementos
            if (content.usesAdaptiveAI && content.usesAdaptiveAI === true) return false;
            if (content.isDistortionMode && content.isDistortionMode === true) return false;
            if (content.enemyType && ['gravity_distorter', 'invoker', 'coordinated_swarm'].includes(content.enemyType)) return false;
        }

        if (sector <= 2) {
            if (content.enemyType === 'coordinated_swarm') return false;
            if (content.enemyType === 'invoker' && sector < 5) return false;
        }

        return true;
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SectorContentSystem = SectorContentSystem;
}
