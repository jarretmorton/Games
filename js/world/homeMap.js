import { T } from '../data/tileTypes.js';

const W  = T.SHOP_WALL;
const F  = T.SHOP_FLOOR;
const BD = T.BED;
const FN = T.FURNACE;
const CT = T.CRAFTING_TABLE;
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE;
const BS = T.BOOKSHELF;

// Home interior: 8 columns x 7 rows
// Bed and furnace in upper corners, crafting table mid-right
// Cozy villager home with Minecraft decor
export const homeMap = [
    [W,  W,  W,  W,  W,  W,  W,  W ],
    [W,  BD, BD, F,  F,  FN, F,  W ],
    [W,  F,  F,  F,  F,  F,  BS, W ],
    [W,  F,  CT, CT, F,  F,  F,  W ],
    [W,  TO, F,  F,  F,  F,  TO, W ],
    [W,  F,  F,  DE, DE, F,  F,  W ],
    [W,  W,  W,  DE, DE, W,  W,  W ],
];

// Player spawns near the door at bottom center
export const HOME_SPAWN_X = 3.5 * 32 + 16;
export const HOME_SPAWN_Y = 4 * 32 + 16;

// Resident NPC position (tile coords)
export const HOME_NPC_X = 5;
export const HOME_NPC_Y = 2;
