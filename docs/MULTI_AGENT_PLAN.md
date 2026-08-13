# ZCraft — Multi-Agent Level Expansion Plan (1 → 5 Levels)

**Repo:** `github.com/jarretmorton/ZCraft` · **Game:** ZCraft (Zelda × Minecraft) · **Written against:** `VERSION 1.1.4`
**Purpose:** A hands-on multi-agent workflow exercise — orchestrator-workers + evaluator-optimizer applied to a creative + QC domain, with deliberately minimal, high-leverage human input.

> **Status update (`VERSION 1.4.0`):** Gates 1–2 passed and Phase 0 shipped — the README, [WORLD_BIBLE.md](WORLD_BIBLE.md), [LEVEL_SPEC.md](LEVEL_SPEC.md), the `LEVELS` registry (`js/world/levels.js`), the `?debug=1` hook (`js/engine/debugHook.js`), the Playwright harness (`tests/`), and the `.claude/agents/` definitions. **L2 (Lush Caverns) is authored, play-tested, and merged** (Gate 3); L3–L5 remain to be built per Phases 2–4. Notes for readers of the original text below: §0 describes the repo *as it was at `1.1.4`* and is kept as the historical baseline (`main.js` is now ~3,300 lines and the registry exists); the planned `docs/ARCHITECTURE.md` was folded into the README's "Project structure" section + LEVEL_SPEC; `Plan for a game.docx` became the plain-text `Initial_prompt`.

---

## 0. What the repo actually is (so the plan is grounded, not assumed)

- Vanilla ES-module browser game. Entry point `zcraft.html`, all logic under `js/`, served by `http-server`. No build step, no tests.
- **A "level" = a map.** Maps live in `js/world/` as 2-D arrays of tile IDs (`tileTypes.js` enum `T`), plus exported spawn coords and special-tile constants (locked doors, pressure plates, spawn points). See `dungeonMap.js` for the canonical shape.
- Today's "Level 1" is the **town hub + interiors (home, shop, library, alchemist) + one dungeon**. The dungeon arc: a library book hints at the obsidian-pillar puzzle → push pillars onto pressure plates → unlock the fancy chamber → collect the **Ender Pearl**.
- **The one hard constraint:** `js/main.js` (2,868 lines) is the integration surface. Map switching is hardcoded — `const currentMap = inDungeon ? dungeonMap : townMap;` — and each destination has a bespoke `enterX()` transition function. There is **no level registry**. Save/load enumerates individual flags (e.g. `enderPearlPickedUp`).
- Docs are sparse: a 10-line `CLAUDE.md` (rules: always emit a PR link, branch `claude/<feature>-<sessionId>`, bump semver `VERSION` in `js/main.js`) and a `Plan for a game.docx`. No README, no architecture doc, no level spec.

**The architectural punchline:** writing four new map files is embarrassingly parallel. The *hard* parts are (a) the shared `main.js` integration surface where parallel edits collide, and (b) keeping five independently-authored levels coherent — consistent Minecraft theming, a real Zelda item-gating chain, a sane difficulty curve. The entire multi-agent design exists to solve (a) and (b), not to crank out tile arrays.

---

## 1. PROPOSED LEVEL ARC — *needs your approval before anything is built (Human Gate 1)*

Designed as a Zelda dungeon chain (each level grants an item that gates the next) with authentic Minecraft theming and a difficulty curve. Level 1 is preserved as-is — your and the kids' work stays. The **Ender Pearl you already planted in Level 1 becomes the finale payoff in Level 5**, which is the spine that makes the five levels feel like one game instead of five.

