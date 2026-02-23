/**
 * DONATION SYSTEM - FIXED AND IMPROVED
 * ===================================
 * Sistema de donación mejorado con alias visible
 * Funcionalidad completa: mostrar modal → ingresar monto → confirmar → guardar
 * 
 * ALIAS: gasa.borde.disques.mp (papá)
 */

window.DonationSystem = {
    config: {
        alias: 'gasa.borde.disques.mp',
        minAmount: 5,
        maxAmount: 100000,
        currency: 'ARS'
    },

    /**
     * Mostrar modal de donación
     */
    showModal() {
        console.log('📢 Opening donation modal...');
        
        const modal = document.getElementById('donation-modal');
        if (!modal) {
            console.error('❌ Modal element not found!');
            return;
        }

        // Limpiar campo de entrada
        const input = document.getElementById('custom-donation-amount');
        if (input) {
            input.value = '';
        }

        // Mostrar modal
        modal.style.display = 'flex';
        console.log('✅ Donation modal shown');
    },

    /**
     * Cerrar modal de donación
     */
    closeModal() {
        console.log('📢 Closing donation modal...');
        
        const modal = document.getElementById('donation-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Limpiar input
        const input = document.getElementById('custom-donation-amount');
        if (input) {
            input.value = '';
        }

        console.log('✅ Donation modal closed');
    },

    /**
     * Procesar donación - Se llama al hacer click en ENVIAR o en opciones
     */
    processDonation(amount) {
        console.log(`💰 Processing donation: $${amount}`);

        // Convertir a número si es string
        amount = parseInt(amount) || 0;

        // Validaciones
        if (!amount || amount <= 0) {
            this.showAlert('⚠️ ERROR', `Ingresa un monto válido (mínimo $${this.config.minAmount})`);
            return;
        }

        if (amount < this.config.minAmount) {
            this.showAlert('⚠️ MONTO BAJO', `Monto mínimo: $${this.config.minAmount} ARS`);
            return;
        }

        if (amount > this.config.maxAmount) {
            this.showAlert('⚠️ MONTO ALTO', `Monto máximo: $${this.config.maxAmount} ARS`);
            return;
        }

        // Confirmación
        const confirmed = confirm(
            `✅ CONFIRMAR DONACIÓN\n\n` +
            `Monto: $${amount} ARS\n` +
            `Alias: ${this.config.alias}\n\n` +
            `¿Deseas continuar?`
        );

        if (!confirmed) {
            console.log('❌ Donation cancelled by user');
            return;
        }

        // Guardar donación
        this.recordDonation(amount);

        // Mostrar confirmación final
        this.showConfirmation(amount);

        // Cerrar modal
        this.closeModal();

        // Mostrar mensaje de éxito con animación
        this.showSuccessMessage(amount);

        console.log(`✅ Donation processed successfully: $${amount}`);
    },

    /**
     * Mostrar alerta personalizada
     */
    showAlert(title, message) {
        console.warn(`${title} ${message}`);
        alert(`${title}\n${message}`);
    },

    /**
     * Mostrar confirmación final
     */
    showConfirmation(amount) {
        const msg =
            `✅ DONACIÓN REGISTRADA\n\n` +
            `💵 Monto: $${amount} ARS\n` +
            `🏦 Alias MercadoPago:\n${this.config.alias}\n\n` +
            `¡Gracias por tu apoyo, Piloto!`;

        alert(msg);
    },

    /**
     * Guardar en localStorage
     */
    recordDonation(amount) {
        try {
            let donations = JSON.parse(localStorage.getItem('exodus_donations') || '[]');

            donations.push({
                amount: amount,
                date: new Date().toISOString(),
                alias: this.config.alias
            });

            localStorage.setItem('exodus_donations', JSON.stringify(donations));
            console.log(`💾 Donation saved to localStorage: $${amount}`);
        } catch (e) {
            console.error('❌ Error saving donation:', e);
        }
    },

    /**
     * Notificación de éxito con animación
     */
    showSuccessMessage(amount) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00ff66 0%, #00f2ff 100%);
            color: #000;
            padding: 40px 60px;
            border-radius: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 1.3rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(0, 255, 102, 0.7), 0 0 100px rgba(0, 242, 255, 0.5);
            border: 2px solid rgba(0, 255, 255, 0.8);
            animation: donationIn 0.5s ease-out, donationOut 0.5s ease-in 2.5s forwards;
        `;

        const text = `✅ ¡DONACIÓN EXITOSA!\n$${amount} ARS\n${this.config.alias}`;
        notification.innerHTML = text.replace(/\n/g, '<br>');

        // Agregar animaciones CSS
        const style = document.createElement('style');
        style.id = 'donation-success-animations';
        style.textContent = `
            @keyframes donationIn {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            @keyframes donationOut {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
        `;

        if (!document.getElementById('donation-success-animations')) {
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * Obtener total de donaciones acumuladas
     */
    getTotalDonations() {
        try {
            const donations = JSON.parse(localStorage.getItem('exodus_donations') || '[]');
            return donations.reduce((sum, d) => sum + d.amount, 0);
        } catch (e) {
            console.warn('Error getting total donations:', e);
            return 0;
        }
    },

    /**
     * Obtener historial completo de donaciones
     */
    getDonationHistory() {
        try {
            return JSON.parse(localStorage.getItem('exodus_donations') || '[]');
        } catch (e) {
            console.warn('Error getting donation history:', e);
            return [];
        }
    },

    /**
     * Obtener estado del sistema
     */
    getStatus() {
        return {
            enabled: true,
            alias: this.config.alias,
            minAmount: this.config.minAmount,
            maxAmount: this.config.maxAmount,
            totalDonated: this.getTotalDonations(),
            donationCount: this.getDonationHistory().length
        };
    }
};

// ===== FUNCIONES GLOBALES PARA HTML =====
window.showDonationModal = () => {
    console.log('🎯 Button clicked: showDonationModal');
    window.DonationSystem.showModal();
};

window.closeDonationModal = () => {
    console.log('🎯 Button clicked: closeDonationModal');
    window.DonationSystem.closeModal();
};

window.processDonation = (amount) => {
    console.log(`🎯 Button clicked: processDonation(${amount})`);
    window.DonationSystem.processDonation(amount);
};

// ===== INICIALIZACIÓN =====
console.log('✅ Donation System v2.0 loaded');
console.log(`   Alias: ${window.DonationSystem.config.alias}`);
console.log(`   Range: $${window.DonationSystem.config.minAmount} - $${window.DonationSystem.config.maxAmount} ARS`);
