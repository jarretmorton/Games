# ZCraft

A top-down adventure game that mashes **Zelda**'s dungeon structure with **Minecraft**'s blocks, mobs, and items — built as a family project (a parent + kids) and as a hands-on multi-agent development exercise.

It's a vanilla **ES-module browser game**: no framework, no build step, no bundler. All graphics are drawn procedurally on a `<canvas>` (flat-shaded 32px tiles + simple sprites). Just serve the folder and play.

> Current version: **1.3.0** (see the `VERSION` export in [js/main.js](js/main.js)).

---

## Play locally

Requires [Node.js](https://nodejs.org/) (for the dev server and tests).

```bash
npm install        # installs the http-server dev dependency
npm run serve      # serves the folder on http://localhost:8080
```

Then open **http://localhost:8080/zcraft.html** in a browser.

That's the whole setup — the game itself is just static files (`zcraft.html` + `js/` + `css/`), so any static file server works. `npm run serve` runs `http-server` with caching disabled so edits show up on reload.

### Controls

Desktop is keyboard-driven; on-screen touch controls appear automatically on touch devices.

| Action | Keys |
|---|---|
| Move | Arrow keys or **W A S D** |
| A — attack / confirm / interact | **Z** or **Space** |
| B — shield / cancel | **B** or **Alt** |
| START — save menu | **Enter** |
| SELECT — inventory | **I** or **E** |

At the title screen, press **Enter** to begin, type a name, pick a character, and play. Progress is saved to browser `localStorage` save slots.

---

## The game so far

- **Level 1 — The Village & the Sealed Mine.** A town hub with shops and interiors. Solve an obsidian-pillar / pressure-plate puzzle to unseal the mine, defeat the skeleton, and claim the **Ender Pearl**.
- **Level 2 — The Lush Caverns.** After the Ender Pearl, a villager points you to the broken **well** in the square — fall in to reach a mossy cavern. Survive a cave-spider swarm, claim the **Tripwire Hook** (a grapple), cross the Great Chasm, and shove a boulder to open a permanent passage back to the mine. (A hidden stash rewards exploring.)

More levels (the Deep Dark, the Nether, the End) are planned — see [docs/MULTI_AGENT_PLAN.md](docs/MULTI_AGENT_PLAN.md).

---

## Project structure

```
zcraft.html              Entry point (loads js/main.js as a module)
css/style.css            Layout + responsive touch-control styling
js/
  main.js                Game loop, state machine, level dispatch, save/load
  engine/                input, camera, collision
  entities/              player, enemy, npc, breakable
  rendering/             renderer, sprites, hud, dialogue
  systems/               combat, inventory, shop, puzzle, saveSystem
  world/                 the maps (one module per area) + levels.js registry
  data/                  tileTypes, items, npcs, characters
  state/                 gameState (the state machine)
  audio/                 music (procedural Web Audio chiptune)
docs/                    architecture/design docs (see below)
tests/                   Playwright playtests
```

### A few architecture notes

- **A "level" is a map.** Each area is a module in [js/world/](js/world/) exporting a 2-D array of tile IDs (the `T` enum in [js/data/tileTypes.js](js/data/tileTypes.js)) plus spawn/special-tile coordinates. [js/world/levels.js](js/world/levels.js) is a **registry** cataloguing every area; `enterLevel(id)` drives the generic transition, so adding a level is mostly "append a registry entry."
- **Debug / test hook.** Loading with `?debug=1` (e.g. `zcraft.html?debug=1`) installs `window.__zcraft`, exposing game state and synthetic input for automated testing. It is **never** installed in normal play.

---

## Testing

The test suite drives the real game in a headless browser via the debug hook.

```bash
npm install
npx playwright install chromium   # one-time: fetch the browser
npm test                          # runs the Playwright playtests
```

The tests boot `zcraft.html?debug=1`, fire synthetic input through `window.__zcraft`, and assert against game state (level completability, item gating, no soft-locks). See [tests/](tests/) and the acceptance criteria in [docs/LEVEL_SPEC.md](docs/LEVEL_SPEC.md).

Each run starts and tears down its own server (no stale-server reuse). To run several checkouts in parallel (e.g. multiple level-author worktrees), give each a distinct port:

```bash
ZCRAFT_PORT=8131 npm test
```

---

## Development & design docs

This repo doubles as a multi-agent development exercise. The design contracts live in [docs/](docs/):

- **[MULTI_AGENT_PLAN.md](docs/MULTI_AGENT_PLAN.md)** — the plan for expanding 1 → 5 levels with orchestrated agents.
- **[WORLD_BIBLE.md](docs/WORLD_BIBLE.md)** — tone, palette, the Minecraft roster, the item-progression chain, and difficulty intent.
- **[LEVEL_SPEC.md](docs/LEVEL_SPEC.md)** — the schema and machine-checkable acceptance criteria every new level must satisfy, plus the shared tile-ID registry.

Repo conventions (branch naming, PR links, semver `VERSION` bumps) are in [CLAUDE.md](CLAUDE.md).
