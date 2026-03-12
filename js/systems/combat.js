import { aabbOverlap } from '../engine/collision.js';

export function checkAttackHits(hitbox, enemies) {
    const hits = [];
    if (!hitbox) return hits;

    for (const enemy of enemies) {
        if (!enemy.active || enemy.state === 'dead') continue;
        if (aabbOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                       enemy.x - enemy.w / 2, enemy.y - enemy.h / 2, enemy.w, enemy.h)) {
            hits.push(enemy);
        }
    }
    return hits;
}

export function applyKnockback(entity, fromX, fromY, distance, duration) {
    const dx = entity.x - fromX;
    const dy = entity.y - fromY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    entity.knockbackVX = (dx / len) * (distance / duration);
    entity.knockbackVY = (dy / len) * (distance / duration);
    entity.knockbackTimer = duration;
}
