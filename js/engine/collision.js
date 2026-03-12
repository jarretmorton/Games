import { TILE_SIZE, tileProps } from '../data/tileTypes.js';

// Check if a bounding box overlaps any solid tile
export function collidesWithMap(map, x, y, w, h) {
    // Check all four corners and midpoints of the bounding box
    const points = [
        [x, y],           // top-left
        [x + w - 1, y],   // top-right
        [x, y + h - 1],   // bottom-left
        [x + w - 1, y + h - 1], // bottom-right
        [x + w / 2, y],   // top-center
        [x + w / 2, y + h - 1], // bottom-center
        [x, y + h / 2],   // left-center
        [x + w - 1, y + h / 2], // right-center
    ];

    for (const [px, py] of points) {
        const col = Math.floor(px / TILE_SIZE);
        const row = Math.floor(py / TILE_SIZE);
        if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
            return true; // Out of bounds = solid
        }
        const tileId = map[row][col];
        const props = tileProps[tileId];
        if (props && props.solid) return true;
    }
    return false;
}

// AABB overlap test between two rectangles
export function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Get the tile at a pixel position
export function getTileAtPixel(map, px, py) {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return null;
    return { id: map[row][col], col, row };
}

// Get the interaction type of a tile the player is facing
export function getInteractTile(map, x, y, facing) {
    let checkX = x, checkY = y;
    const dist = 8;
    switch (facing) {
        case 'up':    checkY -= dist; break;
        case 'down':  checkY += dist; break;
        case 'left':  checkX -= dist; break;
        case 'right': checkX += dist; break;
    }
    const col = Math.floor(checkX / TILE_SIZE);
    const row = Math.floor(checkY / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return null;
    const tileId = map[row][col];
    const props = tileProps[tileId];
    return props?.interact ? { interact: props.interact, col, row } : null;
}
