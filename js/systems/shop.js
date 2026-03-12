import { shopItems } from '../data/items.js';
import { player } from '../entities/player.js';
import { inventory } from './inventory.js';

export const shop = {
    items: shopItems,
    selectedIndex: 0,
    message: '',
    messageTimer: 0,

    open() {
        this.selectedIndex = 0;
        this.message = '';
        this.messageTimer = 0;
    },

    moveSelection(dir) {
        this.selectedIndex += dir;
        if (this.selectedIndex < 0) this.selectedIndex = this.items.length - 1;
        if (this.selectedIndex >= this.items.length) this.selectedIndex = 0;
    },

    buy() {
        const item = this.items[this.selectedIndex];
        if (!item) return;

        if (inventory.has(item.id)) {
            this.message = 'Already owned!';
            this.messageTimer = 60;
            return;
        }

        if (player.emeralds < item.cost) {
            this.message = 'Not enough emeralds!';
            this.messageTimer = 60;
            return;
        }

        player.emeralds -= item.cost;
        inventory.add(item);
        this.message = 'Purchased ' + item.name + '!';
        this.messageTimer = 60;
    },

    update() {
        if (this.messageTimer > 0) this.messageTimer--;
    }
};
