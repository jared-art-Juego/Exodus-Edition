/**
 * QUICK INTEGRATION REFERENCE GUIDE
 * ==================================
 * Guía rápida para integrar todos los nuevos sistemas en index.html
 */

// ============================================================================
// PASO 1: Verificar que los scripts se cargan (línea ~250)
// ============================================================================

// ✓ VERIFICAR QUE EXISTEN ESTOS IMPORTS EN index.html:
/*
<script src="src/sector_content_system.js"></script>
<script src="src/enhanced_powerup_system.js"></script>
<script src="src/enhanced_weapons_system.js"></script>
<script src="src/new_game_mechanics.js"></script>
<script src="src/extended_enemies_system.js"></script>
<script src="src/adaptive_ai_system.js"></script>
<script src="src/ranking_system.js"></script>
<script src="src/achievements_system.js"></script>
<script src="src/epic_clips_system.js"></script>
<script src="src/distortion_mode_system.js"></script>
*/

// ============================================================================
// PASO 2: En Game.resetGame() - Agregar inicializaciones
// ============================================================================

// UBICACIÓN: index.html, función Game.resetGame() (buscar por "this.player.x = this.w / 2")
// AGREGAR AL INICIO DE LA FUNCIÓN:

/*
resetGame() {
    // ... código existente ...
    
    // NUEVOS: Inicializar sistemas de expansión
    if (window.SectorContentSystem) {
        // Sistema de contenido por sector ya cargado
    }
    if (window.GameMechanicsSystem) {
        GameMechanicsSystem.initializeGameMechanics();
        GameMechanicsSystem.reset();
    }
    if (window.AdaptiveAISystem) {
        AdaptiveAISystem.initialize(this.sector);
    }
    if (window.DistortionModeSystem) {
        DistortionModeSystem.reset();
    }
    if (window.EpicClipsSystem) {
        EpicClipsSystem.reset();
    }
    if (window.AchievementsSystem) {
        AchievementsSystem.resetTrackers();
    }
    
    // ... resto del código ...
}
*/

// ============================================================================
// PASO 3: En Game.shoot() - Reemplazar lógica de armas
// ============================================================================

// UBICACIÓN: index.html, función Game.shoot() (buscar por "if(p.w === 'ion')")
// REEMPLAZAR TODA LA LÓGICA CON:

/*
shoot() {
    if (this.state !== 'PLAY' || this.player.re || this.showingPowerUp) return;
    const p = this.player;
    
    // NUEVO: Registrar disparo en IA adaptativa
    if (window.AdaptiveAISystem && this.sector > 1) {
        AdaptiveAISystem.recordShot(this, p.w);
    }
    
    // NUEVO: Resetear contador de distorsión
    if (window.DistortionModeSystem) {
        DistortionModeSystem.recordShot();
    }
    
    // NUEVO: Registrar en desafíos
    if (window.AchievementsSystem) {
        AchievementsSystem.recordShot();
        if (window.GameMechanicsSystem) {
            GameMechanicsSystem.miniChallenges.recordShot();
        }
    }
    
    // NUEVO: Usar sistema mejorado de armas
    if (window.EnhancedWeaponsSystem) {
        // Validar que arma sea permitida en sector
        if (!EnhancedWeaponsSystem.isWeaponAllowed(p.w, this.sector)) {
            return; // Arma no permitida
        }
        
        // Disparar con sistema mejorado
        if (!EnhancedWeaponsSystem.fireWeapon(this, p.w)) {
            return; // Falló (sin energía u otra razón)
        }
    } else {
        // FALLBACK: código viejo si sistema no está disponible
        if(p.w === 'ion') {
            this.fire(p.x, p.y, p.ang, 15, '#fff', 30 * p.damageMultiplier);
            this.setReload(0);
        }
        // ... resto del código viejo ...
    }
}
*/

// ============================================================================
// PASO 4: En Game.update() - Agregar actualizaciones de sistemas
// ============================================================================

// UBICACIÓN: index.html, función Game.update() (cerca del inicio, después de "const p = this.player")
// AGREGAR:

