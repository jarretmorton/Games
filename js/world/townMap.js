import { T } from '../data/tileTypes.js';

// 40 columns x 30 rows town map
// Legend: G=grass, P=path, C=cobble, W=wall, etc.
const G = T.GRASS;
const D = T.DIRT_PATH;
const S = T.STONE_FLOOR;
const Wa = T.WATER;
const WS = T.WALL_STONE;
const WW = T.WALL_WOOD;
const TT = T.TREE_TRUNK;
const TC = T.TREE_TOP;
const FE = T.FENCE;
const DS = T.DOOR_SHOP;
const DH = T.DOOR_HOUSE;
const DL = T.DOOR_LIBRARY;
const DO = T.DOOR_HOME;
const SB = T.SECRET_BUSH;
const CB = T.COBBLESTONE;
const SA = T.SAND;
const FR = T.FLOWER_RED;
const FY = T.FLOWER_YELLOW;
const WE = T.WELL;
const FO = T.FOUNTAIN;
const RW = T.ROOF_WOOD;
const RS = T.ROOF_STONE;
const DE = T.DUNGEON_ENTRANCE;
const DB = T.DUNGEON_BLOCKED;
const PP = T.PRESSURE_PLATE;
const ST = T.STONE_TABLET;
const BS = T.BOOKSHELF;
const CW = T.CHURCH_WALL;
const CG = T.CHURCH_WINDOW;
const DG = T.DARK_GRASS;
const BR = T.BRIDGE;
const SI = T.SIGN;

