import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './renderer.js';
import { drawSmallText } from '../main.js';

const CHARS_PER_TICK = 1;
const TICKS_PER_CHAR = 2;

export const dialogue = {
    active: false,
    speakerName: '',
    lines: [],
    currentLine: 0,
    charIndex: 0,
    charTimer: 0,
    fullLineShown: false,

    start(name, lines) {
        this.active = true;
        this.speakerName = name;
        this.lines = Array.isArray(lines) ? lines : [lines];
        this.currentLine = 0;
        this.charIndex = 0;
        this.charTimer = 0;
        this.fullLineShown = false;
    },

    advance() {
        if (!this.active) return false;

        if (!this.fullLineShown) {
            // Show full line instantly
            this.charIndex = this.lines[this.currentLine].length;
            this.fullLineShown = true;
            return true;
        }

        // Next line
        this.currentLine++;
        if (this.currentLine >= this.lines.length) {
            this.active = false;
            return false; // Dialogue ended
        }

        this.charIndex = 0;
        this.charTimer = 0;
        this.fullLineShown = false;
        return true;
    },

    update() {
        if (!this.active || this.fullLineShown) return;

        this.charTimer++;
        if (this.charTimer >= TICKS_PER_CHAR) {
            this.charTimer = 0;
            this.charIndex += CHARS_PER_TICK;
            if (this.charIndex >= this.lines[this.currentLine].length) {
                this.charIndex = this.lines[this.currentLine].length;
                this.fullLineShown = true;
            }
        }
    },

    render(ctx) {
        if (!this.active) return;

        const boxH = 48;
        const boxY = VIRTUAL_HEIGHT - boxH - 4;
        const boxX = 4;
        const boxW = VIRTUAL_WIDTH - 8;

        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Border
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Speaker name tag
        if (this.speakerName) {
            const nameW = this.speakerName.length * 6 + 8;
            ctx.fillStyle = '#333';
            ctx.fillRect(boxX + 4, boxY - 8, nameW, 10);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(boxX + 4, boxY - 8, nameW, 10);
            ctx.fillStyle = '#FFCC00';
            drawSmallText(ctx, this.speakerName, boxX + 8, boxY - 6);
        }

        // Dialogue text (typewriter)
        const line = this.lines[this.currentLine];
        const visibleText = line.substring(0, this.charIndex);

        // Word wrap at ~38 chars per line
        const maxChars = 38;
        const wrappedLines = wordWrap(visibleText, maxChars);

        ctx.fillStyle = '#FFF';
        for (let i = 0; i < wrappedLines.length && i < 3; i++) {
            drawSmallText(ctx, wrappedLines[i], boxX + 8, boxY + 8 + i * 10);
        }

        // Continue indicator
        if (this.fullLineShown) {
            const blink = Math.floor(Date.now() / 300) % 2 === 0;
            if (blink) {
                ctx.fillStyle = '#FFF';
                ctx.fillRect(boxX + boxW - 12, boxY + boxH - 10, 4, 4);
                ctx.fillRect(boxX + boxW - 11, boxY + boxH - 8, 2, 2);
            }
        }
    }
};

function wordWrap(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 > maxChars && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}
