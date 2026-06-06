export const TILE_SIZE = 32;

// Tile IDs
export const T = {
    GRASS: 0,
    DIRT_PATH: 1,
    STONE_FLOOR: 2,
    WATER: 3,
    WALL_STONE: 4,
    WALL_WOOD: 5,
    TREE_TRUNK: 6,
    TREE_TOP: 7,       // overhead layer
    FENCE: 8,
    DOOR_SHOP: 9,
    DOOR_HOUSE: 10,
    COBBLESTONE: 11,
    SAND: 12,
    FLOWER_RED: 13,
    FLOWER_YELLOW: 14,
    WELL: 15,
    FOUNTAIN: 16,
    ROOF_WOOD: 17,     // overhead layer
    ROOF_STONE: 18,    // overhead layer
    DUNGEON_ENTRANCE: 19,
    DUNGEON_BLOCKED: 20,
    PRESSURE_PLATE: 21,
    STONE_TABLET: 22,
    BOOKSHELF: 23,
    CHURCH_WALL: 24,
    CHURCH_WINDOW: 25,
    DARK_GRASS: 26,
    BRIDGE: 27,
    SIGN: 28,
    TORCH: 29,
    DUNGEON_WALL: 30,
    DUNGEON_FLOOR: 31,
    SHOP_WALL: 32,
    SHOP_FLOOR: 33,
    SHOP_SHELF: 34,
    CRAFTING_TABLE: 35,
    SHOP_DESK: 36,
    SKELETON_CAGE: 37,
    LOCKED_DOOR: 38,
    FANCY_FLOOR: 39,
    DOOR_LIBRARY: 40,
    DOOR_HOME: 41,
    BED: 42,
    FURNACE: 43,
    ENCHANTING_TABLE: 44,
    SECRET_BUSH: 45,
    LECTERN: 46,
    DOOR_ALCH: 47,

    // ── L2 Lush Caverns (reserved block 48–63, docs/LEVEL_SPEC.md §6) ──
    MOSS_FLOOR: 48,       // walkable mossy cave floor (the L2 base floor)
    MOSS_WALL: 49,        // mossy cave wall (solid)
    CAVE_WATER: 50,       // deep cave water — solid barrier, grapple over it
    CHASM: 51,            // bottomless gap — solid barrier, grapple over it
    GLOW_BERRY: 52,       // glowing berry vines on the wall (solid decor)
    DRIPLEAF: 53,         // big dripleaf — walkable traversal platform
    VINE: 54,             // hanging vines (walkable, decorative)
    HOOK_ANCHOR: 55,      // grapple target — solid, the hook latches onto it
    CLAY: 56,             // clay block floor accent (walkable)
    LUSH_EXIT: 57,        // (reserved) forward exit to deep_dark — deferred until L3
    LUSH_ROCK: 58,        // pushable boulder — the L2 exit; shove it to open the mine
    LUSH_SECRET: 59,      // hidden glow-berry stash (looks like wall; +emeralds once)
    MINE_HOLE: 60,        // passage punched in the mine's right wall (L1<->L2 link)
};

