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
