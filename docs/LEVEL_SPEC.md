# ZCraft — Level Spec

**Status:** Draft for Human Gate 2 review · the *contract every new level file must satisfy* · grounded against the code at `VERSION 1.1.4`.

This is the machine-side companion to [WORLD_BIBLE.md](WORLD_BIBLE.md) (the creative side). It defines: the real map format a level must produce (§1–§3), the registry/gating fields the refactor will add (§4), the per-level acceptance criteria a Playwright test will assert (§5), and the **shared tile-ID namespace authors must not reuse** (§6).

> ⚠️ **Two-phase reality.** §1–§3 and §6 describe the code **as it exists today** — authors can rely on them now. §4 and §5 describe the **post-refactor** API (the `LEVELS` registry, the `window.__zcraft` debug hook, `gatingItemIn/Out`). Those do not exist at `1.1.4`; they are the contract the Phase-0 refactor must deliver, and the acceptance scripts run against them. See WORLD_BIBLE §7 for the gap. Gate 2 should approve this spec and the refactor together.

---

## 1. What a "level" is, concretely

A level is a **map module** in `js/world/`, e.g. `dungeonMap.js`. It exports:

1. A **2-D array of tile IDs**, row-major: `map[row][col]`. Every row must be the same length (the renderer reads `map[0].length` as the width). The canonical shape is `dungeonMap.js`.
2. **Spawn coordinates** in *pixels* (not tiles), conventionally the tile center: `SPAWN_X = col * 32 + 16`. Tile size is **32 px** (`TILE_SIZE`, `tileTypes.js`).
3. **Special-position constants** the integration needs — enemy spawns, gate locations, reward locations — as named exports (e.g. `DUNGEON_SPAWN_X/Y`, `ZOMBIE_SPAWN_X/Y`, `LOCKED_DOOR_ROW`, `LOCKED_DOOR_COLS`, `ENDER_PEARL_X/Y`).

A level may also need entries in the **shared registries** (§6 / WORLD_BIBLE §7.2): tiles (`tileTypes.js`), items (`items.js` + `sprites.js`), enemies (`enemy.js`), NPCs (`npcs.js`).

### Coordinate & convention rules (from the real code)

- **Row-major, `[row][col]`.** Pixel position of a tile: `x = col * 32`, `y = row * 32`. Center: `+ 16`.
- **Solidity** comes from `tileProps[id].solid` (`tilemap.js` `isSolidTile`). `WATER` is solid (a barrier, not swimmable). **A tile ID with no `tileProps` entry is treated as solid** and renders nothing — an invisible wall (see §6).
- **Overhead tiles** (`props.overhead: true`, e.g. tree canopy, roofs) render on a separate layer *above* the player (`renderMap` layer 2). Use for anything the player walks under.
- **Interactive tiles** carry `props.interact: '<name>'` (e.g. `'shop'`, `'lectern'`, `'tablet'`). The handler is a hardcoded branch in `main.js` keyed off that string — a new interact type means new `main.js` logic, which is an integration-surface change to flag, not a pure level-local addition.
- **Entrance / exit conventions in use today:** entering a sub-area is triggered by stepping on a tile (`DUNGEON_ENTRANCE`, or an `interact` door); exiting the dungeon is triggered by walking off the bottom edge — `playerRow >= map.length - 1` (`main.js:614`). New levels should pick one of these two patterns, not invent a third, unless the refactor generalizes transitions.

---

## 2. Required tiles every level must contain

| Requirement | How it's expressed today | Notes |
|---|---|---|
| **Spawn** | exported `SPAWN_X/Y` pixel coords landing on a non-solid tile | The player is placed here on `enter`. Must be reachable & non-solid. |
| **Entrance** | a tile/edge that lands the player at this level's spawn (an `interact` door tile, or a `DUNGEON_ENTRANCE`-style tile) | This is the `gatingItemIn` checkpoint (§4). |
| **Exit** | a tile/edge whose `gatingItemOut` item has been collected (e.g. walk-off-edge, or a portal/door tile) | Crossing it advances to the next level. |
| **Boss arena** | an open region with the boss's spawn exported (cf. `ZOMBIE_SPAWN_X/Y`) | Boss defeat sets the level's `cleared` flag. |
| **Reward** | the granted item's pickup location exported (cf. `ENDER_PEARL_X/Y`) | Collecting it sets the item flag and (usually) is gated behind the boss/puzzle. |
| **Secret (≥1)** | at least one hidden, off-critical-path reward — a disguised/interact tile or hidden alcove granting **emeralds or an item** (never a heart) | Discovering it sets a one-time flag and grants the reward. Required (criterion G10). |

