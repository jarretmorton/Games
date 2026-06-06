// ─────────────────────────────────────────────────────────────────────────────
// L2 — The Lush Caverns acceptance script (docs/LEVEL_SPEC.md §5.2)
//
// Drives the game through window.__zcraft (debug hook) along the documented L2
// path and asserts the L2 acceptance criteria:
//   • Acquiring the Tripwire Hook adds `tripwire_hook` + sets the hook flag.
//   • A traversal impossible without the hook is completable with it (the grapple
//     across the Great Chasm).
//   • Defeating the cave-spider swarm sets the L2 clearedFlag.
//   • Gate-out: the forward exit fires only while holding `tripwire_hook`.
//   • Ender-Pearl invariant is not violated by L2.
//
// PILOT NOTE: L2 is reached via the TEMPORARY dev entrance (press L in the
// village under ?debug=1) — NOT the canonical L1→L2 connection (orchestrator
// decision). See the level-author report.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';

// NOTE: helpers are defined inline (not imported from playtest.spec.js) because
// Playwright forbids one spec file importing another. They mirror the shared
// debug-hook helpers in tests/playtest.spec.js.

/** Open the game with the debug hook enabled and wait until it is installed. */
async function bootDebug(page) {
    await page.goto('/zcraft.html?debug=1');
    await page.waitForFunction(() => !!window.__zcraft, null, { timeout: 10_000 });
}

/** Read the live game state snapshot. */
function readState(page) {
    return page.evaluate(() => window.__zcraft.state);
}

/** Press a key for `frames` game ticks (≈16ms each), then release. */
async function tap(page, code, frames = 4) {
    await page.evaluate((c) => window.__zcraft.input(c, true), code);
    await page.waitForTimeout(frames * 16);
    await page.evaluate((c) => window.__zcraft.input(c, false), code);
    await page.waitForTimeout(2 * 16);
}

/** Hold a key down for N frames (no release) — used for sustained movement. */
async function hold(page, code, frames) {
    await page.evaluate((c) => window.__zcraft.input(c, true), code);
    await page.waitForTimeout(frames * 16);
}
async function release(page, code) {
    await page.evaluate((c) => window.__zcraft.input(c, false), code);
    await page.waitForTimeout(2 * 16);
}

/** Walk through the title → name → character flow into the village. */
async function reachVillage(page) {
    await tap(page, 'Enter');          // TITLE → NAME_ENTRY (slot select)
    await tap(page, 'Enter');          // pick empty slot → start typing
    await tap(page, 'KeyA');           // type a one-letter name
    await tap(page, 'Enter');          // confirm name → CHARACTER_SELECT
    await tap(page, 'Enter');          // pick character → PLAYING (village)
    await expect.poll(() => readState(page).then(s => s.levelId)).toBe('village');
}

/** Press the dev-entrance key until we are inside L2. */
async function warpToLush(page) {
    for (let i = 0; i < 5; i++) {
        await tap(page, 'KeyL', 2);
        await page.waitForTimeout(400); // let the enter transition finish
        const s = await readState(page);
        if (s.levelId === 'lush_caverns') return;
    }
    throw new Error('failed to warp into lush_caverns');
}

/** Dismiss any active dialogue by tapping the action key a few times. */
async function clearDialogue(page) {
    for (let i = 0; i < 4; i++) await tap(page, 'Space', 2);
}

/** Walk left/right until the player's tile column equals `targetCol`. */
async function centerColumn(page, targetCol) {
    for (let i = 0; i < 24; i++) {
        const s = await readState(page);
        const col = Math.round(s.player.x / 32);
        if (col === targetCol) return;
        const dir = col < targetCol ? 'ArrowRight' : 'ArrowLeft';
        await hold(page, dir, 5);
        await release(page, dir);
    }
}

