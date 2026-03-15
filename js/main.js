import { initRenderer, clearScreen, getCtx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './rendering/renderer.js';
import { input } from './engine/input.js';
import { gameState, States } from './state/gameState.js';
import { camera } from './engine/camera.js';
import { renderMap, updateTileAnimations } from './world/tilemap.js';
import { townMap, SPAWN_X, SPAWN_Y, breakablePositions } from './world/townMap.js';
import { dungeonMap, DUNGEON_SPAWN_X, DUNGEON_SPAWN_Y, ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y } from './world/dungeonMap.js';
import { shopMap, SHOP_SPAWN_X, SHOP_SPAWN_Y, SHOPKEEPER_X, SHOPKEEPER_Y, SKELETON_X, SKELETON_Y, CRAFTING_TABLE_COL, CRAFTING_TABLE_ROW } from './world/shopMap.js';
import { player } from './entities/player.js';
import { characters } from './data/characters.js';
import { drawCharacter, drawItem, drawArrow, drawTrappedSkeleton, drawSkeleton } from './rendering/sprites.js';
import { createNPCs } from './entities/npc.js';
import { npcData, shopkeeperData } from './data/npcs.js';
import { dialogue } from './rendering/dialogue.js';
import { createBreakables } from './entities/breakable.js';
import { renderHUD } from './rendering/hud.js';
import { inventory } from './systems/inventory.js';
import { shop } from './systems/shop.js';
import { puzzle } from './systems/puzzle.js';
import { checkAttackHits, applyKnockback } from './systems/combat.js';
import { Enemy } from './entities/enemy.js';
import { TILE_SIZE, tileProps, T } from './data/tileTypes.js';
import { aabbOverlap } from './engine/collision.js';
import { itemDefs } from './data/items.js';
import { music } from './audio/music.js';

export const VERSION = '0.7.1';

const TICK_RATE = 1000 / 60;
let lastTime = 0;
let accumulator = 0;
let ctx;

let titleTimer = 0;
let selectedChar = 0;

// Game entities
let npcs = [];
let breakables = [];
let drops = [];
let enemies = [];
let arrows = [];
let invSelectedIndex = 0;

// State flags
let inDungeon = false;
let inShop = false;
let puzzleSolvedAnimation = 0;
let dungeonCleared = false;

// Shop interior state
let shopNpcs = [];
let shopEnemies = [];
let shopSkeletonFreed = false;
let shopSkeletonDefeated = false;
let shopSkeletonAnimFrame = 0;
let shopSkeletonAnimTimer = 0;

// Save point for respawning after death
let savePoint = { x: SPAWN_X, y: SPAWN_Y, inDungeon: false, inShop: false };

// Death screen
let deathTimer = 0;
const DEATH_SCREEN_DURATION = 120; // 2 seconds at 60fps

// Transition effect
let transition = { active: false, timer: 0, maxTime: 30, callback: null };

function init() {
    ctx = initRenderer();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    npcs = createNPCs(npcData);
    breakables = createBreakables(breakablePositions);
    drops = [];
    enemies = [];
    arrows = [];
    inventory.reset();
    puzzle.init();
    inDungeon = false;
    inShop = false;
    dungeonCleared = false;
    puzzleSolvedAnimation = 0;
    shopNpcs = createNPCs([shopkeeperData]);
    shopEnemies = [];
    shopSkeletonFreed = false;
    shopSkeletonDefeated = false;

    // Hook up weapon purchase callback to free the skeleton
    shop.onWeaponPurchased = () => {
        if (!shopSkeletonFreed && !shopSkeletonDefeated) {
            shopSkeletonFreed = true;
        }
    };
}

function gameLoop(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += delta;

    while (accumulator >= TICK_RATE) {
        update();
        input.clear();
        accumulator -= TICK_RATE;
    }

    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    titleTimer++;

    // Handle screen transitions
    if (transition.active) {
        transition.timer++;
        if (transition.timer >= transition.maxTime) {
            transition.active = false;
            if (transition.callback) transition.callback();
        }
        return;
    }

    switch (gameState.current) {
        case States.TITLE:
            if (input.start || input.action) {
                music.unlock();
                gameState.change(States.CHARACTER_SELECT);
            }
            break;

        case States.CHARACTER_SELECT:
            if (input.leftPressed) selectedChar = (selectedChar - 1 + characters.length) % characters.length;
            if (input.rightPressed) selectedChar = (selectedChar + 1) % characters.length;
            if (input.start || input.action) {
                const chosen = characters[selectedChar];
                player.init(SPAWN_X, SPAWN_Y, chosen.palette);
                player.characterId = chosen.id;
                startGame();
                music.play('overworld');
                gameState.change(States.PLAYING);
            }
            break;

        case States.PLAYING:
            if (inDungeon) updateDungeon();
            else if (inShop) updateShopInterior();
            else updatePlaying();
            break;

        case States.DIALOGUE:
            dialogue.update();
            if (input.action) {
                if (!dialogue.advance()) gameState.change(States.PLAYING);
            }
            break;

        case States.INVENTORY:
            updateInventory();
            break;

        case States.SHOP:
            updateShop();
            break;

        case States.DEAD:
            deathTimer++;
            if (deathTimer >= DEATH_SCREEN_DURATION && (input.action || input.start)) {
                respawnPlayer();
            }
            break;
    }
}

function updatePlaying() {
    updateTileAnimations();

    // Build solid entity list
    const solidEntities = [];
    for (const npc of npcs) {
        solidEntities.push({ x: npc.collX, y: npc.collY, w: npc.w, h: npc.h, solid: true });
    }
    for (const b of breakables) {
        if (b.active && b.solid) {
            solidEntities.push({ x: b.x + 4, y: b.y + 4, w: b.w - 8, h: b.h - 8, solid: true });
        }
    }
    // Add puzzle blocks as solid
    for (const ent of puzzle.getSolidEntities()) {
        solidEntities.push(ent);
    }

    player.update(townMap, solidEntities);
    for (const npc of npcs) npc.update();
    for (const b of breakables) b.update();

    // Puzzle update
    const justSolved = puzzle.update();
    if (justSolved && puzzleSolvedAnimation === 0) {
        puzzleSolvedAnimation = 1;
        camera.shake(3, 30);
        openDungeonEntrance();
        dialogue.start('', ['The ground rumbles... The dungeon entrance has opened!']);
        gameState.change(States.DIALOGUE);
    }

    // Drops update
    updateDrops();

    // Arrow projectile update
    updateArrows(townMap);

    // Check if bow just released an arrow
    if (player.bowReleased) {
        player.bowReleased = false;
        spawnArrow();
    }

    camera.follow(player.x, player.y, townMap[0].length, townMap.length);
    camera.update();

    // Secondary action (B/ALT) - shield block
    if (input.secondary && !player.blocking) {
        player.startBlock();
    }

    // Action button
    if (input.action) {
        // First check if near an NPC or interactable (takes priority)
        const nearInteract = checkNearInteract();

        if (nearInteract) {
            tryInteract();
        } else {
            // Try pushing a block first (works with or without weapon)
            const pushed = puzzle.tryPush(player.x, player.y, player.facing, townMap);
            if (!pushed) {
                if (player.attack()) {
                    const hitbox = player.getAttackHitbox();
                    if (hitbox) {
                        // Hit breakables
                        for (const b of breakables) {
                            if (b.active && !b.destroying) {
                                if (aabbOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                                               b.x + 4, b.y + 4, b.w - 8, b.h - 8)) {
                                    const drop = b.hit();
                                    if (drop) spawnDrop(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, drop);
                                }
                            }
                        }
                        // Hit enemies (weapon only)
                        if (player.equippedItem && player.equippedItem.type === 'weapon') {
                            const hits = checkAttackHits(hitbox, enemies);
                            for (const enemy of hits) {
                                enemy.takeDamage(player.equippedItem.damage, player.x, player.y);
                            }
                        }
                    }
                } else {
                    tryInteract();
                }
            }
        }
    }

    // Check dungeon entrance
    if (puzzle.solved) {
        const dungeonCol = 5, dungeonRow = 24;
        const playerCol = Math.floor(player.x / TILE_SIZE);
        const playerRow = Math.floor(player.y / TILE_SIZE);
        if (playerCol === dungeonCol && playerRow === dungeonRow) {
            enterDungeon();
        }
    }

    if (input.inventory) {
        invSelectedIndex = 0;
        gameState.change(States.INVENTORY);
    }
}

