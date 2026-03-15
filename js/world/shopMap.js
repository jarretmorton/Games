import { T } from '../data/tileTypes.js';

const W = T.DUNGEON_WALL;   // Reuse dungeon wall for shop walls
const F = T.DUNGEON_FLOOR;  // Reuse dungeon floor
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE; // Reuse for shop exit door
const BS = T.BOOKSHELF;     // Shelves with items

// Shop interior: 12 columns x 10 rows
// Features: crafting table area, shelves, shopkeeper spot, skeleton corner
export const shopMap = [
    [W, W, W, W, W, W, W, W, W, W, W, W],
    [W, F, F, F, F, F, F, F, F, BS,BS, W],
    [W, F, F, F, F, F, F, F, F, BS,BS, W],
    [W, F, F, F, F, F, F, F, F, F, F, W],
    [W, TO,F, F, F, F, F, F, F, F, TO,W],
    [W, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, DE,DE,F, F, F, F, W],
    [W, W, W, W, W, DE,DE,W, W, W, W, W],
];

// Player spawns near the door at bottom
export const SHOP_SPAWN_X = 5.5 * 32 + 16;
export const SHOP_SPAWN_Y = 7 * 32;

// Shopkeeper position (center-ish of room)
export const SHOPKEEPER_X = 5;
export const SHOPKEEPER_Y = 4;

// Skeleton trapped in back-right corner
export const SKELETON_X = 10 * 32;
export const SKELETON_Y = 2 * 32;

// Crafting table position (left side of room)
export const CRAFTING_TABLE_X = 2;
export const CRAFTING_TABLE_Y = 2;
