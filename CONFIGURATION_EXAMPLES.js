/**
 * VECTOR EXODUS - Configuration Manager Examples
 * 
 * Estos son ejemplos prácticos de cómo usar ConfigurationManager
 * en tu código JavaScript.
 * 
 * Cópiá y adaptá estos ejemplos para tu proyecto.
 */

// ============================================
// EJEMPLO 1: Leer configuración en un sistema
// ============================================

class MyGameSystem {
    init(game) {
        this.game = game;
        
        // Leer valores de configuración
        const difficulty = ConfigurationManager.get('gameplay.dificultad');
        const maxEnemies = ConfigurationManager.get('gameplay.max_enemies');
        const musicVolume = ConfigurationManager.get('audio.volumen_musica');
        
        console.log(`Sistema inicializado:`);
        console.log(`  - Dificultad: ${difficulty}`);
        console.log(`  - Max enemigos: ${maxEnemies}`);
        console.log(`  - Volumen música: ${musicVolume}`);
    }
}

// ============================================
// EJEMPLO 2: Usar multiplicador de dificultad
// ============================================

// En tu lógica de enemigos
function calcularVidaEnemigo() {
    const baseHealth = 100;
    const multiplier = ConfigurationManager.getDifficultyMultiplier();
    return baseHealth * multiplier;
    // Si dificultad = 'hard' → 100 * 1.3 = 130
    // Si dificultad = 'normal' → 100 * 1.0 = 100
}

function calcularDañoEnemigo() {
    const baseDamage = 10;
    const multiplier = ConfigurationManager.getDifficultyMultiplier();
    return baseDamage * multiplier;
}

// ============================================
// EJEMPLO 3: Cambiar configuración durante el juego
// ============================================

function ajustarVolumen(nuevoVolumen) {
    // El usuario mueve el slider de volumen
    ConfigurationManager.set('audio.volumen_musica', nuevoVolumen);
    
    // Aplicar al reproductor
    if (window.MusicManager) {
        window.MusicManager.setMusicVolume(nuevoVolumen);
    }
}

function cambiarDificultad(dificultad) {
    // El usuario selecciona nueva dificultad
    ConfigurationManager.set('gameplay.dificultad', dificultad);
    console.log(`Dificultad cambiada a: ${dificultad}`);
    // Los cambios se persisten automáticamente
}

// ============================================
// EJEMPLO 4: En el sistema de Sector 1
// ============================================

// En sector1_enhancements.js
class Sector1Manager {
    init(game) {
        this.game = game;
        
        // Leer posiciones desde config
        const bossRightPercent = ConfigurationManager.get('sector1_boss.boss_position_right', 0.75);
        const playerLeftPercent = ConfigurationManager.get('sector1_boss.player_position_left', 0.25);
        
        this.BOSS_RIGHT_X = game.w * bossRightPercent;
        this.PLAYER_LEFT_X = game.w * playerLeftPercent;
        
        console.log(`Sector1 posiciones:`);
        console.log(`  - Boss: ${this.BOSS_RIGHT_X}`);
        console.log(`  - Player: ${this.PLAYER_LEFT_X}`);
    }
}

// ============================================
// EJEMPLO 5: En WeaponBoxSystem
// ============================================

// En weapon_box_system.js
class WeaponBoxMgr {
    constructor() {
        // Leer intervals desde config
        this.SPAWN_INTERVAL_MS = ConfigurationManager.get('weapon_box_system.spawn_interval_ms', 10000);
        this.BOX_LIFETIME_MS = ConfigurationManager.get('weapon_box_system.box_lifetime_ms', 8000);
        
        console.log(`Weapon Box timings:`);
        console.log(`  - Spawn cada: ${this.SPAWN_INTERVAL_MS}ms`);
        console.log(`  - Lifetime: ${this.BOX_LIFETIME_MS}ms`);
    }
}

// ============================================
// EJEMPLO 6: Audio presets
// ============================================