/*
update() {
    if(this.state !== 'PLAY' || this.showingPowerUp) return;
    const p = this.player;
    
    // NUEVOS: Actualizar sistemas de expansión
    if (window.GameMechanicsSystem) {
        GameMechanicsSystem.updateMechanics(this, 16.6);
    }
    
    if (window.DistortionModeSystem && 
        SectorContentSystem.canUseDistortion(this.sector)) {
        DistortionModeSystem.update(16.6);
    }
    
    // ... resto de código viejo ...
}
*/

// ============================================================================
// PASO 5: En Game.recordMovement() - Rastrear IA adaptativa
// ============================================================================

// UBICACIÓN: index.html, en la sección de movimiento del jugador
// AGREGAR DESPUÉS DE ACTUALIZAR x,y:

/*
// NUEVO: Registrar movimiento en IA adaptativa
if (window.AdaptiveAISystem && this.sector > 1) {
    AdaptiveAISystem.recordMovement(this, p.x, p.y);
}
*/

// ============================================================================
// PASO 6: En Game.updateCrates() - Usar sistema mejorado
// ============================================================================

// UBICACIÓN: index.html, función Game.updateCrates() (buscar "this.crates.forEach")
// AL INICIO DE LA FUNCIÓN, AGREGAR:

/*
updateCrates() {
    // NUEVO: Actualizar power-ups mejorados
    if (window.EnhancedPowerUpSystem) {
        this.crates = EnhancedPowerUpSystem.updatePowerUps(this.crates, this);
    }
    
    // ... resto del código ...
}
*/

// ============================================================================
// PASO 7: En Game.destroyCrate() - Usar sistema mejorado
// ============================================================================

// UBICACIÓN: function destroyCrate - línea donde se define poder
// REEMPLAZAR:

/*
    const types = this.sector === 2 ? ['mg','ak47','plasma','railgun'] : ['mg','rocket','ak47'];
    this.player.w = types[Math.floor(Math.random() * types.length)];

CON:

    // NUEVO: Usar sistema mejorado de power-ups
    const powerUpType = window.EnhancedPowerUpSystem 
        ? EnhancedPowerUpSystem.getRandomPowerUp(this.sector)
        : (['rocket', 'mg'][Math.floor(Math.random() * 2)]);
    
    if (window.EnhancedPowerUpSystem) {
        EnhancedPowerUpSystem.applyPowerUp(this, powerUpType);
    } else {
        this.player.w = powerUpType;
    }
*/

// ============================================================================
// PASO 8: En Game.damagePlayer() - Registrar daño
// ============================================================================

// UBICACIÓN: función damagePlayer
// AGREGAR AL INICIO:

/*
damagePlayer(amount) {
    // NUEVO: Registrar daño en sistemas
    if (window.DistortionModeSystem) {
        DistortionModeSystem.recordDamageReceived(amount);
    }
    
    if (window.AchievementsSystem) {
        AchievementsSystem.recordDamageReceived(amount);
    }
    
    // ... resto del código ...
}
*/

// ============================================================================
// PASO 9: En Game.draw() - HUD para sistemas
// ============================================================================

// UBICACIÓN: función draw(), donde se dibuja el HUD
// AGREGAR ANTES DE DIBUJAR CANVAS:

/*
    // NUEVO: Dibujar barras de energía
    if (window.GameMechanicsSystem) {
        GameMechanicsSystem.drawEnergyBar(this.ctx, 20, 60, 120, 10);
    }
    
    // NUEVO: Dibujar contador de distorsión
    if (window.DistortionModeSystem) {
        DistortionModeSystem.drawCounter(this.ctx, 20, 20);
        if (DistortionModeSystem.isDistortionActive) {
            DistortionModeSystem.drawDistortionEffect(this.ctx, this.w, this.h);
        }
    }
    
    // NUEVO: Dibujar clips épicos
    if (window.EpicClipsSystem) {
        EpicClipsSystem.drawClips(this.ctx, this.w, this.h);
    }
    
    // NUEVO: Dibujar objetivos dinámicos
    if (window.GameMechanicsSystem && GameMechanicsSystem.objectives.active) {
        GameMechanicsSystem.drawObjectiveUI(this.ctx, 100);
    }
*/

// ============================================================================
// PASO 10: En Game.bossDefeated() - Registrar logros
// ============================================================================

// UBICACIÓN: función bossDefeated
// AGREGAR AL INICIO:

