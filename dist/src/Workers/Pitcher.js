const MIDI_START = 12;
const MIDI_END = 127;
const A4Midi = 69;
const A4Hz = 440;
const NoteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];
// Clef type to line number of A4 (440hz)
const ClefPitchRef = new Map([
    ["treble", 16],
    ["bass", 16], // this is wrong and all of this only works on staff 0 for now
]);
// midiNumber = the integer assigned to the note value, A4 = 69 = 440hz
function calcPitch(midiNumber) {
    return Math.floor(A4Hz * Math.pow(2, ((midiNumber - A4Midi) / 12)) * 1000) / 1000;
}
function ReturnFrequency(clef, line) {
    const a4line = ClefPitchRef.get(clef);
    let diff = 0;
    let midiNumber = 69;
    if (line === a4line) {
        return A4Hz;
    }
    if (line > a4line) {
        diff = line - a4line;
        midiNumber += diff;
    }
    else {
        if (line >= 0) {
            diff = a4line - line;
            midiNumber -= diff;
        }
        else {
            diff = a4line + -line;
            midiNumber -= diff;
        }
    }
    return calcPitch(midiNumber);
}
function GeneratePitchMap() {
    let map = new Map();
    let noteNameCount = 0;
    let noteNumberCount = 0;
    for (let n = MIDI_START; n <= MIDI_END; n++) {
        if (noteNameCount >= NoteNames.length) {
            noteNameCount = 0;
            noteNumberCount++;
        }
        map.set((NoteNames[noteNameCount] + noteNumberCount).toString(), calcPitch(n));
        noteNameCount++;
    }
    return map;
}
export { GeneratePitchMap };