function updateDungeon() {
    updateTileAnimations();

    const solidEntities = [];
    player.update(dungeonMap, solidEntities);

    // Enemy update and combat
    for (const enemy of enemies) {
        if (!enemy.active) continue;
        enemy.update(player.x, player.y, dungeonMap);

        // Enemy damages player
        if (enemy.canDamagePlayer(player.x, player.y)) {
            const blocked = player.takeDamage(enemy.damage);
            if (blocked) {
                // Shield blocked the attack - bounce enemy back hard
                applyKnockback(enemy, player.x, player.y, 8, 10);
                enemy.hurtTimer = 10;
                enemy.state = 'hurt';
                camera.shake(2, 8);
            }
        }
    }

    // Check if player died
    if (checkPlayerDeath()) return;

    // Secondary action (B/ALT) - shield block
    if (input.secondary && !player.blocking) {
        player.startBlock();
    }

    // Player attacks enemy
    if (input.action && player.equippedItem && player.equippedItem.type === 'weapon') {
        if (player.attack()) {
            const hitbox = player.getAttackHitbox();
            if (hitbox) {
                const hits = checkAttackHits(hitbox, enemies);
                for (const enemy of hits) {
                    enemy.takeDamage(player.equippedItem.damage, player.x, player.y);
                    if (enemy.hp <= 0 && !dungeonCleared) {
                        dungeonCleared = true;
                        // Drop rewards after death animation
                        setTimeout(() => {
                            player.emeralds += 10;
                            inventory.add(itemDefs.diamond);
                            player.hasDiamond = true;
                            dialogue.start('', ['The zombie has been defeated!', 'You found a Diamond and 10 emeralds!']);
                            gameState.change(States.DIALOGUE);
                        }, 400);
                    }
                }
            }
        }
    }

    // Arrow projectile update
    updateArrows(dungeonMap);

    // Check if bow just released an arrow
    if (player.bowReleased) {
        player.bowReleased = false;
        spawnArrow();
    }

    updateDrops();

    camera.follow(player.x, player.y, dungeonMap[0].length, dungeonMap.length);
    camera.update();

    // Exit dungeon
    const playerRow = Math.floor(player.y / TILE_SIZE);
    if (playerRow >= dungeonMap.length - 1) {
        exitDungeon();
    }

    if (input.inventory) {
        invSelectedIndex = 0;
        gameState.change(States.INVENTORY);
    }
}

function enterDungeon() {
    // Save position at dungeon entrance
    savePoint = { x: DUNGEON_SPAWN_X, y: DUNGEON_SPAWN_Y, inDungeon: true, inShop: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inDungeon = true;
        inShop = false;
        player.x = DUNGEON_SPAWN_X;
        player.y = DUNGEON_SPAWN_Y;
        camera.x = 0;
        camera.y = 0;
        if (!dungeonCleared) {
            enemies = [new Enemy(ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y, 'zombie')];
        } else {
            enemies = [];
        }
        music.play('dungeon');
    };
}

