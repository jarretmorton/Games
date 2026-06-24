# ZCraft — World Bible

**Status:** Live · derived from the approved Section 1 arc in [MULTI_AGENT_PLAN.md](MULTI_AGENT_PLAN.md) · grounded against the code at `VERSION 1.3.0` (Phase-0 refactor landed; L2 Lush Caverns merged).

This is the orchestrator's source of truth for *tone, look, roster, and the item-progression spine*. It is the creative contract; the machine-checkable contract lives in [LEVEL_SPEC.md](LEVEL_SPEC.md). **§7 — Reality vs. Plan** now records what the Phase-0 refactor changed and the one gap that remains.

---

## 1. Tone

ZCraft is **Zelda structure wearing Minecraft clothes**, built by and for a parent + kids. Hold these:

- **Cozy, not grimdark.** Even the scary level (Deep Dark) is *spooky-fun*, not horror. The village is the emotional home base; the whole arc is "leave home → grow → come back and restore it."
- **Readable over realistic.** Everything is flat-shaded 32px tiles drawn procedurally in `js/world/tilemap.js` and `js/rendering/sprites.js` — solid base color + a cheap noise speckle + a few hand-placed rectangles. No textures, no gradients beyond a 2-frame animation flip. New art must match this primitive vocabulary.
- **Diegetic Minecraft.** Blocks, mobs, and items are recognizably Minecraft, but the *grammar* is Zelda: one dungeon = one biome = one signature mechanic = one item = one boss = one gate to the next dungeon.
- **Kid-legible difficulty.** The player has **6 HP** (`js/entities/player.js`), a shield that blocks, and generous save points. Death returns you to a save point, it doesn't wipe progress. Lethality is gentle; the challenge is in *puzzles and traversal*, not twitch.

---

## 2. Palette

The existing palette is defined as literal hex in `tileProps` (`js/data/tileTypes.js`). New biomes must extend it without clashing. Anchor colors actually in use today:

| Role | Hex (in code) | Used by |
|---|---|---|
| Grass / overworld green | `#5B8731` / `#4A7628` | `GRASS`, flowers |
| Dirt / wood brown | `#8B6914`, `#6B4226` | paths, planks, doors |
| Stone grey | `#808080`, `#6B6B6B` | walls, floors |
| Cave/dungeon dark | `#3A3A3A` / `#2A2A2A` (wall), `#4A4A4A` (floor) | `DUNGEON_WALL/FLOOR` |
| Water blue | `#3366CC` / `#2255BB` (animated) | `WATER`, `FOUNTAIN` |
| Torch flame | `#FF8800` / `#FFCC00` | `TORCH` decor |
| Enchanted purple | `#1A1630`, `#5533AA`, `#AA88EE` | `FANCY_FLOOR` (the obsidian chamber) |
| Gold accent | `#CC9900` / `#FFD700` | `LOCKED_DOOR` lock |

**Biome palettes the new levels introduce** (author + Asset/Theme agent must keep these internally consistent and distinct from each other so four hands still read as one game):

- **L2 Lush Caverns** — mossy green `#3D6B22`/`#2D5A1E`, glow-berry orange-gold `#E8A23D`, dripleaf teal-green, dark cave stone behind it. Light, wet, alive.
- **L3 Deep Dark / Ancient City** — near-black `#0D0D12` base, **sculk cyan** `#1B4A4A`/`#2EC4B6` as the *only* bright accent (sensors, veins, the soul lantern), deep-slate `#2A2A33`. Almost monochrome on purpose — light is a mechanic here.
- **L4 Nether Fortress** — netherrack red `#7A1A1A`/`#5A1010`, lava orange `#FF6600`/`#FF4400` (reuse the furnace-fire flip), nether-brick dark `#2A1518`, blaze yellow `#FFCC33`.
- **L5 The End** — end-stone pale yellow `#E8E4C0`/`#D8D4A8`, void black `#05050A`, obsidian-pillar purple-black (callback to the L1 `FANCY_FLOOR`), dragon-magenta accent `#C040C0`.

