/**
 * SISTEMA DE 20 COSMÉTICOS ÉPICOS
 * Cada cosmético personaliza la nave con efectos de partículas únicos
 * Los efectos se guardan en localStorage
 */

const CosmeticsSystem = (() => {
    const COSMETICS = {
        '0_classic': {
            name: 'Nave Clásica',
            color: '#00F2FF',
            effect: 'none',
            particles: false,
            description: 'La nave original de Exodus'
        },
        '1_inferno': {
            name: 'Infierno Rojo',
            color: '#FF0044',
            effect: 'fire_trail',
            particles: true,
            particleColor: '#FF6600',
            description: 'Estela de fuego cálida'
        },
        '2_neon_azure': {
            name: 'Neón Azul',
            color: '#00FFFF',
            effect: 'neon_trail',
            particles: true,
            particleColor: '#0099FF',
            description: 'Rastro de neón eléctrico'
        },
        '3_golden_star': {
            name: 'Estrella Dorada',
            color: '#FFD700',
            effect: 'gold_shimmer',
            particles: true,
            particleColor: '#FFED4E',
            description: 'Brillo dorado celestial'
        },
        '4_shadow_ghost': {
            name: 'Sombra Fantasmagórica',
            color: '#9900FF',
            effect: 'shadow_trail',
            particles: true,
            particleColor: '#DD00FF',
            description: 'Aura fantasmal púrpura'
        },
        '5_plasma_storm': {
            name: 'Tormenta de Plasma',
            color: '#00FF99',
            effect: 'plasma_burst',
            particles: true,
            particleColor: '#00FFCC',
            description: 'Descargas de plasma verde'
        },
        '6_dark_matter': {
            name: 'Materia Oscura',
            color: '#330099',
            effect: 'void_trail',
            particles: true,
            particleColor: '#6600FF',
            description: 'Absorción del espacio vacío'
        },
        '7_crystal_ice': {
            name: 'Cristal de Hielo',
            color: '#66CCFF',
            effect: 'ice_crystal',
            particles: true,
            particleColor: '#AAEEFF',
            description: 'Fragmentos congelados'
        },
        '8_solar_flare': {
            name: 'Llamarada Solar',
            color: '#FFAA00',
            effect: 'solar_trail',
            particles: true,
            particleColor: '#FFDD00',
            description: 'Calor solar intenso'
        },
        '9_void_echo': {
            name: 'Eco del Vacío',
            color: '#440044',
            effect: 'void_echo',
            particles: true,
            particleColor: '#AA00FF',
            description: 'Ecos dimensionales'
        },
        '10_lightning_strike': {
            name: 'Rayo Destructivo',
            color: '#FFFF00',
            effect: 'lightning_trail',
            particles: true,
            particleColor: '#88FF00',
            description: 'Descarga eléctrica continua'
        },
        '11_cosmic_dust': {
            name: 'Polvo Cósmico',
            color: '#0099CC',
            effect: 'cosmic_dust',
            particles: true,
            particleColor: '#00CCFF',
            description: 'Polvo de estrellas antiguos'
        },
        '12_emerald_aura': {
            name: 'Aura Esmeralda',
            color: '#00DD00',
            effect: 'emerald_glow',
            particles: true,
            particleColor: '#00FF66',
            description: 'Brillo esmeralda radiante'
        },
        '13_quantum_jump': {
            name: 'Salto Cuántico',
            color: '#FF00FF',
            effect: 'quantum_trail',
            particles: true,
            particleColor: '#FF00AA',
            description: 'Distorsión cuántica'
        },
        '14_titanium_core': {
            name: 'Núcleo de Titanio',
            color: '#CCCCCC',
            effect: 'metal_shine',
            particles: false,
            description: 'Blindaje metálico brillante'
        },
        '15_phoenix_fire': {
            name: 'Fuego Fénix',
            color: '#FF3300',
            effect: 'phoenix_trail',
            particles: true,
            particleColor: '#FF6600',
            description: 'Llamas del renacimiento'
        },
        '16_arctic_blizzard': {
            name: 'Ventisca Ártica',
            color: '#00EEFF',
            effect: 'blizzard_trail',
            particles: true,
            particleColor: '#00FFFF',
            description: 'Tormenta de nieve eterna'
        },
        '17_molten_core': {
            name: 'Núcleo Fundido',
            color: '#CC4400',
            effect: 'molten_trail',
            particles: true,
            particleColor: '#FF6600',
            description: 'Magma incandescente'
        },
        '18_mirage_shimmer': {
            name: 'Espejismo Luminoso',
            color: '#DD99FF',
            effect: 'mirage_trail',
            particles: true,
            particleColor: '#FF99DD',
            description: 'Destellos cambiantes'
        },
        '19_void_commander': {
            name: 'Comandante del Vacío',
            color: '#000099',
            effect: 'void_commander',
            particles: true,
            particleColor: '#4400FF',
            description: 'El poder supremo del vacío'
        }
    };

    let selectedCosmetic = localStorage.getItem('exodus_selected_cosmetic') || '0_classic';
    let particlesActive = {};

    // Inicializar cosméticos
    const init = () => {
        const saved = localStorage.getItem('exodus_selected_cosmetic');
        if (saved && COSMETICS[saved]) {
            selectedCosmetic = saved;
        }
        applyCosmetic(selectedCosmetic);
    };

    // Aplicar cosmético a la nave
    const applyCosmetic = (cosmeticId) => {
        if (!COSMETICS[cosmeticId]) return;

        const cosmetic = COSMETICS[cosmeticId];
        selectedCosmetic = cosmeticId;

        // Cambiar color de la nave
        const ships = document.querySelectorAll('.nave, .ship');
        ships.forEach(ship => {
            ship.style.filter = `drop-shadow(0 0 10px ${cosmetic.color})`;
            ship.style.color = cosmetic.color;
        });

        // Guardar en localStorage
        localStorage.setItem('exodus_selected_cosmetic', cosmeticId);
        localStorage.setItem('exodus_cosmetic_color', cosmetic.color);

        // Activar partículas si están disponibles
        if (cosmetic.particles) {
            startParticleEffect(cosmeticId, cosmetic);
        }
    };

    // Efecto de partículas
    const startParticleEffect = (cosmeticId, cosmetic) => {
        if (particlesActive[cosmeticId]) return;

        particlesActive[cosmeticId] = true;

        // Función que ejecuta el efecto cada frame
        const shipElement = document.querySelector('.nave') || document.querySelector('.ship');
        if (!shipElement) return;

        const particleEffect = () => {
            if (!particlesActive[cosmeticId]) return;

            const rect = shipElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Crear partícula
            const particle = document.createElement('div');
            particle.className = 'cosmetic-particle';
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = cosmetic.particleColor;
            particle.style.boxShadow = `0 0 10px ${cosmetic.particleColor}`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10';
            particle.style.animation = 'cosmetic-float 1s ease-out forwards';

            document.body.appendChild(particle);

            // Remover después de la animación
            setTimeout(() => particle.remove(), 1000);

            // Siguiente partícula
            if (particlesActive[cosmeticId]) {
                setTimeout(() => particleEffect(), 50);
            }
        };

        particleEffect();
    };

    // Detener efecto de partículas
    const stopParticleEffect = (cosmeticId) => {
        particlesActive[cosmeticId] = false;
    };

    // Crear UI de selección
    const createCosmeticsUI = () => {
        const cosmeticsDialog = document.createElement('div');
        cosmeticsDialog.id = 'cosmetics-dialog';
        cosmeticsDialog.className = 'cosmetics-modal';

        let gridHtml = '<div class="cosmetics-grid">';
        Object.entries(COSMETICS).forEach(([id, cosmetic]) => {
            const isSelected = id === selectedCosmetic ? 'selected' : '';
            gridHtml += `
                <div class="cosmetic-slot ${isSelected}" onclick="CosmeticsSystem.selectCosmetic('${id}')">
                    <div class="cosmetic-preview" style="background: linear-gradient(120deg, ${cosmetic.color}, #000);">
                        <div class="cosmetic-icon">✦</div>
                    </div>
                    <div class="cosmetic-name">${cosmetic.name}</div>
                    <div class="cosmetic-desc">${cosmetic.description}</div>
                </div>
            `;
        });
        gridHtml += '</div>';

        cosmeticsDialog.innerHTML = `
            <div class="cosmetics-overlay">
                <div class="cosmetics-container">
                    <h2>🌌 HANGAR DE ESTILO 🌌</h2>
                    <p>Selecciona un cosmético para personalizar tu nave</p>
                    ${gridHtml}
                    <button class="btn btn-secondary" onclick="document.getElementById('cosmetics-dialog').style.display='none'">CERRAR</button>
                </div>
            </div>
        `;

        document.body.appendChild(cosmeticsDialog);
    };

    // Seleccionar cosmético
    const selectCosmetic = (cosmeticId) => {
        // Detener efecto anterior
        const prevCosmetic = COSMETICS[selectedCosmetic];
        if (prevCosmetic && prevCosmetic.particles) {
            stopParticleEffect(selectedCosmetic);
        }

        // Actualizar UI
        document.querySelectorAll('.cosmetic-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        event.currentTarget.closest('.cosmetic-slot').classList.add('selected');

        // Aplicar nuevo cosmético
        applyCosmetic(cosmeticId);
    };

    // Obtener cosmético actual
    const getSelectedCosmetic = () => {
        return COSMETICS[selectedCosmetic];
    };

    // Obtener todos los cosméticos
    const getAllCosmetics = () => {
        return COSMETICS;
    };

    return {
        init,
        applyCosmetic,
        selectCosmetic,
        getSelectedCosmetic,
        getAllCosmetics,
        createCosmeticsUI,
        startParticleEffect,
        stopParticleEffect
    };
})();

// Exportar para uso global
window.CosmeticsSystem = CosmeticsSystem;
