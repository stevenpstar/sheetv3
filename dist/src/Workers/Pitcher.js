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
// midiNumber = the integer assigned to the note value, A4 = 69 = 440hz
function calcPitch(midiNumber) {
    return Math.floor(A4Hz * Math.pow(2, ((midiNumber - A4Midi) / 12)) * 1000) / 1000;
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
