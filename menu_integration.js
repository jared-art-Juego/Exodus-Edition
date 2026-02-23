/**
 * INTEGRACIÓN DE UI - Cosméticos en el Menú
 * Popula el grid de cosméticos con los 20 opciones disponibles
 */

const MenuIntegration = (() => {
    const populateCosmeticsMenu = () => {
        const panel = document.getElementById('cosmetics-panel');
        if (!panel || !window.CosmeticsSystem) return;

        const cosmetics = CosmeticsSystem.getAllCosmetics();
        let html = '';

        Object.entries(cosmetics).forEach(([id, cosmetic]) => {
            html += `
                <div class="cosmetic-slot" onclick="CosmeticsSystem.selectCosmetic('${id}'); this.closest('.cosmetic-slot').classList.add('selected');">
                    <div class="cosmetic-preview" style="background: linear-gradient(120deg, ${cosmetic.color}, #000); border-color: ${cosmetic.color};">
                        <div class="cosmetic-icon">✦</div>
                    </div>
                    <div class="cosmetic-name">${cosmetic.name}</div>
                    <div class="cosmetic-desc">${cosmetic.description}</div>
                </div>
            `;
        });

        panel.innerHTML = html;

        // Marcar el seleccionado actualmente
        const selected = CosmeticsSystem.getSelectedCosmetic();
        const slots = panel.querySelectorAll('.cosmetic-slot');
        slots.forEach(slot => {
            const name = slot.querySelector('.cosmetic-name').textContent;
            if (name === selected.name) {
                slot.classList.add('selected');
            }
        });
    };

    const init = () => {
        // Esperar a que CosmeticsSystem esté disponible
        if (!window.CosmeticsSystem) {
            setTimeout(init, 500);
            return;
        }

        populateCosmeticsMenu();
    };

    return {
        init,
        populateCosmeticsMenu
    };
})();

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => MenuIntegration.init(), 500);
    });
} else {
    setTimeout(() => MenuIntegration.init(), 500);
}

window.MenuIntegration = MenuIntegration;