Reuse the 2-frame `animFrame` flip (`updateTileAnimations`) for any animated tile — there is no other animation system.

---

## 3. Minecraft roster in play

### 3.1 Already in the game (canon — reuse, don't redefine)

**Tiles / blocks** (`tileTypes.js`, IDs 0–60): grass, dirt path, stone floor, water, stone wall, oak-plank wall, tree (trunk + overhead canopy), fence, several doors, cobblestone, sand, red/yellow flowers, well, fountain, wood/stone roofs (overhead), **dungeon (cave) wall & floor**, **pressure plate**, **stone tablet**, bookshelf, church wall/window, bridge, sign, torch, shop fixtures (wall/floor/shelf/desk), **crafting table**, **furnace**, **enchanting table**, **skeleton cage**, **locked iron door**, **obsidian "fancy" floor**, bed, lectern, secret bush — plus the **L2 Lush Caverns** block (48–60): moss floor/wall, cave water, chasm, glow berries, dripleaf, vine, hook anchor, clay, lush rock, lush secret, mine hole.

**Mobs** (`js/entities/enemy.js`): **zombie** (hp 6, dmg 1) and **skeleton** — including `dungeon_skeleton`, a bow archer (hp 5, dmg 1) that fires arrow projectiles. These are the only two enemy archetypes that exist; there is no boss framework (see §7).

**NPCs** (`js/data/npcs.js`, `characters.js`): villagers — farmer, librarian, shopkeeper, alchemist, a home NPC. Drawn via `drawCharacter`.

**Items** (`js/data/items.js`): wooden/stone/iron sword, bow, shield, dragon-breath potion, **emerald** (currency — `player.emeralds`), diamond, golden blueberry (+ jar), **dungeon key**, **`ender_pearl`** (the L1 reward; see §4), and **`tripwire_hook`** (the L2 grapple reward).

### 3.2 New roster the arc introduces (per level — author proposes exact tiles/mobs within these)

| Level | New blocks (theme) | New mobs / boss | Hazards |
|---|---|---|---|
| **L2 Lush Caverns** | glow berries, moss, big dripleaf (traversal platform), clay, cave water, vines | cave-spider swarm (fast, low-HP, many) → swarm mini-boss | water gaps, fall-back-to-start drops |
| **L3 Deep Dark** | sculk, sculk **sensor** (triggers on movement), sculk vein, soul sand, **soul lantern** (light source), reinforced deepslate, ruined (unlit) Nether portal frame | **Warden** (tuned *way* down — slow, telegraphed, avoidable) | darkness, noise-triggered alarms |
| **L4 Nether Fortress** | netherrack, nether brick, **lava**, soul fire, fortress fence, blaze spawner | **Blaze** / Wither-Skeleton boss (ranged — callback to L1 bow) | lava (instant hazard), fireballs |
| **L5 The End** | end stone, **void** (fall = hazard), obsidian pillars (L1 callback), end portal frame, bedrock | **Ender Dragon** (multi-phase finale) | void gaps, dragon breath |

> Authors must register every new block as a tile ID **and** mobs as enemy types — these are *shared* files, not level-local. See §7.4 and LEVEL_SPEC §6.

---

## 4. The item-progression spine (the approved chain)

This is the backbone that makes five independently-authored dungeons feel like one game. Each level **grants** one item that is the **key** to the next — a literal Zelda dungeon-item gate. The L1 Ender Pearl is special: it is granted first and **cashed in last**.

| Level | Item granted | Item id (proposed) | Status in code | Gates next level by… |
|---|---|---|---|---|
| **L1 — Village & Sealed Mine** | **Ender Pearl** | `ender_pearl` | ✅ **exists** (`items.js`), collected in the obsidian chamber | Held in reserve — pays off in L5, not consumed in L1–L4 |
| **L2 — Lush Caverns** | **Tripwire Hook** (grapple) | `tripwire_hook` | ✅ **exists** (`items.js`), granted by the cavern reward chest | Grapple across the Great Chasm to reach L3 |
| **L3 — Deep Dark** | **Flint & Steel** | `flint_and_steel` | ❌ new | Light the ruined Nether portal → enter L4 |
| **L4 — Nether Fortress** | **Blaze Rods → Eyes of Ender** | `blaze_rod`, `eye_of_ender` | ❌ new | Craft eyes, activate End portal → enter L5 |
| **L5 — The End** | *(finale)* — restores the village | — | ❌ new | Uses hook + lantern + bow **+ the L1 Ender Pearl** to beat the Ender Dragon |

