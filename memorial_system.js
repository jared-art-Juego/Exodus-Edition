/**
 * MEMORIAL ÉPICO - Sistema de Estadísticas Holográficas y Timeline Cinematográfico
 * Muestra un Game Over impresionante con:
 * - Tarjeta de rango con glow effect
 * - Timeline de hitos de la partida
 * - Fondo de partículas doradas
 * - Efecto typing en el timeline
 */

const MemorialSystem = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationId = null;
    let isRunning = false;

    // Inicializar canvas de partículas
    const initParticleCanvas = () => {
        const container = document.getElementById('memorial-particles');
        if (!container) return;

        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '190';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        ctx = canvas.getContext('2d');
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    };

    // Crear partículas de chispas doradas
    const createGoldenSparks = (count = 100) => {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height + 20,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4 - 1,
                life: 1,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    };

    // Animar partículas
    const animateParticles = () => {
        if (!ctx) return;

        // Limpiar canvas con fade trail
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Actualizar y dibujar partículas
        particles = particles.filter(p => p.life > 0);

        particles.forEach((p, i) => {
            p.y += p.vy;
            p.x += p.vx;
            p.life -= 0.01;
            p.vy -= 0.05; // Gravedad inversa (suben)
            p.vy *= 0.98; // Fricción

            // Dibujar partícula con glow dorado
            const brightness = Math.round(p.life * 255);
            ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity * p.life})`;
            ctx.shadowColor = `rgba(255, 215, 0, ${p.opacity * p.life})`;
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Trail de polvo
            ctx.fillStyle = `rgba(200, 200, 0, ${p.opacity * p.life * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x - p.vx, p.y - p.vy, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowColor = 'transparent';

        if (particles.length > 0 || isRunning) {
            animationId = requestAnimationFrame(animateParticles);
        }
    };

    // Crear elemento de estadísticas holográficas
    const createStatsCard = (rankData) => {
        const statsHtml = `
            <div class="memorial-card">
                <div class="rank-display">
                    <div class="rank-value" style="color: ${rankData.color}; text-shadow: 0 0 30px ${rankData.color};">
                        ${rankData.rank}
                    </div>
                    <div class="rank-score">SCORE: ${rankData.score}/1000</div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">PRECISIÓN</div>
                        <div class="stat-value">${rankData.stats.accuracy}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">ENEMIGOS</div>
                        <div class="stat-value">${rankData.stats.enemiesDefeated}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">JEFES</div>
                        <div class="stat-value">${rankData.stats.bossesDefeated}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">COMBO MAX</div>
                        <div class="stat-value">${rankData.stats.maxCombo}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">TIEMPO</div>
                        <div class="stat-value">${Math.floor(rankData.stats.playTimeSeconds / 60)}:${String(rankData.stats.playTimeSeconds % 60).padStart(2, '0')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">DAÑO RECIBIDO</div>
                        <div class="stat-value">${rankData.stats.damageReceived}</div>
                    </div>
                </div>

                <div class="rank-description">
                    ${RankSystem.getGradeDescription(rankData.rank)}
                </div>
            </div>
        `;
        return statsHtml;
    };

    // Crear timeline con efecto typing
    const createTimeline = (milestones) => {
        let timelineHtml = '<div class="memorial-timeline">';

        milestones.forEach((milestone, idx) => {
            const delay = idx * 200; // Retraso entre cada evento
            timelineHtml += `
                <div class="timeline-item" style="animation-delay: ${delay}ms;">
                    <div class="timeline-time">${milestone.time}</div>
                    <div class="timeline-text" data-text="${milestone.text}"></div>
                </div>
            `;
        });

        timelineHtml += '</div>';
        return timelineHtml;
    };

    // Animar efecto typing
    const animateTyping = () => {
        const typingElements = document.querySelectorAll('.timeline-text[data-text]');
        typingElements.forEach((el, idx) => {
            const text = el.getAttribute('data-text');
            let index = 0;
            const delay = idx * 300;

            setTimeout(() => {
                const typeInterval = setInterval(() => {
                    if (index < text.length) {
                        el.textContent += text[index];
                        index++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 30);
            }, delay);
        });
    };

    // Mostrar pantalla de Memorial
    const showMemorial = (gameStats, milestones) => {
        isRunning = true;

        // Crear contenedor si no existe
        let memorialDiv = document.getElementById('memorial-screen');
        if (!memorialDiv) {
            memorialDiv = document.createElement('div');
            memorialDiv.id = 'memorial-screen';
            document.body.appendChild(memorialDiv);
        }

        // Crear canvas de partículas
        let particlesDiv = document.getElementById('memorial-particles');
        if (!particlesDiv) {
            particlesDiv = document.createElement('div');
            particlesDiv.id = 'memorial-particles';
            particlesDiv.style.position = 'fixed';
            particlesDiv.style.inset = '0';
            particlesDiv.style.zIndex = '190';
            particlesDiv.style.pointerEvents = 'none';
            document.body.appendChild(particlesDiv);
        }

        // Calcular rango
        const rankData = RankSystem.calculateRank(gameStats);

        // Construir HTML
        const statsCard = createStatsCard(rankData);
        const timeline = createTimeline(milestones);

        memorialDiv.innerHTML = `
            <div class="memorial-overlay">
                <div class="memorial-content">
                    ${statsCard}
                    ${timeline}
                    <div class="memorial-buttons">
                        <button class="btn btn-secondary" onclick="MemorialSystem.closeMemorial()">CONTINUAR</button>
                        <button class="btn btn-secondary" onclick="MemorialSystem.saveLegend('${rankData.rank}', ${rankData.score})">GUARDAR LEYENDA</button>
                    </div>
                </div>
            </div>
        `;

        memorialDiv.style.display = 'flex';

        // Iniciar animaciones
        if (!canvas) {
            initParticleCanvas();
        }
        createGoldenSparks(150);
        animateParticles();
        
        // Pequeño delay para que el DOM esté listo
        setTimeout(() => {
            animateTyping();
        }, 100);

        // Guardar a localStorage automáticamente
        saveLegend(rankData.rank, rankData.score, gameStats);
    };

    // Guardar leyenda en localStorage (top 5)
    const saveLegend = (rank, score, gameStats) => {
        let legends = JSON.parse(localStorage.getItem('exodus_legends') || '[]');

        legends.push({
            rank,
            score,
            date: new Date().toLocaleString('es-AR'),
            stats: gameStats
        });

        // Ordenar por score descendente y mantener top 5
        legends.sort((a, b) => b.score - a.score);
        legends = legends.slice(0, 5);

        localStorage.setItem('exodus_legends', JSON.stringify(legends));

        return legends;
    };

    // Cargar leyendas
    const getLegends = () => {
        return JSON.parse(localStorage.getItem('exodus_legends') || '[]');
    };

    // Cerrar memorial
    const closeMemorial = () => {
        isRunning = false;
        const memorialDiv = document.getElementById('memorial-screen');
        if (memorialDiv) {
            memorialDiv.style.display = 'none';
        }
        const particlesDiv = document.getElementById('memorial-particles');
        if (particlesDiv && canvas) {
            canvas.remove();
            canvas = null;
            ctx = null;
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };

    return {
        showMemorial,
        saveLegend,
        getLegends,
        closeMemorial,
        initParticleCanvas
    };
})();

// Exportar para uso global
window.MemorialSystem = MemorialSystem;
