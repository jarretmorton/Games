import { T } from '../data/tileTypes.js';

const W  = T.SHOP_WALL;
const F  = T.SHOP_FLOOR;
const FF = T.FANCY_FLOOR;
const BS = T.BOOKSHELF;
const ET = T.ENCHANTING_TABLE;
const CT = T.CRAFTING_TABLE;
const TO = T.TORCH;
const LN = T.LECTERN;
const DE = T.DUNGEON_ENTRANCE;

// Alchemist's Workshop: 8 columns x 7 rows
// Back wall: bookshelves + enchanting tables
// Centre: arcane circle of fancy floor with grimoire lectern
// Lab benches (crafting tables) flank the arcane circle
export const alchemistMap = [
    [W,  W,  W,  W,  W,  W,  W,  W ],
    [W,  BS, ET, ET, BS, BS, TO, W ],
    [W,  CT, FF, FF, FF, CT, BS, W ],
    [W,  F,  FF, LN, FF, F,  F,  W ],
    [W,  TO, F,  FF, FF, F,  TO, W ],
    [W,  F,  F,  DE, DE, F,  F,  W ],
    [W,  W,  W,  DE, DE, W,  W,  W ],
];

// Player spawns near the door at bottom centre
export const ALCHEMIST_SPAWN_X = 3.5 * 32 + 16;
export const ALCHEMIST_SPAWN_Y = 4 * 32 + 16;
