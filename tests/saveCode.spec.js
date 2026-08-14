// ─────────────────────────────────────────────────────────────────────────────
// Save-code export/import round trip.
//
// iOS/iPadOS gives a Home Screen web app its own storage container, separate
// from Safari's, so localStorage can never be shared between them. Save codes
// are the manual bridge. This test proves the bridge holds: export a slot,
// wipe storage (standing in for "the other browser"), import the code back,
// and confirm the restored game matches where the player actually was.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { bootDebug, readState, tap, reachVillage } from './helpers.js';

/** Replace window.prompt with a stub we can queue answers into and inspect. */
async function stubPrompt(page) {
    await page.addInitScript(() => {
        window.__prompts = [];
        window.__promptReply = null;
        window.prompt = (message, defaultValue) => {
            window.__prompts.push({ message, defaultValue });
            return window.__promptReply;
        };
    });
}

const slotKey = 'zcraft_save_0';
const readSlot = (page) => page.evaluate((k) => localStorage.getItem(k), slotKey);

/**
 * Open the pause menu from PLAYING and move the cursor to a given option.
 * Must start from PLAYING: the cursor only resets to option 0 on that
 * transition, so entering from a submenu would land on the wrong option.
 */
async function openSaveMenu(page, optionIndex) {
    await expect.poll(() => readState(page).then(s => s.gameState)).toBe('PLAYING');
    await tap(page, 'Enter');
    await expect.poll(() => readState(page).then(s => s.gameState)).toBe('SAVE_MENU');
    for (let i = 0; i < optionIndex; i++) await tap(page, 'ArrowDown');
}

test.describe('save codes', () => {
    test.beforeEach(async ({ page }) => {
        await stubPrompt(page);
        await bootDebug(page);
        await reachVillage(page);
    });

    test('exports a slot, and imports it back after storage is wiped', async ({ page }) => {
        // Move off the spawn tile so the save has distinguishing coordinates.
        await tap(page, 'ArrowRight', 20);
        const moved = await readState(page);

        // Save Game (option 0) → slot 1.
        await openSaveMenu(page, 0);
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('SAVE_SLOTS');
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('PLAYING');

        const original = await readSlot(page);
        expect(original).toBeTruthy();

        // Export Code (option 2) → slot 1 → code arrives via prompt().
        await openSaveMenu(page, 2);
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('EXPORT_SLOTS');
        await tap(page, 'Enter');

        const prompts = await page.evaluate(() => window.__prompts);
        expect(prompts).toHaveLength(1);
        const code = prompts[0].defaultValue;
        expect(code.startsWith('ZC1.')).toBe(true);

        // Stand in for "the other browser": no saved games at all.
        await page.evaluate((k) => localStorage.removeItem(k), slotKey);
        expect(await readSlot(page)).toBeNull();

        // Import Code (option 3) → slot 1 → paste the code.
        await page.evaluate((c) => { window.__promptReply = c; }, code);
        await tap(page, 'KeyX'); // leave EXPORT_SLOTS
        await tap(page, 'KeyX'); // leave SAVE_MENU
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('PLAYING');

        await openSaveMenu(page, 3);
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('IMPORT_SLOTS');
        await tap(page, 'Enter');

        // The slot is byte-identical to what was exported.
        expect(await readSlot(page)).toBe(original);

        // And it actually loads: Restore puts the player back where they were.
        await tap(page, 'KeyX'); // leave IMPORT_SLOTS
        await tap(page, 'KeyX'); // leave SAVE_MENU
        await openSaveMenu(page, 1);
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('RESTORE_SLOTS');
        await tap(page, 'Enter');

        const restored = await readState(page);
        expect(Math.round(restored.player.x)).toBe(Math.round(moved.player.x));
        expect(Math.round(restored.player.y)).toBe(Math.round(moved.player.y));
        expect(restored.levelId).toBe(moved.levelId);
    });

    test('rejects an invalid code without touching the slot', async ({ page }) => {
        await openSaveMenu(page, 0);
        await tap(page, 'Enter');
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('PLAYING');
        const original = await readSlot(page);
        expect(original).toBeTruthy();

        await page.evaluate(() => { window.__promptReply = 'not-a-real-code'; });
        await openSaveMenu(page, 3);
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('IMPORT_SLOTS');
        await tap(page, 'Enter');

        expect(await readSlot(page)).toBe(original);
    });

    test('cancelling the import prompt leaves the slot alone', async ({ page }) => {
        await openSaveMenu(page, 0);
        await tap(page, 'Enter');
        await tap(page, 'Enter');
        await expect.poll(() => readState(page).then(s => s.gameState)).toBe('PLAYING');
        const original = await readSlot(page);

        // window.__promptReply stays null — the same thing a cancelled prompt returns.
        await openSaveMenu(page, 3);
        await tap(page, 'Enter');
        await tap(page, 'Enter');

        expect(await readSlot(page)).toBe(original);
    });
});
