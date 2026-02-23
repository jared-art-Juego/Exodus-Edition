/**
 * DONATORS SYSTEM
 * ===============
 * Gestiona la lista de donadores/supporters
 * 
 * Estructura:
 * - Solo nombres reales de donadores
 * - Cantidad de donación (opcional)
 * - Almacenamiento local
 * - Sin placeholders genéricos
 */

const DonatorsSystem = {
    // Datos de donadores
    donators: [
        // Agregar donadores reales aquí con la estructura:
        // { name: "Nombre", amount: 100, date: "2026-02-23" }
    ],

    /**
     * Agregar nuevo donador
     */
    addDonator(name, amount = 0, date = null) {
        if (!name || name.trim().length === 0) return false;

        const donator = {
            name: name.trim(),
            amount: amount > 0 ? amount : 0,
            date: date || new Date().toISOString().split('T')[0]
        };

        this.donators.push(donator);
        this.sort();
        this.save();

        console.log(`✓ Donator added: ${name}`);
        return true;
    },

    /**
     * Obtener todos los donadores
     */
    getDonators() {
        return [...this.donators];
    },

    /**
     * Obtener cantidad de donadores
     */
    getCount() {
        return this.donators.length;
    },

    /**
     * Verificar si hay donadores
     */
    hasDonators() {
        return this.donators.length > 0;
    },

    /**
     * Ordenar donadores por cantidad descendente
     */
    sort() {
        this.donators.sort((a, b) => {
            if (a.amount !== b.amount) {
                return b.amount - a.amount;
            }
            return a.name.localeCompare(b.name);
        });
    },

    /**
     * Guardar a localStorage
     */
    save() {
        try {
            localStorage.setItem('exodus_donators', JSON.stringify(this.donators));
        } catch (e) {
            console.warn('Could not save donators to localStorage:', e);
        }
    },

    /**
     * Cargar desde localStorage
     */
    load() {
        try {
            const data = localStorage.getItem('exodus_donators');
            if (data) {
                this.donators = JSON.parse(data);
                this.sort();
                console.log(`✓ Loaded ${this.donators.length} donators from storage`);
            }
        } catch (e) {
            console.warn('Could not load donators from localStorage:', e);
        }
    },

    /**
     * Renderizar lista de donadores en HTML
     */
    renderLegendsList() {
        const container = document.getElementById('legends-list');
        if (!container) return;

        if (!this.hasDonators()) {
            container.innerHTML = `
                <p style="color: #888; font-size: 0.9rem; margin: 30px 0;">
                    Gracias por tu apoyo, Piloto.<br/>
                    Sé el primero en apoyar esta misión.
                </p>
            `;
            return;
        }

        let html = '';
        this.donators.forEach((donator, index) => {
            const rank = index + 1;
            const amountText = donator.amount > 0 ? ` • $${donator.amount} ARS` : '';
            const dateText = donator.date ? ` • ${donator.date}` : '';

            html += `
                <div class="legend-item">
                    <span class="legend-rank">#${rank}</span>
                    <span style="color: var(--green); font-weight: bold; font-size: 1.1rem;">${donator.name}</span>
                    <span class="legend-score">${amountText}</span>
                    <span class="legend-date">${dateText}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Inicializar sistema
     */
    init() {
        this.load();
        // Renderizar lista al cargar
        setTimeout(() => {
            this.renderLegendsList();
        }, 500);

        console.log('✓ Donators System initialized');
    }
};

// Auto-inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    DonatorsSystem.init();
});

// Exportar globalmente
window.DonatorsSystem = DonatorsSystem;

console.log('✓ Donators System loaded');
