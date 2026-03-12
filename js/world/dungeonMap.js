import { T } from '../data/tileTypes.js';

const W = T.DUNGEON_WALL;
const F = T.DUNGEON_FLOOR;
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE;

// 16 columns x 12 rows dungeon room
export const dungeonMap = [
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, TO,F, F, F, F, F, F, F, F, F, F, F, TO,F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, TO,F, F, F, F, F, F, F, F, F, F, F, TO,F, W],
    [W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
    [W, F, F, F, F, F, F, DE,DE,F, F, F, F, F, F, W],
    [W, W, W, W, W, W, W, DE,DE,W, W, W, W, W, W, W],
];

// Dungeon spawn (entrance at bottom)
export const DUNGEON_SPAWN_X = 7.5 * 32 + 16;
export const DUNGEON_SPAWN_Y = 9 * 32;

// Zombie spawn (center of room)
export const ZOMBIE_SPAWN_X = 8 * 32;
export const ZOMBIE_SPAWN_Y = 5 * 32;