test.describe('L2 — Lush Caverns', () => {
    test('hook grant, swarm clear, grapple traversal, gate-out (LEVEL_SPEC §5.2)', async ({ page }) => {
        // Driving a melee swarm through synthetic input is slow (each swing is a
        // 16-frame animation); allow generous wall-clock time.
        test.setTimeout(150_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);

        let s = await readState(page);
        // G2 — spawn is safe.
        expect(s.player.hp).toBeGreaterThan(0);
        expect(s.flags.lushCavernsCleared).toBe(false);

        // ── Walk up from the spawn grotto into the swarm arena ────────────
        // Spawn is at the bottom (row 22); the swarm is in the arena (rows
        // 10–14), reached through the neck at row 15. Travel north (≈9 tiles).
        await hold(page, 'ArrowUp', 220);
        await release(page, 'ArrowUp');

        // ── Defeat the cave-spider swarm ──────────────────────────────────
        // We're now among the spiders. They converge, so we sweep attacks in all
        // four directions; nudging around keeps us in contact. The dev entrance
        // equipped a wooden sword so the swarm is beatable.
        const dirs = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
        for (let round = 0; round < 40; round++) {
            const st = await readState(page);
            if (st.flags.lushCavernsCleared) break;
            if (st.player.hp <= 0) throw new Error('player died fighting the swarm');
            // Swing once in each direction; the brief re-aim hold doubles as the
            // spacing the 16-frame attack needs to reset. Spiders converge, so a
            // four-way sweep catches them wherever they cluster.
            for (const f of dirs) {
                await hold(page, f, 3);
                await release(page, f);
                await tap(page, 'Space', 2);
            }
        }
        await clearDialogue(page);

        s = await readState(page);
        // Criterion: defeating the swarm sets the L2 clearedFlag.
        expect(s.flags.lushCavernsCleared).toBe(true);

        // ── Claim the Tripwire Hook from the reward chest ─────────────────
        // The chest sits in the alcove (row 7, col 11), north of the arena
        // through the row-9 gap (cols 9–13). Climb the column to the chest row,
        // re-centering on col 11 so we pass through the gap, then open it.
        for (let i = 0; i < 24; i++) {
            await centerColumn(page, 11);
            const row = Math.round((await readState(page)).player.y / 32);
            if (row <= 7) break;
            await hold(page, 'ArrowUp', 10);
            await release(page, 'ArrowUp');
        }
        for (let i = 0; i < 8 && !(await readState(page)).inventory.includes('tripwire_hook'); i++) {
            await tap(page, 'Space', 2); // open the chest
            await clearDialogue(page);
        }
        s = await readState(page);
        // Criterion: acquiring the hook adds it + sets the hook flag.
        expect(s.inventory).toContain('tripwire_hook');
        expect(s.flags.lushHookAcquired).toBe(true);

        // ── Grapple across the Great Chasm ────────────────────────────────
        // The HOOK_ANCHOR is at cols 10–11 on the far rim (row 3). Center on
        // col 11, walk up to the near rim (row 6, blocked by the chasm), face up,
        // and grapple across — landing on the far antechamber (≈row 2).
        let grappled = false;
        for (let i = 0; i < 16; i++) {
            await centerColumn(page, 11);
            await hold(page, 'ArrowUp', 10); // press up to the rim / face up
            await release(page, 'ArrowUp');
            await tap(page, 'Space', 2);     // grapple when facing the anchor across the gap
            if (Math.round((await readState(page)).player.y / 32) <= 3) { grappled = true; break; }
        }
        // The grapple is the ONLY way across the chasm: reaching the far rim
        // proves the hook-gated traversal (impossible on foot) is completable.
        expect(grappled).toBe(true);

        // ── Cross the LUSH_EXIT (gate-out) ────────────────────────────────
        // Climb the far antechamber to the exit (row 0). With the hook held, the
        // forward transition fires.
        let exited = false;
        for (let i = 0; i < 12; i++) {
            await centerColumn(page, 11);
            await hold(page, 'ArrowUp', 8);
            await release(page, 'ArrowUp');
            if ((await readState(page)).levelId !== 'lush_caverns') { exited = true; break; }
        }
        s = await readState(page);
        // Gate-out fired (left the level) — proves the grapple-only traversal is
        // completable WITH the hook. Destination is nextLevel when registered,
        // else the village fallback (pilot). Either way we are no longer stuck.
        expect(exited).toBe(true);
        expect(s.levelId).not.toBe('lush_caverns');

        // Ender-Pearl invariant: L2 never grants or consumes it; absence here is
        // expected (the test reached L2 via the dev warp, not through L1).
        expect(s.inventory).not.toContain('ender_pearl'); // not spuriously added
    });

    test('gate-out is honored — without the hook the chasm/exit is uncrossable (G4)', async ({ page }) => {
        test.setTimeout(60_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);

        // Do NOT clear the swarm or take the hook. Try to climb straight to the
        // exit. The Great Chasm is solid (CHASM + CAVE_WATER) and only the hook
        // crosses it, so the player must remain in lush_caverns.
        for (let i = 0; i < 20; i++) {
            await centerColumn(page, 11);
            await hold(page, 'ArrowUp', 10);
            await release(page, 'ArrowUp');
            await tap(page, 'Space', 2); // a stray action must NOT grapple (no hook)
        }
        const s = await readState(page);
        expect(s.inventory).not.toContain('tripwire_hook');
        // Gate-out NOT fired: still in L2 (the near rim / chasm blocks the way).
        expect(s.levelId).toBe('lush_caverns');
        // Player got no further than the near rim (row >= the chasm's south edge).
        expect(Math.round(s.player.y / 32)).toBeGreaterThanOrEqual(6);
    });
});
