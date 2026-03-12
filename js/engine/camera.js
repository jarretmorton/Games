import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../rendering/renderer.js';
import { TILE_SIZE } from '../data/tileTypes.js';

export const camera = {
    x: 0,
    y: 0,
    shakeTimer: 0,
    shakeIntensity: 0,

    follow(targetX, targetY, mapWidth, mapHeight) {
        // Target: center the camera on the target
        const targetCamX = targetX - VIRTUAL_WIDTH / 2;
        const targetCamY = targetY - VIRTUAL_HEIGHT / 2;

        // Smooth interpolation
        this.x += (targetCamX - this.x) * 0.1;
        this.y += (targetCamY - this.y) * 0.1;

        // Clamp to map bounds
        const maxX = mapWidth * TILE_SIZE - VIRTUAL_WIDTH;
        const maxY = mapHeight * TILE_SIZE - VIRTUAL_HEIGHT;
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    },

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    },

    update() {
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
        }
    },

    getDrawX() {
        let x = Math.round(this.x);
        if (this.shakeTimer > 0) {
            x += Math.round((Math.random() - 0.5) * this.shakeIntensity * 2);
        }
        return x;
    },

    getDrawY() {
        let y = Math.round(this.y);
        if (this.shakeTimer > 0) {
            y += Math.round((Math.random() - 0.5) * this.shakeIntensity * 2);
        }
        return y;
    }
};
