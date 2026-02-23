/**
 * AI ANIMATION DECORATOR
 * ======================
 * Animaciones decorativas en los costados del menú
 * 
 * Características:
 * - Vista previa visual de cada sector
 * - Animaciones suaves sin interferir con controles
 * - Canvas decorativo
 * - Totalmente no interactivo
 */

const AIAnimationDecorator = {
    // Estado
    state: {
        showing: false,
        animationFrames: 0,
        canvases: {
            left: null,
            right: null
        },
        contexts: {
            left: null,
            right: null
        },
        particles: []
    },

    // Colores por sector
    sectorColors: {
        sector1: { primary: '#00f2ff', secondary: '#0099ff', accent: '#00ff66' },
        sector2: { primary: '#ff6600', secondary: '#ff3300', accent: '#ffcc00' },
        sector3: { primary: '#ff0044', secondary: '#ff00ff', accent: '#ff99ff' }
    },

    /**
     * Inicializar decoradores
     */
    init() {
        if (this.state.showing) return;

        this.state.showing = true;
        this.createCanvases();
        this.startAnimation();

        console.log('✓ AI Animation Decorator initialized');
    },

    /**
     * Crear canvas para animaciones
     */
    createCanvases() {
        // Canvas izquierda
        const leftContainer = document.createElement('div');
        leftContainer.id = 'ai-left-container';
        leftContainer.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 150px;
            height: 100vh;
            z-index: 30;
            pointer-events: none;
            background: linear-gradient(90deg, rgba(0,0,0,0.5), transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;

        const leftCanvas = document.createElement('canvas');
        leftCanvas.id = 'ai-left-canvas';
        leftCanvas.width = 150;
        leftCanvas.height = 720;
        leftCanvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;

        leftContainer.appendChild(leftCanvas);
        document.body.appendChild(leftContainer);

        // Canvas derecha
        const rightContainer = document.createElement('div');
        rightContainer.id = 'ai-right-container';
        rightContainer.style.cssText = `
            position: fixed;
            right: 0;
            top: 0;
            width: 150px;
            height: 100vh;
            z-index: 30;
            pointer-events: none;
            background: linear-gradient(-90deg, rgba(0,0,0,0.5), transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;

        const rightCanvas = document.createElement('canvas');
        rightCanvas.id = 'ai-right-canvas';
        rightCanvas.width = 150;
        rightCanvas.height = 720;
        rightCanvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;

        rightContainer.appendChild(rightCanvas);
        document.body.appendChild(rightContainer);

        // Guardar referencias
        this.state.canvases.left = leftCanvas;
        this.state.canvases.right = rightCanvas;
        this.state.contexts.left = leftCanvas.getContext('2d');
        this.state.contexts.right = rightCanvas.getContext('2d');
    },

    /**
     * Iniciar animación
     */
    startAnimation() {
        const animate = () => {
            this.state.animationFrames++;

            // Dibujar en canvas izquierda (Sector 1)
            this.drawSectorPreview(
                this.state.contexts.left,
                this.state.canvases.left,
                'sector1',
                'left'
            );

            // Dibujar en canvas derecha (alternating Sector 2 y 3)
            const sectorIndex = Math.floor(this.state.animationFrames / 180) % 2;
            const sector = sectorIndex === 0 ? 'sector2' : 'sector3';
            this.drawSectorPreview(
                this.state.contexts.right,
                this.state.canvases.right,
                sector,
                'right'
            );

            if (this.state.showing) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    /**
     * Dibujar vista previa de sector
     */
    drawSectorPreview(ctx, canvas, sector, side) {
        const colors = this.sectorColors[sector];
        const time = this.state.animationFrames * 0.02;

        // Limpiar canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar elementos decorativos según sector
        switch (sector) {
            case 'sector1':
                this.drawSector1Preview(ctx, canvas, colors, time);
                break;
            case 'sector2':
                this.drawSector2Preview(ctx, canvas, colors, time);
                break;
            case 'sector3':
                this.drawSector3Preview(ctx, canvas, colors, time);
                break;
        }

        // Dibujar etiqueta
        this.drawLabel(ctx, canvas, sector, colors);
    },

    /**
     * Vista previa de Sector 1
     */
    drawSector1Preview(ctx, canvas, colors, time) {
        ctx.save();

        // Círculos orbitales
        for (let i = 1; i <= 3; i++) {
            const angle = time * (0.02 * i);
            const radius = 20 + i * 15;

            ctx.strokeStyle = colors.primary;
            ctx.globalAlpha = 0.3 + Math.sin(time * 0.05 + i) * 0.2;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 - 100, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Punto en órbita
            const x = canvas.width / 2 + Math.cos(angle) * radius;
            const y = canvas.height / 2 - 100 + Math.sin(angle) * radius;

            ctx.fillStyle = colors.secondary;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Centro
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 100, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    /**
     * Vista previa de Sector 2
     */
    drawSector2Preview(ctx, canvas, colors, time) {
        ctx.save();

        // Líneas de energía
        for (let i = 0; i < 5; i++) {
            const yOffset = canvas.height / 2 - 100 + (i - 2) * 30;
            const waveAmount = Math.sin(time * 0.05 + i) * 15;

            ctx.strokeStyle = colors.primary;
            ctx.globalAlpha = 0.5 + Math.sin(time * 0.03 + i) * 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, yOffset);

            for (let x = 10; x <= canvas.width - 10; x += 10) {
                const wave = Math.sin(x * 0.02 + time * 0.05) * waveAmount;
                ctx.lineTo(x, yOffset + wave);
            }

            ctx.stroke();
        }

        // Pulsos de energía
        const pulseSize = 20 + Math.sin(time * 0.08) * 10;
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.7 + Math.sin(time * 0.08) * 0.2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 100, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    /**
     * Vista previa de Sector 3
     */
    drawSector3Preview(ctx, canvas, colors, time) {
        ctx.save();

        // Enemigos enemigos en formación
        const formationY = canvas.height / 2 - 100;
        const formation = 3;

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < formation; col++) {
                const x = canvas.width / 2 - 25 + col * 25;
                const y = formationY - 20 + row * 25;
                const bobOffset = Math.sin(time * 0.04 + row + col) * 5;

                // Cuerpo
                ctx.fillStyle = colors.primary;
                ctx.globalAlpha = 0.6 + Math.sin(time * 0.05 + col) * 0.3;
                ctx.beginPath();
                ctx.arc(x, y + bobOffset, 4, 0, Math.PI * 2);
                ctx.fill();

                // Aura
                ctx.strokeStyle = colors.secondary;
                ctx.globalAlpha = 0.4;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y + bobOffset, 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Boss en el centro
        const bossY = formationY + 50;
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const bossSize = 15 + Math.sin(time * 0.06) * 5;
        ctx.arc(canvas.width / 2, bossY, bossSize, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    },

    /**
     * Dibujar etiqueta del sector
     */
    drawLabel(ctx, canvas, sector, colors) {
        ctx.save();
        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = 0.8;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';

        const label = sector.replace('sector', 'S');
        ctx.fillText(label, canvas.width / 2, canvas.height - 20);

        ctx.restore();
    },

    /**
     * Detener animación
     */
    stop() {
        this.state.showing = false;
    },

    /**
     * Limpiar decoradores
     */
    cleanup() {
        const leftContainer = document.getElementById('ai-left-container');
        const rightContainer = document.getElementById('ai-right-container');

        if (leftContainer) leftContainer.remove();
        if (rightContainer) rightContainer.remove();

        this.state.showing = false;
    }
};

// Auto-inicializar cuando esté disponible
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Opcionalmente mostrar animaciones (descomenta si lo deseas)
        // AIAnimationDecorator.init();
    }, 500);
});

// Exportar globalmente
window.AIAnimationDecorator = AIAnimationDecorator;

console.log('✓ AI Animation Decorator loaded');