**The Ender Pearl payoff (L5).** The Pearl is collected in L1's locked chamber. Its *pickup* now has one consequence — the `enderPearlPickedUp` flag opens the town well, the L1→L2 entrance — but **the item itself is still never consumed or read from inventory after pickup**; it remains reserved for L5. L5 is where it becomes load-bearing: the canonical Minecraft use (a thrown teleport) becomes the boss-fight traversal/dodge tool — escape a void gap, or teleport behind the dragon. This is the single thread that retroactively justifies L1's reward, so **L5's design must treat `inventory.has('ender_pearl')` as a hard requirement** and the integration must guarantee the Pearl survives the journey (it must never be consumed by an earlier gate).

**Why this chain is "authentic, not arbitrary":** flint & steel → portal, blaze rods → eyes of ender → End portal → dragon is the *real* Minecraft endgame ladder. The Tripwire Hook is the one deliberate liberty — a real Minecraft block repurposed as a clean Zelda hookshot.

---

## 5. Difficulty-curve intent

One sentence per beat. The curve is **emotional**, not just numeric — it's why the order is fixed.

1. **L1 — Intro / teach the verbs.** Move, push blocks onto pressure plates, read a tablet/book for a hint, fight one telegraphed skeleton, open a locked door with a found key, claim a reward. Low lethality, high legibility. *Already shipped — do not retune.*
2. **L2 — Traversal.** Introduce the grapple and ask the player to *think in space* — gaps, water, levers across a chasm. Combat is a swarm (many weak things), not a duel. Teaches the hook so thoroughly that L3's gate (grapple the chasm) feels earned.
3. **L3 — Stealth spike (the midpoint fear beat).** The deliberate difficulty peak — *but in tension, not damage*. Darkness + sculk sensors + a slow unkillable-feeling Warden the player learns to *avoid*, lit only by the soul lantern. Should feel like the scariest, most memorable level; failure = get caught and reset a room, not a brutal death.
4. **L4 — Combat-heavy.** Release the tension: now the player is strong, has ranged options (bow callback to L1), and fights through blazes over lava. Straight-ahead action after the stealth pressure.
5. **L5 — Boss synthesis.** The finale demands *every* tool at once — hook to cross the void, lantern's lesson about light, bow for ranged phases, and the L1 Ender Pearl for the clutch dodge. Then the village is restored and the story closes where it began.

Practical calibration for authors (grounded in current numbers): the player has **6 HP**; existing enemies deal **1 dmg** and have **5–6 HP**. Scale new enemies *relative to these* — a "tuned-down Warden" or a "boss" should still be beatable by a kid with a shield and patience. Lethality stays low; the difficulty lives in the *mechanic*, not the damage numbers.

---

## 6. Authoring guardrails (creative latitude, inside the lines)

Authors own layout, room geometry, NPC dialogue, hidden secrets, sub-puzzles, enemy placement, and tuning. They do **not** own: the biome, the signature mechanic, the boss type, the granted item, or the gate — those are fixed by §3–§4 above. Additional house rules:

