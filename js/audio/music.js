// Zelda/Minecraft mashup chiptune music using Web Audio API
// Combines Zelda's melodic adventure feel with Minecraft's ambient calm

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let currentTrack = null;

// Note frequencies
const NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    REST: 0
};

const BPM = 100;
const BEAT = 60 / BPM;

// Overworld theme - Zelda adventurous melody with Minecraft calm vibes
const overworldMelody = [
    // Phrase 1 - Zelda-inspired adventure motif
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.A4, dur: 1.0 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.B4, dur: 1.0 },
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.E4, dur: 1.0 }, { note: NOTE.D4, dur: 1.0 },
    // Phrase 2 - Minecraft calm descending
    { note: NOTE.E4, dur: 0.75 }, { note: NOTE.D4, dur: 0.25 },
    { note: NOTE.C4, dur: 0.5 }, { note: NOTE.D4, dur: 0.5 },
    { note: NOTE.E4, dur: 1.0 }, { note: NOTE.G4, dur: 1.0 },
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.E4, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    // Phrase 3 - Rising adventure call
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.B4, dur: 0.5 },
    { note: NOTE.C5, dur: 1.0 }, { note: NOTE.B4, dur: 0.5 },
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.G4, dur: 1.0 },
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.A4, dur: 1.5 }, { note: NOTE.REST, dur: 0.5 },
    // Phrase 4 - Gentle resolution (Minecraft style)
    { note: NOTE.G4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.D4, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.D4, dur: 1.0 }, { note: NOTE.E4, dur: 1.5 },
    { note: NOTE.REST, dur: 1.0 },
];

const overworldBass = [
    // Supportive bass following chord roots
    { note: NOTE.C3, dur: 2.0 }, { note: NOTE.G3, dur: 2.0 },
    { note: NOTE.A3, dur: 2.0 }, { note: NOTE.E3, dur: 2.0 },
    { note: NOTE.C3, dur: 2.0 }, { note: NOTE.G3, dur: 2.0 },
    { note: NOTE.A3, dur: 2.0 }, { note: NOTE.E3, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.A3, dur: 1.5 }, { note: NOTE.C3, dur: 2.0 },
    { note: NOTE.G3, dur: 2.0 }, { note: NOTE.A3, dur: 2.0 },
    { note: NOTE.C3, dur: 1.5 }, { note: NOTE.REST, dur: 1.0 },
    { note: NOTE.G3, dur: 2.0 }, { note: NOTE.C3, dur: 2.5 },
    { note: NOTE.REST, dur: 1.0 },
];

const overworldArpeggio = [
    // Minecraft-style ambient arpeggios
    { note: NOTE.C4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.G4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.G3, dur: 0.5 }, { note: NOTE.B3, dur: 0.5 },
    { note: NOTE.D4, dur: 0.5 }, { note: NOTE.B3, dur: 0.5 },
    { note: NOTE.A3, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.E3, dur: 0.5 }, { note: NOTE.G3, dur: 0.5 },
    { note: NOTE.B3, dur: 0.5 }, { note: NOTE.G3, dur: 0.5 },
    { note: NOTE.C4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.G4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.G3, dur: 0.5 }, { note: NOTE.B3, dur: 0.5 },
    { note: NOTE.D4, dur: 0.5 }, { note: NOTE.B3, dur: 0.5 },
    { note: NOTE.A3, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.A3, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.C4, dur: 0.5 }, { note: NOTE.G3, dur: 0.5 },
    { note: NOTE.E3, dur: 0.5 }, { note: NOTE.G3, dur: 0.5 },
    { note: NOTE.C4, dur: 1.0 },
    { note: NOTE.REST, dur: 1.0 },
];

// Dungeon theme - darker, more tense
const dungeonMelody = [
    { note: NOTE.E3, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.E3, dur: 0.5 }, { note: NOTE.G3, dur: 0.5 },
    { note: NOTE.A3, dur: 0.5 }, { note: NOTE.G3, dur: 1.0 },
    { note: NOTE.REST, dur: 0.5 }, { note: NOTE.F3, dur: 0.5 },
    { note: NOTE.E3, dur: 1.5 }, { note: NOTE.REST, dur: 1.0 },
    { note: NOTE.B3, dur: 0.5 }, { note: NOTE.A3, dur: 0.5 },
    { note: NOTE.G3, dur: 0.5 }, { note: NOTE.E3, dur: 0.5 },
    { note: NOTE.F3, dur: 1.0 }, { note: NOTE.E3, dur: 1.5 },
    { note: NOTE.REST, dur: 1.5 },
];

const dungeonBass = [
    { note: NOTE.E3, dur: 2.0 }, { note: NOTE.REST, dur: 1.0 },
    { note: NOTE.A3, dur: 1.5 }, { note: NOTE.G3, dur: 1.5 },
    { note: NOTE.E3, dur: 2.0 }, { note: NOTE.REST, dur: 1.5 },
    { note: NOTE.G3, dur: 1.0 }, { note: NOTE.F3, dur: 1.0 },
    { note: NOTE.E3, dur: 2.0 }, { note: NOTE.REST, dur: 1.5 },
];

