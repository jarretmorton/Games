import { initRenderer, clearScreen, getCtx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, getScale } from './rendering/renderer.js';
import { input } from './engine/input.js';
import { gameState, States } from './state/gameState.js';
import { camera } from './engine/camera.js';
import { renderMap, updateTileAnimations } from './world/tilemap.js';
import { townMap, SPAWN_X, SPAWN_Y, breakablePositions } from './world/townMap.js';
import { dungeonMap, DUNGEON_SPAWN_X, DUNGEON_SPAWN_Y, ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y, LOCKED_DOOR_ROW, LOCKED_DOOR_COLS, ENDER_PEARL_X, ENDER_PEARL_Y } from './world/dungeonMap.js';
import { shopMap, SHOP_SPAWN_X, SHOP_SPAWN_Y, SHOPKEEPER_X, SHOPKEEPER_Y, SKELETON_X, SKELETON_Y, CRAFTING_TABLE_COL, CRAFTING_TABLE_ROW } from './world/shopMap.js';
import { libraryMap, LIBRARY_SPAWN_X, LIBRARY_SPAWN_Y, LIBRARY_NPC_X, LIBRARY_NPC_Y, libraryBreakablePositions } from './world/libraryMap.js';
import { homeMap, HOME_SPAWN_X, HOME_SPAWN_Y, HOME_NPC_X, HOME_NPC_Y, homeBreakablePositions } from './world/homeMap.js';
import { alchemistMap, ALCHEMIST_SPAWN_X, ALCHEMIST_SPAWN_Y, alchemistBreakablePositions } from './world/alchemistMap.js';
import { player } from './entities/player.js';
import { characters } from './data/characters.js';
import { drawCharacter, drawItem, drawArrow, drawTrappedSkeleton, drawSkeleton, drawChest } from './rendering/sprites.js';
import { createNPCs } from './entities/npc.js';
import { npcData, shopkeeperData, libraryNpcData, homeNpcData, alchemistNpcData } from './data/npcs.js';
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
import { saveSystem } from './systems/saveSystem.js';
import { LEVELS, getLevel, levelIdFromFlags } from './world/levels.js';
import { installDebugHook } from './engine/debugHook.js';

export const VERSION = '1.2.0';

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

// Dungeon chest (spawns after defeating skeleton)
let dungeonChest = null;

// Locked chamber state
let lockedRoomOpen = false;
let enderPearlPickedUp = false;

// Enemy arrows (skeleton archer projectiles)
let enemyArrows = [];

// Shop interior state
let shopNpcs = [];
let shopEnemies = [];
let shopSkeletonFreed = false;
let shopSkeletonDefeated = false;
let shopSkeletonAnimFrame = 0;
let shopSkeletonAnimTimer = 0;

// Library interior state
let inLibrary = false;
let libraryNpcs = [];
let libraryBreakables = [];

// Home interior state
let inHome = false;
let homeNpcs = [];
let homeBreakables = [];

// Alchemist interior state
let inAlchemist = false;
let alchemistNpcs = [];
let alchemistBreakables = [];

// Secret bush state (one-time reward)
let secretBushCollected = false;

// Save point for respawning after death
let savePoint = { x: SPAWN_X, y: SPAWN_Y, inDungeon: false, inShop: false };

// Persistent save/name system
let currentSaveSlot = 0;
let playerName = '';

// Name entry state
let nameEntrySelectedSlot = 0;
let nameEntryTyping = false;
let nameEntryText = '';
let nameEntryEraseSlot = -1; // >=0 when awaiting erase confirmation

// Save menu state (pause → save/restore/cancel)
let saveMenuOption = 0; // 0=Save, 1=Restore, 2=Cancel

// Save/restore slot selection
let selectedSlot = 0;
let saveSlotContext = 'save'; // 'save' | 'restore'

// On-screen keyboard flash feedback
let kbFlashKey = null;
let kbFlashTimer = 0;
let kbCursorIndex = 0;

// ── ON-SCREEN KEYBOARD LAYOUT ──
const KB_KEY_W = 22;
const KB_KEY_H = 13;
const KB_H_GAP = 2;
const KB_V_GAP = 2;
const KB_ROW_H = KB_KEY_H + KB_V_GAP; // 15
const KB_Y = 44; // top of keyboard in typing mode

let _kbKeys = null;
function getKbKeys() {
    if (_kbKeys) return _kbKeys;
    const keys = [];

    // Rows 1 and 2
    const letterRows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
    ];
    for (let r = 0; r < letterRows.length; r++) {
        const row = letterRows[r];
        const rowW = row.length * KB_KEY_W + (row.length - 1) * KB_H_GAP;
        let x = Math.floor((VIRTUAL_WIDTH - rowW) / 2);
        const y = KB_Y + r * KB_ROW_H;
        for (const letter of row) {
            keys.push({ label: letter, code: 'Key' + letter, x, y, w: KB_KEY_W, h: KB_KEY_H });
            x += KB_KEY_W + KB_H_GAP;
        }
    }

    // Row 3: Z X C V B N M + DEL
    const delW = 36;
    const row3Letters = ['Z','X','C','V','B','N','M'];
    const lettersW = row3Letters.length * KB_KEY_W + (row3Letters.length - 1) * KB_H_GAP;
    const row3TotalW = lettersW + KB_H_GAP + delW;
    let x3 = Math.floor((VIRTUAL_WIDTH - row3TotalW) / 2);
    const y3 = KB_Y + 2 * KB_ROW_H;
    for (const letter of row3Letters) {
        keys.push({ label: letter, code: 'Key' + letter, x: x3, y: y3, w: KB_KEY_W, h: KB_KEY_H });
        x3 += KB_KEY_W + KB_H_GAP;
    }
    keys.push({ label: 'DEL', code: 'Backspace', x: x3, y: y3, w: delW, h: KB_KEY_H });

    // Row 4: CANCEL + SPACE + OK
    const cancelW = 44, spcW = 78, okW = 38;
    const row4TotalW = cancelW + KB_H_GAP + spcW + KB_H_GAP + okW;
    const x4 = Math.floor((VIRTUAL_WIDTH - row4TotalW) / 2);
    const y4 = KB_Y + 3 * KB_ROW_H;
    keys.push({ label: 'CANCEL', code: 'Cancel', x: x4, y: y4, w: cancelW, h: KB_KEY_H });
    keys.push({ label: 'SPACE', code: 'Space', x: x4 + cancelW + KB_H_GAP, y: y4, w: spcW, h: KB_KEY_H });
    keys.push({ label: 'OK', code: 'Enter', x: x4 + cancelW + KB_H_GAP + spcW + KB_H_GAP, y: y4, w: okW, h: KB_KEY_H });

    _kbKeys = keys;
    return keys;
}

// Keyboard row index ranges for d-pad navigation
const KB_NAV_ROWS = [
    [0,1,2,3,4,5,6,7,8,9],
    [10,11,12,13,14,15,16,17,18],
    [19,20,21,22,23,24,25,26],
    [27,28,29],
];

// Death screen
let deathTimer = 0;
const DEATH_SCREEN_DURATION = 120; // 2 seconds at 60fps

// Transition effect
let transition = { active: false, timer: 0, maxTime: 30, callback: null };

// ── Level-registry bridge (Phase 0) ──────────────────────────────────────────
// The engine still tracks location with the boolean flags below; these derive
// the canonical currentLevelId + flag bag that the registry, debug hook, and
// save format share. See js/world/levels.js and docs/LEVEL_SPEC.md §4.
function currentLevelId() {
    return levelIdFromFlags({ inDungeon, inShop, inLibrary, inHome, inAlchemist });
}

