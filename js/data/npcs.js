// NPC definitions with positions, dialogue, and palettes

export const npcData = [
    {
        id: 'farmer',
        name: 'Farmer',
        tileX: 8, tileY: 10,
        facing: 'down',
        palette: {
            hair: '#5A3520',
            skin: '#C4956A',
            eye: '#333333',
            nose: '#B0845A',
            robe: '#8B6914',
            shoe: '#444444',
        },
        dialogue: [
            "Welcome to Craftville, traveler!",
            "Watch out for the mine shaft south of town...",
            "I heard strange sounds from below ground last night.",
            "Break some grass or pots to find emeralds!",
        ]
    },
    {
        id: 'librarian',
        name: 'Librarian',
        tileX: 24, tileY: 10,
        facing: 'down',
        palette: {
            hair: '#CCCCCC',
            skin: '#C4956A',
            eye: '#333333',
            nose: '#B0845A',
            robe: '#EEEEEE',
            shoe: '#444444',
        },
        dialogue: [
            "The ancient texts speak of four pillars...",
            "Dark stones must rest upon the marks of power.",
            "Try checking the puzzle area south of the shop.",
            "The old mine entrance will only open when the pillars are set.",
        ]
    },
    {
        id: 'blacksmith',
        name: 'Blacksmith',
        tileX: 8, tileY: 13,
        facing: 'up',
        palette: {
            hair: '#1A1A1A',
            skin: '#8B6B4A',
            eye: '#333333',
            nose: '#7A5A3A',
            robe: '#555555',
            shoe: '#333333',
        },
        dialogue: [
            "I've got the finest tools in town!",
            "Visit my shop just behind me.",
            "You'll need a good sword for what's down there.",
            "Gather emeralds and come see what I've got!",
        ]
    },
    {
        id: 'wanderer',
        name: 'Wanderer',
        tileX: 30, tileY: 18,
        facing: 'left',
        palette: {
            hair: '#2D5A1E',
            skin: '#C4956A',
            eye: '#333333',
            nose: '#B0845A',
            robe: '#4A7628',
            shoe: '#3D2D20',
        },
        dialogue: [
            "I saw strange markings on the stones near the old mine...",
            "Push the dark blocks onto the glowing plates.",
            "If you get stuck, check the stone tablet to reset.",
            "I also heard there is something golden hidden in town...",
        ]
    },
];

// Library NPC - Alex the archivist (inside the library)
export const libraryNpcData = {
    id: 'archivist',
    name: 'Alex',
    tileX: 2, tileY: 3,
    facing: 'right',
    palette: {
        hair: '#CC6633',
        skin: '#C4956A',
        eye: '#4466AA',
        nose: '#B0845A',
        robe: '#5588CC',
        shoe: '#333333',
    },
    dialogue: [
        "Welcome to the Craftville library! Knowledge is power!",
        "Did you know creepers were a coding mistake? Now they're iconic.",
        "The enchanting table uses ancient Galactic Runes... untranslatable.",
        "I've been cataloguing every biome. 67 at last count!",
    ]
};

// Home NPC - Steve the villager (inside the cozy house)
export const homeNpcData = {
    id: 'steve_home',
    name: 'Steve',
    tileX: 5, tileY: 2,
    facing: 'left',
    palette: {
        hair: '#1A1A1A',
        skin: '#C4956A',
        eye: '#333333',
        nose: '#B0845A',
        robe: '#3366AA',
        shoe: '#4A3728',
    },
    dialogue: [
        "Home sweet home! Nothing like a cozy house after mining.",
        "I mined for three days straight once. Found diamonds on level 12!",
        "My furnace has been smelting iron since Tuesday. No rush.",
        "Watch out at night - creepers blew up my last house. Twice.",
    ]
};

// Shopkeeper NPC (inside the shop interior)
export const shopkeeperData = {
    id: 'shopkeeper',
    name: 'Shopkeeper',
    tileX: 1, tileY: 3,
    facing: 'right',
    palette: {
        hair: '#8B4513',
        skin: '#C4956A',
        eye: '#333333',
        nose: '#B0845A',
        robe: '#8B0000',
        shoe: '#333333',
    },
    dialogue: [
        "Welcome to my shop! Take a look around!",
        "I've got potions, weapons, and more!",
        "That skeleton? Don't worry about him... he's harmless.",
        "The golden blueberries? Sorry, those aren't for sale.",
    ]
};
