export const VIRTUAL_WIDTH = 256;
export const VIRTUAL_HEIGHT = 224;

let canvas, ctx;
let scale = 1;

export function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    resize();
    window.addEventListener('resize', resize);

    return ctx;
}

function resize() {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    // Find the largest integer scale that fits
    scale = Math.max(1, Math.floor(Math.min(
        windowW / VIRTUAL_WIDTH,
        windowH / VIRTUAL_HEIGHT
    )));

    canvas.width = VIRTUAL_WIDTH * scale;
    canvas.height = VIRTUAL_HEIGHT * scale;

    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

export function clearScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
}

export function getCtx() {
    return ctx;
}

export function getScale() {
    return scale;
}
