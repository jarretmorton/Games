import { drawZombie, drawSkeleton } from '../rendering/sprites.js';
import { collidesWithMap } from '../engine/collision.js';

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = 16;
        this.h = 16;
        this.active = true;

        // Stats (defaults for zombie)
        this.hp = 6;
        this.maxHp = 6;
        this.damage = 1;
        this.speed = 0.5;
        this.detectionRadius = 80;

        // Skeleton archer overrides
        if (type === 'dungeon_skeleton') {
            this.hp = 5;
            this.maxHp = 5;
            this.damage = 1;
            this.speed = 0.6;
            this.detectionRadius = 120;
            this.bowCooldown = 0;
            this.bowShootSignal = false;
            this.preferredRange = 80; // tries to stay this far from player
        }

        // State
        this.state = 'idle'; // idle, chasing, attacking, hurt, dead
        this.facing = 'down';
        this.animFrame = 0;
        this.animTimer = 0;

        // AI
        this.idleTimer = 0;
        this.idleDir = { x: 0, y: 0 };
        this.attackCooldown = 0;
        this.attackWindup = 0;

        // Knockback
        this.knockbackVX = 0;
        this.knockbackVY = 0;
        this.knockbackTimer = 0;

        // Hurt flash
        this.hurtTimer = 0;
        this.hitFlashTimer = 0;

        // Death
        this.deathTimer = 0;
    }

    update(playerX, playerY, map) {
        if (!this.active) return;

        // Knockback
        if (this.knockbackTimer > 0) {
            this.knockbackTimer--;
            this.x += this.knockbackVX;
            this.y += this.knockbackVY;
            return;
        }

        // Death animation
        if (this.state === 'dead') {
            this.deathTimer++;
            if (this.deathTimer > 20) {
                this.active = false;
            }
            return;
        }

        // Hurt state
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            if (this.hurtTimer === 0) this.state = 'idle';
            return;
        }

        // Hit flash countdown
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;

        // Attack cooldown
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Distance to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Animation
        this.animTimer++;
        if (this.animTimer >= 20) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }

        if (dist < this.detectionRadius) {
            this.state = 'chasing';

            if (this.type === 'dungeon_skeleton') {
                // Skeleton archer: maintain distance, shoot arrows
                if (this.bowCooldown > 0) this.bowCooldown--;

                const nx = dx / dist;
                const ny = dy / dist;

                if (dist < this.preferredRange - 10) {
                    // Too close - back away
                    this.x -= nx * this.speed;
                    this.y -= ny * this.speed;
                } else if (dist > this.preferredRange + 20) {
                    // Too far - approach
                    this.x += nx * this.speed * 0.5;
                    this.y += ny * this.speed * 0.5;
                }

                // Shoot when at good range and cooldown ready
                if (this.bowCooldown <= 0 && dist <= this.detectionRadius) {
                    this.bowCooldown = 90;
                    this.bowShootSignal = true;
                }

                // Update facing based on player direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.facing = dx > 0 ? 'right' : 'left';
                } else {
                    this.facing = dy > 0 ? 'down' : 'up';
                }
            } else {
                // Default: chase and melee attack
                if (dist < 20 && this.attackCooldown <= 0) {
                    // Attack
                    this.state = 'attacking';
                    this.attackWindup++;
                    if (this.attackWindup > 15) {
                        this.attackWindup = 0;
                        this.attackCooldown = 60;
                        this.state = 'chasing';
                        return; // Signal to main loop to check hit
                    }
                } else {
                    this.attackWindup = 0;
                    // Move toward player
                    const nx = dx / dist;
                    const ny = dy / dist;
                    this.x += nx * this.speed;
                    this.y += ny * this.speed;
                }
            }
        } else {
            // Idle wander
            this.state = 'idle';
            this.idleTimer--;
            if (this.idleTimer <= 0) {
                this.idleTimer = 30 + Math.random() * 60;
                const angle = Math.random() * Math.PI * 2;
                this.idleDir = { x: Math.cos(angle) * 0.3, y: Math.sin(angle) * 0.3 };
            }
            this.x += this.idleDir.x;
            this.y += this.idleDir.y;
        }
    }

    takeDamage(amount, fromX, fromY) {
        if (this.state === 'dead') return;

        this.hp -= amount;
        this.hitFlashTimer = 6;
        this.hurtTimer = 10;

        // Knockback
        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.knockbackVX = (dx / len) * 4;
        this.knockbackVY = (dy / len) * 4;
        this.knockbackTimer = 6;

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'dead';
            this.deathTimer = 0;
        } else {
            this.state = 'hurt';
        }
    }

    canDamagePlayer(playerX, playerY) {
        if (this.state !== 'attacking' || this.attackWindup < 15) return false;
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < 24;
    }

    render(ctx) {
        if (!this.active) return;

        const drawFn = this.type === 'dungeon_skeleton' ? drawSkeleton : drawZombie;

        // Death shrink
        if (this.state === 'dead') {
            if (Math.floor(this.deathTimer / 2) % 2 === 0) {
                drawFn(ctx, this.x, this.y, this.animFrame, 2);
            }
            return;
        }

        // Hit flash
        if (this.hitFlashTimer > 0 && this.hitFlashTimer % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(this.x - 8, this.y - 20, 16, 24);
            return;
        }

        drawFn(ctx, this.x, this.y, this.animFrame, 2);

        // Health bar
        if (this.hp < this.maxHp) {
            const barW = 20;
            const barH = 3;
            const barX = this.x - barW / 2;
            const barY = this.y - 24;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#CC2222';
            ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
        }
    }
}
