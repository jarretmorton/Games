// Playwright config for the ZCraft scripted playtester (Phase 0 — plan §0.5).
// Boots http-server and drives zcraft.html?debug=1 via window.__zcraft.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8080;
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
        reuseExistingServer: true,
        timeout: 20_000,
    },
});