// En menu de ajustes
function setAudioPreset(preset) {
    const presets = {
        silencio: 'muted',
        bajo: 'quiet',
        normal: 'balanced',
        fuerte: 'loud'
    };
    
    ConfigurationManager.applyVolumePreset(presets[preset]);
    console.log(`Audio preset aplicado: ${preset}`);
}

// ============================================
// EJEMPLO 7: Debugging - Ver configuración actual
// ============================================

function debugConfig() {
    // Ver estado de carga
    const status = ConfigurationManager.getStatus();
    console.log('ConfigurationManager Status:', status);
    
    // Ver toda la configuración
    const config = ConfigurationManager.getAll();
    console.log('Full Configuration:', config);
    
    // Ver solo audio
    console.log('Audio Settings:', config.audio);
    
    // Ver solo gameplay
    console.log('Gameplay Settings:', config.gameplay);
}

// ============================================
// EJEMPLO 8: Checar si característica está habilitada
// ============================================

function initializeGame() {
    // Inicializar solo sistemas habilitados
    if (ConfigurationManager.isEnabled('enhancement_systems.sector1_enhancements')) {
        window.Sector1Enhancements.init(window.Game);
        console.log('✓ Sector1 Enhancements cargado');
    }
    
    if (ConfigurationManager.isEnabled('enhancement_systems.menu_animation')) {
        window.MenuAnimationSystem.init();
        console.log('✓ Menu Animation cargado');
    }
    
    if (ConfigurationManager.isEnabled('enhancement_systems.persistent_save')) {
        window.PersistentSaveSystem.init(window.Game);
        console.log('✓ Save System cargado');
    }
}

// ============================================
// EJEMPLO 9: Crear nuevo valor en config
// ============================================

function guardarConfiguracionJugador(nombreJugador, nivelAlcanzado) {
    // Actualizar datos del jugador
    ConfigurationManager.set('player.nombre_jugador', nombreJugador);
    ConfigurationManager.set('player.nivel_maximo_alcanzado', nivelAlcanzado);
    
    // Automáticamente se persiste en localStorage
    console.log(`Jugador guardado: ${nombreJugador} - Nivel: ${nivelAlcanzado}`);
}

// ============================================
// EJEMPLO 10: Exportar e importar config
// ============================================

function exportarConfiguracionJugador() {
    // Exportar config como JSON
    const json = ConfigurationManager.export();
    
    // Guardar en archivo o enviar al servidor
    console.log(json);
    
    // En un navegador, podrías hacer:
    // navigator.clipboard.writeText(json);
    
    return json;
}

function importarConfiguracionJugador(jsonString) {
    // Importar config desde JSON
    const success = ConfigurationManager.import(jsonString);
    
    if (success) {
        console.log('✓ Configuración importada exitosamente');
    } else {
        console.error('✗ Error al importar configuración');
    }
    
    return success;
}

// ============================================
// EJEMPLO 11: Uso en el main.js (Electron)
// ============================================

const { app, BrowserWindow } = require('electron');

// Notar: Los módulos de Electron son CommonJS
// Pero el config.json se lee desde el navegador

function createWindow() {
    // Crear ventana
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        // Podrías leer del config.json directamente con fs
        // const config = JSON.parse(fs.readFileSync('config.json'));
        // width: config.display.width
    });

    win.loadFile('index.html');
    // ConfigurationManager cargará desde index.html
}

app.whenReady().then(createWindow);

// ============================================
// EJEMPLO 12: Tests unitarios
// ============================================

// Test: Leer valores
async function testReadConfiguration() {
    await ConfigurationManager.load();
    
    const difficulty = ConfigurationManager.get('gameplay.dificultad');
    console.assert(difficulty === 'normal', 'Dificultad debe ser "normal"');
    
    const maxEnemies = ConfigurationManager.get('gameplay.max_enemies');
    console.assert(maxEnemies === 50, 'Max enemies debe ser 50');
    
    console.log('✓ Test readConfiguration pasó');
}