export const townMap = [
    // Row 0 - Top border: trees
    [TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,G, G, G, G, G, G, TC,TT,TC,TC,TT,TC,TC,G, G, G, G, TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC],
    // Row 1 - Trees + church top
    [TC,TT,TC,TC,TT,TC,TC,G, G, G, G, G, G, CW,CW,CW,CW,CW,CW,G, G, G, G, G, G, G, G, G, TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT],
    // Row 2 - Church body
    [TC,TC,G, G, G, G, G, G, G, G, G, G, G, CW,CG,CW,CW,CG,CW,G, G, G, G, G, G, G, G, G, G, G, G, TC,TC,TT,TC,TC,TT,TC,TC,TC],
    // Row 3 - Church body + door
    [G, G, G, G, G, FR,G, G, G, G, G, G, G, CW,CW,CW,DH,CW,CW,G, G, G, G, G, G, FR,G, G, G, G, G, G, G, TC,TC,TT,TC,TC,TT,TC],
    // Row 4 - Church base + narrow gap to blueberry area
    [G, G, G, G, G, G, G, G, G, G, G, G, G, CW,CW,CW,CW,CW,CW,G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, TC,TC,TT,TC,TC,TC],
    // Row 5 - Open area north of main road
    [G, G, G, TT,TC,G, G, G, G, G, G, G, G, G, G, CB,CB,G, G, G, G, G, G, G, G, G, G, G, G, G, TT,TC,G, G, G, G, G, TC,TT,TC],
    // Row 6 - House 1 (NPC1 Farmer) top
    [G, G, G, TC,G, G, WW,WW,WW,WW,WW,G, G, G, G, CB,CB,G, G, G, G, G, WW,WW,WW,WW,WW,G, G, G, TC,G, G, G, G, G, G, G, TC,TC],
    // Row 7 - House 1 body + path + House 2 (NPC2 Librarian)
    [G, G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, CB,CB,G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, G, G, G, FY,G, G, G, G],
    // Row 8 - House 1 door + House 2 door
    [G, G, FY,G, G, G, WW,RW,RW,RW,WW,G, G, G, G, CB,CB,G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 9 - House fronts (col 8 = library door, col 24 = home door)
    [G, G, G, G, G, G, WW,WW,DL,WW,WW,G, G, G, FO,FO,FO,G, G, G, G, G, WW,WW,DO,WW,WW,G, G, G, G, G, G, G, G, G, G, FR,G, G],
    // Row 10 - Path in front of houses + fountain center
    [G, G, G, G, G, G, G, G, D, G, G, G, G, G, FO,FO,FO,G, G, G, G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 11 - Main cobblestone road
    [CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB],
    // Row 12 - Main cobblestone road
    [CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB],
    // Row 13 - Below road: shop area + well + house 3
    [G, G, G, G, G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, G, WE,G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 14 - Shop top (NPC3 Blacksmith nearby)
    [G, G, G, G, SI,G, WW,WW,WW,WW,WW,G, G, G, G, G, G, G, G, G, G, G, G, WW,WW,WW,WW,WW,G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 15 - Shop body + House 3 body
    [G, G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, G, G, G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 16 - Shop body + House 3 body
    [G, G, FR,G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, FY,G, G, G, G, G, G, WW,RW,RW,RW,WW,G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 17 - Shop door + House 3 door
    [G, G, G, G, G, G, WW,WW,DS,WW,WW,G, G, G, G, G, G, G, G, G, G, G, G, WW,WW,DH,WW,WW,G, G, G, G, G, FR,G, G, G, G, G, G],
    // Row 18 - Grass patches with breakables
    [G, G, G, G, G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 19 - Open grass area
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 20 - Puzzle area top border (opening at columns 18-19 for entry)
    [G, G, G, G, G, G, G, G, G, G, G, G, G, FE,FE,FE,FE,FE,S, S, FE,FE,FE,FE,FE,FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 21 - Puzzle area: stone floor with push blocks
    [G, G, G, G, G, G, G, G, G, G, G, G, G, FE,S, S, S, PP,S, S, PP,S, S, S, S, FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 22 - Puzzle area
    [G, G, G, G, G, G, G, G, G, G, G, G, G, FE,S, S, S, S, S, S, S, S, S, S, S, FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 23 - Puzzle area center + stone tablet
    [G, G, G, G, DB,DB,DB,G, G, G, G, G, ST,FE,S, S, S, S, S, S, S, S, S, S, S, FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 24 - Dungeon entrance (blocked)
    [G, G, G, G, DB,DE,DB,G, G, G, G, G, G, FE,S, S, PP,S, S, S, S, PP,S, S, S, FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 25 - Below dungeon + puzzle area bottom border
    [G, G, G, G, DB,DB,DB,G, G, G, G, G, G, FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 26 - Trees bottom
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 27 - Trees bottom
    [TT,TC,G, G, G, FY,G, G, G, G, G, TT,TC,G, G, G, G, G, G, G, G, G, G, G, G, G, TT,TC,G, G, G, G, G, G, FR,G, G, TT,TC,G],
    // Row 28 - Trees bottom (col 9 = secret bush hidden in forest)
    [TC,TT,TC,G, G, G, G, G, TT,SB,TC,TC,TT,TC,G, G, G, G, G, G, G, G, G, G, TT,TC,TC,TT,TC,G, G, G, G, TT,TC,TC,TC,TC,TT,TC],
    // Row 29 - Bottom border: trees
    [TC,TC,TT,TC,TC,TT,TC,TC,TC,TT,TC,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC,TT,TC,TC],
];

// Spawn point (center of town, on the cobblestone road)
export const SPAWN_X = 15 * 32 + 8;
export const SPAWN_Y = 11 * 32 + 8;

// NPC positions (tile coordinates)
export const npcPositions = [
    { id: 'farmer',      tileX: 8,  tileY: 10, facing: 'down' },
    { id: 'librarian',   tileX: 24, tileY: 10, facing: 'down' },
    { id: 'blacksmith',  tileX: 8,  tileY: 13, facing: 'up' },
    { id: 'wanderer',    tileX: 18, tileY: 19, facing: 'left' },
];

// Breakable object positions (tile coordinates)
export const breakablePositions = [
    // Grass patches around town
    { tileX: 1, tileY: 13, type: 'grass' },
    { tileX: 2, tileY: 14, type: 'grass' },
    { tileX: 3, tileY: 18, type: 'grass' },
    { tileX: 3, tileY: 19, type: 'grass' },
    { tileX: 30, tileY: 13, type: 'grass' },
    { tileX: 31, tileY: 14, type: 'grass' },
    { tileX: 32, tileY: 13, type: 'grass' },
    { tileX: 35, tileY: 18, type: 'grass' },
    { tileX: 36, tileY: 19, type: 'grass' },
    { tileX: 37, tileY: 18, type: 'grass' },
    // Pots near buildings
    { tileX: 5, tileY: 14, type: 'pot' },
    { tileX: 5, tileY: 17, type: 'pot' },
    { tileX: 12, tileY: 9, type: 'pot' },
    { tileX: 21, tileY: 9, type: 'pot' },
    { tileX: 28, tileY: 14, type: 'pot' },
    // Bushes near edges
    { tileX: 0, tileY: 19, type: 'bush' },
    { tileX: 1, tileY: 20, type: 'bush' },
    { tileX: 38, tileY: 19, type: 'bush' },
    { tileX: 39, tileY: 20, type: 'bush' },
    { tileX: 34, tileY: 6, type: 'bush' },
    // Special golden sparkle pot (contains the enchanted blueberry)
    { tileX: 18, tileY: 4, type: 'golden_pot' },
];

// Push block starting positions (tile coordinates)
// Blocks placed centrally so player can get behind them to push
export const pushBlockStartPositions = [
    { tileX: 17, tileY: 23 },  // push up 2x → plate at (17,21)
    { tileX: 20, tileY: 23 },  // push up 2x → plate at (20,21)
    { tileX: 16, tileY: 22 },  // push down 2x → plate at (16,24)
    { tileX: 21, tileY: 22 },  // push down 2x → plate at (21,24)
];

// Pressure plate positions (tile coordinates) - already in the map as PP tiles
export const pressurePlatePositions = [
    { tileX: 17, tileY: 21 },
    { tileX: 20, tileY: 21 },
    { tileX: 16, tileY: 24 },
    { tileX: 21, tileY: 24 },
];
