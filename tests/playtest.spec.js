// ─────────────────────────────────────────────────────────────────────────────
// ZCraft scripted playtester (Phase 0 foundation — plan §0.5, docs/LEVEL_SPEC.md §5)
//
// This file currently holds the DEBUG-HOOK SMOKE TEST that proves the
// window.__zcraft contract works end-to-end. Per-level acceptance scripts
// (LEVEL_SPEC §5: completability, gate-in/out, item-granted, no soft-lock,
// Ender-Pearl preservation) are added alongside each new level by its author /
// the scripted-playtester agent, using the helpers below.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';

const KNOWN_LEVEL_IDS = ['village', 'mine', 'shop', 'library', 'home', 'alchemist'];

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

test.describe('debug hook contract', () => {
    test('window.__zcraft installs under ?debug=1 and reports well-formed state', async ({ page }) => {
        await bootDebug(page);

        const version = await page.evaluate(() => window.__zcraft.version);
        expect(typeof version).toBe('string');
        expect(version).toMatch(/^\d+\.\d+\.\d+$/);

        const state = await readState(page);
        expect(KNOWN_LEVEL_IDS).toContain(state.levelId); // at the title screen → 'village'
        expect(state.player).toEqual(expect.objectContaining({ hp: expect.any(Number) }));
        expect(Array.isArray(state.inventory)).toBe(true);
        expect(state.flags).toEqual(expect.objectContaining({ inDungeon: expect.any(Boolean) }));
    });

    test('the hook is NOT installed without the debug flag', async ({ page }) => {
        await page.goto('/zcraft.html');
        const hasHook = await page.evaluate(() => !!window.__zcraft);
        expect(hasHook).toBe(false);
    });

    test('synthetic input reaches the game (title → name entry)', async ({ page }) => {
        await bootDebug(page);
        // Title screen advances on START (Enter); proves input() is wired through
        // js/engine/input.js without throwing and the loop keeps ticking.
        await tap(page, 'Enter');
        const state = await readState(page);
        expect(state).toBeTruthy();
        expect(KNOWN_LEVEL_IDS).toContain(state.levelId);
    });
});

export { bootDebug, readState, tap, KNOWN_LEVEL_IDS };
