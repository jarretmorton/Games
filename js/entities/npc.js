import { drawNPC } from '../rendering/sprites.js';
import { TILE_SIZE } from '../data/tileTypes.js';

export class NPC {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.x = data.tileX * TILE_SIZE + TILE_SIZE / 2;
        this.y = data.tileY * TILE_SIZE + TILE_SIZE / 2;
        this.facing = data.facing || 'down';
        this.palette = data.palette;
        this.dialogue = data.dialogue;
        this.dialogueIndex = 0;
        this.animFrame = 0;
        this.animTimer = 0;

        // Collision box for blocking player movement
        this.solid = true;
        this.w = 14;
        this.h = 12;
    }

    // Bounding box position (for collision with player)
    get collX() { return this.x - this.w / 2; }
    get collY() { return this.y - this.h / 2 + 4; }

    update() {
        // Idle breathing animation
        this.animTimer++;
        if (this.animTimer >= 40) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    getNextDialogue() {
        const line = this.dialogue[this.dialogueIndex];
        this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogue.length;
        return line;
    }

    render(ctx) {
        drawNPC(ctx, this.x, this.y, this.facing, this.animFrame, this.palette);
    }
}

export function createNPCs(npcDataList) {
    return npcDataList.map(data => new NPC(data));
}