// Test: Cambiar valores
function testSetConfiguration() {
    ConfigurationManager.set('test.value', 'test');
    const value = ConfigurationManager.get('test.value');
    console.assert(value === 'test', 'Valor debe ser "test"');
    
    console.log('✓ Test setConfiguration pasó');
}

// Test: Valores por defecto
function testDefaultValues() {
    const inexistente = ConfigurationManager.get('inexistent.path', 'default');
    console.assert(inexistente === 'default', 'Debe retornar valor por defecto');
    
    console.log('✓ Test defaultValues pasó');
}

// Ejecutar tests (solo para desarrollo)
// testReadConfiguration();
// testSetConfiguration();
// testDefaultValues();

// ============================================
// EJEMPLO 13: Eventos y listeners
// ============================================

// Crear eventos personalizados
function crearEvento(nombre, datos) {
    return new CustomEvent(nombre, { detail: datos });
}

function cambiarVolumeConEvento(nuevoVolumen) {
    // Cambiar volumen
    ConfigurationManager.set('audio.volumen_musica', nuevoVolumen);
    
    // Disparar evento
    const evento = crearEvento('volumeChanged', { volume: nuevoVolumen });
    document.dispatchEvent(evento);
}

// Escuchar cambios
document.addEventListener('volumeChanged', (e) => {
    console.log('Volumen cambió a:', e.detail.volume);
    if (window.MusicManager) {
        window.MusicManager.setMusicVolume(e.detail.volume);
    }
});

// ============================================
// EJEMPLO 14: Cargar configuración personalizada
// ============================================

async function cargarConfiguracionPersonalizada() {
    // Podrías tener múltiples archivos de config
    try {
        const respuesta = await fetch('config-custom.json');
        const customConfig = await respuesta.json();
        
        // Importar la configuración personalizada
        ConfigurationManager.import(JSON.stringify(customConfig));
        
        console.log('✓ Configuración personalizada cargada');
    } catch (error) {
        console.error('No se encontró config-custom.json, usando defaults');
    }
}

// ============================================
// EJEMPLO 15: Patrón Singleton
// ============================================

// ConfigurationManager ya es un Singleton globalmente disponible

// Solo hacer:
const config = window.ConfigurationManager;

// ¡No instanciar múltiples veces!
// Está disponible en toda tu aplicación

// ============================================
// Resumen de Uso
// ============================================

/*
 * LEER configuración:
 *   ConfigurationManager.get('path.to.value', defaultValue)
 * 
 * CAMBIAR configuración:
 *   ConfigurationManager.set('path.to.value', newValue);
 * 
 * OBTENER TODO:
 *   ConfigurationManager.getAll()
 * 
 * CHECAR si está habilitado:
 *   ConfigurationManager.isEnabled('path.to.feature')
 * 
 * DIFICULTAD multiplicador:
 *   ConfigurationManager.getDifficultyMultiplier(difficulty)
 * 
 * VOLUMEN presets:
 *   ConfigurationManager.applyVolumePreset('loud')
 * 
 * EXPORTAR/IMPORTAR:
 *   ConfigurationManager.export()
 *   ConfigurationManager.import(jsonString)
 * 
 * RECARGAR:
 *   await ConfigurationManager.reload()
 */

// ============================================
// NOTAS IMPORTANTES
// ============================================

/*
 * 1. ConfigurationManager se carga automáticamente
 * 2. Si config.json no existe, usa DEFAULT_CONFIG
 * 3. Los cambios se persisten automáticamente
 * 4. Usa rutas con puntos (ej: 'audio.volumen_music')
 * 5. Siempre proporciona un defaultValue para mayor seguridad
 * 6. Es 100% compatible con sistemas existentes
 * 7. No requiere ninguna inicialización manual en tu código
 */
