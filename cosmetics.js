class CosmeticManager {
    constructor(game) {
        this.game = game;
        this.storageKey = 'vx_cosmetics_v1';
        this.catalog = {
            rewards: { base: 120, perWave: 25, premiumChance: 0.06 },
            defaults: { shot: 'standard', trail: 'none', thruster: 'cyan', idle: 'steady' },
            shot: {
                standard: { id: 'standard', color: 'rgba(255,255,255,0.5)', size: 3, alpha: 0.5, costCoins: 0, costPremium: 0, sound: 'standard' },
                plasma: { id: 'plasma', color: 'rgba(0,180,255,0.8)', size: 5, alpha: 0.8, costCoins: 400, costPremium: 0, sound: 'plasma' },
                electric: { id: 'electric', color: 'rgba(100,200,255,0.9)', size: 3, alpha: 0.9, costCoins: 500, costPremium: 0, sound: 'electric' },
                pulse: { id: 'pulse', color: 'rgba(0,255,100,0.8)', size: 6, alpha: 0.6, costCoins: 600, costPremium: 0, sound: 'laser' },
                dark: { id: 'dark', color: 'rgba(50,0,50,0.9)', size: 5, alpha: 0.9, costCoins: 0, costPremium: 3, sound: 'dark' }
            },
            trail: {
                none: { id: 'none', rate: 0, life: 0, size: 0, color: 'rgba(0,0,0,0)' },
                clean: { id: 'clean', rate: 40, life: 15, size: 2, color: 'rgba(0,200,255,0.6)', costCoins: 200, costPremium: 0 },
                fire: { id: 'fire', rate: 50, life: 20, size: 3, color: 'rgba(180,0,255,0.6)', costCoins: 350, costPremium: 0 },
                reactor: { id: 'reactor', rate: 60, life: 25, size: 2, color: 'rgba(0,255,100,0.5)', costCoins: 300, costPremium: 0 },
                glitch: { id: 'glitch', rate: 30, life: 10, size: 3, color: 'rgba(0,255,0,0.8)', costCoins: 0, costPremium: 2 }
            },
            thruster: {
                cyan: { id: 'cyan', color: 'var(--blue)', costCoins: 0, costPremium: 0 },
                red: { id: 'red', color: 'var(--red)', costCoins: 250, costPremium: 0 },
                green: { id: 'green', color: 'var(--green)', costCoins: 250, costPremium: 0 },
                violet: { id: 'violet', color: 'var(--purple)', costCoins: 350, costPremium: 0 },
                white: { id: 'white', color: '#ffffff', costCoins: 0, costPremium: 3 }
            },
            idle: {
                steady: { id: 'steady', amp: 0, speed: 0, scale: 1, costCoins: 0, costPremium: 0 },
                vibrate: { id: 'vibrate', type: 'shake', amp: 1.5, speed: 0.8, scale: 1, costCoins: 150, costPremium: 0 },
                float: { id: 'float', type: 'sine', amp: 3, speed: 0.003, scale: 1, costCoins: 250, costPremium: 0 },
                pulse: { id: 'pulse', type: 'scale', amp: 0, speed: 0.004, scale: 1.05, costCoins: 350, costPremium: 0 },
                discharge: { id: 'discharge', type: 'spark', amp: 0, speed: 0, scale: 1, costCoins: 0, costPremium: 2 }
            }
        };
        this.active = { shot: 'standard', trail: 'none', thruster: 'cyan', idle: 'steady' };
        this.owned = { shot: ['standard'], trail: ['none'], thruster: ['cyan'], idle: ['steady'] };
        this.coins = 0;
        this.premiumCoins = 0;
        this.lastTrailAt = 0;
        this.supporter = false;
        this.donationTotal = 0;
        this.SUPPORT_AMOUNTS = [1400, 2800, 4200];
        this.SUPPORT_DIAMONDS_REWARD = 50;
    }
    init() {
        const saved = this.load();
        if(saved) {
            this.active = saved.active || this.active;
            this.owned = saved.owned || this.owned;
            this.coins = typeof saved.coins === 'number' ? saved.coins : this.coins;
            this.premiumCoins = typeof saved.premiumCoins === 'number' ? saved.premiumCoins : this.premiumCoins;
            this.supporter = !!saved.supporter;
            this.donationTotal = typeof saved.donationTotal === 'number' ? saved.donationTotal : 0;
        }
        this.syncGame();
        this.save();
    }
    syncGame() {
        this.game.coins = this.coins;
        this.game.premiumCoins = this.premiumCoins;
    }
    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
    save() {
        const data = {
            active: this.active,
            owned: this.owned,
            coins: this.coins,
            premiumCoins: this.premiumCoins,
            supporter: this.supporter,
            donationTotal: this.donationTotal
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {}
    }
    getActive(category) {
        const id = this.active[category] || this.catalog.defaults[category];
        return this.catalog[category][id] || this.catalog[category][this.catalog.defaults[category]];
    }
    equip(category, id) {
        if(!this.catalog[category] || !this.catalog[category][id]) return false;
        if(!this.isOwned(category, id)) return false;
        this.active[category] = id;
        this.save();
        return true;
    }
    unequip(category) {
        if(!this.catalog.defaults[category]) return false;
        this.active[category] = this.catalog.defaults[category];
        this.save();
        return true;
    }
    isOwned(category, id) {
        return (this.owned[category] || []).includes(id);
    }
    buy(category, id) {
        const item = this.catalog[category] && this.catalog[category][id];
        if(!item || this.isOwned(category, id)) return false;
        const costCoins = item.costCoins || 0;
        const costPremium = item.costPremium || 0;
        if(costPremium > 0) {
            if(this.premiumCoins < costPremium) return false;
            this.premiumCoins -= costPremium;
        } else {
            if(this.coins < costCoins) return false;
            this.coins -= costCoins;
        }
        if(!this.owned[category]) this.owned[category] = [];
        this.owned[category].push(id);
        this.syncGame();
        this.save();
        return true;
    }
    confirmSupport(monto) {
        if (!navigator.onLine) return false;
        const amt = typeof monto === 'number' ? monto : parseInt(monto, 10);
        if (isNaN(amt) || amt <= 0) return false;
        this.supporter = true;
        this.donationTotal += amt;
        this.premiumCoins += this.SUPPORT_DIAMONDS_REWARD;
        this.syncGame();
        this.save();
        return true;
    },

    grantWaveRewards(wave, sector) {
        const base = this.catalog.rewards.base;
        const perWave = this.catalog.rewards.perWave;
        this.coins += base + (perWave * wave) + (sector * 10);
        if(Math.random() < this.catalog.rewards.premiumChance) {
            this.premiumCoins += 1;
        }
        this.syncGame();
        this.save();
    }
    applyShotEffect(bullet) {
        const effect = this.getActive('shot');
        bullet.effect = { 
            id: effect.id,
            color: effect.color, 
            size: effect.size, 
            alpha: effect.alpha 
        };
    }
    getIdleOffset() {
        const anim = this.getActive('idle');
        const t = Date.now();
        let sx = 0, sy = 0, scale = 1, ang = 0;

        if (anim.type === 'sine') {
            sy = Math.sin(t * anim.speed) * anim.amp;
        } else if (anim.type === 'shake') {
            sx = (Math.random() - 0.5) * anim.amp;
            sy = (Math.random() - 0.5) * anim.amp;
        } else if (anim.type === 'scale') {
            scale = 1 + Math.sin(t * anim.speed) * (anim.scale - 1);
        } else if (anim.type === 'spark') {
            if (Math.random() < 0.05) {
                sx = (Math.random() - 0.5) * 5;
                sy = (Math.random() - 0.5) * 5;
            }
        }

        return { x: sx, y: sy, scale, ang };
    }
    drawThruster(ctx) {
        const thruster = this.getActive('thruster');
        ctx.save();
        ctx.fillStyle = thruster.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(-20, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(-26, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    spawnTrail(p) {
        const trail = this.getActive('trail');
        if(trail.rate <= 0) return;
        const now = Date.now();
        if(now - this.lastTrailAt < 1000 / trail.rate) return;
        this.lastTrailAt = now;
        const angle = p.ang + Math.PI;
        const ox = Math.cos(angle) * 18;
        const oy = Math.sin(angle) * 18;
        
        let vx = (Math.random() - 0.5) * 0.6;
        let vy = (Math.random() - 0.5) * 0.6;
        let col = trail.color;
        let x = p.x + ox;
        let y = p.y + oy;

        if(trail.id === 'glitch') {
            x += (Math.random() - 0.5) * 10;
            y += (Math.random() - 0.5) * 10;
        } else if(trail.id === 'fire') {
            vx += (Math.random() - 0.5) * 2;
            vy += (Math.random() - 0.5) * 2;
        }

        this.game.particles.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            life: trail.life,
            maxLife: trail.life,
            col: col,
            type: trail.id
        });
    }
}
window.CosmeticManager = CosmeticManager;