| # | Level / Biome | Signature mechanic & boss | Item acquired | Gates the next level by… |
|---|---|---|---|---|
| 1 | **The Village & the Sealed Mine** *(existing)* | Obsidian-pillar / pressure-plate puzzle; skeleton in the dungeon | **Ender Pearl** *(already there)* | Establishes the world; reward pays off in L5 |
| 2 | **The Lush Caverns** (lush cave: glow berries, dripleaf, water) | Traversal puzzles; cave-spider swarm mini-boss | **Tripwire Hook** (grapple — pull across gaps/water, yank far levers, hook enemies) | Grapple across the Great Chasm to reach the Deep Dark |
| 3 | **The Deep Dark / Ancient City** (sculk, darkness) | **Stealth** vs. sculk sensors + **Soul Lantern** light mechanic; **Warden** boss (tuned down) | **Flint & Steel** | Light the ruined obsidian **Nether portal** |
| 4 | **The Nether Fortress** (netherrack, lava, blazes) | Lava traversal + ranged combat (bow callback to L1); Blaze/Wither-Skeleton boss | **Blaze Rods → Eyes of Ender** | Craft the eyes, activate the **End portal** |
| 5 | **The End** (end stone, void, obsidian pillars — callback to L1) | Boss synthesis: uses hook + lantern + bow + **the L1 Ender Pearl** to traverse the void / dodge | *(finale)* **Ender Dragon** | — restores the village; story closes |

**Why this chain:** items 1, 3, 4 are the *canonical* Minecraft endgame progression (flint & steel → portal; blaze rods → eyes of ender → End portal → dragon), so the gating reads as authentic, not arbitrary. The Tripwire Hook is the one liberty — a real Minecraft block repurposed as a clean Zelda hookshot. Difficulty curve: intro → traversal → fear/stealth spike (midpoint) → combat-heavy → boss synthesis.

**What I'm asking you to approve here is only the spine** — biome, signature mechanic, boss, acquired item, and gate. Everything below that line (exact tile layouts, room geometry, NPC dialogue, hidden secrets, sub-puzzles, enemy placement, tuning) is left to the author agents' creative latitude, held true to Zelda structure and Minecraft theme. Approve as-is, swap any row, or redirect.

---

## 2. MULTI-AGENT ARCHITECTURE

**Topology: orchestrator-workers (parallel authoring) + evaluator-optimizer (QC loop), with a serial integration gate.** Same two patterns you've named in Spike SysML — reused here in a new domain, which is the point of the exercise.

```
                         ┌─────────────────────────────┐
                         │  ORCHESTRATOR / SHOWRUNNER   │  owns World Bible + Level Spec
                         │  (lead Claude Code session)  │  decomposes, dispatches, sequences,
                         └──────────────┬──────────────┘  escalates to human at gates
              ┌──────────────┬──────────┼───────────┬───────────────┐
              ▼              ▼          ▼            ▼               ▼
      ┌─────────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────────┐
      │  REFACTOR   │  │ AUTHOR   │ │ AUTHOR   │ │ AUTHOR   │  │ ASSET/THEME  │
      │ (Phase 0,   │  │ Level 2  │ │ Level 3  │ │ Level 4/5│  │ (shared tiles│
      │  serial)    │  └────┬─────┘ └────┬─────┘ └────┬─────┘  │  + palette)  │
      └─────────────┘       │            │            │        └──────────────┘
                            ▼            ▼            ▼
                    ┌───────────────────────────────────────┐
                    │  QC / PLAYTEST (independent evaluators) │
                    │  • Scripted Playtester (Playwright)     │  ← deterministic: completable? gate works? soft-locks?
                    │  • Exploratory Playtester (Chrome/Cowork)│  ← judgment: fun? fair? theming? exploits?
                    └───────────────────┬───────────────────┘
                                        │  defect → fix → re-test (evaluator-optimizer loop)
                                        ▼
                         ┌─────────────────────────────┐
                         │  INTEGRATOR (serial merge,   │  merge L2…L5 one at a time,
                         │  full regression after each) │  bump VERSION, open PR per CLAUDE.md
                         └─────────────────────────────┘
```

### Agent roster

