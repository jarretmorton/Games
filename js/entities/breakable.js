import { drawBreakable } from '../rendering/sprites.js';
import { TILE_SIZE } from '../data/tileTypes.js';

export class Breakable {
    constructor(data) {
        this.tileX = data.tileX;
        this.tileY = data.tileY;
        this.type = data.type;
        this.x = data.tileX * TILE_SIZE;
        this.y = data.tileY * TILE_SIZE;
        this.w = TILE_SIZE;
        this.h = TILE_SIZE;
        this.solid = true;
        this.active = true;
        this.hp = 1;

        // Destruction particles
        this.particles = [];
        this.destroying = false;
        this.destroyTimer = 0;

        // Regeneration (bushes and grass only)
        this.canRegenerate = (this.type === 'bush' || this.type === 'grass');
        this.regenTimer = 0;
        this.regenDelay = 600; // ~10 seconds at 60fps
    }

    hit() {
        if (!this.active || this.destroying) return null;
        this.hp--;
        if (this.hp <= 0) {
            this.destroying = true;
            this.destroyTimer = 15;
            this.solid = false;

            // Generate particles
            const colors = this.getColors();
            for (let i = 0; i < 6; i++) {
                this.particles.push({
                    x: this.x + TILE_SIZE / 2 + (Math.random() - 0.5) * 10,
                    y: this.y + TILE_SIZE / 2 + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 2 - 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 15,
                });
            }

            // Determine drop
            return this.getDrop();
        }
        return null;
    }

    getColors() {
        switch (this.type) {
            case 'grass': return ['#4A7628', '#5B8731', '#3D6B22'];
            case 'pot': return ['#8B6914', '#A67C1A', '#6B5010'];
            case 'heart_pot': return ['#CC2222', '#FF4444', '#8B6914'];
            case 'bush': return ['#2D5A1E', '#3D6B22', '#4A7628'];
            case 'golden_pot': return ['#8B6914', '#FFD700', '#A67C1A'];
            default: return ['#888'];
        }
    }

    getDrop() {
        if (this.type === 'golden_pot') {
            return { type: 'golden_blueberry' };
        }

        // Heart pots always drop a full heart
        if (this.type === 'heart_pot') {
            return { type: 'heart', amount: 2 };
        }

        // Pots: 25% total heart chance
        if (this.type === 'pot') {
            const roll = Math.random();
            if (roll < 0.15) return { type: 'heart', amount: 2 }; // full heart
            if (roll < 0.25) return { type: 'heart', amount: 1 }; // half heart
            if (roll < 0.75) return { type: 'emerald', amount: 1 };
            if (roll < 0.83) return { type: 'emerald', amount: 3 };
            return null;
        }

        // Bushes and grass: 25% heart chance
        const roll = Math.random();
        if (roll < 0.15) return { type: 'heart', amount: 2 }; // full heart
        if (roll < 0.25) return { type: 'heart', amount: 1 }; // half heart
        if (roll < 0.70) return { type: 'emerald', amount: 1 };
        if (roll < 0.78) return { type: 'emerald', amount: 3 };
        return null;
    }

    update() {
        if (this.destroying) {
            this.destroyTimer--;
            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15;
                p.life--;
            }
            this.particles = this.particles.filter(p => p.life > 0);
            if (this.destroyTimer <= 0 && this.particles.length === 0) {
                this.active = false;
                this.destroying = false;
                if (this.canRegenerate) {
                    this.regenTimer = this.regenDelay;
                }
            }
        }

        // Regeneration countdown
        if (!this.active && this.canRegenerate && this.regenTimer > 0) {
            this.regenTimer--;
            if (this.regenTimer <= 0) {
                this.active = true;
                this.solid = true;
                this.hp = 1;
                this.destroying = false;
                this.particles = [];
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        if (!this.destroying) {
            drawBreakable(ctx, this.x, this.y, this.type);
        }

        // Render particles
        for (const p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        }
    }
}

export function createBreakables(positions) {
    return positions.map(pos => new Breakable(pos));
}