**Dimensions.** No hard engine limit (the camera follows and clamps to `map[0].length × map.length`). Existing reference sizes: town **40×30**, dungeon **16×18**, shop **8×7**. New dungeons should land in roughly **16×18 → 32×32**; bigger is fine if traversal justifies it. Rows must all be equal length.

---

## 3. Level file skeleton (matches `dungeonMap.js` exactly)

```js
// js/world/<levelName>Map.js
import { T } from '../data/tileTypes.js';

// Local aliases keep the array readable (see dungeonMap.js / townMap.js)
const W = T.DUNGEON_WALL;
const F = T.DUNGEON_FLOOR;
// ...one alias per tile used

// <cols> columns x <rows> rows — describe the layout in a comment block
export const <levelName>Map = [
    [W, W, W, /* ... */ W],
    // ...rows, all the same length
];

// Spawn in PIXELS (tile-center convention: col*32 + 16)
export const <LEVEL>_SPAWN_X = 7.5 * 32 + 16;
export const <LEVEL>_SPAWN_Y = 15 * 32;

// Boss / enemy spawns, gate positions, reward position — named exports
export const <LEVEL>_BOSS_X = 8 * 32;
export const <LEVEL>_BOSS_Y = 11 * 32;
// export const <LEVEL>_GATE_ROW = ...; etc.
```

---

## 4. Registry & gating fields (post-refactor contract)

After Phase 0, each level appends one entry to `js/world/levels.js`. This is the schema that entry must satisfy. *(Field names are the proposed contract — Gate 2 finalizes them; the author and refactor agents must agree before parallel authoring starts.)*

```js
// js/world/levels.js  — authors APPEND one entry; integrator de-conflicts
export const LEVELS = {
  village:    { /* L1, existing — wraps townMap + interiors */ },
  mine:       { /* L1 dungeon, existing — wraps dungeonMap */ },

  lush_caverns: {
    id:            'lush_caverns',         // unique, snake_case — also the state.levelId value
    title:         'The Lush Caverns',
    map:           lushCavernsMap,          // the 2-D array from §3
    spawn:         [LUSH_SPAWN_X, LUSH_SPAWN_Y],  // pixels
    gatingItemIn:  'tripwire_hook'??null,   // item REQUIRED to ENTER (null = open). L2 entrance is open from L1.
    gatingItemOut: 'tripwire_hook',         // item the player must HOLD to cross the exit into the next level
    boss:          { type: 'cave_spider_swarm', spawn: [..], clearedFlag: 'lushBossCleared' },
    grantsItem:    'tripwire_hook',         // item this level awards (its reward pickup)
    nextLevel:     'deep_dark',             // id this level's exit leads to
    onEnter() { /* spawn boss/enemies, set music, reset per-level state */ },
  },
  // deep_dark, nether_fortress, the_end ...
};
```

**Field meanings, tied to the chain in WORLD_BIBLE §4:**

| Field | Meaning | Enforced by |
|---|---|---|
| `id` | Unique level id; equals `state.levelId` | Acceptance §5 |
| `map`, `spawn` | The §3 array + pixel spawn | Renderer / player init |
| `gatingItemIn` | Item required to *enter* (`null` if open). | `enterLevel(id)` refuses without it |
| `gatingItemOut` | Item the player must *hold* to take the exit. **This is the Zelda gate.** | exit transition checks `inventory.has(gatingItemOut)` |
| `grantsItem` | The item this level awards | Reward pickup adds it |
| `boss` | `{ type, spawn, clearedFlag }` — defeat sets `clearedFlag` | Combat → flag in the per-level flag bag |
| `nextLevel` | Destination id of the exit | Transition |

**Gating-chain invariant (must hold across all five levels):**
`grantsItem(Lₙ) === gatingItemOut(Lₙ)` and `gatingItemOut(Lₙ)` unlocks the *entrance* of `Lₙ₊₁`. Concretely:

| Level | `gatingItemIn` | `grantsItem` = `gatingItemOut` | `nextLevel` |
|---|---|---|---|
| `mine` (L1) | `null` | `ender_pearl` *(held, not spent)* | `lush_caverns` |
| `lush_caverns` (L2) | `null` | `tripwire_hook` | `deep_dark` |
| `deep_dark` (L3) | `tripwire_hook` | `flint_and_steel` | `nether_fortress` |
| `nether_fortress` (L4) | `flint_and_steel` | `eye_of_ender` | `the_end` |
| `the_end` (L5) | `eye_of_ender` | — *(finale)* | — |

