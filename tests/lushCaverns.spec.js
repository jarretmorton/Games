// ─────────────────────────────────────────────────────────────────────────────
// L2 — The Lush Caverns acceptance script (docs/LEVEL_SPEC.md §5.2 + G10)
//
// Drives the game through window.__zcraft (debug hook) and asserts:
//   • Defeating the cave-spider swarm sets the L2 clearedFlag.
//   • Acquiring the Tripwire Hook adds `tripwire_hook` + sets the hook flag.
//   • Grapple traversal: the Great Chasm is crossable ONLY with the hook.
//   • The hidden glow-berry stash (the secret) sets `lushSecretFound` (G10).
//   • The exit boulder drops the player into the mine (levelId → 'mine').
//   • Gate-out: without the hook the chasm is uncrossable (player stays in L2).
//   • Ender-Pearl invariant is not violated by L2.
//
// PILOT NOTE: L2 is reached here via the TEMPORARY dev entrance (press L under
// ?debug=1), which uses the same well-drop spawn as the real well entrance.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import {
    bootDebug, readState, tap, hold, release,
    reachVillage, clearDialogue, centerColumn, centerRow,
} from './helpers.js';

/** L2-specific: warp straight into the Lush Caverns via the dev entrance. */
async function warpToLush(page) {
    for (let i = 0; i < 5; i++) {
        await tap(page, 'KeyL', 2);
        await page.waitForTimeout(400);
        const s = await readState(page);
        if (s.levelId === 'lush_caverns') return;
    }
    throw new Error('failed to warp into lush_caverns');
}

/** Clear the cave-spider swarm by climbing into the arena and sweeping. */
async function clearSwarm(page) {
    const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    for (let round = 0; round < 60; round++) {
        const st = await readState(page);
        if (st.flags.lushCavernsCleared) return;
        if (st.player.hp <= 0) { await tap(page, 'Space'); continue; } // respawn if downed
        await hold(page, 'ArrowUp', 3); await release(page, 'ArrowUp'); // press into the arena
        for (const f of dirs) {
            await hold(page, f, 3);
            await release(page, f);
            await tap(page, 'Space', 2);
        }
    }
}

