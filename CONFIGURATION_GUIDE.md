# 📋 Configuration Manager - Guía de Uso

**Archivo**: `configuration_manager.js`
**Status**: ✅ Implementado
**Fecha**: February 22, 2026

---

## 🎯 ¿Qué es?

El **ConfigurationManager** es un sistema profesional que:
- ✅ Carga automáticamente `config.json` al iniciar
- ✅ Proporciona acceso fácil a configuraciones desde JavaScript
- ✅ Tiene valores por defecto para casos de error
- ✅ Permite cambiar configuraciones en tiempo real
- ✅ Persiste cambios automáticamente

---

## 📦 ¿Cómo funciona?

### Carga Automática
```javascript
// Se ejecuta automáticamente al cargar la página
await ConfigurationManager.load();
// ↓ Carga config.json
// ↓ Aplica valores al juego
// ✅ Listo para usar
```

### Estructura
```
config.json (archivo)
    ↓
ConfigurationManager.load()
    ↓
Merge con DEFAULT_CONFIG
    ↓
Aplicar al juego
    ↓
Disponible en window.ConfigurationManager
```

---

## 💻 Uso desde JavaScript

### 1️⃣ Obtener Valores

```javascript
// Obtener un valor específico
const volumeMusicao = ConfigurationManager.get('audio.volumen_musica');
console.log("Volumen de música:", volumeMusicao); // 0.8

// Con valor por defecto si no existe
const customValue = ConfigurationManager.get('custom.key', 'default_value');

// Obtener toda la configuración
const config = ConfigurationManager.getAll();
console.log("Configuración completa:", config);
```

### 2️⃣ Cambiar Valores

```javascript
// Cambiar volumen
ConfigurationManager.set('audio.volumen_musica', 0.5);

// Cambiar dificultad
ConfigurationManager.set('gameplay.dificultad', 'hard');

// Cambiar nombre del jugador
ConfigurationManager.set('player.nombre_jugador', 'NuevoNombre');
```

### 3️⃣ Usar en Sistemas del Juego

```javascript
// En tu código del juego (ej: en un sistema)
class MyGameSystem {
    init(game) {
        this.game = game;
        
        // Leer configuración
        const difficulty = ConfigurationManager.get('gameplay.dificultad');
        const maxEnemies = ConfigurationManager.get('gameplay.max_enemies');
        const volume = ConfigurationManager.get('audio.volumen_musica');
        
        console.log(`Sistema iniciado - Dificultad: ${difficulty}, Max enemigos: ${maxEnemies}`);
    }
}
```

### 4️⃣ Checar si algo está habilitado

```javascript
// Verificar si una característica está habilitada
if (ConfigurationManager.isEnabled('enhancement_systems.sector1_enhancements')) {
    console.log("Sector 1 enhancements habilitados");
}

// Más ejemplos
if (ConfigurationManager.isEnabled('menu_animation')) {
    startMenuAnimation();
}
```

### 5️⃣ Multiplicador de Dificultad

```javascript
// Obtener multiplicador de dificultad actual
const multiplier = ConfigurationManager.getDifficultyMultiplier();
console.log("Multiplicador:", multiplier); // 1.0 para 'normal'

// O especificar una dificultad
const hardMultiplier = ConfigurationManager.getDifficultyMultiplier('hard');
console.log("Hard:", hardMultiplier); // 1.3

// Usar en cálculos
const enemyHealth = 100 * multiplier;
```

### 6️⃣ Audio presets

```javascript
// Aplicar preset de volumen predefinido
ConfigurationManager.applyVolumePreset('muted');      // Silencio
ConfigurationManager.applyVolumePreset('quiet');      // Bajo
ConfigurationManager.applyVolumePreset('balanced');   // Balanceado (default)
ConfigurationManager.applyVolumePreset('loud');       // Fuerte
```

---

## 📝 config.json - Estructura

```json
{
  "player": {
    "nombre_jugador": "Piloto Exodus",
    "nivel_maximo_alcanzado": 1,
    "ultima_partida": "2026-02-22",
    "sector_actual": 1
  },
  "audio": {
    "volumen_musica": 0.8,
    "volumen_efectos": 1.0,
    "volumen_master": 0.7,
    "enabled": true,
    "auto_play_music": true
  },
  "gameplay": {
    "dificultad": "normal",
    "starting_sector": 1,
    "max_enemies": 50
  },
  "enhancement_systems": {
    "sector1_enhancements": true,
    "defeat_cinematic": true,
    "weapon_box_system": true,
    "persistent_save": true,
    "menu_animation": true,
    "procedural_backgrounds": true
  }
}
```

---

## 🎮 Ejemplos Prácticos

### Ejemplo 1: En MusicManager
```javascript
// Aplicar volumen desde config
if (window.ConfigurationManager && window.MusicManager) {
    const musicVol = ConfigurationManager.get('audio.volumen_musica', 0.6);
    window.MusicManager.setMusicVolume(musicVol);
}
```

### Ejemplo 2: En Sector1Enhancements
```javascript
// Usar posiciones desde config
this.BOSS_RIGHT_X = game.w * ConfigurationManager.get('sector1_boss.boss_position_right', 0.75);
this.PLAYER_LEFT_X = game.w * ConfigurationManager.get('sector1_boss.player_position_left', 0.25);
```

### Ejemplo 3: En WeaponBoxSystem
```javascript
// Usar intervals desde config
const spawnInterval = ConfigurationManager.get('weapon_box_system.spawn_interval_ms', 10000);
const lifetime = ConfigurationManager.get('weapon_box_system.box_lifetime_ms', 8000);
```

