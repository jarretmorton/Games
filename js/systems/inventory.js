import { player } from '../entities/player.js';

export const inventory = {
    items: [], // Array of item objects

    add(itemDef) {
        // Check if already have this item
        const existing = this.items.find(i => i.id === itemDef.id);
        if (existing) {
            // Don't add duplicates for non-stackable items
            return false;
        }
        this.items.push({ ...itemDef });
        player.inventory = this.items;
        // Auto-equip weapons and armor
        if (itemDef.type === 'weapon' || itemDef.type === 'armor') {
            this.equip(itemDef.id);
        }
        return true;
    },

    remove(itemId) {
        const idx = this.items.findIndex(i => i.id === itemId);
        if (idx >= 0) {
            this.items.splice(idx, 1);
            player.inventory = this.items;
            return true;
        }
        return false;
    },

    has(itemId) {
        return this.items.some(i => i.id === itemId);
    },

    equip(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return false;

        // Armor goes to secondary slot, weapons to primary
        if (item.type === 'armor') {
            player.secondaryItem = item;
            return true;
        } else if (item.type === 'weapon') {
            player.equippedItem = item;
            return true;
        }
        return false;
    },

    reset() {
        this.items = [];
        player.inventory = this.items;
        player.equippedItem = null;
        player.secondaryItem = null;
    }
};
