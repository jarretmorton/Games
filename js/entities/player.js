import { input } from '../engine/input.js';
import { collidesWithMap } from '../engine/collision.js';
import { drawCharacter, drawSwordSwing } from '../rendering/sprites.js';
import { TILE_SIZE } from '../data/tileTypes.js';

export const player = {
    x: 0,
    y: 0,
    facing: 'down',
    state: 'idle', // idle, walking, attacking, hurt
    health: 6,
    maxHealth: 6,
    emeralds: 0,
    speed: 1.5,

    // Animation
    animFrame: 0,
    animTimer: 0,

    // Attack
    attackTimer: 0,
    attackDuration: 16,

    // Hurt / invincibility
    hurtTimer: 0,
    invincibleTimer: 0,

    // Collision box (relative to center position)
    collW: 12,
    collH: 10,
    get collX() { return this.x - this.collW / 2; },
    get collY() { return this.y - this.collH / 2 + 4; }, // Offset down to feet area

    // Character palette (set during character select)
    palette: null,
    characterId: 'steve',

    // Inventory
    inventory: [],
    equippedItem: null,

    // Flags
    hasBlueberry: false,
    hasDiamond: false,

    init(x, y, palette) {
        this.x = x;
        this.y = y;
        this.palette = palette;
        this.health = this.maxHealth;
        this.emeralds = 0;
        this.inventory = [];
        this.equippedItem = null;
        this.state = 'idle';
        this.facing = 'down';
        this.hasBlueberry = false;
        this.hasDiamond = false;
    },

    update(map, entities) {
        // Invincibility countdown
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            if (this.hurtTimer === 0) this.state = 'idle';
            return; // Can't act while hurt
        }

        // Attack state
        if (this.state === 'attacking') {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.state = 'idle';
            }
            return; // Can't move while attacking
        }

        // Movement
        let dx = 0, dy = 0;
        if (input.up) { dy = -this.speed; this.facing = 'up'; }
        else if (input.down) { dy = this.speed; this.facing = 'down'; }
        if (input.left) { dx = -this.speed; this.facing = 'left'; }
        else if (input.right) { dx = this.speed; this.facing = 'right'; }

        // Prioritize last pressed direction for facing
        if (dx !== 0 && dy !== 0) {
            // Keep facing from the more recent input
        }

        const moving = dx !== 0 || dy !== 0;

        if (moving) {
            this.state = 'walking';

            // Move X then Y separately for sliding along walls
            if (dx !== 0) {
                const newX = this.x + dx;
                const cx = newX - this.collW / 2;
                const cy = this.y - this.collH / 2 + 4;
                if (!collidesWithMap(map, cx, cy, this.collW, this.collH) &&
                    !this.collidesWithEntities(newX, this.y, entities)) {
                    this.x = newX;
                }
            }

            if (dy !== 0) {
                const newY = this.y + dy;
                const cx = this.x - this.collW / 2;
                const cy = newY - this.collH / 2 + 4;
                if (!collidesWithMap(map, cx, cy, this.collW, this.collH) &&
                    !this.collidesWithEntities(this.x, newY, entities)) {
                    this.y = newY;
                }
            }

            // Walk animation
            this.animTimer++;
            if (this.animTimer >= 8) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.state = 'idle';
            this.animFrame = 0;
            this.animTimer = 0;
        }

        // Clamp to map bounds
        const mapW = map[0].length * TILE_SIZE;
        const mapH = map.length * TILE_SIZE;
        this.x = Math.max(8, Math.min(mapW - 8, this.x));
        this.y = Math.max(8, Math.min(mapH - 8, this.y));
    },

    collidesWithEntities(newX, newY, entities) {
        const cx = newX - this.collW / 2;
        const cy = newY - this.collH / 2 + 4;
        for (const ent of entities) {
            if (ent.solid && ent.active !== false) {
                if (cx < ent.x + ent.w && cx + this.collW > ent.x &&
                    cy < ent.y + ent.h && cy + this.collH > ent.y) {
                    return true;
                }
            }
        }
        return false;
    },

    attack() {
        if (this.state === 'attacking' || this.state === 'hurt') return false;

        this.state = 'attacking';
        this.attackTimer = this.attackDuration;
        return true;
    },

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.state = 'hurt';
        this.hurtTimer = 15;
        this.invincibleTimer = 60;
    },

    getAttackHitbox() {
        if (this.state !== 'attacking') return null;
        // Arc-based hitbox: covers the semicircle sweep area in front of the character
        // The sword sweeps ~180° so the hitbox is wider to cover the arc
        const reach = 20;
        switch (this.facing) {
            case 'up':    return { x: this.x - reach, y: this.y - 26, w: reach * 2, h: 18 };
            case 'down':  return { x: this.x - reach, y: this.y + 2, w: reach * 2, h: 18 };
            case 'left':  return { x: this.x - 26, y: this.y - reach, w: 18, h: reach * 2 };
            case 'right': return { x: this.x + 2, y: this.y - reach, w: 18, h: reach * 2 };
        }
        return null;
    },

    // Get the point the player is "looking at" for interactions
    getInteractPoint() {
        const dist = 16;
        switch (this.facing) {
            case 'up':    return { x: this.x, y: this.y - dist };
            case 'down':  return { x: this.x, y: this.y + dist };
            case 'left':  return { x: this.x - dist, y: this.y };
            case 'right': return { x: this.x + dist, y: this.y };
        }
    },

    render(ctx) {
        if (!this.palette) return;

        // Flash when invincible
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 3) % 2 === 0) {
            return; // Skip rendering for flash effect
        }

        drawCharacter(ctx, this.x, this.y, this.facing, this.animFrame, this.palette);

        // Draw sword swing during attack
        if (this.state === 'attacking' && this.equippedItem) {
            drawSwordSwing(ctx, this.x, this.y, this.facing, this.attackTimer, {
                swordId: this.equippedItem.id,
            });
        }
    }
};
