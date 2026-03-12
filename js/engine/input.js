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
    // ── D-Pad: handle at container level for multi-touch diagonal support ──
    const dpad = document.getElementById('dpad');
    if (dpad) initDpadTouch(dpad);

    // ── Action buttons (A, B, SELECT, START): per-button touch ──
    const actionBtns = document.querySelectorAll('[data-key]');
    if (actionBtns.length > 0) initActionButtonTouch(actionBtns);
}

function initDpadTouch(dpad) {
    // Each touch tracks which direction(s) it's pressing
    const dpadTouches = new Map(); // touchId -> dir key or null

    function getDirAtPoint(x, y) {
        const el = document.elementFromPoint(x, y);
        return el?.dataset?.dir || null;
    }

    function applyDpadState() {
        // Collect all active dirs from all current touches
        const activeDirs = new Set();
        for (const dir of dpadTouches.values()) {
            if (dir) activeDirs.add(dir);
        }
        // Update key state for each direction
        for (const dir of ALL_DIRS) {
            if (activeDirs.has(dir) && !keys[dir]) {
                keys[dir] = true;
                justPressed[dir] = true;
            } else if (!activeDirs.has(dir) && keys[dir]) {
                keys[dir] = false;
                justReleased[dir] = true;
            }
        }
        // Update visual pressed state
        for (const btn of dpad.querySelectorAll('[data-dir]')) {
            btn.classList.toggle('pressed', activeDirs.has(btn.dataset.dir));
        }
    }

    function onTouchStartMove(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const dir = getDirAtPoint(touch.clientX, touch.clientY);
            dpadTouches.set(touch.identifier, dir);
        }
        applyDpadState();
    }

    function onTouchEndCancel(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            dpadTouches.delete(touch.identifier);
        }
        applyDpadState();
    }

    dpad.addEventListener('touchstart', onTouchStartMove, { passive: false });
    dpad.addEventListener('touchmove', onTouchStartMove, { passive: false });
    dpad.addEventListener('touchend', onTouchEndCancel, { passive: false });
    dpad.addEventListener('touchcancel', onTouchEndCancel, { passive: false });
}

function initActionButtonTouch(buttons) {
    const btnTouches = new Map();

    for (const btn of buttons) {
        const keyCode = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                btnTouches.set(touch.identifier, btn);
            }
            if (!keys[keyCode]) justPressed[keyCode] = true;
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
