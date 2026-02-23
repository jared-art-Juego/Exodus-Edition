/**
 * SISTEMA DE INICIALIZACIÓN Y COORDINACIÓN
 * Coordina: Cosméticos, YouTube Player, Memorial, Donación
 */

const GameInitializer = (() => {
    // Inicializar sistemas
    const init = () => {
        console.log('🚀 Inicializando EXODUS EDITION...');

        // Inicializar cosméticos
        setTimeout(() => {
            if (window.CosmeticsSystem) {
                CosmeticsSystem.init();
                console.log('✓ Cosméticos iniciados');
            }
        }, 500);

        // Inicializar YouTube Player
        setTimeout(() => {
            if (window.YouTubePlayer) {
                YouTubePlayer.init();
                console.log('✓ YouTube Player iniciado');
            }
        }, 1000);

        // Cargar leyendas al menú
        setTimeout(() => {
            loadLegendsToMenu();
            console.log('✓ Leyendas cargadas');
        }, 1500);

        // Funciones de donación globales
        window.showDonationModal = () => {
            const modal = document.getElementById('donation-modal');
            if (modal) modal.style.display = 'flex';
        };

        window.closeDonationModal = () => {
            const modal = document.getElementById('donation-modal');
            if (modal) modal.style.display = 'none';
        };

        window.processDonation = (amount) => {
            console.log(`¡Gracias por tu donación de $${amount} ARS! ❤️`);
            alert(`¡Gracias por tu donación de $${amount} ARS! Tu apoyo es invaluable para nosotros.`);
            window.closeDonationModal();
        };

        // Reparar imagen de inicio con fallback a Canvas
        fixStartupImage();

        console.log('✅ EXODUS EDITION listo para despegar!');
    };

    // Cargar leyendas al menú
    const loadLegendsToMenu = () => {
        const legendsList = document.getElementById('legends-list');
        if (!legendsList) return;

        const legends = MemorialSystem.getLegends();

        if (legends.length === 0) {
            legendsList.innerHTML = '<p style="color: #888; font-size: 0.9rem;">No hay leyendas aún. ¡Crea la tuya!</p>';
            return;
        }

        let html = '';
        legends.forEach((legend, idx) => {
            const date = new Date(legend.date).toLocaleDateString('es-AR');
            html += `
                <div class="legend-item">
                    <div>
                        <span class="legend-rank" style="background: ${RankSystem.RANK_COLORS[legend.rank]}">${legend.rank}</span>
                        <span class="legend-score">Score: ${legend.score}</span>
                    </div>
                    <div style="margin-top: 8px;">
                        <span style="color: #aaa;">Enemigos: ${legend.stats.enemiesDefeated} | Jefes: ${legend.stats.bossesDefeated} | Tiempo: ${Math.floor(legend.stats.playTimeSeconds / 60)}m</span>
                    </div>
                    <div class="legend-date">${date}</div>
                </div>
            `;
        });

        legendsList.innerHTML = html;
    };

    // Reparar y animar imagen de inicio
    const fixStartupImage = () => {
        const introImage = document.querySelector('#intro-cinematic img');
        if (!introImage) return;

        // Crear imagen con fallback
        introImage.style.opacity = '0';
        introImage.style.transition = 'opacity 3s ease-in';

        // Intentar cargar imagen
        const img = new Image();
        img.onload = () => {
            introImage.style.opacity = '1';
            console.log('✓ Imagen de inicio cargada');
        };

        img.onerror = () => {
            console.log('⚠️ Imagen no encontrada, generando fondo de Canvas...');
            generateStarField();
        };

        img.src = 'media/inicio.png';
        introImage.src = img.src;
    };

    // Generar campo de estrellas si falla la imagen
    const generateStarField = () => {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        // Fondo oscuro
        ctx.fillStyle = '#001a33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generar estrellas
        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.5 + 0.5
            });
        }

        // Dibujar estrellas
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 200, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            ctx.fillStyle = `rgba(100, 150, 255, ${star.opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Reemplazar img con canvas
        const image = document.querySelector('#intro-cinematic img');
        if (image) {
            image.style.display = 'none';
            image.parentElement.insertBefore(canvas, image);
            canvas.style.animation = 'fadeIn 2s ease-in';
        }
    };

    return {
        init,
        loadLegendsToMenu
    };
})();

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GameInitializer.init();
    });
} else {
    GameInitializer.init();
}

window.GameInitializer = GameInitializer;