function exitDungeon() {
    const exitX = 5 * TILE_SIZE + TILE_SIZE / 2;
    const exitY = 25 * TILE_SIZE + TILE_SIZE / 2;
    // Save position at dungeon exit
    savePoint = { x: exitX, y: exitY, inDungeon: false, inShop: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inDungeon = false;
        inShop = false;
        player.x = exitX;
        player.y = exitY;
        music.play('overworld');
    };
}

function enterShop() {
    // Save position outside the shop
    savePoint = { x: player.x, y: player.y, inDungeon: false, inShop: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inShop = true;
        inDungeon = false;
        player.x = SHOP_SPAWN_X;
        player.y = SHOP_SPAWN_Y;
        camera.x = 0;
        camera.y = 0;
        // Spawn skeleton enemy if freed and not defeated
        if (shopSkeletonFreed && !shopSkeletonDefeated) {
            shopEnemies = [new Enemy(SKELETON_X, SKELETON_Y, 'skeleton')];
            shopEnemies[0].hp = 4;
            shopEnemies[0].maxHp = 4;
            shopEnemies[0].speed = 0.7;
        } else {
            shopEnemies = [];
        }
        music.play('shop');
    };
}

function exitShop() {
    const exitX = 8 * TILE_SIZE + TILE_SIZE / 2;
    const exitY = 18 * TILE_SIZE + TILE_SIZE / 2;
    savePoint = { x: exitX, y: exitY, inDungeon: false, inShop: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inShop = false;
        player.x = exitX;
        player.y = exitY;
        music.play('overworld');
    };
}

function updateShopInterior() {
    updateTileAnimations();

    // Animate trapped skeleton
    shopSkeletonAnimTimer++;
    if (shopSkeletonAnimTimer >= 30) {
        shopSkeletonAnimTimer = 0;
        shopSkeletonAnimFrame = (shopSkeletonAnimFrame + 1) % 2;
    }

    const solidEntities = [];
    for (const npc of shopNpcs) {
        solidEntities.push({ x: npc.collX, y: npc.collY, w: npc.w, h: npc.h, solid: true });
    }

    player.update(shopMap, solidEntities);

    for (const npc of shopNpcs) npc.update();

    // Enemy update and combat (skeleton)
    for (const enemy of shopEnemies) {
        if (!enemy.active) continue;
        enemy.update(player.x, player.y, shopMap);

        // Enemy damages player
        if (enemy.canDamagePlayer(player.x, player.y)) {
            const blocked = player.takeDamage(enemy.damage);
            if (blocked) {
                applyKnockback(enemy, player.x, player.y, 8, 10);
                enemy.hurtTimer = 10;
                enemy.state = 'hurt';
                camera.shake(2, 8);
            }
        }
    }

    // Check if player died
    if (checkPlayerDeath()) return;

    // Secondary action - shield block
    if (input.secondary && !player.blocking) {
        player.startBlock();
    }

    // Player attacks enemy
    if (input.action) {
        // First check if near NPC or interactable
        const nearInteract = checkNearShopInteract();

        if (nearInteract) {
            tryShopInteract();
        } else if (player.equippedItem && player.equippedItem.type === 'weapon') {
            if (player.attack()) {
                const hitbox = player.getAttackHitbox();
                if (hitbox) {
                    const hits = checkAttackHits(hitbox, shopEnemies);
                    for (const enemy of hits) {
                        enemy.takeDamage(player.equippedItem.damage, player.x, player.y);
                        if (enemy.hp <= 0 && !shopSkeletonDefeated) {
                            shopSkeletonDefeated = true;
                            setTimeout(() => {
                                player.emeralds += 5;
                                dialogue.start('', ['The skeleton has been defeated!', 'You found 5 emeralds!']);
                                gameState.change(States.DIALOGUE);
                            }, 400);
                        }
                    }
                }
            }
        } else {
            // Try to attack without weapon (or try interact)
            if (!player.attack()) {
                tryShopInteract();
            }
        }
    }

    // Arrow projectile update
    updateArrows(shopMap);

    // Check if bow just released an arrow
    if (player.bowReleased) {
        player.bowReleased = false;
        spawnArrow();
    }

    // Arrow hits skeleton
    for (const arrow of arrows) {
        if (!arrow.active) continue;
        for (const enemy of shopEnemies) {
            if (!enemy.active || enemy.state === 'dead') continue;
            const ex = enemy.x - enemy.w / 2;
            const ey = enemy.y - enemy.h / 2;
            if (aabbOverlap(arrow.x - 3, arrow.y - 3, 6, 6, ex, ey, enemy.w, enemy.h)) {
                enemy.takeDamage(arrow.damage, arrow.x, arrow.y);
                arrow.active = false;
                if (enemy.hp <= 0 && !shopSkeletonDefeated) {
                    shopSkeletonDefeated = true;
                    setTimeout(() => {
                        player.emeralds += 5;
                        dialogue.start('', ['The skeleton has been defeated!', 'You found 5 emeralds!']);
                        gameState.change(States.DIALOGUE);
                    }, 400);
                }
                break;
            }
        }
    }

    updateDrops();

    camera.follow(player.x, player.y, shopMap[0].length, shopMap.length);
    camera.update();

    // Exit shop - walk south through the door
    const playerRow = Math.floor(player.y / TILE_SIZE);
    if (playerRow >= shopMap.length - 1) {
        exitShop();
    }

    if (input.inventory) {
        invSelectedIndex = 0;
        gameState.change(States.INVENTORY);
    }
}

