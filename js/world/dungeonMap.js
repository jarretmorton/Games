import { T } from '../data/tileTypes.js';

const W  = T.DUNGEON_WALL;
const F  = T.DUNGEON_FLOOR;
const TO = T.TORCH;
const DE = T.DUNGEON_ENTRANCE;
const LD = T.LOCKED_DOOR;
const FF = T.FANCY_FLOOR;

// 16 columns x 18 rows dungeon
// Rows 0-5:  Fancy locked chamber (accessible through locked door at row 5)
// Rows 6-17: Main dungeon room (entrance at bottom, rows 16-17)
export const dungeonMap = [
    // ── Locked Fancy Chamber ──────────────────────────────
    [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W],
    [W, TO, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, TO,  W],
    [W, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF,  W],
    [W, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF,  W],
    [W, TO, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, FF, TO,  W],
    [W,  W,  W,  W,  W,  W,  W, LD, LD,  W,  W,  W,  W,  W,  W,  W],
    // ── Passage row (opening at cols 7-8) ────────────────
    [W,  W,  W,  W,  W,  W,  W,  F,  F,  W,  W,  W,  W,  W,  W,  W],
    // ── Main Dungeon Room ─────────────────────────────────
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W, TO,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F, TO,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W, TO,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F, TO,  F,  W],
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W],
    [W,  F,  F,  F,  F,  F,  F, DE, DE,  F,  F,  F,  F,  F,  F,  W],
    [W,  W,  W,  W,  W,  W,  W, DE, DE,  W,  W,  W,  W,  W,  W,  W],
];

// Dungeon spawn (entrance at bottom of room, row 15)
export const DUNGEON_SPAWN_X = 7.5 * 32 + 16;
export const DUNGEON_SPAWN_Y = 15 * 32;

// Skeleton spawn (center of main dungeon room)
export const ZOMBIE_SPAWN_X = 8 * 32;
export const ZOMBIE_SPAWN_Y = 11 * 32;

// Locked chamber constants
export const LOCKED_DOOR_ROW = 5;
export const LOCKED_DOOR_COLS = [7, 8];
export const ENDER_PEARL_X = 8 * 32;
export const ENDER_PEARL_Y = 2 * 32 + 16;