function currentFlags() {
    return {
        inDungeon, inShop, inLibrary, inHome, inAlchemist,
        puzzleSolved: puzzle.solved,
        dungeonCleared,
        lockedRoomOpen,
        enderPearlPickedUp,
        shopSkeletonFreed,
        shopSkeletonDefeated,
        secretBushCollected,
    };
}

function init() {
    ctx = initRenderer();
    initCanvasInput();
    installDebugHook({
        version: VERSION,
        getState: () => ({
            levelId: currentLevelId(),
            player: { x: player.x, y: player.y, hp: player.health },
            inventory: inventory.items.map(i => i.id),
            flags: currentFlags(),
        }),
    });
    requestAnimationFrame(gameLoop);
}

function initCanvasInput() {
    // Canvas touch/click input removed; keyboard is navigated via d-pad controls only.
}

function handleKbKeyTap(key) {
    kbFlashKey = key.code;
    kbFlashTimer = 8;
    if (key.code === 'Backspace') {
        nameEntryText = nameEntryText.slice(0, -1);
    } else if (key.code === 'Enter') {
        if (nameEntryText.length > 0) {
            playerName = nameEntryText;
            currentSaveSlot = nameEntrySelectedSlot;
            nameEntryTyping = false;
            gameState.change(States.CHARACTER_SELECT);
        }
    } else if (key.code === 'Cancel') {
        nameEntryTyping = false;
        nameEntryText = '';
    } else if (key.code === 'Space') {
        if (nameEntryText.length < 10) nameEntryText += ' ';
    } else if (key.code.startsWith('Key')) {
        if (nameEntryText.length < 10) nameEntryText += key.code.slice(3);
    }
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
    dungeonChest = null;
    enemyArrows = [];
    lockedRoomOpen = false;
    enderPearlPickedUp = false;
    // Reset locked door tiles in case a previous game opened them
    dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[0]] = T.LOCKED_DOOR;
    dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[1]] = T.LOCKED_DOOR;
    shopNpcs = createNPCs([shopkeeperData]);
    shopEnemies = [];
    shopSkeletonFreed = false;
    shopSkeletonDefeated = false;
    libraryNpcs = createNPCs([libraryNpcData]);
    libraryBreakables = createBreakables(libraryBreakablePositions);
    homeNpcs = createNPCs([homeNpcData]);
    homeBreakables = createBreakables(homeBreakablePositions);
    alchemistNpcs = createNPCs([alchemistNpcData]);
    alchemistBreakables = createBreakables(alchemistBreakablePositions);
    inLibrary = false;
    inHome = false;
    inAlchemist = false;

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
    if (kbFlashTimer > 0) kbFlashTimer--;

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
                nameEntrySelectedSlot = 0;
                nameEntryTyping = false;
                nameEntryText = '';
                gameState.change(States.NAME_ENTRY);
            }
            break;

        case States.NAME_ENTRY:
            updateNameEntry();
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
            else if (inLibrary) updateLibraryInterior();
            else if (inHome) updateHomeInterior();
            else if (inAlchemist) updateAlchemistInterior();
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

        case States.SAVE_MENU:
            updateSaveMenu();
            break;

        case States.SAVE_SLOTS:
            updateSaveSlots();
            break;

        case States.RESTORE_SLOTS:
            updateRestoreSlots();
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

    // Auto-enter buildings when player walks through door tiles
    {
        const playerCol = Math.floor(player.x / TILE_SIZE);
        const playerRow = Math.floor(player.y / TILE_SIZE);
        if (playerRow >= 0 && playerRow < townMap.length && playerCol >= 0 && playerCol < townMap[0].length) {
            const tileId = townMap[playerRow][playerCol];
            const interact = tileProps[tileId]?.interact;
            if (interact === 'shop' && !transition.active) {
                enterShop();
            } else if (interact === 'library' && !transition.active) {
                enterLibrary();
            } else if (interact === 'home' && !transition.active) {
                enterHome();
            } else if (interact === 'alchemist' && !transition.active) {
                enterAlchemist();
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

    if (input.start) {
        saveMenuOption = 0;
        gameState.change(States.SAVE_MENU);
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

        // Skeleton archer: spawn enemy arrow if signal set
        if (enemy.bowShootSignal) {
            enemy.bowShootSignal = false;
            spawnEnemyArrow(enemy.x, enemy.y, player.x, player.y, enemy.damage);
        }

        // Melee enemy damages player
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

    // Update enemy arrows (skeleton archer projectiles)
    updateEnemyArrows();

    // Check if player died
    if (checkPlayerDeath()) return;

    // Secondary action (B/ALT) - shield block
    if (input.secondary && !player.blocking) {
        player.startBlock();
    }

    // Chest interaction (before attack so action can open chest)
    if (input.action && dungeonChest && !dungeonChest.opened) {
        const dist = Math.abs(player.x - dungeonChest.x) + Math.abs(player.y - dungeonChest.y);
        if (dist < 28) {
            dungeonChest.opened = true;
            inventory.add(itemDefs.key);
            dialogue.start('', ['You opened the chest!', 'You found a Dungeon Key!', 'A heavy iron door was spotted to the north...']);
            gameState.change(States.DIALOGUE);
        }
    }

    // Locked chamber door interaction
    const DOOR_CX = (LOCKED_DOOR_COLS[0] + 1) * 32; // center of both door tiles
    const DOOR_CY = LOCKED_DOOR_ROW * 32 + 16;
    if (!lockedRoomOpen) {
        const doorDist = Math.abs(player.x - DOOR_CX) + Math.abs(player.y - DOOR_CY);
        if (doorDist < 55 && input.action) {
            if (inventory.has('key')) {
                lockedRoomOpen = true;
                dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[0]] = T.DUNGEON_FLOOR;
                dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[1]] = T.DUNGEON_FLOOR;
                inventory.remove('key');
                dialogue.start('', ['The Dungeon Key turns with a deep clunk...', 'The ornate chamber has opened!']);
                gameState.change(States.DIALOGUE);
            } else if (doorDist < 40) {
                dialogue.start('', ['The door is sealed shut.', 'It needs a special key...']);
                gameState.change(States.DIALOGUE);
            }
        }
    }

    // Ender pearl interaction (only reachable once locked room open)
    if (!enderPearlPickedUp) {
        const epDist = Math.abs(player.x - ENDER_PEARL_X) + Math.abs(player.y - ENDER_PEARL_Y);
        if (epDist < 28 && input.action) {
            enderPearlPickedUp = true;
            inventory.add(itemDefs.ender_pearl);
            dialogue.start('', ['You found an Ender Pearl!', 'Its surface swirls with mysterious energy...', 'A relic from another world.']);
            gameState.change(States.DIALOGUE);
        }
    }

    // Player attacks enemy
    if (input.action && player.equippedItem && player.equippedItem.type === 'weapon') {
        if (player.attack()) {
            const hitbox = player.getAttackHitbox();
            if (hitbox) {
                const hits = checkAttackHits(hitbox, enemies);
                for (const enemy of hits) {
                    enemy.takeDamage(player.equippedItem.damage, player.x, player.y);
                    if (enemy.hp <= 0) {
                        maybeDropHeart(enemy.x, enemy.y);
                        if (!dungeonCleared) {
                            dungeonCleared = true;
                            setTimeout(() => {
                                spawnDungeonChest(enemy.x, enemy.y);
                                dialogue.start('', ['The skeleton has been defeated!', 'A chest appeared...']);
                                gameState.change(States.DIALOGUE);
                            }, 400);
                        }
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

    if (input.start) {
        saveMenuOption = 0;
        gameState.change(States.SAVE_MENU);
    }
}

function enterDungeon() {
    // Sourced from the level registry (js/world/levels.js) — the single source
    // of truth for spawn / boss / music. Values match the legacy constants.
    const mine = getLevel('mine');
    const [spawnX, spawnY] = mine.spawn;
    // Save position at dungeon entrance
    savePoint = { x: spawnX, y: spawnY, inDungeon: true, inShop: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inDungeon = true;
        inShop = false;
        player.x = spawnX;
        player.y = spawnY;
        camera.x = 0;
        camera.y = 0;
        if (!dungeonCleared) {
            const [bx, by] = mine.boss.spawn;
            enemies = [new Enemy(bx, by, mine.boss.type)];
        } else {
            enemies = [];
        }
        enemyArrows = [];
        music.play(mine.music);
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

function spawnDungeonChest(x, y) {
    dungeonChest = { x, y, opened: false };
}

function spawnEnemyArrow(fromX, fromY, toX, toY, damage) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 2.5;
    let facing = 'down';
    if (Math.abs(dx) > Math.abs(dy)) {
        facing = dx > 0 ? 'right' : 'left';
    } else {
        facing = dy > 0 ? 'down' : 'up';
    }
    enemyArrows.push({
        x: fromX,
        y: fromY,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        facing,
        damage,
        active: true,
        life: 120,
    });
}

function updateEnemyArrows() {
    for (const arrow of enemyArrows) {
        if (!arrow.active) continue;
        arrow.x += arrow.vx;
        arrow.y += arrow.vy;
        arrow.life--;

        if (arrow.life <= 0) { arrow.active = false; continue; }

        // Solid tile collision
        const col = Math.floor(arrow.x / TILE_SIZE);
        const row = Math.floor(arrow.y / TILE_SIZE);
        if (row < 0 || row >= dungeonMap.length || col < 0 || col >= dungeonMap[0].length) {
            arrow.active = false; continue;
        }
        if (tileProps[dungeonMap[row][col]]?.solid) { arrow.active = false; continue; }

        // Hit player
        const dist = Math.abs(player.x - arrow.x) + Math.abs(player.y - arrow.y);
        if (dist < 12) {
            arrow.active = false;
            const blocked = player.takeDamage(arrow.damage);
            if (blocked) camera.shake(2, 6);
        }
    }
    enemyArrows = enemyArrows.filter(a => a.active);
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

function enterLibrary() {
    savePoint = { x: player.x, y: player.y, inDungeon: false, inShop: false, inLibrary: false, inHome: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inLibrary = true;
        inShop = false;
        inDungeon = false;
        inHome = false;
        player.x = LIBRARY_SPAWN_X;
        player.y = LIBRARY_SPAWN_Y;
        camera.x = 0;
        camera.y = 0;
        music.play('shop'); // reuse shop music for cozy interior feel
    };
}

function exitLibrary() {
    const exitX = 8 * TILE_SIZE + TILE_SIZE / 2;
    const exitY = 10 * TILE_SIZE + TILE_SIZE / 2;
    savePoint = { x: exitX, y: exitY, inDungeon: false, inShop: false, inLibrary: false, inHome: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inLibrary = false;
        player.x = exitX;
        player.y = exitY;
        music.play('overworld');
    };
}

function updateLibraryInterior() {
    updateTileAnimations();

    const solidEntities = [];
    for (const npc of libraryNpcs) {
        solidEntities.push({ x: npc.collX, y: npc.collY, w: npc.w, h: npc.h, solid: true });
    }

    player.update(libraryMap, solidEntities);
    for (const npc of libraryNpcs) npc.update();

    if (checkPlayerDeath()) return;

    if (input.secondary && !player.blocking) player.startBlock();

    if (input.action) {
        const nearInteract = checkNearLibraryInteract();
        if (nearInteract) {
            tryLibraryInteract();
        } else {
            if (player.attack()) {
                const hitbox = player.getAttackHitbox();
                if (hitbox) {
                    for (const b of libraryBreakables) {
                        if (b.active && !b.destroying) {
                            if (aabbOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                                           b.x + 4, b.y + 4, b.w - 8, b.h - 8)) {
                                const drop = b.hit();
                                if (drop) spawnDrop(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, drop);
                            }
                        }
                    }
                }
            } else {
                tryLibraryInteract();
            }
        }
    }

    for (const b of libraryBreakables) b.update();
    updateArrows(libraryMap);
    if (player.bowReleased) { player.bowReleased = false; spawnArrow(); }
    updateDrops();

    camera.follow(player.x, player.y, libraryMap[0].length, libraryMap.length);
    camera.update();

    const playerRow = Math.floor(player.y / TILE_SIZE);
    if (playerRow >= libraryMap.length - 1) exitLibrary();

    if (input.inventory) { invSelectedIndex = 0; gameState.change(States.INVENTORY); }
    if (input.start) { saveMenuOption = 0; gameState.change(States.SAVE_MENU); }
}

function checkNearLibraryInteract() {
    const point = player.getInteractPoint();
    for (const npc of libraryNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) return true;
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < libraryMap.length && col >= 0 && col < libraryMap[0].length) {
        const props = tileProps[libraryMap[row][col]];
        if (props?.interact) return true;
    }
    return false;
}

function tryLibraryInteract() {
    const point = player.getInteractPoint();
    for (const npc of libraryNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) {
            dialogue.start(npc.name, [npc.getNextDialogue()]);
            gameState.change(States.DIALOGUE);
            return;
        }
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < libraryMap.length && col >= 0 && col < libraryMap[0].length) {
        const tileId = libraryMap[row][col];
        const props = tileProps[tileId];
        if (props?.interact === 'bookshelf') {
            const books = [
                ['Mining for Dummies', '"Never dig straight down." - Notch, probably.'],
                ['Creeper Anatomy', '"They have no arms. How do they even explode?" - Unknown Scholar'],
                ['The Nether: A Travel Guide', '"Bring fire resistance. Seriously." - Author Unknown'],
                ['Diamond Theory', '"Found at Y=-58. Diamonds are a miner\'s best friend." - Geologist'],
            ];
            const b = books[Math.floor(Math.random() * books.length)];
            dialogue.start(b[0], [b[1]]);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'enchanting_table') {
            dialogue.start('Enchanting Table', [
                'The runes glow with ancient power...',
                'Bookshelves amplify its magic. The more, the stronger.',
                'Lapis lazuli is required for enchanting. Spend wisely.',
            ]);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'lectern') {
            dialogue.start('Lectern', [
                '"The world is made of blocks, but the universe is made of stories." - Herobrine',
                'A copy of "Crafting Recipes Vol. XII" lies open.',
                'Recipe of the day: 8 obsidian + 1 eye of ender = Nether portal frame.',
            ]);
            gameState.change(States.DIALOGUE);
        }
    }
}

function enterHome() {
    savePoint = { x: player.x, y: player.y, inDungeon: false, inShop: false, inLibrary: false, inHome: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inHome = true;
        inShop = false;
        inDungeon = false;
        inLibrary = false;
        player.x = HOME_SPAWN_X;
        player.y = HOME_SPAWN_Y;
        camera.x = 0;
        camera.y = 0;
        music.play('shop');
    };
}

function exitHome() {
    const exitX = 24 * TILE_SIZE + TILE_SIZE / 2;
    const exitY = 10 * TILE_SIZE + TILE_SIZE / 2;
    savePoint = { x: exitX, y: exitY, inDungeon: false, inShop: false, inLibrary: false, inHome: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inHome = false;
        player.x = exitX;
        player.y = exitY;
        music.play('overworld');
    };
}

function enterAlchemist() {
    savePoint = { x: player.x, y: player.y, inDungeon: false, inShop: false, inLibrary: false, inHome: false, inAlchemist: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inAlchemist = true;
        inShop = false;
        inDungeon = false;
        inLibrary = false;
        inHome = false;
        player.x = ALCHEMIST_SPAWN_X;
        player.y = ALCHEMIST_SPAWN_Y;
        camera.x = 0;
        camera.y = 0;
        music.play('shop');
    };
}

function exitAlchemist() {
    const exitX = 25 * TILE_SIZE + TILE_SIZE / 2;
    const exitY = 18 * TILE_SIZE + TILE_SIZE / 2;
    savePoint = { x: exitX, y: exitY, inDungeon: false, inShop: false, inLibrary: false, inHome: false, inAlchemist: false };
    transition.active = true;
    transition.timer = 0;
    transition.maxTime = 20;
    transition.callback = () => {
        inAlchemist = false;
        player.x = exitX;
        player.y = exitY;
        music.play('overworld');
    };
}

function updateHomeInterior() {
    updateTileAnimations();

    const solidEntities = [];
    for (const npc of homeNpcs) {
        solidEntities.push({ x: npc.collX, y: npc.collY, w: npc.w, h: npc.h, solid: true });
    }

    player.update(homeMap, solidEntities);
    for (const npc of homeNpcs) npc.update();

    if (checkPlayerDeath()) return;

    if (input.secondary && !player.blocking) player.startBlock();

    if (input.action) {
        const nearInteract = checkNearHomeInteract();
        if (nearInteract) {
            tryHomeInteract();
        } else {
            if (player.attack()) {
                const hitbox = player.getAttackHitbox();
                if (hitbox) {
                    for (const b of homeBreakables) {
                        if (b.active && !b.destroying) {
                            if (aabbOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                                           b.x + 4, b.y + 4, b.w - 8, b.h - 8)) {
                                const drop = b.hit();
                                if (drop) spawnDrop(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, drop);
                            }
                        }
                    }
                }
            } else {
                tryHomeInteract();
            }
        }
    }

    for (const b of homeBreakables) b.update();
    updateArrows(homeMap);
    if (player.bowReleased) { player.bowReleased = false; spawnArrow(); }
    updateDrops();

    camera.follow(player.x, player.y, homeMap[0].length, homeMap.length);
    camera.update();

    const playerRow = Math.floor(player.y / TILE_SIZE);
    if (playerRow >= homeMap.length - 1) exitHome();

    if (input.inventory) { invSelectedIndex = 0; gameState.change(States.INVENTORY); }
    if (input.start) { saveMenuOption = 0; gameState.change(States.SAVE_MENU); }
}

function checkNearHomeInteract() {
    const point = player.getInteractPoint();
    for (const npc of homeNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) return true;
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < homeMap.length && col >= 0 && col < homeMap[0].length) {
        const props = tileProps[homeMap[row][col]];
        if (props?.interact) return true;
    }
    return false;
}

function tryHomeInteract() {
    const point = player.getInteractPoint();
    for (const npc of homeNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) {
            dialogue.start(npc.name, [npc.getNextDialogue()]);
            gameState.change(States.DIALOGUE);
            return;
        }
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < homeMap.length && col >= 0 && col < homeMap[0].length) {
        const tileId = homeMap[row][col];
        const props = tileProps[tileId];
        if (props?.interact === 'crafting_table') {
            dialogue.start('Crafting Table', ['A worn crafting grid. Countless swords made here.', '3x3 grid, endless possibilities...']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'bookshelf') {
            dialogue.start('Bookshelf', ['"Zombie-Proofing Your Home" by Notch Jr.', '"Sleep at night, the mobs won\'t wait."']);
            gameState.change(States.DIALOGUE);
        }
    }
}

function updateAlchemistInterior() {
    updateTileAnimations();

    const solidEntities = [];
    for (const npc of alchemistNpcs) {
        solidEntities.push({ x: npc.collX, y: npc.collY, w: npc.w, h: npc.h, solid: true });
    }

    player.update(alchemistMap, solidEntities);
    for (const npc of alchemistNpcs) npc.update();

    if (checkPlayerDeath()) return;

    if (input.secondary && !player.blocking) player.startBlock();

    if (input.action) {
        const nearInteract = checkNearAlchemistInteract();
        if (nearInteract) {
            tryAlchemistInteract();
        } else {
            if (player.attack()) {
                const hitbox = player.getAttackHitbox();
                if (hitbox) {
                    for (const b of alchemistBreakables) {
                        if (b.active && !b.destroying) {
                            if (aabbOverlap(hitbox.x, hitbox.y, hitbox.w, hitbox.h,
                                           b.x + 4, b.y + 4, b.w - 8, b.h - 8)) {
                                const drop = b.hit();
                                if (drop) spawnDrop(b.x + TILE_SIZE / 2, b.y + TILE_SIZE / 2, drop);
                            }
                        }
                    }
                }
            } else {
                tryAlchemistInteract();
            }
        }
    }

    for (const b of alchemistBreakables) b.update();
    updateArrows(alchemistMap);
    if (player.bowReleased) { player.bowReleased = false; spawnArrow(); }
    updateDrops();

    camera.follow(player.x, player.y, alchemistMap[0].length, alchemistMap.length);
    camera.update();

    const playerRow = Math.floor(player.y / TILE_SIZE);
    if (playerRow >= alchemistMap.length - 1) exitAlchemist();

    if (input.inventory) { invSelectedIndex = 0; gameState.change(States.INVENTORY); }
    if (input.start) { saveMenuOption = 0; gameState.change(States.SAVE_MENU); }
}

function checkNearAlchemistInteract() {
    const point = player.getInteractPoint();
    for (const npc of alchemistNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) return true;
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < alchemistMap.length && col >= 0 && col < alchemistMap[0].length) {
        const props = tileProps[alchemistMap[row][col]];
        if (props?.interact) return true;
    }
    return false;
}

function tryAlchemistInteract() {
    const point = player.getInteractPoint();
    for (const npc of alchemistNpcs) {
        const dist = Math.abs(point.x - npc.x) + Math.abs(point.y - npc.y);
        if (dist < 24) {
            dialogue.start(npc.name, [npc.getNextDialogue()]);
            gameState.change(States.DIALOGUE);
            return;
        }
    }
    const col = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (row >= 0 && row < alchemistMap.length && col >= 0 && col < alchemistMap[0].length) {
        const tileId = alchemistMap[row][col];
        const props = tileProps[tileId];
        if (props?.interact === 'enchanting_table') {
            dialogue.start('Enchanting Table', ['Arcane runes pulse with energy from The End.', 'The formulae are... untranslatable to the common tongue.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'bookshelf') {
            dialogue.start('Bookshelf', ['"Forbidden Experiments, Vol. III: Catalogued by Explosion Radius."', '"Do NOT mix blaze powder with spider eyes unsupervised."']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'crafting_table') {
            dialogue.start('Lab Bench', ['Not for crafting — for dissecting. Very different.', 'Residue of ender pearl, obsidian dust, and something unidentified.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'lectern') {
            dialogue.start('Grimoire', ['"To bind an ender pearl: speak thrice, duck, and do not blink."', '"Phase II: unknown. Phase III: definitely unknown. Results: pending."']);
            gameState.change(States.DIALOGUE);
        }
    }
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
                            maybeDropHeart(enemy.x, enemy.y);
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

    if (input.start) {
        saveMenuOption = 0;
        gameState.change(States.SAVE_MENU);
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
        inLibrary = savePoint.inLibrary || false;
        inHome = savePoint.inHome || false;
        inAlchemist = savePoint.inAlchemist || false;
        if (inDungeon && !dungeonCleared) {
            enemies = [new Enemy(ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y, 'dungeon_skeleton')];
            enemyArrows = [];
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
        music.play(inDungeon ? 'dungeon' : ((inShop || inLibrary || inHome || inAlchemist) ? 'shop' : 'overworld'));
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
                else if (drop.type === 'heart') {
                    player.health = Math.min(player.maxHealth, player.health + drop.amount);
                } else if (drop.type === 'golden_blueberry') {
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
                if (enemy.hp <= 0) {
                    maybeDropHeart(enemy.x, enemy.y);
                    if (!dungeonCleared && inDungeon) {
                        dungeonCleared = true;
                        const ex = enemy.x, ey = enemy.y;
                        setTimeout(() => {
                            spawnDungeonChest(ex, ey);
                            dialogue.start('', ['The skeleton has been defeated!', 'A chest appeared...']);
                            gameState.change(States.DIALOGUE);
                        }, 400);
                    }
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

function maybeDropHeart(x, y) {
    const roll = Math.random();
    if (roll < 0.25) {
        const amount = roll < 0.12 ? 2 : 1; // 12% full heart, 13% half heart
        spawnDrop(x, y, { type: 'heart', amount });
    }
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
        } else if (props?.interact === 'library') {
            enterLibrary();
        } else if (props?.interact === 'home') {
            enterHome();
        } else if (props?.interact === 'alchemist') {
            enterAlchemist();
        } else if (props?.interact === 'tablet') {
            dialogue.start('Stone Tablet', ['Place the dark stones upon the marks of power.', 'The path below shall open.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'bookshelf') {
            dialogue.start('Book', ['The four pillars of obsidian hold the key...', 'Push them onto the glowing plates to unseal the mine.']);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'sign') {
            dialogue.start('Sign', ["Blacksmith's Shop - Finest weapons in Craftville!"]);
            gameState.change(States.DIALOGUE);
        } else if (props?.interact === 'secret_bush') {
            if (!secretBushCollected) {
                secretBushCollected = true;
                player.emeralds += 20;
                // Replace the bush tile with plain grass
                townMap[28][9] = T.GRASS;
                dialogue.start('', ['You found a secret stash hidden in the forest!', 'You collected 20 emeralds!!', '(Nice exploring, you found the secret spot!)']);
                gameState.change(States.DIALOGUE);
            } else {
                dialogue.start('', ['Just trees here...']);
                gameState.change(States.DIALOGUE);
            }
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

// ── SAVE SYSTEM ──

function performSave(slot) {
    const data = {
        name: playerName,
        version: VERSION,
        timestamp: Date.now(),
        // Player
        x: player.x,
        y: player.y,
        health: player.health,
        maxHealth: player.maxHealth,
        emeralds: player.emeralds,
        characterId: player.characterId,
        palette: player.palette,
        facing: player.facing,
        inventoryItemIds: inventory.items.map(i => i.id),
        equippedItemId: player.equippedItem?.id || null,
        secondaryItemId: player.secondaryItem?.id || null,
        hasBlueberry: player.hasBlueberry,
        hasDiamond: player.hasDiamond,
        // World — canonical level id + flag bag (Phase 0); the named booleans
        // below remain the authoritative restore fields for backward compat.
        currentLevelId: currentLevelId(),
        flags: currentFlags(),
        inDungeon,
        inShop,
        inLibrary,
        inHome,
        inAlchemist,
        secretBushCollected,
        puzzleSolved: puzzle.solved,
        dungeonCleared,
        lockedRoomOpen,
        enderPearlPickedUp,
        shopSkeletonFreed,
        shopSkeletonDefeated,
        dungeonChestOpened: dungeonChest?.opened || false,
        dungeonChestX: dungeonChest?.x || null,
        dungeonChestY: dungeonChest?.y || null,
    };
    saveSystem.save(slot, data);
    currentSaveSlot = slot;
}

function performRestore(slot) {
    const data = saveSystem.getSlot(slot);
    if (!data) return;

    // Initialize world fresh
    startGame();

    // Restore player
    const charDef = characters.find(c => c.id === data.characterId) || characters[0];
    player.init(data.x, data.y, data.palette || charDef.palette);
    player.characterId = data.characterId || charDef.id;
    player.health = data.health;
    player.maxHealth = data.maxHealth;
    player.emeralds = data.emeralds;
    player.facing = data.facing || 'down';
    player.hasBlueberry = data.hasBlueberry || false;
    player.hasDiamond = data.hasDiamond || false;

    // Restore inventory (add without auto-equipping so we can set equipped manually)
    inventory.reset();
    for (const id of (data.inventoryItemIds || [])) {
        if (itemDefs[id]) {
            const item = { ...itemDefs[id] };
            inventory.items.push(item);
        }
    }
    player.inventory = inventory.items;
    player.equippedItem = inventory.items.find(i => i.id === data.equippedItemId) || null;
    player.secondaryItem = inventory.items.find(i => i.id === data.secondaryItemId) || null;

    // Restore world flags
    inDungeon = data.inDungeon || false;
    inShop = data.inShop || false;
    inLibrary = data.inLibrary || false;
    inHome = data.inHome || false;
    inAlchemist = data.inAlchemist || false;
    secretBushCollected = data.secretBushCollected || false;
    dungeonCleared = data.dungeonCleared || false;
    lockedRoomOpen = data.lockedRoomOpen || false;
    enderPearlPickedUp = data.enderPearlPickedUp || false;
    shopSkeletonFreed = data.shopSkeletonFreed || false;
    shopSkeletonDefeated = data.shopSkeletonDefeated || false;

    // Restore puzzle state
    if (data.puzzleSolved) {
        puzzle.solved = true;
        openDungeonEntrance();
    }

    // Restore secret bush tile (if already collected, it becomes grass)
    if (data.secretBushCollected) {
        townMap[28][9] = T.GRASS;
    }

    // Restore locked dungeon door
    if (data.lockedRoomOpen) {
        dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[0]] = T.DUNGEON_FLOOR;
        dungeonMap[LOCKED_DOOR_ROW][LOCKED_DOOR_COLS[1]] = T.DUNGEON_FLOOR;
    }

    // Restore dungeon chest
    if (data.dungeonChestX !== null && data.dungeonChestX !== undefined) {
        dungeonChest = { x: data.dungeonChestX, y: data.dungeonChestY, opened: data.dungeonChestOpened };
    }

    // Restore enemies
    if (inDungeon && !dungeonCleared) {
        enemies = [new Enemy(ZOMBIE_SPAWN_X, ZOMBIE_SPAWN_Y, 'dungeon_skeleton')];
    } else {
        enemies = [];
    }
    if (inShop && shopSkeletonFreed && !shopSkeletonDefeated) {
        shopEnemies = [new Enemy(SKELETON_X, SKELETON_Y, 'skeleton')];
        shopEnemies[0].hp = 4;
        shopEnemies[0].maxHp = 4;
        shopEnemies[0].speed = 0.7;
    } else {
        shopEnemies = [];
    }

    savePoint = { x: data.x, y: data.y, inDungeon: data.inDungeon, inShop: data.inShop };
    playerName = data.name;
    currentSaveSlot = slot;

    camera.x = 0;
    camera.y = 0;
    music.play(inDungeon ? 'dungeon' : ((inShop || inLibrary || inHome || inAlchemist) ? 'shop' : 'overworld'));
    gameState.change(States.PLAYING);
}

function updateNameEntry() {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (nameEntryTyping) {
        // D-pad navigation across on-screen keyboard
        let curRow = 0, curCol = 0;
        for (let r = 0; r < KB_NAV_ROWS.length; r++) {
            const idx = KB_NAV_ROWS[r].indexOf(kbCursorIndex);
            if (idx !== -1) { curRow = r; curCol = idx; break; }
        }
        if (input.leftPressed) {
            const row = KB_NAV_ROWS[curRow];
            kbCursorIndex = row[(curCol - 1 + row.length) % row.length];
        }
        if (input.rightPressed) {
            const row = KB_NAV_ROWS[curRow];
            kbCursorIndex = row[(curCol + 1) % row.length];
        }
        if (input.upPressed) {
            const newRow = (curRow - 1 + KB_NAV_ROWS.length) % KB_NAV_ROWS.length;
            const row = KB_NAV_ROWS[newRow];
            kbCursorIndex = row[Math.min(curCol, row.length - 1)];
        }
        if (input.downPressed) {
            const newRow = (curRow + 1) % KB_NAV_ROWS.length;
            const row = KB_NAV_ROWS[newRow];
            kbCursorIndex = row[Math.min(curCol, row.length - 1)];
        }
        // Action button taps the focused on-screen key
        if (input.action) {
            handleKbKeyTap(getKbKeys()[kbCursorIndex]);
        }
        // Capture letter keys (physical keyboard); skip Z as it doubles as the action button
        for (const letter of ALPHABET) {
            if (letter === 'Z') continue;
            if (input.isPressed('Key' + letter) && nameEntryText.length < 10) {
                nameEntryText += letter;
            }
        }
        // Capture digit keys
        for (let d = 0; d <= 9; d++) {
            if (input.isPressed('Digit' + d) && nameEntryText.length < 10) {
                nameEntryText += String(d);
            }
        }
        // Backspace
        if (input.isPressed('Backspace')) {
            nameEntryText = nameEntryText.slice(0, -1);
        }
        // Enter key confirms directly (desktop shortcut)
        if (input.start && nameEntryText.length > 0) {
            playerName = nameEntryText;
            currentSaveSlot = nameEntrySelectedSlot;
            nameEntryTyping = false;
            gameState.change(States.CHARACTER_SELECT);
        }
        // Cancel typing (go back to slot selection)
        if (input.cancel) {
            nameEntryTyping = false;
            nameEntryText = '';
        }
    } else {
        if (nameEntryEraseSlot >= 0) {
            // Erase confirmation pending
            if (input.action || input.start) {
                saveSystem.clearSlot(nameEntryEraseSlot);
                nameEntryEraseSlot = -1;
            }
            if (input.cancel) {
                nameEntryEraseSlot = -1;
            }
        } else {
            if (input.upPressed) nameEntrySelectedSlot = (nameEntrySelectedSlot - 1 + 3) % 3;
            if (input.downPressed) nameEntrySelectedSlot = (nameEntrySelectedSlot + 1) % 3;
            if (input.action || input.start) {
                const slots = saveSystem.getAllSlots();
                if (slots[nameEntrySelectedSlot]) {
                    performRestore(nameEntrySelectedSlot);
                } else {
                    nameEntryTyping = true;
                    nameEntryText = '';
                    kbCursorIndex = 0;
                }
            }
            // B initiates erase on a slot with data
            if (input.isPressed('KeyB')) {
                const slots = saveSystem.getAllSlots();
                if (slots[nameEntrySelectedSlot]) {
                    nameEntryEraseSlot = nameEntrySelectedSlot;
                }
            }
            // X to go back to title
            if (input.isPressed('KeyX')) {
                gameState.change(States.TITLE);
            }
        }
    }
}

function updateSaveMenu() {
    if (input.upPressed) saveMenuOption = (saveMenuOption - 1 + 3) % 3;
    if (input.downPressed) saveMenuOption = (saveMenuOption + 1) % 3;
    if (input.action || input.start) {
        if (saveMenuOption === 0) {
            // Save
            selectedSlot = 0;
            saveSlotContext = 'save';
            gameState.change(States.SAVE_SLOTS);
        } else if (saveMenuOption === 1) {
            // Restore
            selectedSlot = 0;
            saveSlotContext = 'restore';
            gameState.change(States.RESTORE_SLOTS);
        } else {
            // Cancel
            gameState.change(States.PLAYING);
        }
    }
    if (input.cancel) {
        gameState.change(States.PLAYING);
    }
}

function updateSaveSlots() {
    if (input.upPressed) selectedSlot = (selectedSlot - 1 + 3) % 3;
    if (input.downPressed) selectedSlot = (selectedSlot + 1) % 3;
    if (input.action || input.start) {
        performSave(selectedSlot);
        gameState.change(States.PLAYING);
    }
    if (input.cancel) {
        gameState.change(States.SAVE_MENU);
    }
}

function updateRestoreSlots() {
    const slots = saveSystem.getAllSlots();
    if (input.upPressed) selectedSlot = (selectedSlot - 1 + 3) % 3;
    if (input.downPressed) selectedSlot = (selectedSlot + 1) % 3;
    if (input.action || input.start) {
        if (slots[selectedSlot]) {
            performRestore(selectedSlot);
        }
    }
    if (input.cancel) {
        gameState.change(States.SAVE_MENU);
    }
}

// ── RENDER ──

function render() {
    clearScreen();

    switch (gameState.current) {
        case States.TITLE: renderTitle(); break;
        case States.NAME_ENTRY: renderNameEntry(); break;
        case States.CHARACTER_SELECT: renderCharacterSelect(); break;
        case States.SAVE_MENU:
            renderCurrentScene();
            renderSaveMenu();
            break;
        case States.SAVE_SLOTS:
            renderCurrentScene();
            renderSaveSlots();
            break;
        case States.RESTORE_SLOTS:
            renderCurrentScene();
            renderRestoreSlots();
            break;
        case States.PLAYING:
        case States.DIALOGUE:
        case States.INVENTORY:
        case States.SHOP:
            renderCurrentScene();
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

function renderCurrentScene() {
    if (inDungeon) renderDungeonScene();
    else if (inShop) renderShopScene();
    else if (inLibrary) renderLibraryScene();
    else if (inHome) renderHomeScene();
    else if (inAlchemist) renderAlchemistScene();
    else renderTownScene();
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
    // Player arrows
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }
    // Enemy arrows (skeleton archer)
    for (const arrow of enemyArrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }
    // Dungeon chest
    if (dungeonChest) {
        entities.push({ y: dungeonChest.y + 8, render: () => {
            drawChest(ctx, dungeonChest.x, dungeonChest.y, dungeonChest.opened);
            if (!dungeonChest.opened) {
                const dist = Math.abs(player.x - dungeonChest.x) + Math.abs(player.y - dungeonChest.y);
                if (dist < 28) {
                    ctx.fillStyle = '#FFD700';
                    drawSmallText(ctx, 'Press A to open', dungeonChest.x - 40, dungeonChest.y - 28);
                }
            }
        }});
    }

    // Locked door prompt
    if (!lockedRoomOpen) {
        const DOOR_CX = (LOCKED_DOOR_COLS[0] + 1) * 32; // center of both door tiles
        const DOOR_CY = LOCKED_DOOR_ROW * 32 + 16;
        entities.push({ y: DOOR_CY + 8, render: () => {
            const doorDist = Math.abs(player.x - DOOR_CX) + Math.abs(player.y - DOOR_CY);
            if (doorDist < 55) {
                if (inventory.has('key')) {
                    ctx.fillStyle = '#FFD700';
                    drawSmallText(ctx, 'Press A to unlock', DOOR_CX - 49, DOOR_CY - 22);
                } else {
                    ctx.fillStyle = '#AA6666';
                    drawSmallText(ctx, 'Needs a key', DOOR_CX - 31, DOOR_CY - 22);
                }
            }
        }});
    }

    // Ender pearl (floating pedestal in locked room)
    if (!enderPearlPickedUp) {
        entities.push({ y: ENDER_PEARL_Y, render: () => {
            // Pedestal base
            const px = ENDER_PEARL_X;
            const py = ENDER_PEARL_Y;
            ctx.fillStyle = '#2A2050';
            ctx.fillRect(px - 12, py + 4, 24, 8);
            ctx.fillStyle = '#3A3060';
            ctx.fillRect(px - 10, py + 2, 20, 6);
            ctx.fillStyle = '#4A4070';
            ctx.fillRect(px - 8, py, 16, 4);
            // Pillar details
            ctx.fillStyle = '#AA88EE';
            ctx.fillRect(px - 11, py + 4, 2, 8);
            ctx.fillRect(px + 9, py + 4, 2, 8);
            // Magical glow beneath pearl
            ctx.fillStyle = 'rgba(140, 80, 220, 0.35)';
            ctx.fillRect(px - 10, py - 6, 20, 12);
            // Draw ender pearl sprite (8x8 at scale 2 = 16x16)
            drawItem(ctx, px - 8, py - 18, 'ender_pearl', 2);
            // Floating sparkles
            const t = Date.now() / 300;
            ctx.fillStyle = '#CC88FF';
            ctx.fillRect(px + Math.round(Math.sin(t) * 10) - 1, py - 14 + Math.round(Math.cos(t * 0.7) * 4), 2, 2);
            ctx.fillRect(px + Math.round(Math.sin(t + 2) * 8) - 1, py - 10 + Math.round(Math.cos(t * 0.9 + 1) * 4), 2, 2);
            // Interact prompt
            const epDist = Math.abs(player.x - ENDER_PEARL_X) + Math.abs(player.y - ENDER_PEARL_Y);
            if (epDist < 28) {
                ctx.fillStyle = '#CC88FF';
                drawSmallText(ctx, 'Press A to take', px - 43, py - 36);
            }
        }});
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

function renderLibraryScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, libraryMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    const entities = [];
    for (const b of libraryBreakables) {
        if (b.active) entities.push({ y: b.y + TILE_SIZE, render: () => b.render(ctx) });
    }
    for (const npc of libraryNpcs) {
        entities.push({ y: npc.y, render: () => npc.render(ctx) });
    }
    entities.push({ y: player.y, render: () => player.render(ctx) });
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    renderMap(ctx, libraryMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 2);

    ctx.restore();
    renderHUD(ctx, player);

    ctx.fillStyle = '#888';
    drawSmallText(ctx, 'Library', VIRTUAL_WIDTH / 2 - 18, 2);
}

function renderHomeScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, homeMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    const entities = [];
    for (const b of homeBreakables) {
        if (b.active) entities.push({ y: b.y + TILE_SIZE, render: () => b.render(ctx) });
    }
    for (const npc of homeNpcs) {
        entities.push({ y: npc.y, render: () => npc.render(ctx) });
    }
    entities.push({ y: player.y, render: () => player.render(ctx) });
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    renderMap(ctx, homeMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 2);

    ctx.restore();
    renderHUD(ctx, player);

    ctx.fillStyle = '#888';
    drawSmallText(ctx, "Steve's House", VIRTUAL_WIDTH / 2 - 33, 2);
}

function renderAlchemistScene() {
    const camX = camera.getDrawX();
    const camY = camera.getDrawY();

    ctx.save();
    ctx.translate(-camX, -camY);

    renderMap(ctx, alchemistMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 0);

    const entities = [];
    for (const b of alchemistBreakables) {
        if (b.active) entities.push({ y: b.y + TILE_SIZE, render: () => b.render(ctx) });
    }
    for (const npc of alchemistNpcs) {
        entities.push({ y: npc.y, render: () => npc.render(ctx) });
    }
    entities.push({ y: player.y, render: () => player.render(ctx) });
    for (const drop of drops) {
        if (drop.active) entities.push({ y: drop.y, render: () => renderDrop(ctx, drop) });
    }
    for (const arrow of arrows) {
        if (arrow.active) entities.push({ y: arrow.y, render: () => drawArrow(ctx, arrow.x, arrow.y, arrow.facing) });
    }

    entities.sort((a, b) => a.y - b.y);
    for (const ent of entities) ent.render();

    renderMap(ctx, alchemistMap, camX, camY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, 2);

    ctx.restore();
    renderHUD(ctx, player);

    ctx.fillStyle = '#BB88FF';
    drawSmallText(ctx, "Zara's Workshop", VIRTUAL_WIDTH / 2 - 42, 2);
}

function renderDrop(ctx, drop) {
    if (drop.type === 'emerald') {
        ctx.fillStyle = '#2D8B46';
        ctx.fillRect(drop.x - 3, drop.y - 2, 6, 1);
        ctx.fillRect(drop.x - 4, drop.y - 1, 8, 3);
        ctx.fillRect(drop.x - 3, drop.y + 2, 6, 1);
        ctx.fillStyle = '#5FD394';
        ctx.fillRect(drop.x - 2, drop.y - 1, 4, 2);
    } else if (drop.type === 'heart') {
        // Heart shape pixel art
        const c = drop.amount >= 2 ? '#CC2222' : '#CC7777'; // full=red, half=pink
        ctx.fillStyle = c;
        ctx.fillRect(drop.x - 4, drop.y - 2, 3, 3);
        ctx.fillRect(drop.x + 1, drop.y - 2, 3, 3);
        ctx.fillRect(drop.x - 5, drop.y - 1, 10, 3);
        ctx.fillRect(drop.x - 4, drop.y + 2, 8, 2);
        ctx.fillRect(drop.x - 3, drop.y + 4, 6, 1);
        ctx.fillRect(drop.x - 2, drop.y + 5, 4, 1);
        ctx.fillRect(drop.x - 1, drop.y + 6, 2, 1);
        if (drop.amount >= 2) {
            ctx.fillStyle = '#FF6666';
            ctx.fillRect(drop.x - 3, drop.y - 1, 2, 2);
        }
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

function renderNameEntry() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Starfield
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 20; i++) {
        const seed = i * 7919;
        const sx = (seed * 13) % VIRTUAL_WIDTH;
        const sy = (seed * 17) % (VIRTUAL_HEIGHT - 40);
        if (Math.sin(titleTimer * 0.05 + i) > 0.3) ctx.fillRect(sx, sy, 1, 1);
    }

    if (nameEntryTyping) {
        renderNameEntryTyping();
    } else {
        renderNameEntrySlots();
    }
}

function renderNameEntrySlots() {
    const slots = saveSystem.getAllSlots();

    ctx.fillStyle = '#fff';
    drawSmallText(ctx, 'Select Save Slot', VIRTUAL_WIDTH / 2 - 48, 10);
    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'Choose a slot for your adventure', VIRTUAL_WIDTH / 2 - 93, 19);

    for (let i = 0; i < 3; i++) {
        const slotData = slots[i];
        const isSelected = i === nameEntrySelectedSlot;
        const boxY = 32 + i * 33;
        const boxX = 12;
        const boxW = VIRTUAL_WIDTH - 24;
        const boxH = 29;

        ctx.fillStyle = isSelected ? '#2a2a50' : '#1e1e38';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = isSelected ? '#ffcc00' : '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = isSelected ? '#ffcc00' : '#888';
        drawSmallText(ctx, 'SLOT ' + (i + 1), boxX + 6, boxY + 5);

        if (nameEntryEraseSlot === i) {
            // Erase confirmation state
            ctx.strokeStyle = '#CC3333';
            ctx.lineWidth = 1;
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.fillStyle = '#CC3333';
            drawSmallText(ctx, 'ERASE SAVE? A:Confirm  B:Cancel', boxX + 6, boxY + 12);
        } else if (slotData) {
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            drawSmallText(ctx, slotData.name, boxX + 6, boxY + 15);
            const loc = slotData.inDungeon ? 'Mine' : (slotData.inShop ? 'Shop' : 'Town');
            ctx.fillStyle = '#3CB371';
            drawSmallText(ctx, String(slotData.emeralds) + 'em', boxX + boxW - 30, boxY + 15);
            ctx.fillStyle = '#888';
            drawSmallText(ctx, loc, boxX + boxW - 60, boxY + 15);
            ctx.fillStyle = '#4CAF50';
            drawSmallText(ctx, '(LOAD)', boxX + 6 + (slotData.name.length * 6) + 6, boxY + 15);
        } else {
            ctx.fillStyle = '#555';
            drawSmallText(ctx, '(Empty)', boxX + 6, boxY + 15);
        }
    }

    ctx.fillStyle = '#555';
    if (nameEntryEraseSlot >= 0) {
        drawSmallText(ctx, 'A:Confirm Erase  B:Cancel', VIRTUAL_WIDTH / 2 - 75, VIRTUAL_HEIGHT - 10);
    } else {
        drawSmallText(ctx, 'A:Select  B:Erase  X:Back', VIRTUAL_WIDTH / 2 - 75, VIRTUAL_HEIGHT - 10);
    }
}

function renderNameEntryTyping() {
    // Slot header
    ctx.fillStyle = '#ffcc00';
    drawSmallText(ctx, 'SLOT ' + (nameEntrySelectedSlot + 1) + ' - ENTER YOUR NAME', 10, 8);

    // Name input box
    const boxX = 10, boxY = 20, boxW = VIRTUAL_WIDTH - 20, boxH = 18;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const cursor = Math.floor(titleTimer / 15) % 2 === 0 ? '_' : ' ';
    ctx.fillStyle = '#fff';
    drawSmallText(ctx, nameEntryText + cursor, boxX + 6, boxY + 6);

    const countColor = nameEntryText.length >= 10 ? '#CC3333' : '#555';
    ctx.fillStyle = countColor;
    drawSmallText(ctx, String(nameEntryText.length) + '/10', boxX + boxW - 24, boxY + 6);

    // On-screen keyboard
    renderOnscreenKeyboard();

    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'D-Pad:Navigate  A:Select  X:Back', VIRTUAL_WIDTH / 2 - 96, VIRTUAL_HEIGHT - 10);
}

function renderOnscreenKeyboard() {
    const keys = getKbKeys();
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isFlash = kbFlashKey === key.code && kbFlashTimer > 0;
        const isCursor = i === kbCursorIndex;
        const isOk = key.code === 'Enter';
        const isCancel = key.code === 'Cancel';
        const isDel = key.code === 'Backspace';

        // Background
        if (isFlash) {
            ctx.fillStyle = isOk ? '#6FCF72' : (isCancel ? '#CC5555' : '#7777BB');
        } else if (isCursor) {
            ctx.fillStyle = isOk ? '#2a6a2a' : (isCancel ? '#5a2525' : '#4a4a88');
        } else if (isOk) {
            ctx.fillStyle = '#1a4a1a';
        } else if (isCancel) {
            ctx.fillStyle = '#3a1515';
        } else {
            ctx.fillStyle = '#1e1e3a';
        }
        ctx.fillRect(key.x, key.y, key.w, key.h);

        // Border
        ctx.strokeStyle = isFlash ? '#fff' : (isCursor ? '#ffcc00' : (isOk ? '#3CB371' : (isCancel ? '#885555' : '#444')));
        ctx.lineWidth = 1;
        ctx.strokeRect(key.x, key.y, key.w, key.h);

        // Label
        ctx.fillStyle = isFlash ? '#000' : (isCursor ? '#ffcc00' : (isOk ? '#3CB371' : (isDel || isCancel ? '#AA8888' : '#ccc')));
        const labelX = Math.floor(key.x + key.w / 2 - key.label.length * 3);
        const labelY = Math.floor(key.y + (key.h - 6) / 2);
        drawSmallText(ctx, key.label, labelX, labelY);
    }
}

function renderSaveMenu() {
    const menuW = 110, menuH = 70;
    const menuX = VIRTUAL_WIDTH / 2 - menuW / 2;
    const menuY = VIRTUAL_HEIGHT / 2 - menuH / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1;
    ctx.strokeRect(menuX, menuY, menuW, menuH);

    ctx.fillStyle = '#fff';
    drawSmallText(ctx, 'GAME MENU', menuX + menuW / 2 - 27, menuY + 7);

    const options = ['Save Game', 'Restore', 'Cancel'];
    for (let i = 0; i < options.length; i++) {
        const y = menuY + 22 + i * 14;
        if (i === saveMenuOption) {
            ctx.fillStyle = '#333355';
            ctx.fillRect(menuX + 6, y - 2, menuW - 12, 12);
            ctx.fillStyle = '#ffcc00';
            drawSmallText(ctx, '>', menuX + 10, y);
        } else {
            ctx.fillStyle = '#aaa';
        }
        drawSmallText(ctx, options[i], menuX + 20, y);
    }

    ctx.fillStyle = '#555';
    drawSmallText(ctx, 'Z:Select  X:Cancel', menuX + 8, menuY + menuH - 12);
}

function renderSaveSlots() {
    const slots = saveSystem.getAllSlots();
    renderSlotPicker(slots, 'Save to Slot', false);
}

function renderRestoreSlots() {
    const slots = saveSystem.getAllSlots();
    renderSlotPicker(slots, 'Restore from Slot', true);
}

function renderSlotPicker(slots, title, restoreMode) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const boxW = VIRTUAL_WIDTH - 24;
    const boxH = VIRTUAL_HEIGHT - 24;
    const boxX = 12;
    const boxY = 12;

    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#fff';
    drawSmallText(ctx, title, boxX + boxW / 2 - title.length * 3, boxY + 7);

    for (let i = 0; i < 3; i++) {
        const slotData = slots[i];
        const isSelected = i === selectedSlot;
        const slotBoxY = boxY + 20 + i * 30;
        const slotBoxX = boxX + 6;
        const slotBoxW = boxW - 12;
        const slotBoxH = 26;
        const isEmpty = !slotData;
        const greyOut = restoreMode && isEmpty;

        ctx.fillStyle = isSelected && !greyOut ? '#2a2a50' : '#1e1e38';
        ctx.fillRect(slotBoxX, slotBoxY, slotBoxW, slotBoxH);
        ctx.strokeStyle = isSelected && !greyOut ? '#ffcc00' : (greyOut ? '#333' : '#444');
        ctx.lineWidth = 1;
        ctx.strokeRect(slotBoxX, slotBoxY, slotBoxW, slotBoxH);

        ctx.fillStyle = greyOut ? '#444' : (isSelected ? '#ffcc00' : '#888');
        drawSmallText(ctx, 'SLOT ' + (i + 1), slotBoxX + 5, slotBoxY + 4);

        if (slotData) {
            ctx.fillStyle = greyOut ? '#555' : (isSelected ? '#fff' : '#aaa');
            drawSmallText(ctx, slotData.name, slotBoxX + 5, slotBoxY + 14);
            const loc = slotData.inDungeon ? 'Mine' : (slotData.inShop ? 'Shop' : 'Town');
            ctx.fillStyle = '#3CB371';
            drawSmallText(ctx, String(slotData.emeralds) + 'em', slotBoxX + slotBoxW - 30, slotBoxY + 14);
            ctx.fillStyle = '#888';
            drawSmallText(ctx, loc, slotBoxX + slotBoxW - 60, slotBoxY + 14);
        } else {
            ctx.fillStyle = '#444';
            drawSmallText(ctx, restoreMode ? '(No save)' : '(Empty)', slotBoxX + 5, slotBoxY + 14);
        }
    }

    if (restoreMode) {
        ctx.fillStyle = '#555';
        drawSmallText(ctx, 'Up/Down:Select  Enter:Load  X:Back', boxX + 6, boxY + boxH - 12);
    } else {
        ctx.fillStyle = '#555';
        drawSmallText(ctx, 'Up/Down:Select  Enter:Save  X:Back', boxX + 6, boxY + boxH - 12);
    }
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
