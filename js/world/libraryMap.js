import { T } from '../data/tileTypes.js';

const W  = T.SHOP_WALL;
const F  = T.SHOP_FLOOR;
const BS = T.BOOKSHELF;
const ET = T.ENCHANTING_TABLE;
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE;
const LN = T.LECTERN;

// Library interior: 8 columns x 7 rows
// Back wall: bookshelves + enchanting table
// Middle: open reading area with lectern
// Torches on walls, exit at south
export const libraryMap = [
    [W,  W,  W,  W,  W,  W,  W,  W ],
    [W,  BS, BS, ET, BS, BS, BS, W ],
    [W,  BS, F,  F,  F,  F,  BS, W ],
    [W,  F,  F,  F,  LN, F,  F,  W ],
    [W,  TO, F,  F,  F,  F,  TO, W ],
    [W,  F,  F,  DE, DE, F,  F,  W ],
    [W,  W,  W,  DE, DE, W,  W,  W ],
];

// Player spawns near the door at bottom center
export const LIBRARY_SPAWN_X = 3.5 * 32 + 16;
export const LIBRARY_SPAWN_Y = 4 * 32 + 16;

// Librarian NPC position (tile coords, facing south toward player)
export const LIBRARY_NPC_X = 2;
export const LIBRARY_NPC_Y = 3;

// Interior breakables
export const libraryBreakablePositions = [
    { tileX: 5, tileY: 2, type: 'heart_pot' },
];
