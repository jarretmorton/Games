import { TILE_SIZE, tileProps } from '../data/tileTypes.js';

let animFrame = 0;
let animTimer = 0;

export function updateTileAnimations() {
    animTimer++;
    if (animTimer >= 30) {
        animTimer = 0;
        animFrame = (animFrame + 1) % 2;
    }
}

export function renderMap(ctx, map, cameraX, cameraY, viewW, viewH, layer) {
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(map[0].length - 1, Math.ceil((cameraX + viewW) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endRow = Math.min(map.length - 1, Math.ceil((cameraY + viewH) / TILE_SIZE));

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const tileId = map[row][col];
            const props = tileProps[tileId];
            if (!props) continue;

            const isOverhead = !!props.overhead;

            // Layer 0: ground tiles (non-overhead)
            // Layer 2: overhead tiles
            if (layer === 0 && isOverhead) continue;
            if (layer === 2 && !isOverhead) continue;

            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            drawTile(ctx, tileId, props, x, y);
        }
    }
}

function drawTile(ctx, tileId, props, x, y) {
    const s = TILE_SIZE;

    // Base color
    ctx.fillStyle = props.color;
    ctx.fillRect(x, y, s, s);

    // Texture noise pattern using tile position as seed
    ctx.fillStyle = props.color2;
    const seed = (x * 7 + y * 13) & 0xFFFF;
    for (let i = 0; i < 6; i++) {
        const px = ((seed * (i + 1) * 31) % (s - 2)) + 1;
        const py = ((seed * (i + 1) * 47) % (s - 2)) + 1;
        ctx.fillRect(x + px, y + py, 2, 2);
    }

    // Water animation
    if (props.animated && animFrame === 1) {
        ctx.fillStyle = '#4488DD';
        for (let i = 0; i < 4; i++) {
            const wx = x + ((seed + i * 7) % (s - 4));
            const wy = y + ((seed + i * 11) % (s - 2));
            ctx.fillRect(wx, wy, 4, 1);
        }
    }

    // Decorations (flowers, pressure plate markers, torches)
    if (props.decor) {
        ctx.fillStyle = props.decor;
        switch (props.decor) {
            case '#CC3333': // Red flower
            case '#CCCC33': // Yellow flower
                ctx.fillRect(x + 12, y + 10, 4, 4);
                ctx.fillRect(x + 14, y + 8, 4, 4);
                ctx.fillStyle = '#2D5A1E';
                ctx.fillRect(x + 14, y + 14, 2, 6);
                break;
            case '#993333': // Pressure plate redstone dot
                ctx.fillRect(x + 13, y + 13, 6, 6);
                break;
            case '#FF8800': // Torch flame
                ctx.fillRect(x + 13, y + 6, 6, 6);
                ctx.fillStyle = '#FFCC00';
                ctx.fillRect(x + 14, y + 7, 4, 4);
                if (animFrame === 1) {
                    ctx.fillRect(x + 15, y + 4, 2, 3);
                }
                break;
        }
    }

    // Special tile rendering
    if (props.interact === 'shop') {
        // Door with a little sign
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(x + 10, y + 2, 12, s - 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 20, y + 14, 2, 2); // door handle
    }

    if (props.interact === 'bookshelf') {
        // Books on shelf
        ctx.fillStyle = '#CC3333';
        ctx.fillRect(x + 4, y + 4, 6, 10);
        ctx.fillStyle = '#3333CC';
        ctx.fillRect(x + 12, y + 4, 6, 10);
        ctx.fillStyle = '#33CC33';
        ctx.fillRect(x + 22, y + 4, 6, 10);
        ctx.fillStyle = '#CC3333';
        ctx.fillRect(x + 4, y + 18, 6, 10);
        ctx.fillStyle = '#CCCC33';
        ctx.fillRect(x + 12, y + 18, 6, 10);
        ctx.fillStyle = '#8833CC';
        ctx.fillRect(x + 22, y + 18, 6, 10);
    }

    // Fence posts
    if (props === tileProps[8]) {
        ctx.fillStyle = '#6B5030';
        ctx.fillRect(x + 2, y + 4, 4, 24);
        ctx.fillRect(x + 26, y + 4, 4, 24);
        ctx.fillStyle = '#7A6348';
        ctx.fillRect(x, y + 8, s, 4);
        ctx.fillRect(x, y + 20, s, 4);
    }

    // Well
    if (props === tileProps[15]) {
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = '#1A3366';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 6, y + 2, 2, 28);
        ctx.fillRect(x + 24, y + 2, 2, 28);
        ctx.fillRect(x + 6, y + 0, 20, 2);
    }

    // Fountain center
    if (props === tileProps[16]) {
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 6, y + 6, 20, 20);
        ctx.fillStyle = '#3366CC';
        ctx.fillRect(x + 10, y + 10, 12, 12);
        // Water spout
        if (animFrame === 0) {
            ctx.fillStyle = '#6699DD';
            ctx.fillRect(x + 14, y + 4, 4, 8);
        } else {
            ctx.fillStyle = '#6699DD';
            ctx.fillRect(x + 14, y + 2, 4, 10);
        }
    }

    // Dungeon blocked
    if (props === tileProps[20]) {
        // Iron bars
        ctx.fillStyle = '#666';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 4 + i * 8, y, 2, s);
        }
        ctx.fillRect(x, y + 8, s, 2);
        ctx.fillRect(x, y + 22, s, 2);
    }

    // Church stained glass window
    if (props === tileProps[25]) {
        ctx.fillStyle = '#4488CC';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = '#CC4444';
        ctx.fillRect(x + 10, y + 6, 12, 8);
        ctx.fillStyle = '#CCCC44';
        ctx.fillRect(x + 10, y + 16, 12, 8);
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + 15, y + 4, 2, 24);
        ctx.fillRect(x + 4, y + 14, 24, 2);
    }

    // Tree top (overhead)
    if (props.overhead && props.color === '#2D5A1E') {
        ctx.fillStyle = '#2D5A1E';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#3D6B22';
        ctx.fillRect(x + 4, y + 4, 8, 8);
        ctx.fillRect(x + 20, y + 16, 8, 8);
        ctx.fillStyle = '#1E4A12';
        ctx.fillRect(x + 12, y + 12, 8, 8);
    }

    // Stone tablet
    if (props.interact === 'tablet') {
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 6, y + 4, 20, 24);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 10, y + 8, 12, 2);
        ctx.fillRect(x + 10, y + 13, 12, 2);
        ctx.fillRect(x + 10, y + 18, 12, 2);
    }
}

export function getTileAt(map, pixelX, pixelY) {
    const col = Math.floor(pixelX / TILE_SIZE);
    const row = Math.floor(pixelY / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return null;
    }
    return map[row][col];
}

export function isSolidTile(map, pixelX, pixelY) {
    const tileId = getTileAt(map, pixelX, pixelY);
    if (tileId === null) return true;
    const props = tileProps[tileId];
    return props ? props.solid : true;
}
