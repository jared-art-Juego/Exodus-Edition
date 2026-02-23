**GUÍA DE INTEGRACIÓN - VECTOR EXODUS CORRECCIONES**
====================================================

## 🚀 PASOS PARA INTEGRAR TODOS LOS SISTEMAS

### FASE 1: SONIDO (AudioManager)

**Objetivo**: Que la música funcione en menú y sectores

**Paso 1.1: Obtener archivos MP3**
```
Busca en:
- Pixabay Music: https://pixabay.com/music/
- Incompetech: https://incompetech.com/
- Bensound: https://www.bensound.com/

Descarga 6 pistas (cualquier duración, 1-5 min)
```

**Paso 1.2: Renombrar archivos**
```
menu_theme.mp3
sector1_music.mp3
sector2_music.mp3
sector3_music.mp3
victory_theme.mp3
defeat_theme.mp3
```

**Paso 1.3: Colocar en carpeta**
```
C:\Users\Jared\Desktop\EXODUS EDITION\
  └─ assets\
      └─ audio\
          └─ music\
              ├── menu_theme.mp3
              ├── sector1_music.mp3
              ├── sector2_music.mp3
              ├── sector3_music.mp3
              ├── victory_theme.mp3
              └── defeat_theme.mp3
```

**Paso 1.4: Verificar en index.html**
```html
<!-- Buscar en index.html (línea ~245) -->
<script src="src/audio_manager.js"></script>
<!-- Debe estar PRESENTE -->
```

**Paso 1.5: Inicializar en Game.resetGame()**
```javascript
// En src/main.js o index.html, después de Game.resetGame()
Game.resetGame = function() {
    // ... código existente ...
    
    // AGREGAR esto al final:
    if (window.AudioManager) {
        AudioManager.playMenuMusic();
        console.log('✓ Menu music started');
    }
};
```

**Paso 1.6: Reproducir música en sector**
```javascript
// En la sección donde inicia el juego (Game.startGame)
Game.startGame = function(sector) {
    // ... código existente ...
    
    // AGREGAR esto:
    if (window.AudioManager) {
        AudioManager.playSectorMusic(sector);
        console.log(`✓ Sector ${sector} music started`);
    }
};
```

**✅ Test**: Abre el juego → debería escuchar música en menú y cambiar en Sector 1

---

### FASE 2: AMETRALLADORA (MachineGunBurstSystem)

**Objetivo**: Que dispare 2 ráfagas de 10 balas sin freezear

**Paso 2.1: Verificar en index.html**
```html
<!-- Buscar en index.html (línea ~248) -->
<script src="src/machine_gun_burst_system.js"></script>
<!-- Debe estar PRESENTE -->
```

**Paso 2.2: Integrar en Game.shoot()**
```javascript
// En index.html, buscar función Game.shoot()
// Luego de verificar cooldown, AGREGAR:

if (game.currentWeapon === 'mg') {
    // Bloquear si ya está disparando ráfaga
    if (!window.MachineGunBurstSystem.canFireBurst()) {
        return;
    }
    
    // Iniciar ráfaga
    window.MachineGunBurstSystem.startBurst(game);
    return;
}
```

**Paso 2.3: Actualizar en Game.update()**
```javascript
// En Game.update() (dentro del loop principal)
// AGREGAR esto:

if (window.MachineGunBurstSystem) {
    MachineGunBurstSystem.update(game, Date.now());
}
```

**Paso 2.4: Resetear en Game.resetGame()**
```javascript
// En Game.resetGame()
// AGREGAR esto:

if (window.MachineGunBurstSystem) {
    MachineGunBurstSystem.reset();
}
```

**✅ Test**: Selecciona MG → dispara → debería ver 2 ráfagas claras

---

### FASE 3: LEYENDA / DONADORES

**Objetivo**: Mostrar solo nombres reales de donadores

**Paso 3.1: Verificar en index.html**
```html
<!-- Buscar en index.html (línea ~251) -->
<script src="src/donators_system.js"></script>
<!-- Debe estar PRESENTE -->
```

**Paso 3.2: Inicialmente sin donadores**
```javascript
// El menú debe mostrar:
// "Gracias por tu apoyo, Piloto.
//  Sé el primero en apoyar esta misión."

// Esto es NORMAL - el sistema está listo para recibir donadores
```

**Paso 3.3: Agregar donadores (manual para test)**
```javascript
// En la consola del navegador (F12), escribe:
DonatorsSystem.addDonator('Piloto Valiente', 500, '2026-02-23');
DonatorsSystem.addDonator('Comandante Supremo', 1000, '2026-02-22');
DonatorsSystem.renderLegendsList();

// Debería aparecer en el menú bajo "LEYENDAS"
```

**Paso 3.4: Los donadores se guardan automáticamente**
```javascript
// En localStorage:
// Key: 'exodus_donators'
// Value: array JSON con donadores

// Se cargan automáticamente al reiniciar
```

---

### FASE 4: CRÉDITOS FINALES

**Objetivo**: Mostrar pantalla de créditos al terminar

**Paso 4.1: Verificar en index.html**
```html
<!-- Buscar en index.html (línea ~249) -->
<script src="src/credits_system.js"></script>
<!-- Debe estar PRESENTE -->
```

