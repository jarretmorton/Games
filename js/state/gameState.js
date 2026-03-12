export const States = {
    TITLE: 'TITLE',
    CHARACTER_SELECT: 'CHARACTER_SELECT',
    PLAYING: 'PLAYING',
    DIALOGUE: 'DIALOGUE',
    INVENTORY: 'INVENTORY',
    SHOP: 'SHOP',
    DUNGEON: 'DUNGEON',
    PUZZLE_COMPLETE: 'PUZZLE_COMPLETE',
    PAUSED: 'PAUSED'
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
