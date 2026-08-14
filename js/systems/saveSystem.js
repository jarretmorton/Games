const SAVE_KEY_PREFIX = 'zcraft_save_';
const NUM_SLOTS = 3;

// Save-code format marker. iOS/iPadOS gives a Home Screen web app its own
// storage container, separate from Safari's, so localStorage can never be
// shared between them. Codes are the manual bridge: export on one, import on
// the other. Bump the digit if the payload shape ever stops being readable by
// an older build.
const CODE_PREFIX = 'ZC1';

function getSaveKey(slot) {
    return SAVE_KEY_PREFIX + slot;
}

// btoa/atob only handle latin1, and player names can be any unicode, so round
// trip through UTF-8 bytes rather than passing the JSON string directly.
function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}

function fromBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

// A code gets pasted through Messages/Notes/Mail, any of which may mangle
// '+' and '/' or eat a trailing '='. base64url survives that trip.
function toBase64Url(b64) {
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code) {
    let b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return b64;
}

// Guard against pasting a truncated or unrelated string into a slot: a save
// that restores is one we can at least place the player with.
function looksLikeSave(data) {
    return !!data
        && typeof data === 'object'
        && typeof data.name === 'string'
        && Number.isFinite(data.x)
        && Number.isFinite(data.y)
        && Number.isFinite(data.health);
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
    },

    encode(data) {
        return CODE_PREFIX + '.' + toBase64Url(toBase64(JSON.stringify(data)));
    },

    decode(code) {
        const cleaned = String(code ?? '').trim().replace(/\s+/g, '');
        if (!cleaned.startsWith(CODE_PREFIX + '.')) return null;
        let data;
        try {
            data = JSON.parse(fromBase64(fromBase64Url(cleaned.slice(CODE_PREFIX.length + 1))));
        } catch {
            return null;
        }
        return looksLikeSave(data) ? data : null;
    },

    // Returns a shareable code, or null if the slot is empty.
    exportSlot(slot) {
        const data = this.getSlot(slot);
        return data ? this.encode(data) : null;
    },

    // Returns true if the code parsed and was written to the slot.
    importCode(slot, code) {
        const data = this.decode(code);
        if (!data) return false;
        this.save(slot, data);
        return true;
    },

    // Safari's ITP can evict script-writable storage — localStorage included —
    // after roughly a week without a visit, which would take saved games with
    // it. Asking for persistence is best-effort and never blocks startup.
    async requestPersistence() {
        try {
            if (!navigator.storage?.persist) return false;
            if (await navigator.storage.persisted()) return true;
            return await navigator.storage.persist();
        } catch {
            return false;
        }
    }
};
