/**
 * CREDITS SYSTEM
 * ==============
 * Pantalla de créditos al completar sectores
 * 
 * Características:
 * - Scroll vertical suave
 * - Música de créditos
 * - Nombre del creador
 * - Lista de canciones utilizadas
 * - Agradecimientos finales
 */

const CreditsSystem = {
    // Estado
    state: {
        showing: false,
        scrollPosition: 0,
        maxScroll: 0,
        scrollSpeed: 1.5,
        autoScrollActive: true,
        startTime: 0,
        duration: 30000 // 30 segundos de créditos
    },

    // Datos de créditos
    credits: {
        title: 'CREDITS',
        sections: [
            {
                title: '🎮 VECTOR EXODUS: EXODUS EDITION 🎮',
                content: 'Una experiencia épica de combate espacial',
                delay: 0
            },
            {
                title: 'CREADO POR',
                content: 'Jared',
                delay: 3000,
                highlight: true
            },
            {
                title: 'MÚSICA UTILIZADA',
                content: [
                    'menu_theme.mp3',
                    'sector1_music.mp3',
                    'sector2_music.mp3',
                    'sector3_music.mp3',
                    'victory_theme.mp3',
                    'defeat_theme.mp3'
                ],
                delay: 6000
            },
            {
                title: 'TECNOLOGÍA',
                content: [
                    'Electron - Desktop Framework',
                    'HTML5 Canvas - Rendering',
                    'Web Audio API - Sound',
                    'Vanilla JavaScript - Game Logic'
                ],
                delay: 12000
            },
            {
                title: 'AGRADECIMIENTO ESPECIAL',
                content: 'A todos los pilotos que se atrevieron\na viajar al corazón de Exodus.\n\n¡Gracias por jugar!',
                delay: 18000,
                highlight: true
            },
            {
                title: 'FIN',
                content: 'PRESIONA ESPACIO PARA CONTINUAR',
                delay: 24000,
                highlight: true
            }
        ]
    },

    /**
     * Mostrar pantalla de créditos
     */
    show() {
        if (this.state.showing) return;

        this.state.showing = true;
        this.state.scrollPosition = 0;
        this.state.startTime = Date.now();
        this.state.autoScrollActive = true;

        // Crear overlay de créditos
        let creditsOverlay = document.getElementById('credits-overlay');
        if (!creditsOverlay) {
            creditsOverlay = document.createElement('div');
            creditsOverlay.id = 'credits-overlay';
            creditsOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 250;
                background: linear-gradient(180deg, #000 0%, #001a33 50%, #000 100%);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-family: 'Orbitron', monospace;
            `;
            document.body.appendChild(creditsOverlay);
        } else {
            creditsOverlay.style.display = 'flex';
        }

        // Crear contenedor de scroll
        let creditsList = document.getElementById('credits-list');
        if (!creditsList) {
            creditsList = document.createElement('div');
            creditsList.id = 'credits-list';
            creditsList.style.cssText = `
                width: 100%;
                height: 100%;
                overflow: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 100vh 40px 100vh 40px;
                transform: translateY(0);
                transition: transform 0.05s linear;
            `;
            creditsOverlay.appendChild(creditsList);
        } else {
            creditsList.innerHTML = '';
        }

        // Generar contenido de créditos
        this.credits.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.cssText = `
                margin: 60px 0;
                text-align: center;
                opacity: 0;
                animation: fadeInCredit 2s ease-in-out forwards;
                animation-delay: ${section.delay}ms;
                max-width: 600px;
            `;

            // Título
            const title = document.createElement('h2');
            title.style.cssText = `
                color: ${section.highlight ? '#ff0044' : '#00f2ff'};
                font-size: ${section.highlight ? '2.5rem' : '1.8rem'};
                margin: 0 0 15px 0;
                text-shadow: 0 0 ${section.highlight ? '20px' : '10px'} ${section.highlight ? '#ff0044' : '#00f2ff'};
                font-weight: bold;
            `;
            title.textContent = section.title;
            sectionDiv.appendChild(title);

            // Contenido
            if (typeof section.content === 'string') {
                const p = document.createElement('p');
                p.style.cssText = `
                    color: #aaa;
                    font-size: 1rem;
                    line-height: 1.8;
                    margin: 0;
                `;
                p.textContent = section.content;
                sectionDiv.appendChild(p);
            } else if (Array.isArray(section.content)) {
                section.content.forEach(item => {
                    const li = document.createElement('p');
                    li.style.cssText = `
                        color: #aaa;
                        font-size: 0.9rem;
                        line-height: 1.6;
                        margin: 5px 0;
                    `;
                    li.textContent = '• ' + item;
                    sectionDiv.appendChild(li);
                });
            }

            creditsList.appendChild(sectionDiv);
        });

        // Agregar estilos de animación
        if (!document.getElementById('credits-style')) {
            const style = document.createElement('style');
            style.id = 'credits-style';
            style.textContent = `
                @keyframes fadeInCredit {
                    0% { opacity: 0; transform: translateY(20px); }
                    50% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                
                #credits-overlay::-webkit-scrollbar {
                    width: 8px;
                }
                
                #credits-overlay::-webkit-scrollbar-track {
                    background: rgba(0, 242, 255, 0.1);
                }
                
                #credits-overlay::-webkit-scrollbar-thumb {
                    background: rgba(0, 242, 255, 0.5);
                    border-radius: 4px;
                }
                
                #credits-overlay::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 242, 255, 0.8);
                }
            `;
            document.head.appendChild(style);
        }

        // Reproducir música de créditos
        if (window.AudioManager) {
            window.AudioManager.playVictoryMusic();
        }

        // Registrar teclas
        this._registerKeyHandlers();

        console.log('✓ Credits screen shown');
    },

    /**
     * Ocultar pantalla de créditos
     */
    hide() {
        const overlay = document.getElementById('credits-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.state.showing = false;
        this.state.autoScrollActive = false;
        console.log('✓ Credits screen hidden');
    },

    /**
     * Registrar manejadores de teclas
     */
    _registerKeyHandlers() {
        const handleKey = (e) => {
            if (this.state.showing) {
                if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                    e.preventDefault();
                    this.hide();
                    // Volver al menú
                    if (window.Game && window.Game.resetGame) {
                        window.Game.resetGame();
                    }
                    document.removeEventListener('keydown', handleKey);
                }
            }
        };
        document.addEventListener('keydown', handleKey);
    },

    /**
     * Reproducir créditos automáticos
     * Llamar esto después de completar un sector
     */
    playAutomaticCredits() {
        this.show();
        
        // Auto-scroll a través de los créditos
        const creditsList = document.getElementById('credits-list');
        if (creditsList) {
            let scrollAmount = 0;
            const scrollInterval = setInterval(() => {
                scrollAmount += this.state.scrollSpeed;
                creditsList.parentElement.scrollTop = scrollAmount;

                // Detener al final
                if (scrollAmount >= creditsList.scrollHeight) {
                    clearInterval(scrollInterval);
                    setTimeout(() => {
                        this.hide();
                        if (window.Game && window.Game.resetGame) {
                            window.Game.resetGame();
                        }
                    }, 3000);
                }
            }, 50);
        }
    },

    /**
     * Verificar si está mostrando créditos
     */
    isShowing() {
        return this.state.showing;
    }
};

// Exportar globalmente
window.CreditsSystem = CreditsSystem;

console.log('✓ Credits System loaded');