// Shop theme - warm, cozy, medieval market feel
const shopMelody = [
    // Phrase 1 - Welcoming, bouncy melody
    { note: NOTE.C4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.G4, dur: 0.75 }, { note: NOTE.E4, dur: 0.25 },
    { note: NOTE.F4, dur: 0.5 }, { note: NOTE.A4, dur: 0.5 },
    { note: NOTE.G4, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    // Phrase 2 - Playful descending run
    { note: NOTE.A4, dur: 0.5 }, { note: NOTE.G4, dur: 0.5 },
    { note: NOTE.F4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.D4, dur: 0.75 }, { note: NOTE.C4, dur: 0.75 },
    { note: NOTE.REST, dur: 0.5 },
    // Phrase 3 - Rising hopeful motif
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.F4, dur: 0.5 },
    { note: NOTE.G4, dur: 0.5 }, { note: NOTE.A4, dur: 0.5 },
    { note: NOTE.G4, dur: 1.0 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.C4, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    // Phrase 4 - Gentle ending
    { note: NOTE.D4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.F4, dur: 0.5 }, { note: NOTE.E4, dur: 0.5 },
    { note: NOTE.D4, dur: 0.75 }, { note: NOTE.C4, dur: 1.25 },
    { note: NOTE.REST, dur: 1.0 },
];

const shopBass = [
    { note: NOTE.C3, dur: 2.0 }, { note: NOTE.F3, dur: 2.0 },
    { note: NOTE.G3, dur: 1.5 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.A3, dur: 1.5 }, { note: NOTE.G3, dur: 1.0 },
    { note: NOTE.F3, dur: 1.5 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.C3, dur: 2.0 }, { note: NOTE.G3, dur: 1.5 },
    { note: NOTE.F3, dur: 1.0 }, { note: NOTE.REST, dur: 0.5 },
    { note: NOTE.G3, dur: 1.5 }, { note: NOTE.C3, dur: 2.0 },
    { note: NOTE.REST, dur: 1.0 },
];

const shopArpeggio = [
    // Gentle plucked lute-like arpeggios
    { note: NOTE.C4, dur: 0.75 }, { note: NOTE.E4, dur: 0.75 },
    { note: NOTE.G4, dur: 0.75 }, { note: NOTE.REST, dur: 0.25 },
    { note: NOTE.F3, dur: 0.75 }, { note: NOTE.A3, dur: 0.75 },
    { note: NOTE.C4, dur: 0.75 }, { note: NOTE.REST, dur: 0.25 },
    { note: NOTE.G3, dur: 0.75 }, { note: NOTE.B3, dur: 0.75 },
    { note: NOTE.D4, dur: 0.75 }, { note: NOTE.REST, dur: 0.25 },
    { note: NOTE.A3, dur: 0.75 }, { note: NOTE.C4, dur: 0.75 },
    { note: NOTE.E4, dur: 0.75 }, { note: NOTE.REST, dur: 0.25 },
    { note: NOTE.F3, dur: 0.75 }, { note: NOTE.A3, dur: 0.75 },
    { note: NOTE.C4, dur: 0.75 }, { note: NOTE.REST, dur: 0.25 },
    { note: NOTE.G3, dur: 0.75 }, { note: NOTE.C4, dur: 0.75 },
    { note: NOTE.E4, dur: 0.5 }, { note: NOTE.C4, dur: 0.5 },
    { note: NOTE.REST, dur: 1.0 },
];

function initAudio() {
    if (audioCtx) return;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
}

function playNote(freq, startTime, duration, type, gainValue) {
    if (freq === 0) return; // REST
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Envelope: quick attack, sustain, release
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.02);
    gain.gain.setValueAtTime(gainValue, startTime + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, startTime + duration * 0.95);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

function scheduleTrack(melody, startTime, type, gain) {
    let time = startTime;
    let totalDuration = 0;
    for (const n of melody) {
        const dur = n.dur * BEAT;
        playNote(n.note, time, dur, type, gain);
        time += dur;
        totalDuration += dur;
    }
    return totalDuration;
}

function playLoop(melodyParts, trackId) {
    if (!audioCtx || currentTrack !== trackId) return;

    const now = audioCtx.currentTime + 0.1;
    let maxDuration = 0;

    for (const part of melodyParts) {
        const dur = scheduleTrack(part.notes, now, part.type, part.gain);
        maxDuration = Math.max(maxDuration, dur);
    }

    // Schedule next loop
    setTimeout(() => playLoop(melodyParts, trackId), (maxDuration - 0.5) * 1000);
}

export const music = {
    play(track) {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (currentTrack === track && isPlaying) return;
        this.stop();

        currentTrack = track;
        isPlaying = true;

        if (track === 'overworld') {
            playLoop([
                { notes: overworldMelody, type: 'triangle', gain: 0.4 },
                { notes: overworldBass, type: 'sine', gain: 0.25 },
                { notes: overworldArpeggio, type: 'sine', gain: 0.12 },
            ], track);
        } else if (track === 'dungeon') {
            playLoop([
                { notes: dungeonMelody, type: 'square', gain: 0.15 },
                { notes: dungeonBass, type: 'sine', gain: 0.2 },
            ], track);
        } else if (track === 'shop') {
            playLoop([
                { notes: shopMelody, type: 'triangle', gain: 0.3 },
                { notes: shopBass, type: 'sine', gain: 0.2 },
                { notes: shopArpeggio, type: 'sine', gain: 0.1 },
            ], track);
        }
    },

    stop() {
        currentTrack = null;
        isPlaying = false;
        // Fade out any currently playing notes by resetting the audio graph
        if (audioCtx && masterGain) {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
            // Restore gain after fade for next track
            setTimeout(() => {
                if (masterGain) masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            }, 200);
        }
    },

    // Call on first user interaction to unlock audio
    unlock() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
};
