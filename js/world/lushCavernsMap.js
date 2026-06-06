// ─────────────────────────────────────────────────────────────────────────────
// L2 — The Lush Caverns (map module — mirrors js/world/dungeonMap.js)
//
// Biome: lush cave (moss, glow berries, big dripleaf, cave water, vines).
// Signature mechanic: the Tripwire Hook grapple. The player crosses an
// otherwise-impassable chasm/water by facing a HOOK_ANCHOR and pressing action
// while holding `tripwire_hook` — they are yanked across to the far side.
//
// FLOW (you DROP IN from the town well, mid-map, then climb):
//   1. Well drop: you fall in at the arena center (LUSH_WELL_DROP).
//   2. Cave-spider SWARM arena (the mini-boss) — clearing it frees movement.
//   3. Reward alcove: the Tripwire Hook chest (north of the arena).
//   4. The Great Chasm: a band of CHASM + CAVE_WATER with a HOOK_ANCHOR on the
//      far (north) rim — impossible to cross on foot, trivial with the hook.
//   5. North shelf: shove the EXIT BOULDER (far left) to punch a permanent hole
//      in the mine's right wall and drop into the mine. A HIDDEN stash sits on
//      the far-right of the shelf. (The mine hole is also the return entrance:
//      arriving from the mine lands you here, at LUSH_MINE_ENTRY.)
//   NOTE: the forward link to deep_dark (L3) is deferred until that level exists.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../data/tileTypes.js';

const W  = T.MOSS_WALL;
const F  = T.MOSS_FLOOR;
const C  = T.CAVE_WATER;
const X  = T.CHASM;
const G  = T.GLOW_BERRY;
const D  = T.DRIPLEAF;
const V  = T.VINE;
const H  = T.HOOK_ANCHOR;
const Y  = T.CLAY;
const R  = T.LUSH_ROCK;     // the exit boulder (far-left, north of the chasm)
const K  = T.LUSH_SECRET;   // hidden glow-berry stash (north-east)
const TO = T.TORCH;

// 24 columns x 24 rows.
export const lushCavernsMap = [
    // row 0 — solid far-north wall (no door here — the exit is the boulder below)
    [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W],
    // row 1 — north shelf antechamber
    [W,  G,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  G,  W,  W],
    // row 2 — north shelf (reachable ONLY via the grapple): EXIT boulder on the
    //          far left (col 1), a HIDDEN glow-berry stash on the far right (col 21)
    [W,  R,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  K,  W,  W],
    // row 3 — far rim of the Great Chasm, with the HOOK ANCHOR the player aims at
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  H,  H,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 4 — THE GREAT CHASM (impassable on foot)
    [W,  X,  X,  X,  X,  X,  X,  C,  C,  C,  X,  X,  C,  C,  C,  X,  X,  X,  X,  X,  X,  X,  W,  W],
    // row 5 — chasm continues
    [W,  X,  X,  X,  X,  X,  X,  C,  C,  C,  X,  X,  C,  C,  C,  X,  X,  X,  X,  X,  X,  X,  W,  W],
    // row 6 — near rim (player launches the grapple from here, facing up)
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 7 — reward alcove floor (Tripwire Hook chest sits here, col 11)
    [W,  G,  F,  F,  F,  F,  F,  F,  F,  Y,  Y,  Y,  Y,  Y,  F,  F,  F,  F,  F,  F,  F,  G,  W,  W],
    // row 8 — alcove
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  Y,  Y,  Y,  Y,  Y,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 9 — wall band separating alcove from the boss arena, gap at cols 10-13
    [W,  W,  W,  W,  W,  W,  W,  W,  W,  F,  F,  F,  F,  F,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W],
    // row 10 — top of the SWARM ARENA
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 11 — arena (spider swarm spawns spread across this band)
    [W,  F,  F,  V,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  V,  F,  F,  F,  W,  W],
    // row 12 — arena center
    [W,  F,  F,  F,  F,  F,  F,  F,  D,  F,  F,  F,  F,  D,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 13 — arena center
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 14 — arena
    [W,  F,  F,  V,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  V,  F,  F,  F,  W,  W],
    // row 15 — bottom of arena, narrow neck back to the entry grotto (cols 10-13)
    [W,  W,  W,  W,  W,  W,  W,  W,  W,  F,  F,  F,  F,  F,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W],
    // row 16 — entry grotto
    [W,  G,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  G,  W,  W],
    // row 17 — a small cave pool to teach "water = barrier" early (safe to walk around)
    [W,  F,  F,  F,  C,  C,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  C,  C,  F,  F,  F,  F,  W,  W],
    // row 18
    [W,  F,  F,  F,  C,  C,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  C,  C,  F,  F,  F,  F,  W,  W],
    // row 19
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 20
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 21 — torches flank the spawn
    [W,  G,  F,  F,  F,  F,  TO, F,  F,  F,  F,  F,  F,  F,  F,  F,  TO, F,  F,  F,  F,  G,  W,  W],
    // row 22 — SPAWN row (player lands at col 11)
    [W,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  W,  W],
    // row 23 — south wall
    [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W],
];

// Spawn in PIXELS (tile-center convention: col*32 + 16)
export const LUSH_SPAWN_X = 11 * 32 + 16;
export const LUSH_SPAWN_Y = 22 * 32;

// Cave-spider SWARM mini-boss spawn points (several fast, low-HP spiders),
// spread across the arena (rows 10–14). [x, y] pixel coords.
export const LUSH_SWARM_SPAWNS = [
    [6  * 32 + 16, 11 * 32 + 16],
    [17 * 32 + 16, 11 * 32 + 16],
    [11 * 32 + 16, 12 * 32 + 16],
    [4  * 32 + 16, 13 * 32 + 16],
    [19 * 32 + 16, 13 * 32 + 16],
];

// Reward: the Tripwire Hook chest sits in the alcove (row 7), gated behind the
// swarm. Pixel position (tile center).
export const LUSH_REWARD_X = 11 * 32 + 16;
export const LUSH_REWARD_Y = 7 * 32 + 16;

// Grapple gate: the HOOK_ANCHOR tiles on the far rim of the Great Chasm.
// The player stands on the near rim (row 6) facing up and grapples across.
export const LUSH_ANCHOR_ROW = 3;
export const LUSH_ANCHOR_COLS = [10, 11];

// Well drop: the player falls in from the town well into the grotto just south
// of the swarm arena — a safe landing mid-map, then they climb up into the
// spiders (rather than dropping right on top of one). Pixel center.
export const LUSH_WELL_DROP_X = 11 * 32 + 16;
export const LUSH_WELL_DROP_Y = 16 * 32 + 16;

// The EXIT boulder on the north shelf (far left) — shove it to open the mine.
export const LUSH_ROCK_ROW = 2;
export const LUSH_ROCK_COL = 1;

// Return entrance: arriving from the mine hole lands the player on the north
// shelf, just east of the (now-removed) boulder.
export const LUSH_MINE_ENTRY_X = 3 * 32 + 16;
export const LUSH_MINE_ENTRY_Y = 2 * 32 + 16;

// Hidden glow-berry stash on the far-right of the north shelf (the L2 secret).
export const LUSH_SECRET_ROW = 2;
export const LUSH_SECRET_COL = 21;
