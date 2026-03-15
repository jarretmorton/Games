import { T } from '../data/tileTypes.js';

const W = T.SHOP_WALL;
const F = T.SHOP_FLOOR;
const SH = T.SHOP_SHELF;    // Shelves along the back wall
const CT = T.CRAFTING_TABLE; // Crafting table in the middle
const SD = T.SHOP_DESK;     // Shopkeeper's desk on the left
const SC = T.SKELETON_CAGE; // Skeleton cage on the right
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE; // Reuse for shop exit door

// Shop interior: 8 columns x 7 rows (fits in one screen at 256x224)
// Layout: shelves across back, desk left, crafting middle, cage right
export const shopMap = [
    [W,  W,  W,  W,  W,  W,  W,  W ],
    [W,  SH, SH, SH, SH, SH, SH, W ],
    [W,  SD, F,  F,  F,  F,  SC, W ],
    [W,  F,  F,  CT, CT, F,  F,  W ],
    [W,  TO, F,  F,  F,  F,  TO, W ],
    [W,  F,  F,  DE, DE, F,  F,  W ],
    [W,  W,  W,  DE, DE, W,  W,  W ],
];

// Player spawns near the door at bottom
export const SHOP_SPAWN_X = 3.5 * 32 + 16;
export const SHOP_SPAWN_Y = 4 * 32 + 16;

// Shopkeeper position (behind desk on the left, row 2)
export const SHOPKEEPER_X = 1;
export const SHOPKEEPER_Y = 3;

// Skeleton trapped in cage on the right (row 2)
export const SKELETON_X = 6 * 32 + 16;
export const SKELETON_Y = 2 * 32 + 16;

// Crafting table position (middle of room)
export const CRAFTING_TABLE_COL = 3;
export const CRAFTING_TABLE_ROW = 3;