function checkNearShopInteract() {
    const point = player.getInteractPoint();
    for (const npc of shopNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) return true;
    }
    // Check interactable tiles in the shop
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < shopMap.length && col >= 0 && col < shopMap[0].length) {
        const props = tileProps[shopMap[row][col]];
        if (props?.interact) return true;
    }
    return false;
}

function tryShopInteract() {
    const point = player.getInteractPoint();
    for (const npc of shopNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) {
            if (npc.id === 'shopkeeper') {
                // Open the buy menu
                shop.open();
                gameState.change(States.SHOP);
            } else {
                dialogue.start(npc.name, [npc.getNextDialogue()]);
                gameState.change(States.DIALOGUE);
            }
            return;
        }
    }
    // Check tile interactions in the shop
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < shopMap.length && col >= 0 && col < shopMap[0].length) {
        const tileId = shopMap[row][col];
        const props = tileProps[tileId];
        if (props?.interact === 'crafting_table') {
            dialogue.start('Crafting Table', ['The grid hums with ancient energy...', 'Three across, three down. What could be combined here?']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'shop_shelf') {
            dialogue.start('Shopkeeper', ["Hey! Don't touch the merchandise!", "Those aren't for sale... yet."]);
            gameState.change(States.DIALOGUE);
        }
    }
}

function checkPlayerDeath() {
    if (player.health <= 0) {
        deathTimer = 0;
        music.stop();
        gameState.change(States.DEAD);
        return true;
    }
    return false;
}

function respawnPlayer() {
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        player.health = player.maxHealth;
        player.state = 'idle';
        player.hurtTimer = 0;
        player.invincibleTimer = 60;
        player.x = savePoint.x;
        player.y = savePoint.y;
        inDungeon = savePoint.inDungeon || false;
        inShop = savePoint.inShop || false;
        if (inDungeon && !dungeonCleared) {
            enemies = [new Enemy(ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y, 'zombie')];
        } else if (inDungeon) {
            enemies = [];
        }
        if (inShop && shopSkeletonFreed && !shopSkeletonDefeated) {
            shopEnemies = [new Enemy(SKELETON_X, SKELETON_Y, 'skeleton')];
            shopEnemies[0].hp = 4;
            shopEnemies[0].maxHp = 4;
            shopEnemies[0].speed = 0.7;
        } else if (inShop) {
            shopEnemies = [];
        }
        music.play(inDungeon ? 'dungeon' : (inShop ? 'shop' : 'overworld'));
        gameState.change(States.PLAYING);
    };
}

function openDungeonEntrance() {
    // Change the blocked tiles to open entrance
    townMap[23][4] = T.STONE_FLOOR;
    townMap[23][5] = T.STONE_FLOOR;
    townMap[23][6] = T.STONE_FLOOR;
    townMap[24][4] = T.STONE_FLOOR;
    townMap[24][5] = T.DUNGEON_ENTRANCE;
    townMap[24][6] = T.STONE_FLOOR;
    townMap[25][4] = T.STONE_FLOOR;
    townMap[25][5] = T.STONE_FLOOR;
    townMap[25][6] = T.STONE_FLOOR;
}

function updateDrops() {
    for (const drop of drops) {
        drop.timer++;
        drop.y += drop.vy;
        if (drop.vx) {
            drop.x += drop.vx;
            drop.vx *= 0.95; // friction
        }
        drop.vy += 0.1;
        if (drop.type === 'golden_blueberry') {
            // Stop when blueberry lands back on grass after jumping
            if (drop.vy > 0 && drop.y >= drop.groundY) {
                const col = Math.floor(drop.x / TILE_SIZE);
                const row = Math.floor(drop.y / TILE_SIZE);
                if (row >= 0 && row < townMap.length && col >= 0 && col < townMap[0].length) {
                    const tile = townMap[row][col];
                    if (tile === T.GRASS || tile === T.DARK_GRASS) {
                        drop.vy = 0;
                        drop.vx = 0;
                    }
                }
            }
            if (drop.vy > 2) drop.vy = 2;
        } else if (drop.vy > 0) {
            drop.vy = 0;
        }

        if (drop.timer > 10) {
            const dist = Math.abs(player.x - drop.x) + Math.abs(player.y - drop.y);
            if (dist < 20) {
                if (drop.type === 'emerald') player.emeralds += drop.amount;
                else if (drop.type === 'golden_blueberry') {
                    inventory.add(itemDefs.golden_blueberry);
                    player.hasBlueberry = true;
                    dialogue.start('', ['You found the Golden Enchanted Blueberry!']);
                    gameState.change(States.DIALOGUE);
                }
                drop.active = false;
            }
        }
    }
    drops = drops.filter(d => d.active);
}

function spawnArrow() {
    const speed = 3.5;
    let vx = 0, vy = 0;
    switch (player.facing) {
        case 'up':    vy = -speed; break;
        case 'down':  vy = speed; break;
        case 'left':  vx = -speed; break;
        case 'right': vx = speed; break;
    }
    arrows.push({
        x: player.x,
        y: player.y,
        vx,
        vy,
        facing: player.facing,
        damage: player.equippedItem ? player.equippedItem.damage : 1,
        active: true,
        life: 120, // max lifetime in frames
    });
}