export const tileProps = {
    [T.GRASS]:            { solid: false, color: '#5B8731', color2: '#4A7628' },
    [T.DIRT_PATH]:        { solid: false, color: '#8B6914', color2: '#7A5C12' },
    [T.STONE_FLOOR]:      { solid: false, color: '#808080', color2: '#707070' },
    [T.WATER]:            { solid: true,  color: '#3366CC', color2: '#2255BB', animated: true },
    [T.WALL_STONE]:       { solid: true,  color: '#6B6B6B', color2: '#5A5A5A' },
    [T.WALL_WOOD]:        { solid: true,  color: '#6B4226', color2: '#5A3520' },
    [T.TREE_TRUNK]:       { solid: true,  color: '#4A3728', color2: '#3D2D20' },
    [T.TREE_TOP]:         { solid: false, color: '#2D5A1E', color2: '#1E4A12', overhead: true },
    [T.FENCE]:            { solid: true,  color: '#8B7355', color2: '#7A6348' },
    [T.DOOR_SHOP]:        { solid: false, color: '#4A3728', color2: '#3D2D20', interact: 'shop' },
    [T.DOOR_HOUSE]:       { solid: false, color: '#4A3728', color2: '#3D2D20' },
    [T.COBBLESTONE]:      { solid: false, color: '#707070', color2: '#606060' },
    [T.SAND]:             { solid: false, color: '#D4B896', color2: '#C4A886' },
    [T.FLOWER_RED]:       { solid: false, color: '#5B8731', color2: '#4A7628', decor: '#CC3333' },
    [T.FLOWER_YELLOW]:    { solid: false, color: '#5B8731', color2: '#4A7628', decor: '#CCCC33' },
    [T.WELL]:             { solid: true,  color: '#6B6B6B', color2: '#555555', interact: 'well' },
    [T.FOUNTAIN]:         { solid: true,  color: '#3366CC', color2: '#2255BB', animated: true },
    [T.ROOF_WOOD]:        { solid: false, color: '#8B4513', color2: '#7A3A0E', overhead: true },
    [T.ROOF_STONE]:       { solid: false, color: '#5A5A5A', color2: '#4A4A4A', overhead: true },
    [T.DUNGEON_ENTRANCE]: { solid: false, color: '#1A1A1A', color2: '#0D0D0D' },
    [T.DUNGEON_BLOCKED]:  { solid: true,  color: '#4A4A4A', color2: '#3A3A3A' },
    [T.PRESSURE_PLATE]:   { solid: false, color: '#707070', color2: '#606060', decor: '#993333' },
    [T.STONE_TABLET]:     { solid: true,  color: '#6B6B6B', color2: '#5A5A5A', interact: 'tablet' },
    [T.BOOKSHELF]:        { solid: true,  color: '#6B4226', color2: '#5A3520', interact: 'bookshelf' },
    [T.CHURCH_WALL]:      { solid: true,  color: '#808080', color2: '#6B6B6B' },
    [T.CHURCH_WINDOW]:    { solid: true,  color: '#4488CC', color2: '#CC4444' },
    [T.DARK_GRASS]:       { solid: false, color: '#3D6B22', color2: '#2D5A15' },
    [T.BRIDGE]:           { solid: false, color: '#6B4226', color2: '#5A3520' },
    [T.SIGN]:             { solid: true,  color: '#6B4226', color2: '#5A3520', interact: 'sign' },
    [T.TORCH]:            { solid: false, color: '#333333', color2: '#222222', decor: '#FF8800' },
    [T.DUNGEON_WALL]:     { solid: true,  color: '#3A3A3A', color2: '#2A2A2A' },
    [T.DUNGEON_FLOOR]:    { solid: false, color: '#4A4A4A', color2: '#3D3D3D' },
    [T.SHOP_WALL]:        { solid: true,  color: '#6B4226', color2: '#5A3520' },
    [T.SHOP_FLOOR]:       { solid: false, color: '#8B6914', color2: '#7A5C12' },
    [T.SHOP_SHELF]:       { solid: true,  color: '#6B4226', color2: '#5A3520', interact: 'shop_shelf' },
    [T.CRAFTING_TABLE]:   { solid: true,  color: '#8B5A2B', color2: '#6B4226', interact: 'crafting_table' },
    [T.SHOP_DESK]:        { solid: true,  color: '#6B4226', color2: '#5A3520' },
    [T.SKELETON_CAGE]:    { solid: true,  color: '#8B6914', color2: '#7A5C12' },
    [T.LOCKED_DOOR]:      { solid: true,  color: '#2A1A0A', color2: '#1A0A00' },
    [T.FANCY_FLOOR]:      { solid: false, color: '#1A1630', color2: '#120E24' },
    [T.DOOR_LIBRARY]:     { solid: false, color: '#4A3728', color2: '#3D2D20', interact: 'library' },
    [T.DOOR_HOME]:        { solid: false, color: '#4A3728', color2: '#3D2D20', interact: 'home' },
    [T.BED]:              { solid: true,  color: '#CC4444', color2: '#AA2222' },
    [T.FURNACE]:          { solid: true,  color: '#555555', color2: '#444444' },
    [T.ENCHANTING_TABLE]: { solid: true,  color: '#330066', color2: '#220044', interact: 'enchanting_table' },
    [T.SECRET_BUSH]:      { solid: false, color: '#2D5A1E', color2: '#1E4A12', interact: 'secret_bush' },
    [T.LECTERN]:          { solid: true,  color: '#7A5C12', color2: '#6B4226', interact: 'lectern' },
    [T.DOOR_ALCH]:        { solid: false, color: '#3D1A5A', color2: '#2A1040', interact: 'alchemist' },

    // ── L2 Lush Caverns ──
    [T.MOSS_FLOOR]:       { solid: false, color: '#3D6B22', color2: '#2D5A1E' },
    [T.MOSS_WALL]:        { solid: true,  color: '#2D4A1E', color2: '#1E3514' },
    [T.CAVE_WATER]:       { solid: true,  color: '#2E6B6B', color2: '#1E5252', animated: true },
    [T.CHASM]:            { solid: true,  color: '#0E140E', color2: '#070A07' },
    [T.GLOW_BERRY]:       { solid: true,  color: '#2D4A1E', color2: '#1E3514', decor: '#E8A23D' },
    [T.DRIPLEAF]:         { solid: false, color: '#3A7A5A', color2: '#2D6048' },
    [T.VINE]:             { solid: false, color: '#3D6B22', color2: '#2D5A1E', decor: '#4A8B2E' },
    [T.HOOK_ANCHOR]:      { solid: true,  color: '#5A4630', color2: '#473522' },
    [T.CLAY]:             { solid: false, color: '#9A7A5A', color2: '#856848' },
    [T.LUSH_EXIT]:        { solid: false, color: '#1A2E1A', color2: '#0D1A0D', interact: 'lush_exit' },
    [T.LUSH_ROCK]:        { solid: true,  color: '#5A5246', color2: '#46402F', interact: 'lush_rock' },
    [T.LUSH_SECRET]:      { solid: true,  color: '#2D4A1E', color2: '#1E3514', interact: 'lush_secret' },
    [T.MINE_HOLE]:        { solid: false, color: '#0E140E', color2: '#070A07' },
};
