# 🎮 INTEGRACIÓN DE AUDIO EN GAME LOOP

## 📍 DÓNDE INTEGRAR

El archivo `audio_system_simple.js` está **COMPLETAMENTE INDEPENDIENTE**. Solo necesitas llamar a sus funciones en los puntos correctos del Game loop.

---

## 🔗 PUNTOS DE INTEGRACIÓN

### 1. **MENÚ PRINCIPAL - Iniciar Música**

**Archivo:** `src/main.js` o `src/game_initializer.js`

**BUSCA:**
```javascript
Game.resetGame = function() {
    // ... código existente ...
}
```

**AÑADE AL INICIO:**
```javascript
Game.resetGame = function() {
    // Reproducir música de menú
    if (window.playMenuMusic) {
        playMenuMusic();
    }
    
    // ... resto del código existente ...
}
```

---

### 2. **INICIAR JUEGO - Música por Sector**

**Archivo:** `src/main.js` o `src/game_initializer.js`

**BUSCA:**
```javascript
Game.startGame = function() {
    // ... código existente ...
}
```

**AÑADE DESPUÉS DE INICIALIZAR EL SECTOR:**
```javascript
Game.startGame = function() {
    // ... código existente ...
    
    // Reproducir música según sector
    if (game.currentSector === 1) {
        if (window.playSector1Music) {
            playSector1Music();
        }
    } else if (game.currentSector === 2) {
        if (window.playSector2Music) {
            playSector2Music();
        }
    }
}
```

---

### 3. **VICTORIA - Música de Victoria**

**BUSCA:**
```javascript
// Función que se llama cuando ganas
function onPlayerVictory() {
    // ... código existente ...
}

// O en Game.update() cuando se detecta victoria
if (game.waveComplete) {
    // ... código existente ...
}
```

**AÑADE:**
```javascript
// Cuando detectes victoria
if (window.playVictoryMusic) {
    playVictoryMusic();
}
```

---

### 4. **DERROTA - Música de Derrota**

**BUSCA:**
```javascript
// Función que se llama cuando pierdes
function onPlayerDefeat() {
    // ... código existente ...
}

// O en Game.update() cuando se detecta derrota
if (game.playerDead) {
    // ... código existente ...
}
```

**AÑADE:**
```javascript
// Cuando detectes derrota
if (window.playDefeatMusic) {
    playDefeatMusic();
}
```

---

## 📝 EJEMPLO COMPLETO

Si tu Game loop es así:

```javascript
const Game = {
    // Estado
    state: 'menu',     // 'menu', 'playing', 'victory', 'defeat'
    currentSector: 1,
    playerDead: false,

    // Resetear todo
    resetGame() {
        this.state = 'menu';
        this.playerDead = false;
        
        // ✅ AUDIO: Reproducir música de menú
        if (window.playMenuMusic) {
            playMenuMusic();
        }
    },

    // Iniciar juego
    startGame() {
        this.state = 'playing';
        
        // ✅ AUDIO: Reproducir música del sector
        if (this.currentSector === 1 && window.playSector1Music) {
            playSector1Music();
        } else if (this.currentSector === 2 && window.playSector2Music) {
            playSector2Music();
        }
    },

    // Update del juego
    update() {
        // ... lógica de juego ...

        // Detectar victoria
        if (this.waveComplete && this.state === 'playing') {
            this.state = 'victory';
            
            // ✅ AUDIO: Reproducir música de victoria
            if (window.playVictoryMusic) {
                playVictoryMusic();
            }
        }

        // Detectar derrota
        if (this.playerDead && this.state === 'playing') {
            this.state = 'defeat';
            
            // ✅ AUDIO: Reproducir música de derrota
            if (window.playDefeatMusic) {
                playDefeatMusic();
            }
        }
    },

    // Volver al menú
    backToMenu() {
        this.resetGame(); // Esto ya reproduce la música de menú
    }
};
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Identificar dónde se llama `resetGame()` → Añadir `playMenuMusic()`
- [ ] Identificar dónde se llama `startGame()` → Añadir `playSector1Music()` o `playSector2Music()`
- [ ] Identificar dónde se detecta victoria → Añadir `playVictoryMusic()`
- [ ] Identificar dónde se detecta derrota → Añadir `playDefeatMusic()`
- [ ] Probar que música inicia correctamente
- [ ] Probar que música cambia al cambiar de sector
- [ ] Probar que música cambia al entrar en victoria/derrota
- [ ] Verificar en consola: `AudioSystemSimple.getStatus()`

---

## 🧪 TESTING

### Test 1: Menú Principal
```javascript
// Consola (F12)
AudioSystemSimple.playMenu()
// Debe sonar la música de menú
```

### Test 2: Sector 1
```javascript
AudioSystemSimple.playSector1()
// Debe sonar la música de sector 1
```

### Test 3: Sector 2
```javascript
AudioSystemSimple.playSector2()
// Debe sonar la música de sector 2
```

### Test 4: Victoria
```javascript
AudioSystemSimple.playVictory()
// Debe sonar la música de victoria
```

### Test 5: Derrota
```javascript
AudioSystemSimple.playDefeat()
// Debe sonar la música de derrota
```

### Test 6: Cambiar Volumen
```javascript
AudioSystemSimple.setVolume(0.3)  // Bajo
AudioSystemSimple.setVolume(0.7)  // Normal
AudioSystemSimple.setVolume(1.0)  // Máximo
```

### Test 7: Pausar/Reanudar
```javascript
AudioSystemSimple.pause()    // Pausa
AudioSystemSimple.resume()   // Reanuda
```

---

## 🔍 DEBUGGING

Si la música NO SUENA:

```javascript
// Paso 1: Verificar que el sistema está inicializado
AudioSystemSimple.getStatus()
// Debe mostrar initialized: true, userInteracted: true

