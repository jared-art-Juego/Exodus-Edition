/**
 * FRAGMENT SYSTEM - Progresión Permanente Entre Sectores
 * Los fragmentos se ganan al completar sectores y se usan en el Árbol de Habilidades
 */

window.FragmentSystem = {
    fragments: 0,
    fragmentsThisSector: 0,
    
    // Fragmentos por sector
    fragmentsByProblem: {
        1: 4,
        2: 4,
        3: 4,
        4: 4,
        5: 4,
        6: 4
    },
    
    init() {
        this.fragments = 0;
        this.fragmentsThisSector = 0;
    },
    
    /**
     * Registra los fragmentos ganados al completar un sector
     */
    completeWave(sector) {
        const amount = this.fragmentsByProblem[sector] || 5;
        this.fragmentsThisSector = amount;
        return amount;
    },
    
    /**
     * Agregar fragmentos definitivamente
     */
    addFragments(amount) {
        this.fragments += amount;
        console.log(`+${amount} fragmentos. Total: ${this.fragments}`);
        return this.fragments;
    },
    
    /**
     * Restar fragmentos (cuando se usan en el árbol)
     */
    spendFragments(amount) {
        if (this.fragments >= amount) {
            this.fragments -= amount;
            console.log(`-${amount} fragmentos usados. Restante: ${this.fragments}`);
            return true;
        }
        console.log(`Insuficientes fragmentos. Tienes: ${this.fragments}, necesitas: ${amount}`);
        return false;
    },
    
    canAfford(amount) {
        return this.fragments >= amount;
    },
    
    getFragments() {
        return this.fragments;
    },
    
    getStatus() {
        return {
            total: this.fragments,
            thisSector: this.fragmentsThisSector
        };
    }
};
