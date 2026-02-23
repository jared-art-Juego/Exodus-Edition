/**
 * VECTOR EXODUS - Examples: Visual Effects, Screen Shake & UI
 * 
 * Ejemplos de cómo usar todas las nuevas funciones de efectos visuales
 */

// =============================================
// EJEMPLOS DE USO
// =============================================

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. SCREEN SHAKE (Sacudida de pantalla)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Uso básico
VisualEffectsUI.shakeScreen(); // 300ms, intensidad 10

// Personalizado
VisualEffectsUI.shakeScreen(500, 20);     // 500ms, 20px de intensidad
VisualEffectsUI.shakeScreen(200, 5);      // 200ms, 5px suave

// Ejemplo en combate
function onPlayerHit(damage) {
    const intensidad = Math.min(damage / 10, 30); // Más daño = más sacudida
    VisualEffectsUI.shakeScreen(300, intensidad);
}

// Ejemplo en explosión
function onBossExplosion() {
    VisualEffectsUI.shakeScreen(1000, 50); // Sacudida fuerte y larga
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 2. LOADING SCREEN (Pantalla de carga)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Mostrar pantalla de carga con duración por defecto (5s)
VisualEffectsUI.showLoadingScreen();

// Personalizado
VisualEffectsUI.showLoadingScreen(3000);  // 3 segundos
VisualEffectsUI.showLoadingScreen(8000);  // 8 segundos

// Ejemplo: Mostrar al cargar sector
function loadSector(sectorNumber) {
    VisualEffectsUI.showLoadingScreen(4000);
    
    setTimeout(() => {
        // Cargar sector después que desaparezca loading
        Game.startSector(sectorNumber);
    }, 4000);
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3. PAUSE SYSTEM (Sistema de pausa)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Alternar pausa con ESC (automático)
// Presiona ESC en el juego para pausar/reanudar

// Desde código
VisualEffectsUI.togglePause();

// Checar si está pausado
if (VisualEffectsUI.isPaused()) {
    console.log('Juego está pausado');
} else {
    console.log('Juego está activo');
}

// Ejemplo: Pausa en menú de pausa personalizado
function showCustomPauseMenu() {
    VisualEffectsUI.togglePause();
    
    // Mostrar menú personalizado
    const customMenu = document.createElement('div');
    customMenu.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,10,15,0.95); border: 2px solid #00f2ff; 
                    padding: 30px; z-index: 5001; text-align: center;">
            <h2>MENÚ DE PAUSA</h2>
            <button onclick="showSettings()">AJUSTES</button>
            <button onclick="VisualEffectsUI.togglePause()">CONTINUAR</button>
        </div>
    `;
    document.body.appendChild(customMenu);
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 4. DYNAMIC AUDIO (Efectos de sonido)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Reproducir efecto simple
VisualEffectsUI.playSoundEffect();                    // Frecuencia 440Hz
VisualEffectsUI.playSoundEffect(880, 0.2, 0.2);      // Más agudo, duración 200ms
VisualEffectsUI.playSoundEffect(220, 0.15, 0.1);     // Más grave, sonido suave

// Ejemplos de efectos para diferentes eventos
function onWeaponFire() {
    VisualEffectsUI.playSoundEffect(800, 0.1, 0.15); // Sonido de disparo
}

function onEnemyHit() {
    VisualEffectsUI.playSoundEffect(400, 0.2, 0.2);  // Sonido de impacto
}

function onLevelUp() {
    VisualEffectsUI.playSoundEffect(1200, 0.3, 0.3); // Sonido de poder
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 5. IMAGEN ANIMATION (Animación de imágenes)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Automático: las imágenes con clase .nave se animan con CSS
// <img class="nave" src="ships/fighter.png">

// Aplicar animación a imágenes después de cierto tiempo
function setupImageAnimations() {
    VisualEffectsUI.animateImages();
}

// Para que funcione, agregar clase .nave a las imágenes:
// <img class="nave" src="...">

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 6. FRASES ÉPICAS DISPONIBLES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Acceder a las frases disponibles
console.log('Total de frases:', VisualEffectsUI.FRASES_EPICAS.length);

// Mostrar una frase específica
const frase = VisualEffectsUI.FRASES_EPICAS[0];
console.log('Primera frase:', frase);

// Usar una frase personalizada
const setOfFrases = [
    ...VisualEffectsUI.FRASES_EPICAS,
    "Tu destino escrito en las estrellas...",
    "¿Listo para la batalla final?"
];

// =============================================
// COMBINACIONES DE EFECTOS
// =============================================

/**
 * Ejemplo: Secuencia épica de combate
 */
function epicBattleSequence() {
    // 1. Mostrar loading
    VisualEffectsUI.showLoadingScreen(3000);
    
    // 2. Después de loading, reproducir sonido épico
    setTimeout(() => {
        VisualEffectsUI.playSoundEffect(220, 1, 0.3); // Nota grave épica
    }, 3000);
    
    // 3. Ejecutar primera acción
    setTimeout(() => {
        console.log('¡COMENZÓ LA BATALLA!');
    }, 4000);
}

/**
 * Ejemplo: Golpe crítico con efectos
 */
function criticalHit(damageAmount) {
    // Sonido de crítico
    VisualEffectsUI.playSoundEffect(1200, 0.2, 0.4);
    
    // Sacudida más fuerte según daño
    VisualEffectsUI.shakeScreen(500, Math.min(damageAmount / 5, 40));
    
    // Mostrar texto
    console.log(`⚡ ¡CRÍTICO! Daño: ${damageAmount}`);
}

/**
 * Ejemplo: Derrota del enemigo
 */
function enemyDefeated() {
    // Sonido de victoria
    const notes = [880, 1040, 1200];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            VisualEffectsUI.playSoundEffect(freq, 0.3, 0.3);
        }, i * 200);
    });
    
    // Efecto visual
    VisualEffectsUI.shakeScreen(300, 5);
}

/**
 * Ejemplo: Secuencia de pausa segura
 */
function safePause() {
    if (!VisualEffectsUI.isPaused()) {
        VisualEffectsUI.togglePause();
        console.log('Juego pausado - Música parada');
    } else {
        VisualEffectsUI.togglePause();
        console.log('Juego reanudado - Música continúa');
    }
}

// =============================================
// INTEGRACIÓN CON JUEGO EXISTENTE
// =============================================

/*
 * Agregar esto al principio de tu código principal:
 */

function initializeGameWithEffects() {
    // Cargar todos los sistemas
    console.log('Inicializando VECTOR EXODUS...');
    
    // El VisualEffectsUI.init() se llama automáticamente
    // pero también puedes hacerlo manualmente:
    // VisualEffectsUI.init();
    
    // Ahora todas las funciones están disponibles:
    console.log('✓ Screen shake disponible');
    console.log('✓ Loading screen disponible');
    console.log('✓ Pausa (ESC) disponible');
    console.log('✓ Audio dinámico disponible');
    console.log('✓ Animación de imágenes disponible');
}

// =============================================
// CURSOR PERSONALIZADO
// =============================================

/*
 * El cursor ya está configurado automáticamente
 * - Por defecto: Mira cian (#00f2ff)
 * - En botones: Mira verde (#00ff66)
 * - En enlaces: Mira magenta (#ff00ff)
 * 
 * El punto central del cursor es (16, 16) en un SVG de 32x32
 */

// Si necesitas cambiar el cursor por CSS personalizado:
// Crea un archivo mira_espacial.png y usa:
/*
    * {
        cursor: url('media/mira_espacial.png') 16 16, auto;
    }
*/

// =============================================
// NOTAS IMPORTANTES
// =============================================

/*
 * 1. SCREEN SHAKE:
 *    - No acumular múltiples shakes (esperar a que termine)
 *    - Usar intensidades entre 5-50 para mejores resultados
 *    - Cancela automáticamente si se llama nuevamente
 * 
 * 2. LOADING SCREEN:
 *    - Se muestra automáticamente al cargar (5s default)
 *    - Las frases son aleatorias cada vez
 *    - Corre en su propio z-index (10000)
 * 
 * 3. PAUSA:
 *    - ESC activa/desactiva automáticamente
 *    - Pausa automáticamente la música (si MusicManager existe)
 *    - z-index: 5000
 * 
 * 4. AUDIO:
 *    - Requiere MusicSynthesisEngine.getAudioContext()
 *    - No genera errores si no está disponible
 *    - La variación aleatoria es ±100Hz
 * 
 * 5. ANIMACIONES DE IMÁGENES:
 *    - Agregar clase .nave a las imágenes
 *    - Animación: flote suave 3s infinito
 *    - Mueve ±15px en Y
 * 
 * 6. COMPATIBILIDAD:
 *    - Funciona en todos los navegadores modernos
 *    - Electron 40+ soporta todos los efectos
 *    - Fallback seguro si Web Audio no disponible
 */
