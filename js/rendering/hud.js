import { VIRTUAL_WIDTH } from './renderer.js';
import { drawSmallText } from '../main.js';
import { drawItem, drawPixelGrid } from './sprites.js';

export function renderHUD(ctx, player) {
    // Hearts (top-left)
    const heartY = 4;
    for (let i = 0; i < Math.ceil(player.maxHealth / 2); i++) {
        const x = 4 + i * 14;
        const fullHearts = Math.floor(player.health / 2);
        const hasHalf = player.health % 2 === 1;

        if (i < fullHearts) {
            drawHeart(ctx, x, heartY, 'full');
        } else if (i === fullHearts && hasHalf) {
            drawHeart(ctx, x, heartY, 'half');
        } else {
            drawHeart(ctx, x, heartY, 'empty');
        }
    }

    // Emerald count (below hearts)
    drawEmeraldIcon(ctx, 4, 18);
    ctx.fillStyle = '#FFF';
    drawSmallText(ctx, String(player.emeralds), 16, 19);

    // Primary equipped item - A slot (top-right)
    const itemBoxX = VIRTUAL_WIDTH - 24;
    const itemBoxY = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(itemBoxX - 2, itemBoxY - 2, 20, 20);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(itemBoxX - 2, itemBoxY - 2, 20, 20);

    if (player.equippedItem) {
        drawItem(ctx, itemBoxX, itemBoxY, player.equippedItem.spriteId, 2);
    }

    // Slot label
    ctx.fillStyle = '#888';
    drawSmallText(ctx, 'A', itemBoxX + 6, itemBoxY + 18);

    // Secondary equipped item - B slot (below A slot)
    const secBoxX = VIRTUAL_WIDTH - 24;
    const secBoxY = itemBoxY + 24;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(secBoxX - 2, secBoxY - 2, 20, 20);
    ctx.strokeStyle = player.blocking ? '#4CAF50' : '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(secBoxX - 2, secBoxY - 2, 20, 20);

    if (player.secondaryItem) {
        drawItem(ctx, secBoxX, secBoxY, player.secondaryItem.spriteId, 2);
    }

    // Slot label
    ctx.fillStyle = '#888';
    drawSmallText(ctx, 'B', secBoxX + 6, secBoxY + 18);
}

function drawHeart(ctx, x, y, state) {
    // 7x6 pixel heart
    if (state === 'empty') {
        ctx.fillStyle = '#333';
    } else {
        ctx.fillStyle = '#CC2222';
    }

    // Heart shape
    ctx.fillRect(x + 1, y, 2, 1);
    ctx.fillRect(x + 4, y, 2, 1);
    ctx.fillRect(x, y + 1, 7, 1);
    ctx.fillRect(x, y + 2, 7, 1);
    ctx.fillRect(x + 1, y + 3, 5, 1);
    ctx.fillRect(x + 2, y + 4, 3, 1);
    ctx.fillRect(x + 3, y + 5, 1, 1);

    if (state === 'full') {
        // Highlight
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(x + 1, y + 1, 2, 1);
        ctx.fillRect(x + 1, y + 2, 1, 1);
    }

    if (state === 'half') {
        // Right half is grey
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 4, y, 2, 1);
        ctx.fillRect(x + 4, y + 1, 3, 1);
        ctx.fillRect(x + 4, y + 2, 3, 1);
        ctx.fillRect(x + 4, y + 3, 2, 1);
        ctx.fillRect(x + 4, y + 4, 1, 1);
        // Highlight on left
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(x + 1, y + 1, 2, 1);
        ctx.fillRect(x + 1, y + 2, 1, 1);
    }
}

function drawEmeraldIcon(ctx, x, y) {
    ctx.fillStyle = '#2D8B46';
    ctx.fillRect(x + 3, y, 2, 1);
    ctx.fillRect(x + 1, y + 1, 6, 1);
    ctx.fillRect(x, y + 2, 8, 2);
    ctx.fillRect(x + 1, y + 4, 6, 1);
    ctx.fillRect(x + 3, y + 5, 2, 1);

    ctx.fillStyle = '#5FD394';
    ctx.fillRect(x + 3, y + 1, 2, 1);
    ctx.fillRect(x + 2, y + 2, 3, 1);
}