**Paso 4.2: Reproducir créditos automáticos**
```javascript
// Cuando el jugador completa el último sector:

if (window.CreditsSystem) {
    CreditsSystem.playAutomaticCredits();
}

// Esto:
// 1. Muestra pantalla de créditos
// 2. Reproduce música de victoria
// 3. Hace scroll automático
// 4. Presiona ESPACIO para cerrar
```

**Paso 4.3: O mostrar créditos manualmente**
```javascript
// En consola para test:
CreditsSystem.show();

// Para cerrar:
CreditsSystem.hide();
```

---

### FASE 5: ANIMACIONES DECORATIVAS

**Objetivo**: Agregar animaciones en los costados del menú (OPCIONAL)

**Paso 5.1: Verificar en index.html**
```html
<!-- Buscar en index.html (línea ~250) -->
<script src="src/ai_animation_decorator.js"></script>
<!-- Debe estar PRESENTE -->
```

**Paso 5.2: Inicializar (opcional)**
```javascript
// En Game.showMenu() o similar, AGREGAR:
if (window.AIAnimationDecorator) {
    AIAnimationDecorator.init();
}
```

**Paso 5.3: O en consola para test**
```javascript
AIAnimationDecorator.init();
// Debería ver animaciones en los lados del menú
```

---

### FASE 6: MENÚ EXPANDIDO

**Objetivo**: Menú más grande y mejor CSS (YA HECHO)

**Paso 6.1: Verificar cambios en index.html**
```css
/* Línea ~25 */
.panel {
    max-width: 900px;  /* Antes 700px */
    padding: 40px;     /* Antes 30px */
    /* ... más cambios ... */
}
```

**✅ Ya completado automáticamente**

---

### FASE 7: CORRECCIONES DE LAYOUT

**Objetivo**: Z-index correcto, sin sobreposición (YA HECHO)

**Paso 7.1: Verificar en index.html**
```css
/* Línea ~210 (aproximadamente) */
#hud { z-index: 80; }
#menu { z-index: 100; }
#boss-dialogue { z-index: 120; }
#powerup-overlay { z-index: 150; }
#defeat-screen { z-index: 200; }
#credits-overlay { z-index: 250; }
#intro-cinematic { z-index: 300; }
```

**✅ Ya completado automáticamente**

---

## 📋 CHECKLIST DE INTEGRACIÓN

```
AUDIO MANAGER:
☐ MP3s descargados y renombrados
☐ Colocados en assets/audio/music/
☐ AudioManager.js cargado en index.html
☐ Integrado en Game.resetGame()
☐ Integrado en Game.startGame()
☐ ✅ Test: Música en menú y sector

AMETRALLADORA:
☐ MachineGunBurstSystem.js cargado
☐ Integrado en Game.shoot()
☐ Integrado en Game.update()
☐ MachineGunBurstSystem.reset() en Game.resetGame()
☐ ✅ Test: 2 ráfagas de 10 balas

DONADORES:
☐ DonatorsSystem.js cargado
☐ ✅ Sin acción requerida (auto-funciona)
☐ ✅ Test: Menú muestra "Sé el primero..."

CRÉDITOS:
☐ CreditsSystem.js cargado
☐ Integrado al completar sector
☐ ✅ Test: Pantalla de créditos con scroll

DECORACIONES:
☐ AIAnimationDecorator.js cargado
☐ (Opcional) Inicializar en menú
☐ ✅ Test: Animaciones en lados

MENÚ:
☐ ✅ Already done (CSS updated)
☐ ✅ Test: Menú más grande y centrado

LAYOUT:
☐ ✅ Already done (z-index fixed)
☐ ✅ Test: Sin sobreposición de elementos
```

---

## 🔍 DEBUGGING

Si algo no funciona:

**Música no suena:**
```
1. F12 → Console
2. Busca "AudioManager" en logs
3. Verifica que MP3s existan en assets/audio/music/
4. Comprueba nombres exactos (mayúsculas)
5. Intenta: AudioManager.getStatus()
```

**Ametralladora no funciona:**
```
1. F12 → Console
2. Intenta: MachineGunBurstSystem.getStatus()
3. Verifica que Game.update() llame a MachineGunBurstSystem.update()
4. Selecciona arma MG y dispara
```

**Menú no se ve bien:**
```
1. F12 → DevTools
2. Inspecciona .panel
3. Verifica max-width: 900px
4. Redimensiona ventana si es responsive
```

**Créditos no aparecen:**
```
1. Completa un sector
2. O en consola: CreditsSystem.show()
3. Presiona ESPACIO para cerrar
```

---

## 📚 DOCUMENTACIÓN

- [RESUMEN_CORRECCIONES.md](RESUMEN_CORRECCIONES.md) - Resumen técnico
- [assets/audio/AUDIO_SETUP.md](assets/audio/AUDIO_SETUP.md) - Configuración de audio
- [assets/audio/music/README.md](assets/audio/music/README.md) - Instrucciones MP3

---

## ✅ ESTADO FINAL

```
✓ 5 sistemas nuevos creados
✓ 3 archivos modificados
✓ Build compilado (npm run dist)
✓ Todos los sistemas cargados en index.html
✓ Listo para integración en Game loop
✓ Sin ruptura de sistemas previos
```

**Tiempo estimado de integración**: 30-45 minutos

---

*Guía creada: 2026-02-23*
*Versión: 1.0*