> **Ender-Pearl invariant:** `inventory.has('ender_pearl')` must remain `true` from L1 pickup through the L5 boss. No gate may set `gatingItemOut: 'ender_pearl'` or otherwise consume it. The Pearl is *required* by the L5 boss design, never spent earlier. (See WORLD_BIBLE §4 / §7.4 — it is currently never referenced after pickup.)

---

## 5. Acceptance criteria (what the scripted playtester asserts)

The Scripted Playtester (Playwright) drives the game through the `window.__zcraft` debug hook (Plan §0.4 — **not built yet**), which must expose:

```js
window.__zcraft = {
  get state() { return { levelId, player: {x, y, hp}, inventory /* item ids */, flags }; },
  input(key, down) { /* synthetic keydown/keyup into js/engine/input.js */ },
};
```

Every criterion below is a runtime assertion against `state` after a scripted `input()` path. They are written as **predicates** so they translate directly into `expect(...)` calls.

### 5.0 Criteria that apply to *every* level (global invariants)

- **G1 — Completable.** There exists an input sequence from `onEnter` spawn to the exit after which `state.levelId === <nextLevel>`. (No soft-locks: no required tile is unreachable, no gate is un-openable.)
- **G2 — Spawn is safe.** Immediately after `enterLevel`, `state.player.hp > 0` and the spawn tile is non-solid (player is not stuck in a wall).
- **G3 — Gate-in honored.** `enterLevel(id)` succeeds **iff** `gatingItemIn === null || inventory.has(gatingItemIn)`.
- **G4 — Gate-out honored.** The exit transition fires **only** when `inventory.has(gatingItemOut)`; without the item the player cannot leave forward.
- **G5 — Item granted before exit.** `grantsItem` is in `state.inventory` at the moment the exit is crossed (you can't leave without having earned the key).
- **G6 — No null-state crash.** Walking the full path throws no uncaught error; `state` is readable at every step.
- **G7 — Ender Pearl preserved.** From the moment it's picked up, `inventory.includes('ender_pearl')` stays `true` for the rest of the game (re-checked after every level merge).
- **G8 — Tile-ID hygiene.** Every tile ID present in the level's `map` has a `tileProps` entry (no invisible-wall tiles). *(Static check, not a playthrough.)*
- **G9 — Save/restore round-trips.** Save mid-level, restore: `levelId`, `inventory`, player position, and the level's `clearedFlag` all match. (The refactor's generalized per-level flag bag must cover the level's flags.)
- **G10 — At least one secret.** The level contains a hidden, off-critical-path reward granting **emeralds or an item** (never a heart). Finding it grants the reward and sets a one-time flag that survives save/restore. *(Assert the emerald/inventory delta + the flag.)*

### 5.1 L1 — Village & Sealed Mine *(existing — encode as regression, do not change the level)*

- Pushing both push-blocks onto both pressure plates sets `flags.puzzleSolved === true` and opens the dungeon entrance.
- Defeating the dungeon skeleton sets `flags.dungeonCleared === true` and spawns the chest.
- Opening the chest grants `key`; using `key` at the locked door sets `flags.lockedRoomOpen === true` and removes `key` from inventory.
- Reaching the chamber and acting on the Ender Pearl adds `ender_pearl` and sets `flags.enderPearlPickedUp === true`.
- **Final:** `inventory.includes('ender_pearl') === true`. *(This is the only item L1 must guarantee for the chain.)*

### 5.2 L2 — Lush Caverns

- Acquiring the Tripwire Hook adds `tripwire_hook` to inventory and sets the hook-acquired flag.
- A traversal that is **impossible without the hook** is completable **with** it (assert: a target tile reachable only post-hook becomes reachable).
- Defeating the cave-spider swarm sets the L2 `clearedFlag`.
- **Gate-out (G4/G5):** exit to `deep_dark` fires only with `tripwire_hook` held; on exit `state.levelId === 'deep_dark'`.

### 5.3 L3 — Deep Dark

- The Warden is **avoidable** — a completing path exists that never reduces `state.player.hp` to 0 (stealth, not a damage race).
- Tripping a sculk sensor raises an alarm flag; the soul-lantern mechanic is acquirable/usable (assert its flag).
- Acquiring Flint & Steel adds `flint_and_steel`.
- Using Flint & Steel at the ruined portal sets `flags.netherPortalLit === true` (or equiv.), which is the exit enabler.
- **Gate-in (G3):** `deep_dark` refuses entry without `tripwire_hook`. **Gate-out:** exit to `nether_fortress` requires `flint_and_steel`.

### 5.4 L4 — Nether Fortress

- Lava tiles are hazards: stepping on lava reduces `hp` (or resets to a checkpoint) — assert the hazard fires.
- A ranged-combat encounter (bow callback) is winnable; defeating the Blaze/Wither-Skeleton boss sets the L4 `clearedFlag` and yields `blaze_rod`(s).
- Crafting converts `blaze_rod` → `eye_of_ender` (inventory transition assertable).
- **Gate-in:** requires `flint_and_steel`. **Gate-out:** activating the End portal requires `eye_of_ender`; exit sets `state.levelId === 'the_end'`.

### 5.5 L5 — The End

- **Gate-in:** requires `eye_of_ender`.
- **Synthesis requirement:** the completing path requires the Ender Pearl — assert that with `ender_pearl` **removed** from inventory the boss arena is **not** completable (the void cannot be crossed / dodge unavailable), and **with** it, it is. This is the mechanical proof the L1 reward pays off.
- Defeating the Ender Dragon sets `flags.dragonDefeated === true` and triggers the village-restored ending state.
- **Final:** game reaches its end/credits state with no soft-lock.

---

## 6. Shared tile-ID namespace — DO NOT REUSE

The current `T` enum (`js/data/tileTypes.js`) occupies IDs **0–47**. New tile IDs **start at 48** and authors must not reuse a taken integer. **Every new ID also needs a `tileProps` entry** (`{ solid, color, color2, … }`) — a missing entry makes the tile an invisible solid wall (`isSolidTile` returns `true` when `tileProps[id]` is `undefined`). The integrator resolves any cross-level collisions at merge.

| ID | Name | | ID | Name | | ID | Name |
|---|---|---|---|---|---|---|---|
| 0 | `GRASS` | | 16 | `FOUNTAIN` | | 32 | `SHOP_WALL` |
| 1 | `DIRT_PATH` | | 17 | `ROOF_WOOD` *(overhead)* | | 33 | `SHOP_FLOOR` |
| 2 | `STONE_FLOOR` | | 18 | `ROOF_STONE` *(overhead)* | | 34 | `SHOP_SHELF` |
| 3 | `WATER` *(solid)* | | 19 | `DUNGEON_ENTRANCE` | | 35 | `CRAFTING_TABLE` |
| 4 | `WALL_STONE` | | 20 | `DUNGEON_BLOCKED` | | 36 | `SHOP_DESK` |
| 5 | `WALL_WOOD` | | 21 | `PRESSURE_PLATE` | | 37 | `SKELETON_CAGE` |
| 6 | `TREE_TRUNK` | | 22 | `STONE_TABLET` | | 38 | `LOCKED_DOOR` |
| 7 | `TREE_TOP` *(overhead)* | | 23 | `BOOKSHELF` | | 39 | `FANCY_FLOOR` *(obsidian)* |
| 8 | `FENCE` | | 24 | `CHURCH_WALL` | | 40 | `DOOR_LIBRARY` |
| 9 | `DOOR_SHOP` | | 25 | `CHURCH_WINDOW` | | 41 | `DOOR_HOME` |
| 10 | `DOOR_HOUSE` | | 26 | `DARK_GRASS` | | 42 | `BED` |
| 11 | `COBBLESTONE` | | 27 | `BRIDGE` | | 43 | `FURNACE` |
| 12 | `SAND` | | 28 | `SIGN` | | 44 | `ENCHANTING_TABLE` |
| 13 | `FLOWER_RED` | | 29 | `TORCH` | | 45 | `SECRET_BUSH` |
| 14 | `FLOWER_YELLOW` | | 30 | `DUNGEON_WALL` | | 46 | `LECTERN` |
| 15 | `WELL` | | 31 | `DUNGEON_FLOOR` | | 47 | `DOOR_ALCH` |

**Next free ID: `48`.** Suggested (non-binding) per-level reservations to prevent parallel collisions — the integrator confirms at merge:

| Level | Reserved block |
|---|---|
| L2 Lush Caverns | `48–63` |
| L3 Deep Dark | `64–79` |
| L4 Nether Fortress | `80–95` |
| L5 The End | `96–111` |

Other shared registries that follow the same "append, don't reuse, integrator de-conflicts" rule (WORLD_BIBLE §7.2): **items** (`js/data/items.js`, string ids — new: `tripwire_hook`, `flint_and_steel`, `blaze_rod`, `eye_of_ender`) and their **sprites** (`js/rendering/sprites.js`); **enemy types** (`js/entities/enemy.js`, string types); **NPC data** (`js/data/npcs.js`).

---

*Companion document: [WORLD_BIBLE.md](WORLD_BIBLE.md) — tone, palette, roster, item chain, and difficulty intent. Both are the Phase-0 deliverables reviewed together at Human Gate 2.*