- **Match the rendering primitive.** New tiles are drawn in `tilemap.js` `drawTile` with the same fill-rect + speckle idiom; new entities in `sprites.js`. No images.
- **Every new tile ID needs a `tileProps` entry.** A missing entry renders *nothing* **and** is treated as **solid** (`isSolidTile` returns `true` when `tileProps[id]` is undefined) — i.e. an invisible wall. This is the #1 authoring footgun. See LEVEL_SPEC §6.
- **Stay in the namespace.** New tile IDs start at the next free integer (currently **61** — base game 0–47, L2 used 48–60) and must not collide with another level's IDs. The registry of taken IDs is in LEVEL_SPEC §6.
- **Honor the save model.** Anything that must persist (boss defeated, item taken, gate opened) needs a flag the save system serializes — today those are hand-named booleans (see §7.3).
- **Every level hides at least one secret.** A reward for exploring off the critical path — an optional-path stash of **emeralds or an item** (never a heart container). L1 set the precedent (the forest secret bush → 20 emeralds; L2's hidden glow-berry stash → 25); every new level carries the tradition. This is a hard requirement, not flavor (see LEVEL_SPEC §2 and criterion G10).
- **On ambiguity, stop and ask.** Per the plan's escalation rule — a spec gap or a cross-level conflict is a gate question, not a guess.

---

## 7. Reality vs. Plan — what the Phase-0 refactor delivered

The plan (Section 0) flagged four places where the code was looser than the prose. The Phase-0 refactor has since landed; here is where each stands now. **One gap remains (§7.4) — read it before authoring a gated level.**

**7.1 — Map switching is now registry-driven.** Pre-refactor, scene dispatch was a chain of independent booleans (`inDungeon`, `inShop`, `inLibrary`, `inHome`, `inAlchemist`), each with its own bespoke `enterX`/`exitX`/`updateX`. The boolean flags still exist as the authoritative location state, but a single `setLevel(id)` is now their only writer, `levelIdFromFlags()` derives the canonical `currentLevelId`, and one generic `enterLevel(id, { onEnter })` replaces the per-area enter boilerplate (see [js/main.js](../js/main.js) and [js/world/levels.js](../js/world/levels.js)). Adding a level no longer means hand-editing the dispatch.

**7.2 — A level still touches several shared files (as designed).** The `LEVELS` registry is the *coordination* point, not the only file an author edits. A new level appends to a small, well-known set of **shared, append-only** registries — tile IDs in `tileTypes.js`, items in `items.js` + sprites in `sprites.js`, boss enemy types in `enemy.js`, NPC data in `npcs.js`, music in `audio/music.js` — plus its level-local map file in `js/world/`. The integrator de-conflicts them at merge (option (a) from the original plan). LEVEL_SPEC §6 tracks the shared tile-ID namespace.

**7.3 — `currentLevelId`, the flag bag, and the debug hook now exist.** Save/load serializes `currentLevelId()` + a `flags` bag *alongside* the legacy named booleans (kept for backward-compat restore) — see the save/restore code in [js/main.js](../js/main.js). The `window.__zcraft` debug hook ([js/engine/debugHook.js](../js/engine/debugHook.js)) exposes `{ levelId, player:{x,y,hp}, inventory, flags }` and synthetic `input()`, and the LEVEL_SPEC §5 acceptance criteria run against it via Playwright ([tests/](../tests/)).

**7.4 — Gating and "boss" are still per-level hardcoded; the registry fields are not yet enforced.** This is the remaining gap. A "boss" is still a lone `Enemy` (or, in L2, a swarm) whose death sets a hardcoded `cleared` boolean and spawns a reward chest — there is no boss framework. And although the registry now records `gatingItemIn` / `gatingItemOut` / `grantsItem` / `nextLevel` / `boss.clearedFlag`, **the engine does not read those fields**: gates and rewards are still ad-hoc `inventory.has(...)` checks in [js/main.js](../js/main.js) (e.g. the L2 boulder requires `tripwire_hook`; the well opens once `enderPearlPickedUp`). An author who sets `gatingItemOut` must still implement the matching in-world check by hand. The Ender Pearl is still never consumed (see §4). Wiring the gating fields into a generic `enterLevel` gate is the natural next refactor — see LEVEL_SPEC §4's "Known gap" note.

---

*Companion document: [LEVEL_SPEC.md](LEVEL_SPEC.md) — the machine-checkable schema and acceptance criteria each author must satisfy.*
