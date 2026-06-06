// ─────────────────────────────────────────────────────────────────────────────
// LEVEL REGISTRY  (Phase 0 foundation — see docs/LEVEL_SPEC.md §4)
//
// Single source of truth for the game's areas. Every area — the village hub,
// its interiors, and each dungeon — is catalogued here as one entry. New
// dungeon levels (L2 Lush Caverns → L5 The End) are added by APPENDING one
// entry to LEVELS; this is the shared file level authors touch.
//
// This module is intentionally pure DATA + pure helpers. The engine-side verbs
// that consume it (enterLevel, the transition, save/load) live in js/main.js,
// because they need the live player/camera/enemy/music state.
//
// SCHEMA — every entry satisfies (see docs/LEVEL_SPEC.md §4):
//   id            unique snake_case string; also the value of state.levelId
//   title         display name
//   kind          'hub' | 'interior' | 'dungeon'
//   map           the 2-D tile-ID array (from js/world/<name>Map.js)
//   spawn         [x, y] in PIXELS (tile-center convention: col*32 + 16)
//   gatingItemIn  item id REQUIRED to enter (null = open)
//   gatingItemOut item id the player must HOLD to take the forward exit (null = open)
//   grantsItem    item id this level awards (null = none)
//   boss          { type, spawn:[x,y], clearedFlag } or null
//   nextLevel     id this level's forward exit leads to (null = none yet)
//   music         music track id for this area
//
// GATING-CHAIN INVARIANT (docs/LEVEL_SPEC.md §4): for a dungeon Lₙ,
//   grantsItem(Lₙ) === gatingItemOut(Lₙ)  and that item unlocks Lₙ₊₁'s entrance.
// ENDER-PEARL INVARIANT: 'ender_pearl' is granted in L1 and never consumed by
//   any gate — it is required by the L5 boss design. Do NOT set it as any
//   level's gatingItemOut.
// ─────────────────────────────────────────────────────────────────────────────

import { townMap, SPAWN_X, SPAWN_Y } from './townMap.js';
import { dungeonMap, DUNGEON_SPAWN_X, DUNGEON_SPAWN_Y, ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y } from './dungeonMap.js';
import { shopMap, SHOP_SPAWN_X, SHOP_SPAWN_Y } from './shopMap.js';
import { libraryMap, LIBRARY_SPAWN_X, LIBRARY_SPAWN_Y } from './libraryMap.js';
import { homeMap, HOME_SPAWN_X, HOME_SPAWN_Y } from './homeMap.js';
import { alchemistMap, ALCHEMIST_SPAWN_X, ALCHEMIST_SPAWN_Y } from './alchemistMap.js';

export const LEVELS = {
    // ── L1: The Village & the Sealed Mine (existing) ────────────────────────
    village: {
        id: 'village',
        title: 'The Village',
        kind: 'hub',
        map: townMap,
        spawn: [SPAWN_X, SPAWN_Y],
        gatingItemIn: null,
        gatingItemOut: null,
        grantsItem: null,
        boss: null,
        nextLevel: 'mine',     // the sealed mine is reached from the hub
        music: 'overworld',
    },

    mine: {
        id: 'mine',
        title: 'The Sealed Mine',
        kind: 'dungeon',
        map: dungeonMap,
        spawn: [DUNGEON_SPAWN_X, DUNGEON_SPAWN_Y],
        gatingItemIn: null,    // gated by the pressure-plate puzzle, not an item
        gatingItemOut: null,   // Ender Pearl is HELD for L5, not spent to leave
        grantsItem: 'ender_pearl',
        boss: { type: 'dungeon_skeleton', spawn: [ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y], clearedFlag: 'dungeonCleared' },
        nextLevel: 'lush_caverns', // L2 — appended by its author
        music: 'dungeon',
    },

    // ── Village interiors (hub-internal sub-areas, not arc dungeons) ────────
    shop: {
        id: 'shop', title: 'The Shop', kind: 'interior',
        map: shopMap, spawn: [SHOP_SPAWN_X, SHOP_SPAWN_Y],
        gatingItemIn: null, gatingItemOut: null, grantsItem: null,
        boss: null, nextLevel: 'village', music: 'shop',
    },
    library: {
        id: 'library', title: 'The Library', kind: 'interior',
        map: libraryMap, spawn: [LIBRARY_SPAWN_X, LIBRARY_SPAWN_Y],
        gatingItemIn: null, gatingItemOut: null, grantsItem: null,
        boss: null, nextLevel: 'village', music: 'shop',
    },
    home: {
        id: 'home', title: 'Home', kind: 'interior',
        map: homeMap, spawn: [HOME_SPAWN_X, HOME_SPAWN_Y],
        gatingItemIn: null, gatingItemOut: null, grantsItem: null,
        boss: null, nextLevel: 'village', music: 'shop',
    },
    alchemist: {
        id: 'alchemist', title: 'The Alchemist', kind: 'interior',
        map: alchemistMap, spawn: [ALCHEMIST_SPAWN_X, ALCHEMIST_SPAWN_Y],
        gatingItemIn: null, gatingItemOut: null, grantsItem: null,
        boss: null, nextLevel: 'village', music: 'shop',
    },

    // ── L2–L5: appended by level authors (do NOT collide tile IDs, §6) ──────
    // lush_caverns:    { ... gatingItemOut: 'tripwire_hook',   nextLevel: 'deep_dark' }
    // deep_dark:       { ... gatingItemIn:  'tripwire_hook',   gatingItemOut: 'flint_and_steel', nextLevel: 'nether_fortress' }
    // nether_fortress: { ... gatingItemIn:  'flint_and_steel', gatingItemOut: 'eye_of_ender',    nextLevel: 'the_end' }
    // the_end:         { ... gatingItemIn:  'eye_of_ender' }   // finale; Ender Pearl required
};

export const LEVEL_IDS = Object.keys(LEVELS);

/** Look up a level entry by id (throws on a typo so authors fail loudly). */
export function getLevel(id) {
    const lvl = LEVELS[id];
    if (!lvl) throw new Error(`[levels] unknown level id: ${id}`);
    return lvl;
}

/**
 * Bridge the legacy boolean flags to a canonical level id.
 * The engine still tracks location with inDungeon/inShop/... booleans; this
 * derives the single currentLevelId the debug hook and save format report.
 */
export function levelIdFromFlags({ inDungeon, inShop, inLibrary, inHome, inAlchemist } = {}) {
    if (inDungeon) return 'mine';
    if (inShop) return 'shop';
    if (inLibrary) return 'library';
    if (inHome) return 'home';
    if (inAlchemist) return 'alchemist';
    return 'village';
}
