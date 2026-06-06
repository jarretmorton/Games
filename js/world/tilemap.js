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
            case '#E8A23D': // Glow-berry vine (L2) — gold berries on a dark wall
                ctx.fillStyle = '#3D5A28';
                ctx.fillRect(x + 6, y + 0, 3, 20);
                ctx.fillRect(x + 20, y + 0, 3, 24);
                ctx.fillRect(x + 13, y + 0, 2, 14);
                ctx.fillStyle = '#E8A23D';
                ctx.fillRect(x + 5, y + 8, 5, 5);
                ctx.fillRect(x + 19, y + 14, 5, 5);
                ctx.fillRect(x + 12, y + 18, 4, 4);
                ctx.fillStyle = '#FFD27A';
                ctx.fillRect(x + 6, y + 9, 2, 2);
                ctx.fillRect(x + 20, y + 15, 2, 2);
                if (animFrame === 1) { // gentle glow pulse
                    ctx.fillStyle = 'rgba(232, 162, 61, 0.25)';
                    ctx.fillRect(x + 3, y + 6, 10, 10);
                    ctx.fillRect(x + 17, y + 12, 10, 10);
                }
                break;
            case '#4A8B2E': // Hanging vine (L2)
                ctx.fillStyle = '#2D5A1E';
                ctx.fillRect(x + 8, y + 0, 3, 28);
                ctx.fillRect(x + 20, y + 0, 3, 22);
                ctx.fillStyle = '#4A8B2E';
                ctx.fillRect(x + 7, y + 6, 2, 4);
                ctx.fillRect(x + 19, y + 12, 2, 4);
                ctx.fillRect(x + 9, y + 20, 2, 4);
                break;
        }
    }

    // ── L2 Lush Caverns special tiles ──
    if (tileId === 50) { // T.CAVE_WATER — teal cave pool with drips
        ctx.fillStyle = '#1E5252';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        ctx.fillStyle = animFrame === 1 ? '#3A8B8B' : '#2E6B6B';
        ctx.fillRect(x + 5, y + 8, 8, 2);
        ctx.fillRect(x + 18, y + 16, 8, 2);
        ctx.fillRect(x + 10, y + 22, 7, 2);
    }

    if (tileId === 51) { // T.CHASM — bottomless dark gap with crumbling rim
        ctx.fillStyle = '#070A07';
        ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
        ctx.fillStyle = '#243A22';
        ctx.fillRect(x, y, s, 3);
        ctx.fillRect(x, y + s - 3, s, 3);
        ctx.fillRect(x, y, 3, s);
        ctx.fillRect(x + s - 3, y, 3, s);
    }

    if (tileId === 53) { // T.DRIPLEAF — big dripleaf traversal platform
        ctx.fillStyle = '#2D6048';
        ctx.fillRect(x + 1, y + 4, s - 2, s - 8);
        ctx.fillStyle = '#4A9A6E';
        ctx.fillRect(x + 4, y + 6, s - 8, 10);
        // central stem
        ctx.fillStyle = '#6ECF92';
        ctx.fillRect(x + 14, y + 8, 4, s - 12);
        // leaf veins
        ctx.fillStyle = '#2D6048';
        ctx.fillRect(x + 8, y + 12, 16, 1);
        ctx.fillRect(x + 8, y + 18, 16, 1);
    }

    if (tileId === 55) { // T.HOOK_ANCHOR — wooden post the grapple latches onto
        ctx.fillStyle = '#473522';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#5A4630';
        ctx.fillRect(x + 8, y + 2, 16, s - 4);
        ctx.fillStyle = '#6B5238';
        ctx.fillRect(x + 11, y + 4, 10, s - 8);
        // iron ring the hook catches
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 11, y + 6, 10, 3);
        ctx.fillStyle = '#AAA';
        ctx.fillRect(x + 12, y + 7, 8, 1);
        if (animFrame === 1) {
            ctx.fillStyle = 'rgba(232, 162, 61, 0.35)';
            ctx.fillRect(x + 9, y + 4, 14, 8);
        }
    }

    if (tileId === 56) { // T.CLAY — smooth clay accent floor
        ctx.fillStyle = '#856848';
        ctx.fillRect(x + 2, y + 2, 13, 13);
        ctx.fillRect(x + 17, y + 17, 13, 13);
        ctx.fillStyle = '#9A7A5A';
        ctx.fillRect(x + 17, y + 2, 13, 13);
        ctx.fillRect(x + 2, y + 17, 13, 13);
    }

    if (tileId === 57) { // T.LUSH_EXIT — dark mossy passage onward
        ctx.fillStyle = '#0D1A0D';
        ctx.fillRect(x + 4, y + 2, s - 8, s - 2);
        ctx.fillStyle = '#1A2E1A';
        ctx.fillRect(x + 7, y + 6, s - 14, s - 6);
        // glow-berry lit archway
        ctx.fillStyle = '#3D5A28';
        ctx.fillRect(x + 2, y, 3, s);
        ctx.fillRect(x + s - 5, y, 3, s);
        ctx.fillStyle = '#E8A23D';
        ctx.fillRect(x + 2, y + 5, 3, 3);
        ctx.fillRect(x + s - 5, y + 11, 3, 3);
        if (animFrame === 1) {
            ctx.fillStyle = 'rgba(46, 196, 182, 0.25)';
            ctx.fillRect(x + 9, y + 9, s - 18, s - 12);
        }
    }

    if (tileId === 58) { // T.LUSH_ROCK — a shove-able boulder (the L2 exit)
        ctx.fillStyle = '#46402F';
        ctx.fillRect(x + 3, y + 6, s - 6, s - 9);
        ctx.fillStyle = '#5A5246';
        ctx.fillRect(x + 6, y + 4, s - 14, s - 10);
        ctx.fillStyle = '#6B6353';
        ctx.fillRect(x + 9, y + 7, 9, 7);
        // cracks + shadow
        ctx.fillStyle = '#33301F';
        ctx.fillRect(x + 14, y + 10, 2, 10);
        ctx.fillRect(x + 10, y + 16, 9, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 4, y + s - 5, s - 8, 3);
    }

    if (tileId === 59) { // T.LUSH_SECRET — disguised as mossy wall; faint sparkle
        // base fill/speckle already drew the moss-wall look; just hint a glimmer
        if (animFrame === 1) {
            ctx.fillStyle = 'rgba(232, 162, 61, 0.18)';
            ctx.fillRect(x + 13, y + 13, 5, 5);
            ctx.fillStyle = 'rgba(120, 220, 120, 0.15)';
            ctx.fillRect(x + 8, y + 20, 3, 3);
        }
    }

    if (tileId === 60) { // T.MINE_HOLE — passage punched through the mine wall
        ctx.fillStyle = '#070A07';
        ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
        // jagged broken-rock rim
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(x + 1, y + 1, s - 2, 3);
        ctx.fillRect(x + 1, y + s - 4, s - 2, 3);
        ctx.fillStyle = '#2A4A1E'; // moss creeping in from the lush side
        ctx.fillRect(x + s - 4, y + 8, 3, 6);
        ctx.fillRect(x + s - 6, y + 16, 3, 4);
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

    // Shop shelf (potions and artifacts)
    if (props.interact === 'shop_shelf') {
        // Wooden shelf backing
        ctx.fillStyle = '#5A3520';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        // Shelf planks
        ctx.fillStyle = '#7A5C12';
        ctx.fillRect(x + 1, y + 14, s - 2, 2);
        // Top shelf items - potions
        ctx.fillStyle = '#CC3333'; // red potion
        ctx.fillRect(x + 4, y + 4, 5, 9);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 5, y + 2, 3, 3);
        ctx.fillStyle = '#3366CC'; // blue potion
        ctx.fillRect(x + 14, y + 4, 5, 9);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 15, y + 2, 3, 3);
        ctx.fillStyle = '#33CC33'; // green potion
        ctx.fillRect(x + 24, y + 5, 4, 8);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 25, y + 3, 2, 3);
        // Bottom shelf items - artifacts
        ctx.fillStyle = '#8855CC'; // crystal orb
        ctx.fillRect(x + 5, y + 18, 7, 7);
        ctx.fillStyle = '#AA77EE';
        ctx.fillRect(x + 7, y + 20, 3, 3);
        ctx.fillStyle = '#D4B896'; // scroll
        ctx.fillRect(x + 18, y + 20, 8, 5);
        ctx.fillStyle = '#B8986A';
        ctx.fillRect(x + 18, y + 20, 2, 5);
        ctx.fillRect(x + 24, y + 20, 2, 5);
    }

    // Crafting table
    if (props.interact === 'crafting_table') {
        ctx.fillStyle = '#5A3520';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        // 3x3 crafting grid
        for (let gy = 0; gy < 3; gy++) {
            for (let gx = 0; gx < 3; gx++) {
                ctx.fillStyle = '#D2B48C';
                ctx.fillRect(x + 5 + gx * 8, y + 5 + gy * 8, 6, 6);
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(x + 6 + gx * 8, y + 6 + gy * 8, 4, 4);
            }
        }
    }

    // Shop desk
    if (tileId === 36) { // T.SHOP_DESK
        ctx.fillStyle = '#5A3520';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 2, y + 4, s - 4, s - 8);
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(x + 4, y + 6, s - 8, 4);
        // Emerald on desk
        ctx.fillStyle = '#2D8B46';
        ctx.fillRect(x + 14, y + 16, 6, 6);
        ctx.fillStyle = '#5FD394';
        ctx.fillRect(x + 15, y + 17, 4, 4);
    }

    // Skeleton cage floor
    if (tileId === 37) { // T.SKELETON_CAGE
        // Just floor - the cage/skeleton is drawn as an entity overlay
    }

    // Library/Home doors (render like shop door with a different color accent)
    if (props?.interact === 'library') {
        ctx.fillStyle = '#7A5C12';
        ctx.fillRect(x + 10, y + 2, 12, s - 2);
        ctx.fillStyle = '#3366CC';
        ctx.fillRect(x + 12, y + 6, 8, 4); // blue book accent
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 20, y + 14, 2, 2);
    }

    if (props?.interact === 'home') {
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 10, y + 2, 12, s - 2);
        ctx.fillStyle = '#CC4444';
        ctx.fillRect(x + 12, y + 5, 8, 5); // red flower pot accent
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 20, y + 14, 2, 2);
    }

    // Bed tile
    if (tileId === 42) { // T.BED
        ctx.fillStyle = '#AA2222';
        ctx.fillRect(x, y, s, s);
        // Pillow
        ctx.fillStyle = '#EEEEEE';
        ctx.fillRect(x + 3, y + 3, 12, 10);
        // Blanket
        ctx.fillStyle = '#CC4444';
        ctx.fillRect(x + 3, y + 14, 26, 14);
        ctx.fillStyle = '#AA2222';
        ctx.fillRect(x + 6, y + 16, 20, 2);
        ctx.fillRect(x + 6, y + 20, 20, 2);
        // Frame
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x, y, 3, s);
        ctx.fillRect(x + 29, y, 3, s);
    }

    // Furnace tile
    if (tileId === 43) { // T.FURNACE
        ctx.fillStyle = '#444444';
        ctx.fillRect(x, y, s, s);
        // Stone body
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        // Furnace door
        ctx.fillStyle = '#222222';
        ctx.fillRect(x + 8, y + 16, 16, 12);
        // Fire glow (animated)
        ctx.fillStyle = animFrame === 1 ? '#FF6600' : '#FF4400';
        ctx.fillRect(x + 10, y + 18, 12, 8);
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(x + 12, y + 20, 8, 4);
        // Top slots
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 8, y + 4, 16, 10);
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 10, y + 6, 12, 6);
    }

    // Enchanting Table tile
    if (props?.interact === 'enchanting_table') {
        // Dark base
        ctx.fillStyle = '#220044';
        ctx.fillRect(x, y, s, s);
        // Purple book pedestal
        ctx.fillStyle = '#550088';
        ctx.fillRect(x + 4, y + 16, 24, 12);
        ctx.fillStyle = '#7700AA';
        ctx.fillRect(x + 6, y + 14, 20, 8);
        // Open book on top
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(x + 7, y + 5, 10, 8);
        ctx.fillStyle = '#FF2222';
        ctx.fillRect(x + 8, y + 6, 8, 6);
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(x + 17, y + 5, 8, 8);
        ctx.fillStyle = '#FF2222';
        ctx.fillRect(x + 18, y + 6, 6, 6);
        // Page line divider
        ctx.fillStyle = '#660000';
        ctx.fillRect(x + 15, y + 5, 2, 8);
        // Floating runes (animated)
        ctx.fillStyle = animFrame === 1 ? '#AA88FF' : '#8866DD';
        ctx.fillRect(x + 4, y + 2, 2, 2);
        ctx.fillRect(x + 26, y + 3, 2, 2);
        ctx.fillRect(x + 14, y + 1, 2, 2);
    }

    // Secret Bush tile (looks like dark tree top - blends with forest)
    if (props?.interact === 'secret_bush') {
        // Render exactly like a tree top so it's hidden
        ctx.fillStyle = '#2D5A1E';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#3D6B22';
        ctx.fillRect(x + 4, y + 4, 8, 8);
        ctx.fillRect(x + 20, y + 16, 8, 8);
        ctx.fillStyle = '#1E4A12';
        ctx.fillRect(x + 12, y + 12, 8, 8);
        // Very subtle sparkle when looking closely
        if (animFrame === 1) {
            ctx.fillStyle = 'rgba(100, 220, 100, 0.3)';
            ctx.fillRect(x + 13, y + 13, 4, 4);
        }
    }

    // Lectern tile
    if (props?.interact === 'lectern') {
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x, y, s, s);
        // Wooden post
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(x + 13, y + 10, 6, 18);
        // Base
        ctx.fillStyle = '#7A4A20';
        ctx.fillRect(x + 6, y + 24, 20, 4);
        // Reading surface
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(x + 6, y + 4, 20, 10);
        // Book on lectern
        ctx.fillStyle = '#CC3333';
        ctx.fillRect(x + 9, y + 5, 14, 8);
        ctx.fillStyle = '#EEEEEE';
        ctx.fillRect(x + 11, y + 6, 10, 5);
        ctx.fillStyle = '#999999';
        ctx.fillRect(x + 11, y + 8, 10, 1);
        ctx.fillRect(x + 15, y + 6, 1, 5);
    }

    // Fancy enchanted floor
    if (tileId === 39) { // T.FANCY_FLOOR
        // Dark purple stone with magical inlay
        ctx.fillStyle = '#1A1630';
        ctx.fillRect(x, y, s, s);
        // Stone block pattern
        ctx.fillStyle = '#221A3A';
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillRect(x + 17, y + 17, 13, 13);
        ctx.fillRect(x + 1, y + 17, 14, 13);
        ctx.fillRect(x + 17, y + 1, 13, 14);
        // Grout lines
        ctx.fillStyle = '#0E0A1A';
        ctx.fillRect(x + 15, y, 2, s);
        ctx.fillRect(x, y + 15, s, 2);
        // Magical rune dots (animated sparkle)
        ctx.fillStyle = '#5533AA';
        ctx.fillRect(x + 7, y + 7, 2, 2);
        ctx.fillRect(x + 23, y + 23, 2, 2);
        ctx.fillRect(x + 7, y + 23, 2, 2);
        ctx.fillRect(x + 23, y + 7, 2, 2);
        if (animFrame === 1) {
            ctx.fillStyle = '#AA88EE';
            ctx.fillRect(x + 7, y + 7, 2, 2);
            ctx.fillRect(x + 23, y + 23, 2, 2);
        } else {
            ctx.fillStyle = '#AA88EE';
            ctx.fillRect(x + 7, y + 23, 2, 2);
            ctx.fillRect(x + 23, y + 7, 2, 2);
        }
    }

    // Locked door
    if (tileId === 38) { // T.LOCKED_DOOR
        // Heavy iron-bound door
        ctx.fillStyle = '#1A0A00';
        ctx.fillRect(x, y, s, s);
        // Door frame (stone)
        ctx.fillStyle = '#3A3040';
        ctx.fillRect(x + 2, y + 0, s - 4, s);
        // Door panels
        ctx.fillStyle = '#2A1E10';
        ctx.fillRect(x + 4, y + 2, 10, 12);
        ctx.fillRect(x + 18, y + 2, 10, 12);
        ctx.fillRect(x + 4, y + 16, 10, 14);
        ctx.fillRect(x + 18, y + 16, 10, 14);
        // Metal bands
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 2, y + 14, s - 4, 3);
        ctx.fillRect(x + 2, y + 0, s - 4, 3);
        ctx.fillRect(x + 14, y + 0, 4, s);
        // Gold lock mechanism
        ctx.fillStyle = '#CC9900';
        ctx.fillRect(x + 11, y + 11, 10, 7);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 12, y + 12, 8, 5);
        // Keyhole
        ctx.fillStyle = '#1A0A00';
        ctx.fillRect(x + 15, y + 13, 2, 3);
        ctx.fillRect(x + 14, y + 15, 4, 2);
        // Glow pulse from keyhole
        if (animFrame === 1) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            ctx.fillRect(x + 10, y + 9, 12, 10);
        }
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