1. **Orchestrator / Showrunner** — the lead Claude Code session. Owns the two shared documents (below), decomposes the work, spawns workers, routes defects, runs the serial integration, and escalates to you at the gates. Holds the plan in files/script variables, not in its own context.
2. **Refactor agent** *(Phase 0, serial, runs first)* — converts `main.js`'s hardcoded map switching into a data-driven `LEVELS` registry, generalizes save/load, and adds the testability hook. Everything parallel depends on this landing cleanly.
3. **Level Author workers ×4** *(parallel)* — one per new level. Each receives the World Bible, its Level Spec row, and the registry API, and produces a self-contained branch: map file(s), any new tile IDs, NPC/enemy/item data, puzzle wiring, and the registry entry. Creative latitude within the approved theme.
4. **Asset / Theme agent** *(shared)* — extends the tile sprite set and palette so four independently-authored levels stay visually one game. Prevents four divergent art styles. Can be folded into the orchestrator's World Bible ownership if you want fewer moving parts.
5. **QC / Playtest evaluators ×2 flavors** *(independent of authors)* —
   - **Scripted Playtester** (Playwright + the debug hook): deterministic regression. Can the level be completed start-to-finish? Does the acquired item actually unlock the next level? Any soft-locks, out-of-bounds, null-state crashes? Runs on every level branch *and* after every integration merge.
   - **Exploratory Playtester** (Claude in Chrome or Cowork driving a real browser): judgment QC that scripts can't do — is it fun, is the difficulty fair, does the theming land, are there cheap exploits or dead ends?
6. **Integrator** — serially merges approved branches, runs the full scripted regression after *each* merge, bumps `VERSION`, and opens the PR using the `CLAUDE.md` branch/PR conventions.

### Architecture decisions and why (you asked for justification)

- **Refactor to a level registry *before* fanning out.** Parallel throughput is capped by the shared mutable surface, and `main.js` is it. Shrinking that surface first ("make the change easy, then make the easy change") converts level-adding from "edit a 2,868-line file four ways and merge-conflict" into "append one registry entry." Highest-leverage decision in the plan.
- **A shared World Bible + Level Spec (a blackboard), not inter-agent chat.** Workers that coordinate by messaging each other are O(n²) and drift. Workers that read/write one authoritative artifact stay coherent and auditable. This is your Spike instinct — Iserte's grammar-in-the-loop, your fixed unit-model registry. Conveniently, Claude Code **subagents can't message each other anyway** (they only report to the parent), so the primitive *enforces* the blackboard design.
- **QC agents are independent from authors.** An author verifying its own level shares the exact misconception that produced the bug — same blind spot, same context. Independent verification is the whole premise of code review and of your V-model integration gate. The playtester must run in a separate context from the author.
- **The running game is the evaluator — not unit tests.** There are no unit tests, and the failures that matter (soft-locks, un-completable puzzles, un-fun pacing) are emergent and only visible at runtime. Playing the game is the ground-truth oracle — the direct analog of SPIKE Prime hardware-as-evaluator. Scripted playtests check *coverage*; exploratory playtests check *quality* — the same two things your Spike human-gate evidence package separates.
- **Serial integration with a regression gate after each merge.** Five branches touching a shared registry and a shared tile-ID space will collide (ID reuse, save-format drift, palette clashes). Merging one at a time and re-running the full playtest suite after each catches cross-level regressions before they compound — instead of an n-way merge explosion at the end.
- **Subagents, not Agent Teams, not Dynamic Workflows — for this size.** Right-sizing the machinery is itself a lesson. Four independent authors sharing a blackboard = **subagents** (cheap, context-isolated, parent-mediated). You don't need Agent Teams' peer-to-peer messaging here, and Dynamic Workflows (tens-to-hundreds of subagents) is overkill for a 4-way fan-out. *Stretch goal:* re-run the defect-fix loop as an **Agent Team** later to feel the difference — that's the curriculum's "interaction topology" concept made tangible.

---

## 3. HUMAN CHECKPOINTS — necessary and sufficient

Four gates total. Each sits where human judgment is irreplaceable *or* where an error propagates expensively downstream. Everywhere else, the agents run autonomously and escalate on ambiguity rather than guess.