// Paso 2: Verificar que los elementos de audio existen
console.log(document.getElementById('menuAudio'))     // No debe ser null
console.log(document.getElementById('sector1Audio'))  // No debe ser null

// Paso 3: Intentar reproducir manualmente
AudioSystemSimple.playMenu()

// Paso 4: Ver errores en consola
// Busca mensajes con ⚠️ o ❌

// Paso 5: Verificar archivos de audio
// Abre DevTools → Network
// Intenta reproducir una canción
// Verifica que se descargara ./media/menu.mp3 o ./media/menu.wav
```

---

## ⚠️ IMPORTANTE

1. **NO llames a `AudioSystemSimple` directamente en HTML:**
   ```html
   <!-- ❌ NO HAGAS ESTO -->
   <button onclick="AudioSystemSimple.playMenu()">Play</button>
   
   <!-- ✅ HAZ ESTO -->
   <button onclick="playMenuMusic()">Play</button>
   ```

2. **NO crees múltiples instancias:**
   ```javascript
   // ❌ NO hagas esto
   const audio = new Audio('./media/menu.mp3');
   
   // ✅ El sistema ya lo maneja
   playMenuMusic();
   ```

3. **Siempre verifica que exista:**
   ```javascript
   // ✅ BIEN
   if (window.playMenuMusic) {
       playMenuMusic();
   }
   
   // ❌ Puede causar error
   playMenuMusic(); // Si el script no cargó
   ```

---

## 📞 SOPORTE

### Error: "playMenuMusic is not defined"
- Verifica que `src/audio_system_simple.js` esté en `index.html`
- Recarga la página (no es problema, es que el script fue añadido después)

### Error: "Audio files not found"
- Verifica que existan los archivos en `./media/`
- Verifica el path correcto: `./media/menu.mp3` (no `/media/menu.mp3`)

### No hay sonido pero sin errores
- Abre DevTools (F12) y busca si el usuario ha interactuado
- Hace click en la ventana del juego
- Intenta reproducir de nuevo

### Sonido distorsionado o con glitches
- Verifica que el archivo MP3/WAV sea válido
- Intenta con el archivo WAV en lugar de MP3
- Reduce el volumen con `AudioSystemSimple.setVolume(0.7)`

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Tipo | Cambio |
|---------|------|--------|
| index.html | Modificado | Audio tags corregidos + script audio_system_simple |
| src/audio_system_simple.js | Nuevo | Sistema de audio centralizado |
| src/audio_manager_fixed.js | Desactivado | Reemplazado por audio_system_simple |
| Game loop | Por hacer | Integrar llamadas a playMenuMusic(), etc. |

---

*Fecha: 2026-02-23*  
*Guía: Integración de Audio en Game Loop*  
*Estado: Listo para implementar*
