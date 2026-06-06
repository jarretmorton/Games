# ZCraft — World Bible

**Status:** Draft for Human Gate 2 review · derived from the approved Section 1 arc in [MULTI_AGENT_PLAN.md](MULTI_AGENT_PLAN.md) · grounded against the code at `VERSION 1.1.4`.

This is the orchestrator's source of truth for *tone, look, roster, and the item-progression spine*. It is the creative contract; the machine-checkable contract lives in [LEVEL_SPEC.md](LEVEL_SPEC.md). Where this document and the current code disagree, the disagreements are called out explicitly in **§7 — Reality vs. Plan** so they are decided at the gate, not papered over.

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

**Tiles / blocks** (`tileTypes.js`, IDs 0–47): grass, dirt path, stone floor, water, stone wall, oak-plank wall, tree (trunk + overhead canopy), fence, several doors, cobblestone, sand, red/yellow flowers, well, fountain, wood/stone roofs (overhead), **dungeon (cave) wall & floor**, **pressure plate**, **stone tablet**, bookshelf, church wall/window, bridge, sign, torch, shop fixtures (wall/floor/shelf/desk), **crafting table**, **furnace**, **enchanting table**, **skeleton cage**, **locked iron door**, **obsidian "fancy" floor**, bed, lectern, secret bush.

**Mobs** (`js/entities/enemy.js`): **zombie** (hp 6, dmg 1) and **skeleton** — including `dungeon_skeleton`, a bow archer (hp 5, dmg 1) that fires arrow projectiles. These are the only two enemy archetypes that exist; there is no boss framework (see §7).

**NPCs** (`js/data/npcs.js`, `characters.js`): villagers — farmer, librarian, shopkeeper, alchemist, a home NPC. Drawn via `drawCharacter`.

**Items** (`js/data/items.js`): wooden/stone/iron sword, bow, shield, dragon-breath potion, **emerald** (currency — `player.emeralds`), diamond, golden blueberry (+ jar), **dungeon key**, and **`ender_pearl`** (the L1 reward; see §4).

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
| **L2 — Lush Caverns** | **Tripwire Hook** (grapple) | `tripwire_hook` | ❌ new | Grapple across the Great Chasm to reach L3 |
| **L3 — Deep Dark** | **Flint & Steel** | `flint_and_steel` | ❌ new | Light the ruined Nether portal → enter L4 |
| **L4 — Nether Fortress** | **Blaze Rods → Eyes of Ender** | `blaze_rod`, `eye_of_ender` | ❌ new | Craft eyes, activate End portal → enter L5 |
| **L5 — The End** | *(finale)* — restores the village | — | ❌ new | Uses hook + lantern + bow **+ the L1 Ender Pearl** to beat the Ender Dragon |

**The Ender Pearl payoff (L5).** The Pearl already exists and is collected in L1's locked chamber, but **nothing in the code references it after pickup** — it is currently a dead trophy. L5 is where it becomes load-bearing: the canonical Minecraft use (a thrown teleport) becomes the boss-fight traversal/dodge tool — escape a void gap, or teleport behind the dragon. This is the single thread that retroactively justifies L1's reward, so **L5's design must treat `inventory.has('ender_pearl')` as a hard requirement** and the integration must guarantee the Pearl survives the journey (it must never be consumed by an earlier gate).

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
- **Stay in the namespace.** New tile IDs start at the next free integer (currently **48**) and must not collide with another level's IDs. The registry of taken IDs is in LEVEL_SPEC §6.
- **Honor the save model.** Anything that must persist (boss defeated, item taken, gate opened) needs a flag the save system serializes — today those are hand-named booleans (see §7.3).
- **Every level hides at least one secret.** A reward for exploring off the critical path — an optional-path stash of **emeralds or an item** (never a heart container). L1 set the precedent (the forest secret bush → 20 emeralds; L2's hidden glow-berry stash → 25); every new level carries the tradition. This is a hard requirement, not flavor (see LEVEL_SPEC §2 and criterion G10).
- **On ambiguity, stop and ask.** Per the plan's escalation rule — a spec gap or a cross-level conflict is a gate question, not a guess.

---

## 7. Reality vs. Plan — conflicts to resolve at Gate 2

The plan (Section 0) is *mostly* accurate, but four things are looser in reality than the prose implies. Flagging so the Phase-0 refactor scope is set with eyes open. **None of these block writing this doc; all of them shape the refactor.**

**7.1 — Map switching is not one ternary; it's a 6-way boolean chain.** The plan quotes `const currentMap = inDungeon ? dungeonMap : townMap;` as *the* switch. That exact line exists only once (`main.js:1602`) inside a door-interaction helper. The *actual* scene dispatch is a chain of independent booleans — `inDungeon`, `inShop`, `inLibrary`, `inHome`, `inAlchemist` — each with its own `updateX`, `renderXScene`, `enterX`, and `exitX` function (see `renderCurrentScene` at `main.js:2068` and the update dispatch around `main.js:317`). The integration surface the refactor must collapse is **bigger** than "replace a ternary": it's ~5 flags × 4 bespoke functions each. Good news for the registry — more upside; the warning is just to scope Phase 0 honestly.

**7.2 — "Append one registry entry" is optimistic; a level touches several shared files.** The plan says the `LEVELS` registry is "the ONLY shared file authors touch." In reality a new level needs: a new map file (`js/world/`, level-local ✅), **plus** new tile IDs in `tileTypes.js`, new items in `items.js` **and** their sprites in `sprites.js`, new boss enemy types in `enemy.js`, and likely new NPC data in `npcs.js` and music in `audio/music.js`. These are all **shared, append-only** surfaces. The refactor should either (a) accept that authors append to a small, well-known set of shared registries (tiles, items, enemies, levels) — and the integrator de-conflicts them — or (b) push those into per-level data the registry pulls in. Recommend (a); flag for decision.

**7.3 — There is no `levelId` and no generic flag bag yet.** Save/load serializes ~15 individually-named booleans (`enderPearlPickedUp`, `lockedRoomOpen`, `dungeonCleared`, `inDungeon`…) — confirmed at `main.js:1690–1715` / `1751–1761`. The plan's target (`currentLevelId` + a per-level flag bag) does **not exist yet**. Every acceptance criterion in LEVEL_SPEC is written against the *post-refactor* shape (`state.levelId`, `state.inventory`, `state.flags`). Until the refactor lands and the `window.__zcraft` debug hook (Plan §0.4) is built, those criteria are **aspirational, not runnable**. This is expected — but the spec and the refactor must agree on the exact state shape, so Gate 2 should approve both together.

**7.4 — There is no gating mechanism, no boss framework, and the Ender Pearl is never consumed.** Today "gating" is ad-hoc `inventory.has('key')` checks hardcoded inside `updateDungeon` (`main.js:549`); "boss" is a lone `Enemy` whose death sets `dungeonCleared` and spawns a chest; and `ender_pearl` is collected but **referenced nowhere after pickup**. The spec's `gatingItemIn` / `gatingItemOut` / `boss` fields are *new conventions the refactor must implement*, not descriptions of existing code. In particular, the L5 Ender-Pearl payoff is entirely greenfield, and the integration must guarantee no earlier gate consumes the Pearl.

---

*Companion document: [LEVEL_SPEC.md](LEVEL_SPEC.md) — the machine-checkable schema and acceptance criteria each author must satisfy.*