/*
bossDefeated() {
    // NUEVO: Registrar eventos en sistemas
    if (window.AchievementsSystem) {
        AchievementsSystem.recordWave10();
        AchievementsSystem.recordDistortionMode(); // Si está activa
    }
    
    if (window.EpicClipsSystem) {
        EpicClipsSystem.detectBossDefeated('Boss', this.boss.phase, Date.now() - this.waveStartTime);
    }
    
    // ... resto del código ...
}
*/

// ============================================================================
// PASO 11: En Game.recordKill() - Registrar kills en sistemas
// ============================================================================

// UBICACIÓN: Donde se incrementa kills (en updateBullets())
// AGREGAR DESPUÉS DE this.kills++:

/*
    if (window.AdaptiveAISystem && this.sector > 1) {
        AdaptiveAISystem.recordKill();
    }
    
    if (window.AchievementsSystem) {
        AchievementsSystem.recordKill(Date.now());
        GameMechanicsSystem.miniChallenges.recordKill();
    }
    
    if (window.EpicClipsSystem) {
        EpicClipsSystem.recordKill(Date.now());
    }
*/

// ============================================================================
// PASO 12: Al finalizar sesión - Guardar datos
// ============================================================================

// UBICACIÓN: Cuando la partida termina (Game.checkPlayerDeath o similar)
// AGREGAR:

/*
    if (window.RankingSystem) {
        RankingSystem.recordRun({
            sector: this.sector,
            wave: this.wave,
            score: this.score,
            kills: this.kills,
            bossesDefeated: this.boss ? 1 : 0,
            playtime: Date.now() - this.sessionStartTime,
            difficulty: this.difficulty,
            survived: false,
            finalHP: this.player.hp,
            weaponUsed: this.player.w
        });
    }
    
    if (window.AdaptiveAISystem) {
        AdaptiveAISystem.recordGameEnd(this);
    }
*/

// ============================================================================
// CHECKLIST DE INTEGRACIÓN
// ============================================================================

const INTEGRATION_CHECKLIST = [
    "☐ Verificar que 10 nuevos scripts estén importados en index.html",
    "☐ Agregar inicializaciones en Game.resetGame()",
    "☐ Reemplazar lógica de shoot() con EnhancedWeaponsSystem",
    "☐ Agregar actualizaciones en Game.update()",
    "☐ Agregar tracking de movimiento en IA adaptativa",
    "☐ Actualizar sistema de cajas con EnhancedPowerUpSystem",
    "☐ Actualizar destroyCrate() con nuevos poder-ups",
    "☐ Registrar daño en Game.damagePlayer()",
    "☐ Dibujar barras/contadores en Game.draw() HUD",
    "☐ Registrar eventos en bossDefeated()",
    "☐ Registrar kills en updateBullets()",
    "☐ Guardar datos al finalizar sesión",
    "☐ Probar Sector 1: IA desactivada, no hay distorsión",
    "☐ Probar Sector 2 Onda 2: Modo distorsión funciona",
    "☐ Probar Machine Gun: 2 ráfagas de 10",
    "☐ Probar Power-ups: Desaparecen a 15s, parpadean últimos 3s",
];

// ============================================================================
// DEBUGGING EN CONSOLA
// ============================================================================

/*
// Copiar esto en la consola del navegador (F12) para verificar:

// Verificar sistemas cargados
console.table({
    SectorContent: !!window.SectorContentSystem,
    PowerUp: !!window.EnhancedPowerUpSystem,
    Weapons: !!window.EnhancedWeaponsSystem,
    Mechanics: !!window.GameMechanicsSystem,
    Enemies: !!window.ExtendedEnemiesSystem,
    AdaptiveAI: !!window.AdaptiveAISystem,
    Ranking: !!window.RankingSystem,
    Achievements: !!window.AchievementsSystem,
    EpicClips: !!window.EpicClipsSystem,
    Distortion: !!window.DistortionModeSystem
});

// Ver status de distorsión
Game.sector = 2;
Game.wave = 2;
DistortionModeSystem.getDebugInfo();

// Ver configuración de sector
SectorContentSystem.getSectorConfig(2);

// Ver estadísticas de IA
AdaptiveAISystem.getDebugReport();

// Ver logros desbloqueados
AchievementsSystem.getProgress();
*/

console.log("✅ INTEGRACIÓN - Todos los sistemas listos");
