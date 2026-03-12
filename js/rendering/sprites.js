// Programmatic pixel art sprite system
// All sprites are drawn using fillRect calls with pixel grid arrays

// Draw a pixel grid at position (x, y) with given scale
// grid is an array of rows, each row is an array of color strings (or null for transparent)
export function drawPixelGrid(ctx, x, y, scale, grid) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const color = grid[row][col];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    Math.floor(x + col * scale),
                    Math.floor(y + row * scale),
                    scale,
                    scale
                );
            }
        }
    }
}

// Character pixel template (8 wide x 12 tall)
// Uses palette keys that get resolved to colors per character
const CHAR_DOWN_0 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 'skin','eye','skin','skin','eye','skin', 0],
    [0, 'skin','skin','mouth','mouth','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 0, 'pants', 0, 0, 'pants', 0, 0],
    [0, 0, 'shoe', 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_DOWN_1 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 'skin','eye','skin','skin','eye','skin', 0],
    [0, 'skin','skin','mouth','mouth','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 'pants','pants', 0, 0, 0, 0, 0],
    [0, 'shoe', 0, 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_DOWN_2 = CHAR_DOWN_0; // Stand frame

const CHAR_DOWN_3 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 'skin','eye','skin','skin','eye','skin', 0],
    [0, 'skin','skin','mouth','mouth','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 0, 0, 0, 'pants','pants', 0, 0],
    [0, 'shoe', 0, 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_UP_0 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','hair','hair','hair','hair','skin', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 0, 'pants', 0, 0, 'pants', 0, 0],
    [0, 0, 'shoe', 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_UP_1 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','hair','hair','hair','hair','skin', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 'pants','pants', 0, 0, 0, 0, 0],
    [0, 'shoe', 0, 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_UP_2 = CHAR_UP_0;

const CHAR_UP_3 = [
    [0, 0, 'hair','hair','hair','hair', 0, 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'hair','hair','hair','hair','hair','hair', 0],
    [0, 'skin','hair','hair','hair','hair','skin', 0],
    [0, 'skin','skin','skin','skin','skin','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 'skin','shirt','shirt','shirt','shirt','skin', 0],
    [0, 0, 'shirt','shirt','shirt','shirt', 0, 0],
    [0, 0, 'pants','pants','pants','pants', 0, 0],
    [0, 0, 0, 0, 'pants','pants', 0, 0],
    [0, 'shoe', 0, 0, 0, 'shoe', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_LEFT_0 = [
    [0, 0, 'hair','hair','hair', 0, 0, 0],
    [0, 'hair','hair','hair','hair','hair', 0, 0],
    [0, 'skin','skin','skin','skin', 0, 0, 0],
    [0, 'eye','skin','skin','skin', 0, 0, 0],
    [0, 'skin','mouth','skin', 0, 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    ['skin','shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 'pants','pants','pants', 0, 0, 0, 0],
    [0, 'pants', 0, 'pants', 0, 0, 0, 0],
    [0, 'shoe', 0, 'shoe', 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_LEFT_1 = [
    [0, 0, 'hair','hair','hair', 0, 0, 0],
    [0, 'hair','hair','hair','hair','hair', 0, 0],
    [0, 'skin','skin','skin','skin', 0, 0, 0],
    [0, 'eye','skin','skin','skin', 0, 0, 0],
    [0, 'skin','mouth','skin', 0, 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    ['skin','shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 0, 'pants','pants', 0, 0, 0, 0],
    [0, 'pants','pants', 0, 0, 0, 0, 0],
    [0, 'shoe', 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const CHAR_LEFT_2 = CHAR_LEFT_0;

const CHAR_LEFT_3 = [
    [0, 0, 'hair','hair','hair', 0, 0, 0],
    [0, 'hair','hair','hair','hair','hair', 0, 0],
    [0, 'skin','skin','skin','skin', 0, 0, 0],
    [0, 'eye','skin','skin','skin', 0, 0, 0],
    [0, 'skin','mouth','skin', 0, 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    ['skin','shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 'shirt','shirt','shirt','shirt', 0, 0, 0],
    [0, 'pants','pants', 0, 0, 0, 0, 0],
    [0, 0, 'pants','pants', 0, 0, 0, 0],
    [0, 0, 0, 'shoe', 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

// Right-facing frames are mirrored left frames
function mirrorGrid(grid) {
    return grid.map(row => [...row].reverse());
}

const CHAR_RIGHT_0 = mirrorGrid(CHAR_LEFT_0);
const CHAR_RIGHT_1 = mirrorGrid(CHAR_LEFT_1);
const CHAR_RIGHT_2 = mirrorGrid(CHAR_LEFT_2);
const CHAR_RIGHT_3 = mirrorGrid(CHAR_LEFT_3);

// Animation frame lookup: [facing][frameIndex]
const CHAR_FRAMES = {
    down:  [CHAR_DOWN_0, CHAR_DOWN_1, CHAR_DOWN_2, CHAR_DOWN_3],
    up:    [CHAR_UP_0, CHAR_UP_1, CHAR_UP_2, CHAR_UP_3],
    left:  [CHAR_LEFT_0, CHAR_LEFT_1, CHAR_LEFT_2, CHAR_LEFT_3],
    right: [CHAR_RIGHT_0, CHAR_RIGHT_1, CHAR_RIGHT_2, CHAR_RIGHT_3],
};

// Resolve palette keys to actual colors
function resolveGrid(template, palette) {
    return template.map(row =>
        row.map(cell => {
            if (cell === 0) return null;
            return palette[cell] || cell;
        })
    );
}

// Draw a character sprite
export function drawCharacter(ctx, x, y, facing, animFrame, palette, scale = 2) {
    const template = CHAR_FRAMES[facing][animFrame % 4];
    const resolved = resolveGrid(template, palette);
    // Center the sprite: 8 pixels wide * scale, 12 pixels tall * scale
    const offsetX = x - (8 * scale) / 2;
    const offsetY = y - (12 * scale) + 4; // Feet at bottom
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}

// Draw attack sword swing
export function drawSwordSwing(ctx, x, y, facing, frame, palette) {
    const swordColor = palette?.sword || '#AAAAAA';
    const progress = frame / 12; // 0 to 1

    ctx.fillStyle = swordColor;

    switch (facing) {
        case 'down':
            ctx.fillRect(x - 2 + progress * 12 - 6, y + 8, 4, 14);
            break;
        case 'up':
            ctx.fillRect(x + 2 - progress * 12 + 6, y - 22, 4, 14);
            break;
        case 'left':
            ctx.fillRect(x - 22, y - 2 + progress * 12 - 6, 14, 4);
            break;
        case 'right':
            ctx.fillRect(x + 8, y + 2 - progress * 12 + 6, 14, 4);
            break;
    }

    // Sword hilt
    ctx.fillStyle = '#6B4226';
    switch (facing) {
        case 'down':
            ctx.fillRect(x - 2 + progress * 12 - 6, y + 6, 4, 4);
            break;
        case 'up':
            ctx.fillRect(x + 2 - progress * 12 + 6, y - 10, 4, 4);
            break;
        case 'left':
            ctx.fillRect(x - 10, y - 2 + progress * 12 - 6, 4, 4);
            break;
        case 'right':
            ctx.fillRect(x + 6, y + 2 - progress * 12 + 6, 4, 4);
            break;
    }
}

// NPC villager sprite (brown robe variant)
const NPC_FRAMES = {
    down: [
        [
            [0, 0, 'hair','hair','hair','hair', 0, 0],
            [0, 'hair','hair','hair','hair','hair','hair', 0],
            [0, 'skin','skin','skin','skin','skin','skin', 0],
            [0, 'skin','eye','skin','skin','eye','skin', 0],
            [0, 'skin','skin','nose','nose','skin','skin', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 0, 'robe','robe','robe','robe', 0, 0],
            [0, 0, 'shoe', 0, 0, 'shoe', 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [
            [0, 0, 'hair','hair','hair','hair', 0, 0],
            [0, 'hair','hair','hair','hair','hair','hair', 0],
            [0, 'skin','skin','skin','skin','skin','skin', 0],
            [0, 'skin','eye','skin','skin','eye','skin', 0],
            [0, 'skin','skin','nose','nose','skin','skin', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 'robe','robe','robe','robe','robe','robe', 0],
            [0, 'robe','robe','robe','robe', 0, 0, 0],
            [0, 0, 'shoe', 0, 'shoe', 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ],
    ],
};

export function drawNPC(ctx, x, y, facing, animFrame, palette, scale = 2) {
    const frames = NPC_FRAMES[facing] || NPC_FRAMES.down;
    const template = frames[animFrame % frames.length];
    const resolved = resolveGrid(template, palette);
    const offsetX = x - (8 * scale) / 2;
    const offsetY = y - (12 * scale) + 4;
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}

// Item sprites (8x8 pixel grids)
const ITEM_SPRITES = {
    wooden_sword: [
        [0, 0, 0, 0, 0, 0, '#AAA', 0],
        [0, 0, 0, 0, 0, '#AAA','#CCC', 0],
        [0, 0, 0, 0, '#AAA','#CCC', 0, 0],
        [0, 0, 0, '#AAA','#CCC', 0, 0, 0],
        [0, '#6B4226','#AAA','#CCC', 0, 0, 0, 0],
        ['#6B4226','#8B6914','#6B4226', 0, 0, 0, 0, 0],
        [0, '#6B4226', 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    stone_sword: [
        [0, 0, 0, 0, 0, 0, '#888', 0],
        [0, 0, 0, 0, 0, '#888','#AAA', 0],
        [0, 0, 0, 0, '#888','#AAA', 0, 0],
        [0, 0, 0, '#888','#AAA', 0, 0, 0],
        [0, '#6B4226','#888','#AAA', 0, 0, 0, 0],
        ['#6B4226','#8B6914','#6B4226', 0, 0, 0, 0, 0],
        [0, '#6B4226', 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    iron_sword: [
        [0, 0, 0, 0, 0, 0, '#DDD', 0],
        [0, 0, 0, 0, 0, '#DDD','#FFF', 0],
        [0, 0, 0, 0, '#DDD','#FFF', 0, 0],
        [0, 0, 0, '#DDD','#FFF', 0, 0, 0],
        [0, '#6B4226','#DDD','#FFF', 0, 0, 0, 0],
        ['#6B4226','#8B6914','#6B4226', 0, 0, 0, 0, 0],
        [0, '#6B4226', 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    bow: [
        [0, 0, '#6B4226', 0, 0, 0, 0, 0],
        [0, '#6B4226', 0, '#CCC', 0, 0, 0, 0],
        ['#6B4226', 0, 0, 0, '#CCC', 0, 0, 0],
        ['#6B4226', 0, 0, 0, 0, '#CCC', 0, 0],
        ['#6B4226', 0, 0, 0, '#CCC', 0, 0, 0],
        [0, '#6B4226', 0, '#CCC', 0, 0, 0, 0],
        [0, 0, '#6B4226', 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    shield: [
        [0, '#666','#888','#888','#888','#666', 0, 0],
        ['#666','#888','#4CAF50','#4CAF50','#888','#888','#666', 0],
        ['#666','#4CAF50','#4CAF50','#6ECF72','#4CAF50','#4CAF50','#666', 0],
        ['#666','#4CAF50','#6ECF72','#6ECF72','#6ECF72','#4CAF50','#666', 0],
        ['#666','#4CAF50','#4CAF50','#6ECF72','#4CAF50','#4CAF50','#666', 0],
        [0, '#666','#4CAF50','#4CAF50','#4CAF50','#666', 0, 0],
        [0, 0, '#666','#4CAF50','#666', 0, 0, 0],
        [0, 0, 0, '#666', 0, 0, 0, 0],
    ],
    emerald: [
        [0, 0, 0, '#2D8B46', 0, 0, 0, 0],
        [0, 0, '#2D8B46','#3CB371','#2D8B46', 0, 0, 0],
        [0, '#2D8B46','#3CB371','#5FD394','#3CB371','#2D8B46', 0, 0],
        [0, '#2D8B46','#3CB371','#5FD394','#3CB371','#2D8B46', 0, 0],
        [0, 0, '#2D8B46','#3CB371','#2D8B46', 0, 0, 0],
        [0, 0, 0, '#2D8B46', 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    golden_blueberry: [
        [0, 0, '#2D5A1E', 0, 0, 0, 0, 0],
        [0, '#FFD700', '#FFD700', '#FFD700', 0, 0, 0, 0],
        ['#FFD700','#4444CC','#5555DD','#4444CC','#FFD700', 0, 0, 0],
        ['#FFD700','#5555DD','#7777FF','#5555DD','#FFD700', 0, 0, 0],
        [0, '#FFD700','#4444CC','#FFD700', 0, 0, 0, 0],
        [0, 0, '#FFD700', 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    heart: [
        [0, '#CC2222', 0, 0, '#CC2222', 0, 0, 0],
        ['#CC2222','#FF4444','#CC2222','#CC2222','#FF4444','#CC2222', 0, 0],
        ['#CC2222','#FF4444','#FF6666','#FF4444','#FF4444','#CC2222', 0, 0],
        [0, '#CC2222','#FF4444','#FF4444','#CC2222', 0, 0, 0],
        [0, 0, '#CC2222','#CC2222', 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    diamond: [
        [0, 0, 0, '#5BC8E8', 0, 0, 0, 0],
        [0, 0, '#5BC8E8','#8EDDEE','#5BC8E8', 0, 0, 0],
        [0, '#5BC8E8','#8EDDEE','#B0EFFF','#8EDDEE','#5BC8E8', 0, 0],
        [0, '#5BC8E8','#8EDDEE','#B0EFFF','#8EDDEE','#5BC8E8', 0, 0],
        [0, 0, '#5BC8E8','#8EDDEE','#5BC8E8', 0, 0, 0],
        [0, 0, 0, '#5BC8E8', 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
};

export function drawItem(ctx, x, y, itemId, scale = 2) {
    const sprite = ITEM_SPRITES[itemId];
    if (!sprite) return;
    drawPixelGrid(ctx, x, y, scale, sprite);
}

// Breakable object sprites
export function drawBreakable(ctx, x, y, type) {
    switch (type) {
        case 'grass':
            ctx.fillStyle = '#4A7628';
            ctx.fillRect(x + 4, y + 8, 4, 20);
            ctx.fillRect(x + 12, y + 4, 4, 24);
            ctx.fillRect(x + 20, y + 10, 4, 18);
            ctx.fillStyle = '#5B8731';
            ctx.fillRect(x + 8, y + 6, 4, 22);
            ctx.fillRect(x + 16, y + 8, 4, 20);
            ctx.fillRect(x + 24, y + 12, 4, 16);
            break;
        case 'pot':
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(x + 8, y + 6, 16, 4);
            ctx.fillRect(x + 6, y + 10, 20, 14);
            ctx.fillRect(x + 8, y + 24, 16, 4);
            ctx.fillStyle = '#A67C1A';
            ctx.fillRect(x + 10, y + 12, 12, 8);
            break;
        case 'bush':
            ctx.fillStyle = '#2D5A1E';
            ctx.fillRect(x + 2, y + 8, 28, 20);
            ctx.fillStyle = '#3D6B22';
            ctx.fillRect(x + 6, y + 4, 20, 8);
            ctx.fillRect(x + 4, y + 12, 24, 12);
            ctx.fillStyle = '#4A7628';
            ctx.fillRect(x + 10, y + 6, 12, 6);
            break;
        case 'golden_pot':
            // Same as pot but with golden sparkles
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(x + 8, y + 6, 16, 4);
            ctx.fillRect(x + 6, y + 10, 20, 14);
            ctx.fillRect(x + 8, y + 24, 16, 4);
            ctx.fillStyle = '#A67C1A';
            ctx.fillRect(x + 10, y + 12, 12, 8);
            // Golden sparkles
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 4, y + 4, 2, 2);
            ctx.fillRect(x + 26, y + 8, 2, 2);
            ctx.fillRect(x + 14, y + 2, 2, 2);
            ctx.fillRect(x + 28, y + 20, 2, 2);
            break;
    }
}

// Push block sprite (obsidian)
export function drawPushBlock(ctx, x, y) {
    ctx.fillStyle = '#1A0A2E';
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = '#2D1B4E';
    ctx.fillRect(x + 2, y + 2, 28, 28);
    // Purple highlights
    ctx.fillStyle = '#4A2D7A';
    ctx.fillRect(x + 4, y + 4, 8, 8);
    ctx.fillRect(x + 20, y + 16, 8, 8);
    ctx.fillStyle = '#5A3D8A';
    ctx.fillRect(x + 14, y + 10, 6, 6);
}

// Zombie sprite
const ZOMBIE_DOWN_0 = [
    [0, 0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0, 0],
    [0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0],
    [0, '#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A', 0],
    [0, '#4A7A4A','#111','#4A7A4A','#4A7A4A','#111','#4A7A4A', 0],
    [0, '#4A7A4A','#4A7A4A','#333','#333','#4A7A4A','#4A7A4A', 0],
    [0, '#4A7A4A','#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A','#4A7A4A', 0],
    ['#4A7A4A','#4A7A4A','#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A','#4A7A4A','#4A7A4A'],
    ['#4A7A4A', 0, '#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A', 0, '#4A7A4A'],
    [0, 0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0, 0],
    [0, 0, '#2D4A2D', 0, 0, '#2D4A2D', 0, 0],
    [0, 0, '#333', 0, 0, '#333', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const ZOMBIE_DOWN_1 = [
    [0, 0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0, 0],
    [0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0],
    [0, '#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A','#4A7A4A', 0],
    [0, '#4A7A4A','#111','#4A7A4A','#4A7A4A','#111','#4A7A4A', 0],
    [0, '#4A7A4A','#4A7A4A','#333','#333','#4A7A4A','#4A7A4A', 0],
    [0, '#4A7A4A','#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A','#4A7A4A', 0],
    ['#4A7A4A','#4A7A4A','#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A','#4A7A4A','#4A7A4A'],
    ['#4A7A4A', 0, '#3A6A3A','#3A6A3A','#3A6A3A','#3A6A3A', 0, '#4A7A4A'],
    [0, 0, '#2D4A2D','#2D4A2D','#2D4A2D','#2D4A2D', 0, 0],
    [0, '#2D4A2D','#2D4A2D', 0, 0, 0, 0, 0],
    [0, '#333', 0, 0, 0, '#333', 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

export function drawZombie(ctx, x, y, animFrame, scale = 2) {
    const frames = [ZOMBIE_DOWN_0, ZOMBIE_DOWN_1];
    const grid = frames[animFrame % 2];
    const resolved = grid.map(row => row.map(c => c === 0 ? null : c));
    const offsetX = x - (8 * scale) / 2;
    const offsetY = y - (12 * scale) + 4;
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}