function updateArrows(map) {
    for (const arrow of arrows) {
        if (!arrow.active) continue;

        arrow.x += arrow.vx;
        arrow.y += arrow.vy;
        arrow.life--;

        if (arrow.life <= 0) {
            arrow.active = false;
            continue;
        }

        // Check collision with map (solid tiles)
        const col = Math.floor(arrow.x / TILE_SIZE);
        const row = Math.floor(arrow.y / TILE_SIZE);
        if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
            arrow.active = false;
            continue;
        }
        const props = tileProps[map[row][col]];
        if (props && props.solid) {
            arrow.active = false;
            continue;
        }

        // Check collision with enemies
        for (const enemy of enemies) {
            if (!enemy.active || enemy.state === 'dead') continue;
            const ex = enemy.x - enemy.w / 2;
            const ey = enemy.y - enemy.h / 2;
            if (aabbOverlap(arrow.x - 3, arrow.y - 3, 6, 6, ex, ey, enemy.w, enemy.h)) {
                enemy.takeDamage(arrow.damage, arrow.x, arrow.y);
                arrow.active = false;

                // Check for dungeon clear
                if (enemy.hp <= 0 && !dungeonCleared && inDungeon) {
                    dungeonCleared = true;
                    setTimeout(() => {
                        player.emeralds += 10;
                        inventory.add(itemDefs.diamond);
                        player.hasDiamond = true;
                        dialogue.start('', ['The zombie has been defeated!', 'You found a Diamond and 10 emeralds!']);
                        gameState.change(States.DIALOGUE);
                    }, 400);
                }
                break;
            }
        }

        // Check collision with breakables
        for (const b of breakables) {
            if (!b.active || b.destroying) continue;
            if (aabbOverlap(arrow.x - 3, arrow.y - 3, 6, 6, b.x + 4, b.y + 4, b.w - 8, b.h - 8)) {
                const drop = b.hit();
                if (drop) spawnDrop(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, drop);
                arrow.active = false;
                break;
            }
        }
    }
    arrows = arrows.filter(a => a.active);
}

function spawnDrop(x, y, drop) {
    let dropX = x + (Math.random() - 0.5) * 16;
    let dropVx = 0;
    let dropVy = -2;
    if (drop.type === 'golden_blueberry') {
        dropVx = (Math.random() - 0.5) * 1.5;
        dropVy = -3;  // Jump upward out of the pot
    }
    drops.push({
        x: dropX,
        y: y - 8,
        vx: dropVx,
        vy: dropVy,
        groundY: y,
        type: drop.type,
        amount: drop.amount || 0,
        timer: 0,
        active: true,
    });
}

function checkNearInteract() {
    const point = player.getInteractPoint();
    // Check NPCs
    for (const npc of npcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) return true;
    }
    // Check interactable tiles
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < townMap.length && col >= 0 && col < townMap[0].length) {
        const props = tileProps[townMap[row][col]];
        if (props?.interact) return true;
    }
    return false;
}

function tryInteract() {
    const point = player.getInteractPoint();

    for (const npc of npcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) {
            dialogue.start(npc.name, [npc.getNextDialogue()]);
            gameState.change(States.DIALOGUE);
            return;
        }
    }

    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    const currentMap = inDungeon ? dungeonMap : townMap;
    if (row >= 0 && row < currentMap.length && col >= 0 && col < currentMap[0].length) {
        const tileId = currentMap[row][col];
        const props = tileProps[tileId];

        if (props?.interact === 'shop') {
            enterShop();
        } else if (props?.interact === 'tablet') {
            dialogue.start('Stone Tablet', ['Place the dark stones upon the marks of power.', 'The path below shall open.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'bookshelf') {
            dialogue.start('Book', ['The four pillars of obsidian hold the key...', 'Push them onto the glowing plates to unseal the mine.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'sign') {
            dialogue.start('Sign', ["Blacksmith's Shop - Finest weapons in Craftville!"]);
            gameState.change(States.DIALOGUE);
        }
    }
}

function updateInventory() {
    const items = inventory.items;
    if (items.length === 0) {
        if (input.inventory || input.cancel) gameState.change(States.PLAYING);
        return;
    }
    if (input.upPressed) invSelectedIndex = Math.max(0, invSelectedIndex - 1);
    if (input.downPressed) invSelectedIndex = Math.min(items.length - 1, invSelectedIndex + 1);
    if (input.action) {
        const item = items[invSelectedIndex];
        if (item && (item.type === 'weapon' || item.type === 'armor')) inventory.equip(item.id);
    }
    if (input.inventory || input.cancel) gameState.change(States.PLAYING);
}

function updateShop() {
    shop.update();
    if (input.upPressed) shop.moveSelection(-1);
    if (input.downPressed) shop.moveSelection(1);
    if (input.action) {
        shop.buy();
        // Check if skeleton was freed during this purchase
        if (shopSkeletonFreed && shopEnemies.length === 0 && !shopSkeletonDefeated) {
            // Close shop and trigger skeleton escape
            gameState.change(States.PLAYING);
            shopEnemies = [new Enemy(SKELETON_X, SKELETON_Y, 'skeleton')];
            shopEnemies[0].hp = 4;
            shopEnemies[0].maxHp = 4;
            shopEnemies[0].speed = 0.7;
            shopEnemies[0].damage = 1;
            dialogue.start('', ['The skeleton has broken free from its cage!']);
            gameState.change(States.DIALOGUE);
            return;
        }
    }
    if (input.cancel) gameState.change(States.PLAYING);
}

// ── RENDER ──

function render() {
    clearScreen();

    switch (gameState.current) {
        case States.TITLE: renderTitle(); break;
        case States.CHARACTER_SELECT: renderCharacterSelect(); break;
        case States.PLAYING:
        case States.DIALOGUE:
        case States.INVENTORY:
        case States.SHOP:
            if (inDungeon) renderDungeonScene();
            else if (inShop) renderShopScene();
            else renderTownScene();
            if (gameState.current === States.DIALOGUE) dialogue.render(ctx);
            if (gameState.current === States.INVENTORY) renderInventoryUI();
            if (gameState.current === States.SHOP) renderShopUI();
            break;
        case States.DEAD:
            renderDeathScreen();
            break;
    }

    // Transition overlay
    if (transition.active) {
        const progress = transition.timer / transition.maxTime;
        const alpha = progress < 0.5 ? progress * 2 : 2 - progress * 2;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }
}

function renderTitle() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) {
        const seed = i * 7919;
        const x = (seed * 13) % VIRTUAL_WIDTH;
        const y = (seed * 17) % (VIRTUAL_HEIGHT - 60);
        if (Math.sin(titleTimer * 0.05 + i) > 0.3) ctx.fillRect(x, y, 1, 1);
    }

    ctx.fillStyle = '#2d5a1e';
    ctx.fillRect(0, VIRTUAL_HEIGHT - 40, VIRTUAL_WIDTH, 40);
    ctx.fillStyle = '#5b8731';
    ctx.fillRect(0, VIRTUAL_HEIGHT - 40, VIRTUAL_WIDTH, 2);

    drawTitle(ctx, 50);
    ctx.fillStyle = '#aaa';
    drawSmallText(ctx, 'Zelda/Minecraft mashup by', VIRTUAL_WIDTH / 2 - 75, 88);
    drawSmallText(ctx, 'J, V, A... and also Claude', VIRTUAL_WIDTH / 2 - 78, 97);

    // Version number below subtitle
    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'v' + VERSION, VIRTUAL_WIDTH / 2 - 12, 108);

    if (Math.floor(titleTimer / 30) % 2 === 0) {
        ctx.fillStyle = '#fff';
        drawSmallText(ctx, 'Press ENTER to Start', VIRTUAL_WIDTH / 2 - 60, VIRTUAL_HEIGHT - 60);
    }
}

