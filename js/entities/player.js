import { input } from '../engine/input.js';
import { collidesWithMap } from '../engine/collision.js';
import { drawCharacter, drawSwordSwing, drawBowDraw, drawShieldBlock, drawWebOnPlayer } from '../rendering/sprites.js';
import { TILE_SIZE } from '../data/tileTypes.js';

export const player = {
    x: 0,
    y: 0,
    facing: 'down',
    state: 'idle', // idle, walking, attacking, hurt, shooting, blocking
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

    // Bow shooting
    bowDrawTimer: 0,
    bowDrawDuration: 18, // frames to pull back bowstring
    bowReleased: false,

    // Shield blocking
    blocking: false,
    blockTimer: 0,

    // Hurt / invincibility
    hurtTimer: 0,
    invincibleTimer: 0,

    // Web freeze (spider web attack — immobilized but still vulnerable)
    freezeTimer: 0,
    freezeMax: 0,

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
    secondaryItem: null, // Secondary equip slot (shield, etc.)

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
        this.secondaryItem = null;
        this.state = 'idle';
        this.facing = 'down';
        this.hasBlueberry = false;
        this.hasDiamond = false;
        this.blocking = false;
        this.blockTimer = 0;
        this.bowDrawTimer = 0;
        this.bowReleased = false;
        this.freezeTimer = 0;
        this.freezeMax = 0;
    },

    update(map, entities) {
        // Web freeze: fully immobilized for the duration. We still tick the
        // invincibility timer so melee i-frames keep working (the player can be
        // hurt while frozen). Blocks all input until it runs out.
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            if (this.invincibleTimer > 0) this.invincibleTimer--;
            this.state = 'frozen';
            if (this.freezeTimer === 0) this.state = 'idle';
            return;
        }

        // Invincibility countdown
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            if (this.hurtTimer === 0) this.state = 'idle';
            return; // Can't act while hurt
        }

        // Shield blocking state
        if (this.blocking) {
            this.blockTimer++;
            // Can still change facing direction while blocking
            if (input.up) this.facing = 'up';
            else if (input.down) this.facing = 'down';
            if (input.left) this.facing = 'left';
            else if (input.right) this.facing = 'right';

            // Stop blocking when button released
            if (!input.secondaryHeld) {
                this.blocking = false;
                this.blockTimer = 0;
                this.state = 'idle';
            }
            return; // Can't move while blocking
        }

        // Attack state (sword)
        if (this.state === 'attacking') {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.state = 'idle';
            }
            return; // Can't move while attacking
        }

        // Bow shooting state
        if (this.state === 'shooting') {
            this.bowDrawTimer--;
            if (this.bowDrawTimer <= 0) {
                this.bowReleased = true;
                this.state = 'idle';
            }
            return; // Can't move while drawing bow
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
        if (this.state === 'attacking' || this.state === 'hurt' ||
            this.state === 'shooting' || this.blocking) return false;

        // Bow attack - initiate draw
        if (this.equippedItem && this.equippedItem.id === 'bow') {
            this.state = 'shooting';
            this.bowDrawTimer = this.bowDrawDuration;
            this.bowReleased = false;
            return true;
        }

        this.state = 'attacking';
        this.attackTimer = this.attackDuration;
        return true;
    },

    startBlock() {
        if (this.state === 'hurt' || this.state === 'attacking' ||
            this.state === 'shooting') return false;
        if (!this.secondaryItem || this.secondaryItem.type !== 'armor') return false;

        this.blocking = true;
        this.blockTimer = 0;
        this.state = 'blocking';
        return true;
    },

    // Stick the player in a spider web: immobilized for `duration` frames.
    // No re-stick while already webbed, so the swarm can't chain-freeze the
    // player into a permanent lock.
    freeze(duration) {
        if (this.freezeTimer > 0) return false;
        this.freezeTimer = duration;
        this.freezeMax = duration;
        this.state = 'frozen';
        this.blocking = false;
        this.blockTimer = 0;
        return true;
    },

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return false;

        // Shield block check - if blocking, negate damage
        if (this.blocking && this.secondaryItem && this.secondaryItem.defense) {
            const reduced = Math.max(0, amount - this.secondaryItem.defense);
            if (reduced <= 0) {
                // Fully blocked - just give brief invincibility
                this.invincibleTimer = 15;
                return true; // Signal that damage was blocked
            }
            amount = reduced;
        }

        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.state = 'hurt';
        this.blocking = false;
        this.blockTimer = 0;
        this.hurtTimer = 15;
        this.invincibleTimer = 60;
        return false;
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

    // Get shield block area in front of the player
    getBlockHitbox() {
        if (!this.blocking) return null;
        const w = 18, h = 12;
        switch (this.facing) {
            case 'up':    return { x: this.x - w / 2, y: this.y - 20, w, h };
            case 'down':  return { x: this.x - w / 2, y: this.y + 6, w, h };
            case 'left':  return { x: this.x - 20, y: this.y - h / 2, w: h, h: w };
            case 'right': return { x: this.x + 6, y: this.y - h / 2, w: h, h: w };
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

        // Web overlay (drawn before the invincibility-flash early-return so the
        // web stays visible the whole time you're frozen). Fades as it melts.
        if (this.freezeTimer > 0) {
            drawWebOnPlayer(ctx, this.x, this.y, this.freezeTimer / this.freezeMax);
        }

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

        // Draw bow draw animation
        if (this.state === 'shooting') {
            drawBowDraw(ctx, this.x, this.y, this.facing, this.bowDrawTimer, this.bowDrawDuration);
        }

        // Draw shield when blocking
        if (this.blocking) {
            drawShieldBlock(ctx, this.x, this.y, this.facing, this.blockTimer);
        }
    }
};
