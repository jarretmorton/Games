// Programmatic pixel art sprite system (Link's Awakening style)
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

// ── CHARACTER SPRITES (12 wide x 16 tall, Link's Awakening style) ──
// Shorthand palette keys for compact grid definitions
const _ = 0;
const ol = 'ol';      // dark outline
const hr = 'hair';
const hh = 'hairHi';  // hair highlight
const sk = 'skin';
const ew = 'eyeW';    // eye white
const ey = 'eye';     // eye/iris
const mo = 'mouth';
const sh = 'shirt';
const si = 'shirtHi'; // shirt highlight
const bl = 'belt';
const pn = 'pants';
const bo = 'shoe';

// ── DOWN FACING ──
const CHAR_DOWN_0 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, sk, sk, ol,  _],
    [ _, ol, sk, ew, ey, sk, sk, ew, ey, sk, ol,  _],
    [ _,  _, ol, sk, sk, mo, mo, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, si, sh, ol, sk,  _],
    [ _, sk, ol, sh, sh, sh, sh, sh, sh, ol, sk,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _,  _, ol, pn, pn, ol, ol, pn, pn, ol,  _,  _],
    [ _,  _, ol, bo, bo, ol, ol, bo, bo, ol,  _,  _],
    [ _,  _,  _, ol, ol,  _,  _, ol, ol,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_DOWN_1 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, sk, sk, ol,  _],
    [ _, ol, sk, ew, ey, sk, sk, ew, ey, sk, ol,  _],
    [ _,  _, ol, sk, sk, mo, mo, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _,  _, ol, sh, si, sh, sh, si, sh, ol, sk,  _],
    [ _, sk, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _, ol, pn, pn,  _,  _,  _,  _, pn, pn, ol,  _],
    [ _, ol, bo, ol,  _,  _,  _,  _, ol, bo, ol,  _],
    [ _,  _, ol,  _,  _,  _,  _,  _,  _, ol,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_DOWN_2 = CHAR_DOWN_0;

const CHAR_DOWN_3 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, sk, sk, ol,  _],
    [ _, ol, sk, ew, ey, sk, sk, ew, ey, sk, ol,  _],
    [ _,  _, ol, sk, sk, mo, mo, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, si, sh, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol, sk,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _, ol, pn, pn,  _,  _,  _,  _, pn, pn, ol,  _],
    [ _, ol, bo, ol,  _,  _,  _,  _, ol, bo, ol,  _],
    [ _,  _, ol,  _,  _,  _,  _,  _,  _, ol,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// ── UP FACING ──
const CHAR_UP_0 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, hr, hr, hr, hr, hr, hr, sk, ol,  _],
    [ _,  _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, si, sh, ol, sk,  _],
    [ _, sk, ol, sh, sh, sh, sh, sh, sh, ol, sk,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _,  _, ol, pn, pn, ol, ol, pn, pn, ol,  _,  _],
    [ _,  _, ol, bo, bo, ol, ol, bo, bo, ol,  _,  _],
    [ _,  _,  _, ol, ol,  _,  _, ol, ol,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_UP_1 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, hr, hr, hr, hr, hr, hr, sk, ol,  _],
    [ _,  _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _,  _, ol, sh, si, sh, sh, si, sh, ol, sk,  _],
    [ _, sk, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _, ol, pn, pn,  _,  _,  _,  _, pn, pn, ol,  _],
    [ _, ol, bo, ol,  _,  _,  _,  _, ol, bo, ol,  _],
    [ _,  _, ol,  _,  _,  _,  _,  _,  _, ol,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_UP_2 = CHAR_UP_0;

const CHAR_UP_3 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hh, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, hr, hr, hr, hr, hr, hr, sk, ol,  _],
    [ _,  _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, si, sh, ol,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, sh, sh, ol, sk,  _],
    [ _,  _, ol, sh, bl, bl, bl, bl, sh, ol,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, pn, pn, ol,  _,  _],
    [ _, ol, pn, pn,  _,  _,  _,  _, pn, pn, ol,  _],
    [ _, ol, bo, ol,  _,  _,  _,  _, ol, bo, ol,  _],
    [ _,  _, ol,  _,  _,  _,  _,  _,  _, ol,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// ── LEFT FACING ──
const CHAR_LEFT_0 = [
    [ _,  _,  _, ol, ol, ol, ol, ol,  _,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, ol,  _,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _,  _],
    [ ol, ew, ey, sk, sk, sk, sk, ol,  _,  _,  _,  _],
    [ _, ol, sk, sk, mo, sk, ol,  _,  _,  _,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, ol,  _,  _,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, ol, sk,  _,  _,  _],
    [ _,  _, ol, sh, bl, bl, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, ol,  _,  _,  _,  _],
    [ _,  _, ol, pn, ol, pn, pn, ol,  _,  _,  _,  _],
    [ _,  _, ol, bo, ol, ol, bo, ol,  _,  _,  _,  _],
    [ _,  _,  _, ol,  _,  _, ol,  _,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_LEFT_1 = [
    [ _,  _,  _, ol, ol, ol, ol, ol,  _,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, ol,  _,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _,  _],
    [ ol, ew, ey, sk, sk, sk, sk, ol,  _,  _,  _,  _],
    [ _, ol, sk, sk, mo, sk, ol,  _,  _,  _,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, sh, si, sh, sh, ol, sk,  _,  _,  _],
    [ _, sk, ol, sh, sh, sh, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, sh, bl, bl, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, ol,  _,  _,  _,  _],
    [ _, ol, pn, pn,  _,  _, pn, ol,  _,  _,  _,  _],
    [ _, ol, bo, ol,  _,  _, ol, bo, ol,  _,  _,  _],
    [ _,  _, ol,  _,  _,  _,  _, ol,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const CHAR_LEFT_2 = CHAR_LEFT_0;

const CHAR_LEFT_3 = [
    [ _,  _,  _, ol, ol, ol, ol, ol,  _,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, ol,  _,  _,  _],
    [ _, ol, hr, hh, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, ol,  _,  _,  _],
    [ ol, ew, ey, sk, sk, sk, sk, ol,  _,  _,  _,  _],
    [ _, ol, sk, sk, mo, sk, ol,  _,  _,  _,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, ol,  _,  _,  _,  _],
    [ _, sk, ol, sh, si, sh, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, sh, sh, sh, sh, ol, sk,  _,  _,  _],
    [ _,  _, ol, sh, bl, bl, sh, ol,  _,  _,  _,  _],
    [ _,  _, ol, pn, pn, pn, pn, ol,  _,  _,  _,  _],
    [ _,  _, ol, pn,  _,  _, pn, pn, ol,  _,  _,  _],
    [ _, ol, bo, ol,  _,  _, ol, bo, ol,  _,  _,  _],
    [ _,  _, ol,  _,  _,  _,  _, ol,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
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

// Draw a character sprite (12x16 grid)
export function drawCharacter(ctx, x, y, facing, animFrame, palette, scale = 2) {
    const template = CHAR_FRAMES[facing][animFrame % 4];
    const resolved = resolveGrid(template, palette);
    // Center the sprite: 12 pixels wide * scale, 16 pixels tall * scale
    const offsetX = x - (12 * scale) / 2;
    const offsetY = y - (16 * scale) + 8; // Feet aligned
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}

// Draw attack sword swing
export function drawSwordSwing(ctx, x, y, facing, frame, palette) {
    const swordColor = palette?.sword || '#AAAAAA';
    const progress = frame / 12;

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

// ── NPC SPRITES (12x16, Link's Awakening style robed villagers) ──

// NPC palette keys
const rb = 'robe';    // robe body
const rh = 'robeHi';  // robe highlight
const ns = 'nose';

const NPC_DOWN_0 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, sk, sk, ol,  _],
    [ _, ol, sk, ey, sk, sk, sk, sk, ey, sk, ol,  _],
    [ _, ol, sk, sk, sk, ns, ns, sk, sk, sk, ol,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _, ol, rb, rb, rh, rb, rb, rh, rb, rb, ol,  _],
    [ _, ol, rb, rb, rh, rb, rb, rh, rb, rb, ol,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _,  _,  _, ol, rb, ol, ol, rb, ol,  _,  _,  _],
    [ _,  _,  _, ol, bo, ol, ol, bo, ol,  _,  _,  _],
    [ _,  _,  _,  _, ol,  _,  _, ol,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const NPC_DOWN_1 = [
    [ _,  _,  _, ol, ol, ol, ol, ol, ol,  _,  _,  _],
    [ _,  _, ol, hr, hr, hr, hr, hr, hr, ol,  _,  _],
    [ _, ol, hr, hr, hr, hr, hr, hr, hr, hr, ol,  _],
    [ _, ol, sk, sk, sk, sk, sk, sk, sk, sk, ol,  _],
    [ _, ol, sk, ey, sk, sk, sk, sk, ey, sk, ol,  _],
    [ _, ol, sk, sk, sk, ns, ns, sk, sk, sk, ol,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _, ol, rb, rb, rh, rb, rb, rh, rb, rb, ol,  _],
    [ _, ol, rb, rb, rh, rb, rb, rh, rb, rb, ol,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, rb, ol,  _,  _],
    [ _,  _, ol, rb, rb, rb, rb, rb, ol,  _,  _,  _],
    [ _,  _,  _, ol, rb, ol, rb, ol,  _,  _,  _,  _],
    [ _,  _,  _, ol, bo, ol, ol, bo, ol,  _,  _,  _],
    [ _,  _,  _,  _, ol,  _,  _, ol,  _,  _,  _,  _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

const NPC_FRAMES = {
    down: [NPC_DOWN_0, NPC_DOWN_1],
};

export function drawNPC(ctx, x, y, facing, animFrame, palette, scale = 2) {
    // Add default highlight if not present
    const fullPalette = {
        robeHi: lightenColor(palette.robe, 30),
        ol: '#111111',
        ...palette
    };
    const frames = NPC_FRAMES[facing] || NPC_FRAMES.down;
    const template = frames[animFrame % frames.length];
    const resolved = resolveGrid(template, fullPalette);
    const offsetX = x - (12 * scale) / 2;
    const offsetY = y - (16 * scale) + 8;
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}

// Lighten a hex color by an amount
function lightenColor(hex, amount) {
    if (!hex) return '#888';
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ── ITEM SPRITES (8x8 pixel grids) ──
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

// ── BREAKABLE OBJECT SPRITES ──
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
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(x + 8, y + 6, 16, 4);
            ctx.fillRect(x + 6, y + 10, 20, 14);
            ctx.fillRect(x + 8, y + 24, 16, 4);
            ctx.fillStyle = '#A67C1A';
            ctx.fillRect(x + 10, y + 12, 12, 8);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 4, y + 4, 2, 2);
            ctx.fillRect(x + 26, y + 8, 2, 2);
            ctx.fillRect(x + 14, y + 2, 2, 2);
            ctx.fillRect(x + 28, y + 20, 2, 2);
            break;
    }
}

// ── PUSH BLOCK SPRITE (obsidian) ──
export function drawPushBlock(ctx, x, y) {
    ctx.fillStyle = '#1A0A2E';
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = '#2D1B4E';
    ctx.fillRect(x + 2, y + 2, 28, 28);
    ctx.fillStyle = '#4A2D7A';
    ctx.fillRect(x + 4, y + 4, 8, 8);
    ctx.fillRect(x + 20, y + 16, 8, 8);
    ctx.fillStyle = '#5A3D8A';
    ctx.fillRect(x + 14, y + 10, 6, 6);
}

// ── ZOMBIE SPRITE (12x16, Link's Awakening style) ──
const zol = '#111111';
const zsk = '#4A7A4A';  // zombie skin (green)
const zsh = '#3A6A3A';  // zombie shirt (dark green)
const zhi = '#5A9A5A';  // highlight
const zhr = '#2D4A2D';  // zombie hair
const zey = '#CC1111';  // red eyes

const ZOMBIE_DOWN_0 = [
    [ _,   _,   _, zol, zol, zol, zol, zol, zol,  _,   _,   _],
    [ _,   _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _,   _],
    [ _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _],
    [ _, zol, zsk, zsk, zsk, zsk, zsk, zsk, zsk, zsk, zol,  _],
    [ _, zol, zsk, zey, zsk, zsk, zsk, zsk, zey, zsk, zol,  _],
    [ _, zol, zsk, zsk, zsk, '#333', '#333', zsk, zsk, zsk, zol,  _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _, zsk, zol, zsh, zhi, zsh, zsh, zhi, zsh, zol, zsk,  _],
    [ _, zsk, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol, zsk,  _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _,   _],
    [ _,  _, zol, zhr, zhr, zol, zol, zhr, zhr, zol,  _,   _],
    [ _,  _, zol, '#333', '#333', zol, zol, '#333', '#333', zol,  _,   _],
    [ _,  _,  _, zol, zol,  _,  _, zol, zol,  _,   _,   _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,   _,   _],
];

const ZOMBIE_DOWN_1 = [
    [ _,   _,   _, zol, zol, zol, zol, zol, zol,  _,   _,   _],
    [ _,   _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _,   _],
    [ _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _],
    [ _, zol, zsk, zsk, zsk, zsk, zsk, zsk, zsk, zsk, zol,  _],
    [ _, zol, zsk, zey, zsk, zsk, zsk, zsk, zey, zsk, zol,  _],
    [ _, zol, zsk, zsk, zsk, '#333', '#333', zsk, zsk, zsk, zol,  _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zsh, zhi, zsh, zsh, zhi, zsh, zol, zsk,  _],
    [ _, zsk, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zsh, zsh, zsh, zsh, zsh, zsh, zol,  _,   _],
    [ _,  _, zol, zhr, zhr, zhr, zhr, zhr, zhr, zol,  _,   _],
    [ _, zol, zhr, zhr,  _,  _,  _,  _, zhr, zhr, zol,  _],
    [ _, zol, '#333', zol,  _,  _,  _,  _, zol, '#333', zol,  _],
    [ _,  _, zol,  _,  _,  _,  _,  _,  _, zol,  _,   _],
    [ _,  _,  _,  _,  _,  _,  _,  _,  _,  _,   _,   _],
];

export function drawZombie(ctx, x, y, animFrame, scale = 2) {
    const frames = [ZOMBIE_DOWN_0, ZOMBIE_DOWN_1];
    const grid = frames[animFrame % 2];
    const resolved = grid.map(row => row.map(c => c === 0 ? null : c));
    const offsetX = x - (12 * scale) / 2;
    const offsetY = y - (16 * scale) + 8;
    drawPixelGrid(ctx, offsetX, offsetY, scale, resolved);
}