### Ejemplo 4: En main.js (Electron)
```javascript
const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Aplicar resolución desde config.json
  const win = new BrowserWindow({
    width: 1280,  // O leer de config
    height: 720,
  });
  
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
```

---

## 🔄 Métodos Disponibles

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `get(path, default)` | Obtener valor | `get('audio.volumen_musica')` |
| `set(path, value)` | Establecer valor | `set('gameplay.dificultad', 'hard')` |
| `getAll()` | Obtener config completa | `getAll()` |
| `isEnabled(path)` | Checar si está true | `isEnabled('menu_animation')` |
| `getDifficultyMultiplier(diff)` | Obtener multiplicador | `getDifficultyMultiplier('hard')` |
| `applyVolumePreset(preset)` | Aplicar preset de volumen | `applyVolumePreset('loud')` |
| `load()` | Cargar desde archivo | `await load()` |
| `reload()` | Recargar configuración | `await reload()` |
| `reset()` | Resetear a defaults | `reset()` |
| `export()` | Exportar como JSON string | `export()` |
| `import(json)` | Importar desde JSON string | `import(jsonString)` |
| `getStatus()` | Ver estado de carga | `getStatus()` |

---

## ⚠️ Casos de Error

### Si config.json no existe
```
⚠️ ConfigurationManager] Failed to load config.json
→ Se usan valores DEFAULT_CONFIG automáticamente
→ El juego funciona igual
```

### Si JSON es inválido
```
⚠️ Mismo comportamiento - usa defaults
```

### Si una clave no existe
```javascript
// Esto NO causa error
const valor = ConfigurationManager.get('inexistent.key'); // null
const valor2 = ConfigurationManager.get('inexistent.key', 'default'); // 'default'
```

---

## 🛠️ Cómo Personalizar

### Agregar Nueva Configuración

**1. En config.json**:
```json
{
  "mi_sistema": {
    "mi_opcion": true,
    "mi_valor": 42
  }
}
```

**2. En JavaScript**:
```javascript
const opcion = ConfigurationManager.get('mi_sistema.mi_opcion', false);
const valor = ConfigurationManager.get('mi_sistema.mi_valor', 0);
```

### Modificar Valores en Tiempo Real

```javascript
// El jugador cambia la dificultad
ConfigurationManager.set('gameplay.dificultad', 'insane');

// El cambio se persiste automáticamente
// Y se usa en los cálculos del juego
```

---

## 📊 Estado y Debugging

### Ver Estado Actual
```javascript
const status = ConfigurationManager.getStatus();
console.log(status);
// {
//   isLoaded: true,
//   lastLoadTime: 1708600800000,
//   version: "1.0.0",
//   timestamp: "2026-02-22T10:00:00.000Z"
// }
```

### Ver Configuración Completa
```javascript
const config = ConfigurationManager.getAll();
console.log(JSON.stringify(config, null, 2));
```

### En la Consola del Navegador
```javascript
// Directamente en console
ConfigurationManager.get('audio')
ConfigurationManager.getAll()
ConfigurationManager.getStatus()
```

---

## ✅ Ventajas

- ✅ **Centralizado**: Una sola fuente de verdad (config.json)
- ✅ **Fácil de Usar**: Simple API
- ✅ **Robusto**: Maneja errores gracefully
- ✅ **Flexible**: Valores por defecto para todo
- ✅ **Persistente**: Cambios se guardan automáticamente
- ✅ **Sin Breaking Changes**: Compatible con código existente

---

## 🚀 Casos de Uso Reales

### Caso 1: Juego Beta vs Release
```json
// config.json para beta
{
  "enhancement_systems": {
    "debug_mode": true,
    "spawn_easy_enemies": true
  }
}

// config.json para release
{
  "enhancement_systems": {
    "debug_mode": false,
    "spawn_easy_enemies": false
  }
}
```

### Caso 2: Diferentes Plataformas
```json
// Electron (desktop)
{
  "display": {
    "width": 1920,
    "height": 1080,
    "fullscreen": true
  }
}

// Web
{
  "display": {
    "width": 1280,
    "height": 720,
    "fullscreen": false
  }
}
```

### Caso 3: Balanceo de Gameplay
```javascript
// Ajustar dificultad sin cambiar código
const enemyDamage = 10 * ConfigurationManager.getDifficultyMultiplier();
const playerHealth = 200 * ConfigurationManager.getDifficultyMultiplier();
```

---

## 📚 Integración con Otros Sistemas

El ConfigurationManager ya se integra automáticamente con:

| Sistema | Integración |
|---------|-------------|
| MusicManager | Volumen audio |
| Sector1Enhancements | Posiciones del boss |
| WeaponBoxSystem | Spawn intervals |
| PersistentSaveSystem | Auto-save timing |
| MenuAnimationSystem | Conteos de partículas |
| ProceduralBackgroundGenerator | Densidad de efectos |

---

## 🎯 Resumen

**ConfigurationManager** es tu herramienta para:
1. ✅ Leer configuraciones desde `config.json`
2. ✅ Cambiar valores en tiempo real
3. ✅ Mantener configuración centralizada
4. ✅ Evitar hardcodear constantes
5. ✅ Facilitar customización y balanceo

**Uso simple**:
```javascript
// Leer
let valor = ConfigurationManager.get('audio.volumen_musica');

// Cambiar
ConfigurationManager.set('gameplay.dificultad', 'hard');

// ¡Listo!
```

---

**Last Updated**: February 22, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
