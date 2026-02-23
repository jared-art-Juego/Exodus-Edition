/**
 * VECTOR EXODUS - Visual Effects & UI System
 * 
 * Incluye:
 * - Screen shake (sacudida)
 * - Loading screen con frases épicas
 * - Pause system
 * - Audio dinámico
 * - Animaciones de imágenes
 */

window.VisualEffectsUI = (() => {
    const log = (msg) => console.log(`[VisualEffects] ${msg}`);
    
    let isGamePaused = false;
    let shakeAnimationId = null;
    
    // =============================================
    // SCREEN SHAKE - Sacudida de pantalla
    // =============================================
    
    /**
     * Hacer que la pantalla se sacuda
     * @param {number} duracion - Duración en milisegundos
     * @param {number} intensidad - Intensidad de la sacudida (píxeles)
     */
    function shakeScreen(duracion = 300, intensidad = 10) {
        if (shakeAnimationId) {
            cancelAnimationFrame(shakeAnimationId);
        }
        
        const body = document.body;
        const canvas = document.querySelector('canvas');
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duracion, 1);
            
            // Intensidad decrece con el tiempo
            const currentIntensidad = intensidad * (1 - progress);
            
            // Valores aleatorios para X e Y
            const randomX = (Math.random() - 0.5) * currentIntensidad;
            const randomY = (Math.random() - 0.5) * currentIntensidad;
            
            // Aplicar shake
            if (body) {
                body.style.transform = `translate(${randomX}px, ${randomY}px)`;
            }
            
            if (canvas) {
                canvas.style.transform = `translate(${randomX}px, ${randomY}px)`;
            }
            
            // Continuar si aún hay duración
            if (progress < 1) {
                shakeAnimationId = requestAnimationFrame(shake);
            } else {
                // Resetear posición
                if (body) body.style.transform = 'translate(0, 0)';
                if (canvas) canvas.style.transform = 'translate(0, 0)';
                log(`✓ Screen shake completado (${duracion}ms, ${intensidad}px)`);
            }
        };
        
        shake();
        log(`→ Screen shake iniciado: ${duracion}ms, ${intensidad}px`);
    }
    
    // =============================================
    // LOADING SCREEN - Pantalla de carga
    // =============================================
    
    const FRASES_EPICAS = [
        "Sincronizando motores de salto hiperespacial...",
        "El vacío no es el límite, es el comienzo.",
        "Esquivando asteroides rebeldes en el sector 7...",
        "Cargando protocolo de supervivencia Exodus...",
        "Calibrando cañones láser de alta densidad...",
        "Buscando señales de vida inteligente (o algo parecido)...",
        "Advertencia: El café del piloto se está enfriando.",
        "Estableciendo conexión con la estación orbital...",
        "Traduciendo códigos de una civilización olvidada...",
        "Ignorando las leyes de la física por un momento...",
        "Recogiendo escombros espaciales para el motor...",
        "Sincronizando la IA de combate con tus reflejos...",
        "Limpiando el polvo cósmico del parabrisas...",
        "Calculando la trayectoria para no chocar con el Sol...",
        "Escaneando naves enemigas en el radar...",
        "Preparando el salto al hiperespacio en 3, 2, 1...",
        "Ajustando la gravedad artificial... intenta no flotar.",
        "Descifrando transmisiones alienígenas sospechosas...",
        "Cargando texturas de galaxias lejanas...",
        "Que las estrellas guíen tu camino, Piloto."
    ];
    
    /**
     * Mostrar pantalla de carga con frase aleatoria
     * @param {number} duracion - Duración in milisegundos (default 5000)
     */
    function showLoadingScreen(duracion = 5000) {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #000a0f 0%, #001a2e 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Orbitron', monospace;
            color: #00f2ff;
            backdrop-filter: blur(3px);
            animation: loadingFadeIn 0.5s ease-out;
        `;
        
        // Frase aleatoria
        const fraseAleatoria = FRASES_EPICAS[Math.floor(Math.random() * FRASES_EPICAS.length)];
        
        // Contenedor de texto
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            text-align: center;
            max-width: 600px;
            padding: 40px;
        `;
        
        // Título
        const titulo = document.createElement('h2');
        titulo.textContent = 'EXODUS EDITION';
        titulo.style.cssText = `
            font-size: 2.5rem;
            margin: 0 0 30px 0;
            text-shadow: 0 0 20px #00f2ff;
            letter-spacing: 2px;
        `;
        
        // Frase
        const frase = document.createElement('p');
        frase.textContent = fraseAleatoria;
        frase.style.cssText = `
            font-size: 1.2rem;
            margin: 20px 0;
            line-height: 1.6;
            color: #00f2ff;
            text-shadow: 0 0 10px #00f2ff;
            animation: fraseGlow 1.5s ease-in-out infinite;
        `;
        
        // Barra de carga
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 300px;
            height: 4px;
            background: #001a2e;
            margin: 30px auto;
            border: 1px solid #00f2ff;
            border-radius: 2px;
            overflow: hidden;
            box-shadow: 0 0 10px #00f2ff;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #00f2ff, #ff00ff);
            width: 0%;
            transition: width linear;
            box-shadow: 0 0 10px #00f2ff;
        `;
        progressContainer.appendChild(progressBar);
        
        // Subtítulo
        const subtitulo = document.createElement('p');
        subtitulo.textContent = 'Iniciando misión...';
        subtitulo.style.cssText = `
            font-size: 0.8rem;
            color: #666;
            margin: 20px 0 0 0;
            letter-spacing: 1px;
        `;
        
        // Agregar elementos
        textContainer.appendChild(titulo);
        textContainer.appendChild(frase);
        textContainer.appendChild(progressContainer);
        textContainer.appendChild(subtitulo);
        overlay.appendChild(textContainer);
        
        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes loadingFadeIn {
                from {
                    opacity: 0;
                    backdrop-filter: blur(0px);
                }
                to {
                    opacity: 1;
                    backdrop-filter: blur(3px);
                }
            }
            
            @keyframes fraseGlow {
                0%, 100% { 
                    text-shadow: 0 0 10px #00f2ff;
                    opacity: 0.8;
                }
                50% { 
                    text-shadow: 0 0 30px #00f2ff, 0 0 15px #ff00ff;
                    opacity: 1;
                }
            }
            
            @keyframes loadingFadeOut {
                from {
                    opacity: 1;
                    backdrop-filter: blur(3px);
                }
                to {
                    opacity: 0;
                    backdrop-filter: blur(0px);
                }
            }
        `;
        overlay.appendChild(style);
        
        // Agregar al DOM
        document.body.appendChild(overlay);
        
        log(`📺 Loading screen mostrada: "${fraseAleatoria.substring(0, 40)}..."`);
        
        // Animar barra de carga
        const startTime = Date.now();
        const animateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duracion) * 100, 100);
            progressBar.style.width = progress + '%';
            
            if (progress < 100) {
                requestAnimationFrame(animateProgress);
            }
        };
        animateProgress();
        
        // Remover después de duración con fade out
        setTimeout(() => {
            overlay.style.animation = 'loadingFadeOut 0.8s ease-out forwards';
            setTimeout(() => {
                overlay.remove();
                log('✓ Loading screen ocultada');
            }, 800);
        }, duracion);
        
        return overlay;
    }
    
    // =============================================
    // PAUSE SYSTEM - Sistema de pausa
    // =============================================
    
    /**
     * Alternar pausa del juego
     */
    function togglePause() {
        isGamePaused = !isGamePaused;
        
        const overlay = document.getElementById('pause-overlay');
        
        if (isGamePaused) {
            // Crear overlay de pausa
            const pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 5000;
                font-family: 'Orbitron', monospace;
                backdrop-filter: blur(5px);
                animation: pauseFadeIn 0.3s ease-out;
            `;
            
            const pausePanel = document.createElement('div');
            pausePanel.style.cssText = `
                text-align: center;
                background: rgba(0, 10, 15, 0.95);
                border: 2px solid #00f2ff;
                padding: 50px;
                border-radius: 10px;
                box-shadow: 0 0 30px #00f2ff;
            `;
            
            const pauseTitle = document.createElement('h1');
            pauseTitle.textContent = '⏸ PAUSA';
            pauseTitle.style.cssText = `
                font-size: 3rem;
                color: #00f2ff;
                margin: 0 0 30px 0;
                text-shadow: 0 0 20px #00f2ff;
            `;
            
            const pauseSubtitle = document.createElement('p');
            pauseSubtitle.textContent = 'Presiona ESC para continuar';
            pauseSubtitle.style.cssText = `
                color: #888;
                font-size: 1rem;
                margin: 0;
                letter-spacing: 1px;
            `;
            
            pausePanel.appendChild(pauseTitle);
            pausePanel.appendChild(pauseSubtitle);
            pauseOverlay.appendChild(pausePanel);
            
            // Estilos
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pauseFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pauseFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            pauseOverlay.appendChild(style);
            
            document.body.appendChild(pauseOverlay);
            
            // Pausar música si existe
            if (window.MusicManager) {
                window.MusicManager.pause?.();
            }
            
            log('⏸ Juego pausado');
        } else {
            // Remover overlay de pausa
            if (overlay) {
                overlay.style.animation = 'pauseFadeOut 0.3s ease-out';
                setTimeout(() => overlay.remove(), 300);
            }
            
            // Reanudar música
            if (window.MusicManager) {
                window.MusicManager.resume?.();
            }
            
            log('▶ Juego reanudado');
        }
        
        return isGamePaused;
    }
    
    /**
     * Obtener estado de pausa
     */
    function isPaused() {
        return isGamePaused;
    }
    
    // =============================================
    // DYNAMIC AUDIO - Audio dinámico
    // =============================================
    
    /**
     * Reproducir efecto de sonido con variación
     */
    function playSoundEffect(frequency = 440, duration = 0.1, volume = 0.1) {
        try {
            const audioContext = window.MusicSynthesisEngine?.getAudioContext?.();
            if (!audioContext) return;
            
            const osc = audioContext.createOscillator();
            const env = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = frequency + (Math.random() - 0.5) * 100;
            
            env.gain.setValueAtTime(volume, audioContext.currentTime);
            env.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            osc.connect(env);
            env.connect(audioContext.destination);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + duration);
        } catch (e) {
            log(`⚠ No se pudo reproducir efecto: ${e.message}`);
        }
    }
    
    // =============================================
    // IMAGEN ANIMATION - Movimiento de imágenes
    // =============================================
    
    /**
     * Hacer que las imágenes se muevan como videos cortos
     * Añade desplazamiento y rotación suave
     */
    function animateImages() {
        const images = document.querySelectorAll('img, .game-sprite');
        
        images.forEach(img => {
            const startX = 0;
            const startY = 0;
            const moveRange = 5;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                
                // Movimiento sinusoidal suave
                const offsetX = Math.sin(elapsed * 0.5) * moveRange;
                const offsetY = Math.cos(elapsed * 0.7) * moveRange;
                const rotation = Math.sin(elapsed * 0.3) * 2;
                
                img.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        });
        
        log(`✓ ${images.length} imágenes animadas`);
    }
    
    // =============================================
    // INICIALIZACIÓN
    // =============================================
    
    /**
     * Inicializar todos los efectos visuales
     */
    function init() {
        log('Inicializando sistema de efectos visuales...');
        
        // Escuchar ESC para pausa
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                togglePause();
            }
        });
        
        // Mostrar loading screen al iniciar
        showLoadingScreen(5000);
        
        // Animar imágenes después de cargar
        setTimeout(() => {
            if (document.readyState === 'complete') {
                animateImages();
            }
        }, 1000);
        
        log('✓ Sistema de efectos inicializado');
    }
    
    // =============================================
    // EXPORT
    // =============================================
    
    return {
        shakeScreen,
        showLoadingScreen,
        togglePause,
        isPaused,
        playSoundEffect,
        animateImages,
        init,
        FRASES_EPICAS
    };
})();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
    VisualEffectsUI.init();
});
