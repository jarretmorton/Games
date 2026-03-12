const keys = {};
const justPressed = {};
const justReleased = {};

window.addEventListener('keydown', (e) => {
    if (!keys[e.code]) {
        justPressed[e.code] = true;
    }
    keys[e.code] = true;
    e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    justReleased[e.code] = true;
    e.preventDefault();
});

// ── Mobile Touch Controls ──

const ALL_DIRS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

function initTouchControls() {
    const dpad = document.getElementById('dpad');
    const actionBtns = document.querySelectorAll('[data-key]');
    if (!dpad && actionBtns.length === 0) return;

    // ── D-Pad: track touches by identifier, resolve which dirs are active ──
    const dpadTouches = new Map(); // touchId -> Set of dir keys

    function getDirsAtPoint(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el || !el.dataset.dirs) return null;
        return el.dataset.dirs.split(',');
    }

    function applyDpadState() {
        // Collect all active dirs from all touches
        const activeDirs = new Set();
        for (const dirs of dpadTouches.values()) {
            for (const d of dirs) activeDirs.add(d);
        }
        // Press newly active, release newly inactive
        for (const dir of ALL_DIRS) {
            if (activeDirs.has(dir) && !keys[dir]) {
                keys[dir] = true;
                justPressed[dir] = true;
            } else if (!activeDirs.has(dir) && keys[dir]) {
                keys[dir] = false;
                justReleased[dir] = true;
            }
        }
        // Update visual pressed state on buttons
        for (const el of dpad.querySelectorAll('[data-dirs]')) {
            const elDirs = el.dataset.dirs.split(',');
            const isActive = elDirs.some(d => activeDirs.has(d));
            el.classList.toggle('pressed', isActive);
        }
    }

    dpad.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const dirs = getDirsAtPoint(touch.clientX, touch.clientY);
            dpadTouches.set(touch.identifier, dirs || []);
        }
        applyDpadState();
    }, { passive: false });

    dpad.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (dpadTouches.has(touch.identifier)) {
                const dirs = getDirsAtPoint(touch.clientX, touch.clientY);
                dpadTouches.set(touch.identifier, dirs || []);
            }
        }
        applyDpadState();
    }, { passive: false });

    dpad.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            dpadTouches.delete(touch.identifier);
        }
        applyDpadState();
    }, { passive: false });

    dpad.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            dpadTouches.delete(touch.identifier);
        }
        applyDpadState();
    }, { passive: false });

    // ── Action buttons (A, B, SELECT, START): simple per-button touch ──
    const btnTouches = new Map(); // touchId -> btn element

    for (const btn of actionBtns) {
        const keyCode = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                btnTouches.set(touch.identifier, btn);
            }
            if (!keys[keyCode]) {
                justPressed[keyCode] = true;
            }
            keys[keyCode] = true;
            btn.classList.add('pressed');
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                btnTouches.delete(touch.identifier);
            }
            let stillTouched = false;
            for (const [, b] of btnTouches) {
                if (b === btn) { stillTouched = true; break; }
            }
            if (!stillTouched) {
                keys[keyCode] = false;
                justReleased[keyCode] = true;
                btn.classList.remove('pressed');
            }
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                btnTouches.delete(touch.identifier);
            }
            keys[keyCode] = false;
            justReleased[keyCode] = true;
            btn.classList.remove('pressed');
        }, { passive: false });
    }
}

// Initialize touch controls once DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTouchControls);
} else {
    initTouchControls();
}

export const input = {
    isDown(code) {
        return !!keys[code];
    },

    isPressed(code) {
        return !!justPressed[code];
    },

    isReleased(code) {
        return !!justReleased[code];
    },

    // Directional helpers
    get up() { return this.isDown('ArrowUp') || this.isDown('KeyW'); },
    get down() { return this.isDown('ArrowDown') || this.isDown('KeyS'); },
    get left() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); },
    get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
    get action() { return this.isPressed('KeyZ') || this.isPressed('Space'); },
    get cancel() { return this.isPressed('KeyX'); },
    get inventory() { return this.isPressed('KeyI') || this.isPressed('KeyE'); },
    get start() { return this.isPressed('Enter'); },

    // Pressed versions for menus
    get upPressed() { return this.isPressed('ArrowUp') || this.isPressed('KeyW'); },
    get downPressed() { return this.isPressed('ArrowDown') || this.isPressed('KeyS'); },
    get leftPressed() { return this.isPressed('ArrowLeft') || this.isPressed('KeyA'); },
    get rightPressed() { return this.isPressed('ArrowRight') || this.isPressed('KeyD'); },

    clear() {
        for (const key in justPressed) delete justPressed[key];
        for (const key in justReleased) delete justReleased[key];
    }
};