test.describe('L2 — Lush Caverns', () => {
    test('swarm, hook, grapple, secret, boulder-exit into the mine (§5.2 + G10)', async ({ page }) => {
        test.setTimeout(180_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);

        let s = await readState(page);
        expect(s.player.hp).toBeGreaterThan(0);          // G2 safe spawn
        expect(s.flags.lushCavernsCleared).toBe(false);

        // ── Defeat the swarm ──────────────────────────────────────────────
        await clearSwarm(page);
        await clearDialogue(page);
        s = await readState(page);
        expect(s.flags.lushCavernsCleared).toBe(true);

        // ── Claim the Tripwire Hook (chest at row 7, col 11) ──────────────
        for (let i = 0; i < 24; i++) {
            await centerColumn(page, 11);
            if (Math.round((await readState(page)).player.y / 32) <= 8) break;
            await hold(page, 'ArrowUp', 10); await release(page, 'ArrowUp');
        }
        for (let i = 0; i < 12 && !(await readState(page)).inventory.includes('tripwire_hook'); i++) {
            await centerColumn(page, 11);
            await centerRow(page, 7);   // stand on the chest tile
            await tap(page, 'Space', 2);
            await clearDialogue(page);
        }
        s = await readState(page);
        expect(s.inventory).toContain('tripwire_hook');
        expect(s.flags.lushHookAcquired).toBe(true);

        // ── Grapple across the Great Chasm to the north shelf ─────────────
        let grappled = false;
        for (let i = 0; i < 18; i++) {
            await centerColumn(page, 11);
            await hold(page, 'ArrowUp', 10); await release(page, 'ArrowUp');
            await tap(page, 'Space', 2);
            if (Math.round((await readState(page)).player.y / 32) <= 3) { grappled = true; break; }
        }
        expect(grappled).toBe(true); // the chasm is crossable ONLY via the hook

        // ── Find the hidden stash on the far-right of the shelf (G10) ─────
        // Proximity interaction: get near col 20–21 on row 2 and act.
        await centerRow(page, 2);
        for (let i = 0; i < 12 && !(await readState(page)).flags.lushSecretFound; i++) {
            await centerColumn(page, 20);
            await hold(page, 'ArrowRight', 12); await release(page, 'ArrowRight'); // pin into col 20
            await tap(page, 'Space', 2);
            await clearDialogue(page);
        }
        s = await readState(page);
        expect(s.flags.lushSecretFound).toBe(true);

        // ── Shove the exit boulder on the far-left → drop into the mine ───
        // Proximity interaction: get near col 2 on row 2 and act (needs the hook).
        let exited = false;
        for (let i = 0; i < 12; i++) {
            await centerRow(page, 2);
            await centerColumn(page, 2);
            await tap(page, 'Space', 2);
            await page.waitForTimeout(400); // enter-mine transition
            await clearDialogue(page);
            if ((await readState(page)).levelId === 'mine') { exited = true; break; }
        }
        s = await readState(page);
        expect(exited).toBe(true);
        expect(s.levelId).toBe('mine');                  // the boulder links L2 → mine
        expect(s.inventory).not.toContain('ender_pearl'); // G7: not spuriously added

        // ── Permanence (regression): the doorway is two-way, forever ──────
        // mine → L2 by stepping into the wall hole (the player lands beside it).
        for (let i = 0; i < 12 && (await readState(page)).levelId !== 'lush_caverns'; i++) {
            await hold(page, 'ArrowRight', 8); await release(page, 'ArrowRight');
            await page.waitForTimeout(300);
            await clearDialogue(page);
        }
        expect((await readState(page)).levelId).toBe('lush_caverns');
        // L2 → mine again by walking back through the boulder doorway (col 1).
        await centerRow(page, 2);
        for (let i = 0; i < 16 && (await readState(page)).levelId !== 'mine'; i++) {
            await hold(page, 'ArrowLeft', 8); await release(page, 'ArrowLeft');
            await page.waitForTimeout(300);
            await clearDialogue(page);
        }
        expect((await readState(page)).levelId).toBe('mine');
    });

    test('cave spiders web-freeze the player for ~2 seconds', async ({ page }) => {
        test.setTimeout(120_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);

        // Linger in/near the spider arena until a web connects and freezes us.
        // (The freeze gates input — proven separately — so we just detect it.)
        let froze = false;
        for (let i = 0; i < 120 && !froze; i++) {
            const s = await readState(page);
            if (s.player.frozen) { froze = true; break; }
            if (s.player.hp <= 0) { await tap(page, 'Space'); continue; } // respawn if downed
            await hold(page, 'ArrowUp', 4); await release(page, 'ArrowUp'); // press into the swarm
            await page.waitForTimeout(150);                                 // hold position so a web lands
            if ((await readState(page)).player.frozen) froze = true;
        }
        expect(froze).toBe(true);
    });

    test('secret potato pet (Spud) is findable in the lower grotto', async ({ page }) => {
        test.setTimeout(120_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);
        await clearSwarm(page);     // clear the swarm so exploration is unobstructed
        await clearDialogue(page);

        let s = await readState(page);
        expect(s.flags.lushPetFound).toBe(false);

        // Spud hides at col 2, row 19 (bottom-left of the entry grotto). Walk to
        // the open lower row first, then west to the corner, then onto the pet.
        for (let i = 0; i < 20 && !(await readState(page)).flags.lushPetFound; i++) {
            await centerRow(page, 20);
            await centerColumn(page, 2);
            await centerRow(page, 19);
            await clearDialogue(page);
        }
        s = await readState(page);
        expect(s.flags.lushPetFound).toBe(true);   // walking onto Spud sets the flag
        expect(s.levelId).toBe('lush_caverns');
    });

    test('gate-out is honored — without the hook the chasm is uncrossable (G4)', async ({ page }) => {
        test.setTimeout(120_000);
        await bootDebug(page);
        await reachVillage(page);
        await warpToLush(page);
        await clearSwarm(page);   // clear for free movement; do NOT take the hook
        await clearDialogue(page);

        // Try to climb to the north shelf and grapple — with no hook this is inert.
        for (let i = 0; i < 16; i++) {
            await centerColumn(page, 11);
            await hold(page, 'ArrowUp', 10); await release(page, 'ArrowUp');
            await tap(page, 'Space', 2);
        }
        const s = await readState(page);
        expect(s.inventory).not.toContain('tripwire_hook');
        expect(s.levelId).toBe('lush_caverns');              // never left the level
        expect(Math.round(s.player.y / 32)).toBeGreaterThanOrEqual(4); // never reached the shelf
    });
});
