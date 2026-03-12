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

function initTouchControls() {
    const buttons = document.querySelectorAll('[data-key]');
    if (buttons.length === 0) return;

    // Track active touches per button to handle multi-touch correctly
    const activeTouches = new Map();

    for (const btn of buttons) {
        const keyCode = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                activeTouches.set(touch.identifier, btn);
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
                activeTouches.delete(touch.identifier);
            }
            // Only release if no other touches on this button
            let stillTouched = false;
            for (const [, b] of activeTouches) {
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
                activeTouches.delete(touch.identifier);
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
