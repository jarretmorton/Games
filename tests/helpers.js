// ─────────────────────────────────────────────────────────────────────────────
// Shared playtest helpers for driving ZCraft through the window.__zcraft debug
// hook (see js/engine/debugHook.js). This is a plain module, NOT a *.spec file,
// so Playwright does not collect it as a test and spec files may import it.
// (Playwright forbids one spec importing another — hence this module.)
// ─────────────────────────────────────────────────────────────────────────────
import { expect } from '@playwright/test';

/** Every level id the game can report (used to sanity-check state.levelId). */
export const KNOWN_LEVEL_IDS = ['village', 'mine', 'lush_caverns', 'shop', 'library', 'home', 'alchemist'];

/** Open the game with the debug hook enabled and wait until it is installed. */
export async function bootDebug(page) {
    await page.goto('/zcraft.html?debug=1');
    await page.waitForFunction(() => !!window.__zcraft, null, { timeout: 10_000 });
}

/** Read the live game state snapshot. */
export function readState(page) {
    return page.evaluate(() => window.__zcraft.state);
}

/** Press a key for `frames` game ticks (≈16ms each), then release. */
export async function tap(page, code, frames = 4) {
    await page.evaluate((c) => window.__zcraft.input(c, true), code);
    await page.waitForTimeout(frames * 16);
    await page.evaluate((c) => window.__zcraft.input(c, false), code);
    await page.waitForTimeout(2 * 16);
}

/** Hold a key down for N frames (no release) — sustained movement. */
export async function hold(page, code, frames) {
    await page.evaluate((c) => window.__zcraft.input(c, true), code);
    await page.waitForTimeout(frames * 16);
}

export async function release(page, code) {
    await page.evaluate((c) => window.__zcraft.input(c, false), code);
    await page.waitForTimeout(2 * 16);
}

/** Walk the title → name → character flow into the village. */
export async function reachVillage(page) {
    await tap(page, 'Enter');   // TITLE → NAME_ENTRY
    await tap(page, 'Enter');   // pick empty slot → typing
    await tap(page, 'KeyA');    // one-letter name
    await tap(page, 'Enter');   // confirm → CHARACTER_SELECT
    await tap(page, 'Enter');   // pick character → PLAYING (village)
    await expect.poll(() => readState(page).then(s => s.levelId)).toBe('village');
}

/** Advance dialogue until back in PLAYING (line counts / typewriter reveals vary). */
export async function clearDialogue(page) {
    for (let i = 0; i < 16; i++) {
        if ((await readState(page)).gameState !== 'DIALOGUE') return;
        await tap(page, 'Space', 2);
    }
}

/** Walk left/right until the player's tile column equals `targetCol`. */
export async function centerColumn(page, targetCol) {
    for (let i = 0; i < 48; i++) {
        const col = Math.round((await readState(page)).player.x / 32);
        if (col === targetCol) return;
        const dir = col < targetCol ? 'ArrowRight' : 'ArrowLeft';
        await hold(page, dir, 8);
        await release(page, dir);
    }
}

/** Walk up/down until the player's tile row equals `targetRow`. */
export async function centerRow(page, targetRow) {
    for (let i = 0; i < 48; i++) {
        const row = Math.round((await readState(page)).player.y / 32);
        if (row === targetRow) return;
        const dir = row < targetRow ? 'ArrowDown' : 'ArrowUp';
        await hold(page, dir, 8);
        await release(page, dir);
    }
}