| Gate | When | What you decide | Why it's worth your time |
|---|---|---|---|
| **G1 — Creative spine** | Now (Section 1) | Approve/adjust the 5-level arc + gating chain | Everything inherits from this; a wrong theme is cheap to fix now, expensive after four levels exist |
| **G2 — Foundation review** | End of Phase 0 | Approve the refactor PR + the World Bible + Level Spec | The registry touches the shared surface and the spec is the workers' contract; one bad foundation poisons all parallel work. Reviewed in one sitting. |
| **G3 — Level acceptance** *(lightweight, batchable)* | After each level passes QC | Skim the playtest report; approve merge | Fast skim, not a re-test — the scripted suite already proved completability |
| **G4 — Final taste** | After integration | Play the full game (with the kids) and sign off on *fun* | Agents file defects; only a human signs off on whether it's actually good. The kids are your highest-signal exploratory testers. |

Escalation rule baked into every agent: **on ambiguity, conflict, or a spec gap — stop and ask, don't guess.** That's what keeps "minimal human input" from becoming "low-quality autonomous output."

---

## 4. STEP-BY-STEP SETUP & EXECUTION

Primary harness: **Claude Code** (orchestrator, refactor, authors, integrator, scripted QC). Optional: **Cowork / Claude in Chrome** for exploratory QC. You can run the whole thing in Claude Code alone for a leaner v1 (Playwright-only QC) and add Cowork exploratory QC for the richer version.

> Subagents are configured as Markdown files with YAML frontmatter in `.claude/agents/` (project scope, committed to the repo). Verify exact frontmatter keys and the current `/agents` flow at **docs.claude.com** before relying on specific fields — Claude Code's surface changes fast. Cost scales linearly with parallel agents (~3–4× tokens for 3–4 workers); commit a model per agent (e.g. authoring on the strong model, scripted-QA on a cheaper one) so cost is config, not willpower.

### Phase 0 — Make the repo multi-agent-ready *(serial; ends at G2)*

This phase is done by **you + one Claude Code session**, reviewed by you. Do not parallelize it.

**0.1 — Branch and clone for parallel work.** Plan to give each later worker its own **git worktree** so parallel sessions don't stomp a shared working tree:
```bash
git worktree add ../zcraft-l2 -b claude/level2-lush-caverns
git worktree add ../zcraft-l3 -b claude/level3-deep-dark
# …one per level
```

**0.2 — Write the shared documents (this is also the "docs update" your repo needs).** Following the structured pattern you use on Spike SysML and LLM Accuracy Eval (honest "what this is today," `Status / Flow / Open questions`):
- `README.md` — what ZCraft is, how to run it (`npm install && npx http-server`), current state honestly stated.
- `docs/ARCHITECTURE.md` — module map (`engine / entities / rendering / systems / world / data / state`), the **Level Registry API** (post-refactor), the **tile-ID registry** (the shared namespace authors must not collide in), save-format, and an Open Questions section.
- `docs/WORLD_BIBLE.md` — tone, palette, Minecraft mob/block roster in play, the **item-progression chain** from Section 1, and difficulty-curve intent. *This is the orchestrator's source of truth.*
- `docs/LEVEL_SPEC.md` — the schema every new level file must satisfy: map dimensions, required tiles (spawn, entrance, exit), `gatingItemIn` / `gatingItemOut`, boss, and **acceptance criteria** (the conditions the scripted playtester asserts). *This is each author's contract.*

**0.3 — Refactor `main.js` to a level registry.** Extract a data structure roughly:
```js
// js/world/levels.js
export const LEVELS = {
  town:    { map: townMap,    spawn: [SPAWN_X, SPAWN_Y],    transitions: {...}, onEnter() {} },
  mine:    { map: dungeonMap, spawn: [DUNGEON_SPAWN_X, DUNGEON_SPAWN_Y], ... },
  // level authors append entries here — the ONLY shared file they touch
};
```
Replace `inDungeon ? dungeonMap : townMap` and the bespoke `enterShop/Library/Home/Alchemist/Dungeon` functions with registry lookups (`enterLevel(id)`), and generalize save/load to serialize `currentLevelId` + a per-level flag bag instead of named booleans like `enderPearlPickedUp`.