function renderCharacterSelect() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.fillStyle = '#fff';
    drawSmallText(ctx, 'Choose Your Character', VIRTUAL_WIDTH / 2 - 63, 20);

    const boxSize = 44, gap = 8;
    const totalWidth = characters.length * boxSize + (characters.length - 1) * gap;
    const startX = Math.floor(VIRTUAL_WIDTH / 2 - totalWidth / 2);

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const x = startX + i * (boxSize + gap);
        const y = 60;

        if (i === selectedChar) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(x - 2, y - 2, boxSize + 4, boxSize + 4);
        }
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, boxSize, boxSize);
        drawCharacter(ctx, x + boxSize / 2, y + boxSize / 2 + 6, 'down', 0, char.palette, 2);

        ctx.fillStyle = i === selectedChar ? '#ffcc00' : '#aaa';
        drawSmallText(ctx, char.name, x + boxSize / 2 - char.name.length * 3, y + boxSize + 6);
    }

    if (Math.floor(titleTimer / 30) % 2 === 0) {
        ctx.fillStyle = '#fff';
        drawSmallText(ctx, 'Press ENTER to Confirm', VIRTUAL_WIDTH / 2 - 66, VIRTUAL_HEIGHT - 30);
    }
}

function renderTownScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, townMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    // Collect entities for Y-sort
    const entities = [];
    for (const b of breakables) {
        if (b.active) entities.push({ y: b.y + TILE_SIZE, render: () => b.render(ctx) });
    }
    for (const npc of npcs) {
        entities.push({ y: npc.y, render: () => npc.render(ctx) });
    }
    entities.push({ y: player.y, render: () => player.render(ctx) });

    // Push blocks
    entities.push({ y: 999, render: () => puzzle.render(ctx) });

    // Drops
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    // Arrows
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    renderMap(ctx, townMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 2);

    ctx.restore();
    renderHUD(ctx, player);
}

function renderDungeonScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, dungeonMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    const entities = [];
    entities.push({ y: player.y, render: () => player.render(ctx) });
    for (const enemy of enemies) {
        if (enemy.active) entities.push({ y: enemy.y, render: () => enemy.render(ctx) });
    }
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    // Arrows
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    ctx.restore();
    renderHUD(ctx, player);

    // Dungeon label
    ctx.fillStyle = '#888';
    drawSmallText(ctx, 'The Mine', VIRTUAL_WIDTH / 2 - 24, 2);
}

function renderShopScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, shopMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    // Draw trapped skeleton in cage (if not freed and not defeated)
    if (!shopSkeletonFreed && !shopSkeletonDefeated) {
        drawTrappedSkeleton(ctx, SKELETON_X, SKELETON_Y, shopSkeletonAnimFrame);
    }

    // Collect entities for Y-sort
    const entities = [];
    for (const npc of shopNpcs) {
        entities.push({ y: npc.y, render: () => npc.render(ctx) });
    }
    entities.push({ y: player.y, render: () => player.render(ctx) });

    // Shop enemies (freed skeleton)
    for (const enemy of shopEnemies) {
        if (enemy.active) {
            entities.push({ y: enemy.y, render: () => {
                if (enemy.state === 'dead') {
                    const alpha = 1 - enemy.deathTimer / 20;
                    if (Math.floor(enemy.deathTimer / 2) % 2 === 0) {
                        drawSkeleton(ctx, enemy.x, enemy.y, enemy.animFrame, 2);
                    }
                } else if (enemy.hitFlashTimer > 0 && enemy.hitFlashTimer % 2 === 0) {
                    ctx.fillStyle = '#FFF';
                    ctx.fillRect(enemy.x - 8, enemy.y - 20, 16, 24);
                } else {
                    drawSkeleton(ctx, enemy.x, enemy.y, enemy.animFrame, 2);
                    // Health bar
                    if (enemy.hp < enemy.maxHp) {
                        const barW = 20;
                        const barH = 3;
                        const barX = enemy.x - barW / 2;
                        const barY = enemy.y - 24;
                        ctx.fillStyle = '#333';
                        ctx.fillRect(barX, barY, barW, barH);
                        ctx.fillStyle = '#CC2222';
                        ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);
                    }
                }
            }});
        }
    }

    // Drops
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    // Arrows
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    ctx.restore();
    renderHUD(ctx, player);

    // Shop label
    ctx.fillStyle = '#888';
    drawSmallText(ctx, "Blacksmith's Shop", VIRTUAL_WIDTH / 2 - 51, 2);
}

