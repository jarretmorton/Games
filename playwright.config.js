// Playwright config for the ZCraft scripted playtester (plan §0.5).
// Boots http-server and drives zcraft.html?debug=1 via window.__zcraft.
import { defineConfig, devices } from '@playwright/test';

// Port selection (pilot finding): with a fixed port + reuseExistingServer, a run
// could silently pass against a STALE server from another checkout. So each run
// starts (and tears down) its OWN server (reuseExistingServer:false) — if the
// port is busy it fails loudly instead of reusing stale code. For PARALLEL runs
// (e.g. several level-author worktrees at once), give each a distinct port via
// the ZCRAFT_PORT env var. (Env is inherited by Playwright's worker processes;
// a PID-derived port is NOT — workers would each pick a different one.)
const PORT = Number(process.env.ZCRAFT_PORT) || 8080;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    fullyParallel: false,
    reporter: 'list',
    use: {
        baseURL: BASE_URL,
        headless: true,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        // -c-1 disables caching so edits are picked up between runs.
        command: `npx http-server -p ${PORT} -c-1 .`,
        url: `${BASE_URL}/zcraft.html`,
        reuseExistingServer: false,
        timeout: 20_000,
    },
});