**0.4 — Add the testability hook (this is what lets QC agents "actually play").** Behind a `?debug=1` query flag so it never ships in normal play, expose:
```js
window.__zcraft = {
  get state() { return { levelId, player: {x, y, hp}, inventory, flags }; },
  input(key, down) { /* dispatch synthetic keydown/keyup into js/engine/input.js */ },
};
```
Playwright drives the game by firing `input()` sequences and asserting against `state` (e.g. "after this path, `inventory` contains `tripwire_hook` and `levelId === 'deep_dark'` is reachable").

**0.5 — Scaffold the QC harness.**
```bash
npm i -D @playwright/test
# tests/playtest.spec.js — boots http-server, opens zcraft.html?debug=1, runs per-level scripts
```
Add `"test": "playwright test"` to `package.json`.

**0.6 — Write the subagent definitions** in `.claude/agents/` — one Markdown+YAML file each: `orchestrator`, `level-author`, `scripted-playtester`, `integrator`. Each gets a scoped system prompt (its role + a pointer to the World Bible/Level Spec) and a scoped tool list (per the read-only-subagent best practice, give playtesters read + bash-to-run-tests, keep heavy Write/Edit on the authors and integrator).

➡️ **Human Gate 2:** review the refactor PR + the two spec docs in one sitting. This is the most leveraged review in the project.

### Phase 1 — Creative approval *(Human Gate 1 — already in front of you, Section 1)*
Chronologically first; the World Bible in 0.2 is derived from whatever you approve here.

### Phase 2 — Parallel authoring *(orchestrator-workers)*
In the lead session: *"Read `docs/WORLD_BIBLE.md` and `docs/LEVEL_SPEC.md`. Spawn one `level-author` subagent per level (2–5), each in its own worktree. Each authors its level to spec with full creative latitude on layout, dialogue, secrets, and tuning, appends its `LEVELS` entry, and stops to report a branch + a self-test note. Use the shared tile-ID registry; never reuse an ID."* The asset/theme agent runs alongside to keep palettes coherent.

### Phase 3 — QC loop *(evaluator-optimizer, per level, autonomous)*
For each branch: scripted playtester runs the acceptance script → files defects → author (or a fixer subagent) patches → re-test. Loop until the acceptance criteria pass. Then the exploratory playtester (Chrome/Cowork) does a human-like playthrough and files qualitative defects (fun, fairness, exploits), which run the same fix→re-test loop.

➡️ **Human Gate 3** *(lightweight, batchable):* skim each level's playtest report; approve to merge.

### Phase 4 — Serial integration
Integrator merges approved branches **one at a time**, runs `npm test` (full regression) after each merge, resolves tile-ID/palette/save-format collisions (escalating genuine ambiguity), bumps `VERSION` in `js/main.js` per `CLAUDE.md`, and opens the PR with the required `https://github.com/jarretmorton/ZCraft/pull/new/<branch>` link.

➡️ **Human Gate 4:** play the full five-level game (kids on the controller) and sign off. Merge to `master`.

---

## 5. How this fits the curriculum

This is a self-contained reps exercise on the two patterns you're already documenting in Spike SysML (orchestrator-workers + evaluator-optimizer), in a domain where the evaluator is concrete and visible — *the game plays or it doesn't*. New skills you'd actually exercise hands-on: Claude Code **subagents** and `.claude/agents/` config, **git worktrees** for parallel sessions, a **Playwright** game-driving harness, and the design discipline of a **shared-blackboard topology** with serial integration. Optional stretch that maps straight onto the "interaction topology" glossary entry: re-run Phase 3 as an **Agent Team** (peer messaging) and compare cost/quality against the subagent version. It's off the master-plan critical path — but it's the cleanest "use a multi-agent workflow to do real work with only necessary-and-sufficient human input" demonstration in the whole plan, and it's genuinely fun.

---

*Open the gate: approve or adjust the Section 1 arc and I'll turn it into the World Bible + Level Spec and the four `.claude/agents/` definitions so you can start Phase 0.*
