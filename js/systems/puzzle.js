import { TILE_SIZE, T } from '../data/tileTypes.js';
import { pushBlockStartPositions, pressurePlatePositions } from '../world/townMap.js';
import { drawPushBlock } from '../rendering/sprites.js';
import { collidesWithMap } from '../engine/collision.js';

export const puzzle = {
    blocks: [],
    plates: pressurePlatePositions,
    solved: false,

    init() {
        this.solved = false;
        this.blocks = pushBlockStartPositions.map(pos => ({
            tileX: pos.tileX,
            tileY: pos.tileY,
            x: pos.tileX * TILE_SIZE,
            y: pos.tileY * TILE_SIZE,
            startTileX: pos.tileX,
            startTileY: pos.tileY,
            moving: false,
            moveProgress: 0,
            targetX: 0,
            targetY: 0,
        }));
    },

    reset() {
        for (const block of this.blocks) {
            block.tileX = block.startTileX;
            block.tileY = block.startTileY;
            block.x = block.tileX * TILE_SIZE;
            block.y = block.tileY * TILE_SIZE;
            block.moving = false;
        }
    },

    tryPush(playerX, playerY, facing, map) {
        if (this.solved) return false;

        const checkX = playerX;
        const checkY = playerY;
        let dx = 0, dy = 0;
        switch (facing) {
            case 'up':    dy = -1; break;
            case 'down':  dy = 1; break;
            case 'left':  dx = -1; break;
            case 'right': dx = 1; break;
        }

        // Find block adjacent to player in facing direction
        const playerTileX = Math.floor(checkX / TILE_SIZE);
        const playerTileY = Math.floor(checkY / TILE_SIZE);
        const targetTileX = playerTileX + dx;
        const targetTileY = playerTileY + dy;

        for (const block of this.blocks) {
            if (block.moving) continue;
            if (block.tileX === targetTileX && block.tileY === targetTileY) {
                // Can the block move to the next tile?
                const nextTileX = block.tileX + dx;
                const nextTileY = block.tileY + dy;

                // Check map bounds and solidity
                if (nextTileY < 0 || nextTileY >= map.length || nextTileX < 0 || nextTileX >= map[0].length) {
                    return false;
                }

                const nextTileId = map[nextTileY][nextTileX];
                const { tileProps } = getTilePropsRef();
                if (tileProps[nextTileId]?.solid) return false;

                // Check if another block is there
                const occupied = this.blocks.some(b => b !== block && b.tileX === nextTileX && b.tileY === nextTileY);
                if (occupied) return false;

                // Push the block
                block.tileX = nextTileX;
                block.tileY = nextTileY;
                block.moving = true;
                block.moveProgress = 0;
                block.startMoveX = block.x;
                block.startMoveY = block.y;
                block.targetX = nextTileX * TILE_SIZE;
                block.targetY = nextTileY * TILE_SIZE;
                return true;
            }
        }
        return false;
    },

    update() {
        for (const block of this.blocks) {
            if (block.moving) {
                block.moveProgress += 0.1;
                if (block.moveProgress >= 1) {
                    block.moveProgress = 1;
                    block.moving = false;
                    block.x = block.targetX;
                    block.y = block.targetY;
                } else {
                    block.x = block.startMoveX + (block.targetX - block.startMoveX) * block.moveProgress;
                    block.y = block.startMoveY + (block.targetY - block.startMoveY) * block.moveProgress;
                }
            }
        }

        // Check if all plates are covered
        if (!this.solved) {
            const allCovered = this.plates.every(plate => {
                return this.blocks.some(block =>
                    !block.moving && block.tileX === plate.tileX && block.tileY === plate.tileY
                );
            });
            if (allCovered) {
                this.solved = true;
                return true; // Signal puzzle just solved
            }
        }
        return false;
    },

    getSolidEntities() {
        return this.blocks.map(block => ({
            x: block.x + 2,
            y: block.y + 2,
            w: TILE_SIZE - 4,
            h: TILE_SIZE - 4,
            solid: true,
        }));
    },

    render(ctx) {
        for (const block of this.blocks) {
            drawPushBlock(ctx, Math.floor(block.x), Math.floor(block.y));
        }
    }
};

import { tileProps } from '../data/tileTypes.js';
function getTilePropsRef() {
    return { tileProps };
}
