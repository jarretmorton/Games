export const States = {
    TITLE: 'TITLE',
    NAME_ENTRY: 'NAME_ENTRY',
    CHARACTER_SELECT: 'CHARACTER_SELECT',
    PLAYING: 'PLAYING',
    DIALOGUE: 'DIALOGUE',
    INVENTORY: 'INVENTORY',
    SHOP: 'SHOP',
    DUNGEON: 'DUNGEON',
    PUZZLE_COMPLETE: 'PUZZLE_COMPLETE',
    PAUSED: 'PAUSED',
    DEAD: 'DEAD',
    SAVE_MENU: 'SAVE_MENU',
    SAVE_SLOTS: 'SAVE_SLOTS',
    RESTORE_SLOTS: 'RESTORE_SLOTS',
};

export const gameState = {
    current: States.TITLE,
    previous: null,

    change(newState) {
        this.previous = this.current;
        this.current = newState;
    },

    revert() {
        if (this.previous) {
            this.current = this.previous;
            this.previous = null;
        }
    }
};
