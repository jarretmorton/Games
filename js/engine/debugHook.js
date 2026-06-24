// ─────────────────────────────────────────────────────────────────────────────
// DEBUG / TEST HOOK  (Phase 0 foundation — see docs/LEVEL_SPEC.md §5)
//
// Behind the ?debug=1 query flag ONLY, expose window.__zcraft so an external
// driver (Playwright) can observe state and inject input. Never installed in
// normal play, so it cannot affect a shipped game.
//
//   window.__zcraft.state        → { levelId, gameState, player:{x,y,hp}, inventory:[ids], flags }
//   window.__zcraft.input(code, down)  → fire a synthetic keydown/keyup
//   window.__zcraft.version      → VERSION string
//
// Input is delivered as real KeyboardEvents on window, so it flows through the
// exact same listeners as a human keypress (js/engine/input.js) — no special
// test path through the game logic.
// ─────────────────────────────────────────────────────────────────────────────

export function debugEnabled() {
    try {
        return new URLSearchParams(window.location.search).get('debug') === '1';
    } catch {
        return false;
    }
}

/**
 * Install window.__zcraft when ?debug=1 is present.
 * @param {object} api
 * @param {() => object} api.getState  returns { levelId, gameState, player:{x,y,hp}, inventory, flags }
 * @param {string}       api.version
 */
export function installDebugHook(api) {
    if (!debugEnabled()) return;

    window.__zcraft = {
        version: api.version,
        get state() {
            return api.getState();
        },
        input(code, down) {
            const type = down ? 'keydown' : 'keyup';
            window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
        },
        // Convenience: press-and-release across one or more frames is the
        // driver's job (it must let the game tick between down and up).
    };

    // Signal readiness so a test can wait on it deterministically.
    window.dispatchEvent(new Event('zcraft:debug-ready'));
}
