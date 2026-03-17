const SAVE_KEY_PREFIX = 'zcraft_save_';
const NUM_SLOTS = 3;

function getSaveKey(slot) {
    return SAVE_KEY_PREFIX + slot;
}

export const saveSystem = {
    getSlot(slot) {
        const raw = localStorage.getItem(getSaveKey(slot));
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    getAllSlots() {
        const slots = [];
        for (let i = 0; i < NUM_SLOTS; i++) {
            slots.push(this.getSlot(i));
        }
        return slots;
    },

    save(slot, data) {
        localStorage.setItem(getSaveKey(slot), JSON.stringify(data));
    },

    clearSlot(slot) {
        localStorage.removeItem(getSaveKey(slot));
    }
};