function renderDrop(ctx, drop) {
    if (drop.type === 'emerald') {
        ctx.fillStyle = '#2D8B46';
        ctx.fillRect(drop.x - 3, drop.y - 2, 6, 1);
        ctx.fillRect(drop.x - 4, drop.y - 1, 8, 3);
        ctx.fillRect(drop.x - 3, drop.y + 2, 6, 1);
        ctx.fillStyle = '#5FD394';
        ctx.fillRect(drop.x - 2, drop.y - 1, 4, 2);
    } else if (drop.type === 'golden_blueberry') {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(drop.x - 4, drop.y - 4, 8, 8);
        ctx.fillStyle = '#4444CC';
        ctx.fillRect(drop.x - 3, drop.y - 3, 6, 6);
    }
}

function renderInventoryUI() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const px = 40, py = 20, pw = VIRTUAL_WIDTH - 80, ph = VIRTUAL_HEIGHT - 40;
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#FFF';
    drawSmallText(ctx, 'Inventory', px + pw / 2 - 27, py + 6);

    const items = inventory.items;
    if (items.length === 0) {
        ctx.fillStyle = '#666';
        drawSmallText(ctx, 'Empty', px + pw / 2 - 15, py + ph / 2 - 3);
    } else {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const y = py + 20 + i * 22;
            if (i === invSelectedIndex) {
                ctx.fillStyle = '#333355';
                ctx.fillRect(px + 4, y - 2, pw - 8, 20);
            }
            drawItem(ctx, px + 8, y, item.spriteId, 2);
            ctx.fillStyle = i === invSelectedIndex ? '#FFCC00' : '#CCC';
            drawSmallText(ctx, item.name, px + 28, y + 4);
            if (player.equippedItem?.id === item.id) {
                ctx.fillStyle = '#4CAF50';
                drawSmallText(ctx, 'A', px + pw - 16, y + 4);
            } else if (player.secondaryItem?.id === item.id) {
                ctx.fillStyle = '#4488CC';
                drawSmallText(ctx, 'B', px + pw - 16, y + 4);
            }
        }
    }
    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'Z:Equip  I:Close', px + 8, py + ph - 12);
}

function renderShopUI() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const px = 30, py = 15, pw = VIRTUAL_WIDTH - 60, ph = VIRTUAL_HEIGHT - 30;
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#FFF';
    drawSmallText(ctx, "Blacksmith's Shop", px + pw / 2 - 51, py + 6);
    ctx.fillStyle = '#3CB371';
    drawSmallText(ctx, 'Emeralds: ' + player.emeralds, px + pw - 72, py + 6);

    for (let i = 0; i < shop.items.length; i++) {
        const item = shop.items[i];
        const y = py + 22 + i * 20;
        if (i === shop.selectedIndex) {
            ctx.fillStyle = '#333355';
            ctx.fillRect(px + 4, y - 2, pw - 8, 18);
        }
        drawItem(ctx, px + 8, y, item.spriteId, 2);
        const owned = inventory.has(item.id);
        // Line 1: item name (full width)
        if (item.notForSale) {
            ctx.fillStyle = i === shop.selectedIndex ? '#FFCC00' : '#888';
        } else if (owned) {
            ctx.fillStyle = '#666';
        } else {
            ctx.fillStyle = i === shop.selectedIndex ? '#FFCC00' : '#CCC';
        }
        drawSmallText(ctx, item.name, px + 28, y + 2);
        // Line 2: stats on left, price/status on right
        ctx.fillStyle = '#888';
        if (item.damage) drawSmallText(ctx, 'Dmg:' + item.damage, px + 28, y + 10);
        if (item.defense) drawSmallText(ctx, 'Def:' + item.defense, px + 28, y + 10);
        if (item.notForSale) {
            ctx.fillStyle = '#CC8800';
            drawSmallText(ctx, 'Not for sale', px + pw - 66, y + 10);
        } else if (owned) {
            ctx.fillStyle = '#4CAF50';
            drawSmallText(ctx, 'Owned', px + pw - 40, y + 10);
        } else {
            ctx.fillStyle = player.emeralds >= item.cost ? '#3CB371' : '#CC3333';
            drawSmallText(ctx, String(item.cost) + ' em', px + pw - 36, y + 10);
        }
    }

    if (shop.messageTimer > 0) {
        ctx.fillStyle = '#FFCC00';
        drawSmallText(ctx, shop.message, px + pw / 2 - shop.message.length * 3, py + ph - 24);
    }
    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'Z:Buy  X:Leave', px + 8, py + ph - 12);
}

function renderDeathScreen() {
    // Fade to dark red/black
    const fadeIn = Math.min(1, deathTimer / 30);
    ctx.fillStyle = `rgba(30, 0, 0, ${fadeIn * 0.9})`;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    if (deathTimer > 20) {
        ctx.fillStyle = '#CC2222';
        drawSmallText(ctx, 'You Died!', VIRTUAL_WIDTH / 2 - 27, VIRTUAL_HEIGHT / 2 - 16);
    }

    if (deathTimer >= DEATH_SCREEN_DURATION && Math.floor(deathTimer / 20) % 2 === 0) {
        ctx.fillStyle = '#888';
        drawSmallText(ctx, 'Press ENTER to Continue', VIRTUAL_WIDTH / 2 - 69, VIRTUAL_HEIGHT / 2 + 10);
    }
}

// ── PIXEL FONT ──

const FONT = {
    'A': [0x7C,0xC6,0xFE,0xC6,0xC6,0x00], 'B': [0xFC,0xC6,0xFC,0xC6,0xFC,0x00],
    'C': [0x7E,0xC0,0xC0,0xC0,0x7E,0x00], 'D': [0xFC,0xC6,0xC6,0xC6,0xFC,0x00],
    'E': [0xFE,0xC0,0xFC,0xC0,0xFE,0x00], 'F': [0xFE,0xC0,0xFC,0xC0,0xC0,0x00],
    'G': [0x7E,0xC0,0xCE,0xC6,0x7E,0x00], 'H': [0xC6,0xC6,0xFE,0xC6,0xC6,0x00],
    'I': [0x7E,0x18,0x18,0x18,0x7E,0x00], 'J': [0x3E,0x06,0x06,0xC6,0x7C,0x00],
    'K': [0xC6,0xCC,0xF8,0xCC,0xC6,0x00], 'L': [0xC0,0xC0,0xC0,0xC0,0xFE,0x00],
    'M': [0xC6,0xEE,0xFE,0xD6,0xC6,0x00], 'N': [0xC6,0xE6,0xF6,0xDE,0xCE,0x00],
    'O': [0x7C,0xC6,0xC6,0xC6,0x7C,0x00], 'P': [0xFC,0xC6,0xFC,0xC0,0xC0,0x00],
    'Q': [0x7C,0xC6,0xC6,0xCE,0x7E,0x00], 'R': [0xFC,0xC6,0xFC,0xCC,0xC6,0x00],
    'S': [0x7E,0xC0,0x7C,0x06,0xFC,0x00], 'T': [0xFE,0x30,0x30,0x30,0x30,0x00],
    'U': [0xC6,0xC6,0xC6,0xC6,0x7C,0x00], 'V': [0xC6,0xC6,0xC6,0x6C,0x38,0x00],
    'W': [0xC6,0xD6,0xFE,0xEE,0xC6,0x00], 'X': [0xC6,0x6C,0x38,0x6C,0xC6,0x00],
    'Y': [0xC6,0x6C,0x38,0x18,0x18,0x00], 'Z': [0xFE,0x0C,0x38,0x60,0xFE,0x00],
    '0': [0x7C,0xCE,0xD6,0xE6,0x7C,0x00], '1': [0x38,0x78,0x18,0x18,0x7E,0x00],
    '2': [0x7C,0x06,0x7C,0xC0,0xFE,0x00], '3': [0x7C,0x06,0x3C,0x06,0x7C,0x00],
    '4': [0xC6,0xC6,0xFE,0x06,0x06,0x00], '5': [0xFE,0xC0,0xFC,0x06,0xFC,0x00],
    '6': [0x7E,0xC0,0xFC,0xC6,0x7C,0x00], '7': [0xFE,0x06,0x0C,0x18,0x18,0x00],
    '8': [0x7C,0xC6,0x7C,0xC6,0x7C,0x00], '9': [0x7C,0xC6,0x7E,0x06,0x7C,0x00],
    ' ': [0x00,0x00,0x00,0x00,0x00,0x00], '-': [0x00,0x00,0x7C,0x00,0x00,0x00],
    '.': [0x00,0x00,0x00,0x00,0x18,0x00], '!': [0x18,0x18,0x18,0x00,0x18,0x00],
    '?': [0x7C,0x06,0x3C,0x00,0x30,0x00], ':': [0x00,0x18,0x00,0x18,0x00,0x00],
    ',': [0x00,0x00,0x00,0x18,0x30,0x00], "'": [0x18,0x18,0x00,0x00,0x00,0x00],
    '/': [0x06,0x0C,0x18,0x30,0x60,0x00], '(': [0x0C,0x18,0x18,0x18,0x0C,0x00],
    ')': [0x30,0x18,0x18,0x18,0x30,0x00], '+': [0x00,0x18,0x7E,0x18,0x00,0x00],
};

export function drawSmallText(ctx, text, x, y, color) {
    if (color) ctx.fillStyle = color;
    const upper = text.toUpperCase();
    for (let c = 0; c < upper.length; c++) {
        const charData = FONT[upper[c]];
        if (!charData) continue;
        for (let row = 0; row < 6; row++) {
            let bits = charData[row];
            for (let col = 0; col < 8; col++) {
                if (bits & (0x80 >> col)) {
                    ctx.fillRect(x + c * 6 + col * 0.75, y + row, 1, 1);
                }
            }
        }
    }
}

function drawTitle(ctx, y) {
    const letters = 'ZCRAFT';
    const blockSize = 4;
    const letterWidth = 6 * blockSize;
    const totalWidth = letters.length * letterWidth + (letters.length - 1) * 4;
    let x = Math.floor(VIRTUAL_WIDTH / 2 - totalWidth / 2);

    for (let i = 0; i < letters.length; i++) {
        const charData = FONT[letters[i]];
        if (!charData) continue;
        for (let row = 0; row < 6; row++) {
            let bits = charData[row];
            for (let col = 0; col < 8; col++) {
                if (bits & (0x80 >> col)) {
                    const px = x + col * blockSize * 0.75;
                    const py = y + row * blockSize;
                    ctx.fillStyle = '#1a4a0e';
                    ctx.fillRect(px + 1, py + 1, blockSize - 1, blockSize - 1);
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(px, py, blockSize - 1, blockSize - 1);
                    ctx.fillStyle = '#6ECF72';
                    ctx.fillRect(px, py, 1, blockSize - 2);
                }
            }
        }
        x += letterWidth + 4;
    }
}

init();
