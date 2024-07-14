const MIDI_START = 21;
const MIDI_END = 127;
const A4Midi = 69;
const A4Hz = 440;
//const NoteNames = [
//  "C",
//  "C#",
//  "D",
//  "D#",
//  "E",
//  "F",
//  "F#",
//  "G",
//  "G#",
//  "A",
//  "A#",
//  "B"
//];
const NoteNames = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
];
// Clef type to line number of A4 (440hz)
const ClefPitchRef = new Map([
    ["treble", 16],
    ["bass", 3],
]);
// midiNumber = the integer assigned to the note value, A4 = 69 = 440hz
function calcPitch(midiNumber) {
    return Math.floor(A4Hz * Math.pow(2, ((midiNumber - A4Midi) / 12)) * 1000) / 1000;
}
function ReturnLineFromMidi(clef, midi, staff = 0) {
    let onNote = 0; // A note entry in NoteNames array
    let a4Midi = 69;
    let accidental = 0;
    const a4Line = staff === 0 ? 16 : 34;
    let line = a4Line;
    if (midi === a4Midi) {
        return a4Line;
    }
    if (midi > a4Midi) {
        for (let i = a4Midi; i < midi; i++) {
            console.log("starting");
            console.log(NoteNames[onNote]);
            if (NoteNames[onNote] === "C" || NoteNames[onNote] === "F") {
                line -= 0;
                if (onNote === 0) {
                    onNote = NoteNames.length - 1;
                }
                else {
                    onNote -= 1;
                }
            }
            else {
                line -= 1;
                onNote -= 1;
            }
        }
    }
    else if (a4Midi > midi) {
        for (let i = a4Midi; i > midi; i--) {
            console.log("starting");
            console.log(NoteNames[onNote]);
            if (NoteNames[onNote] === "B" || NoteNames[onNote] === "E") {
                line += 0;
                if (onNote === NoteNames.length - 1) {
                    onNote = 0;
                }
                else {
                    onNote += 1;
                }
            }
            else {
                line += 1;
                onNote += 1;
            }
        }
    }
    console.log("midiNote: ", midi);
    console.log("line: ", line);
    console.log("accidental");
    return line;
}
function ReturnMidiNumber(clef, line, acc = 0, staff = 0) {
    let onNote = 0; // A entry in NoteNames array
    let a4line = ClefPitchRef.get(clef);
    if (staff === 1) {
        a4line = 34;
    }
    else {
        a4line = 16;
    }
    let midiNumber = 69;
    let midiNote = midiNumber;
    if (line === a4line) {
        return midiNumber + acc;
    }
    else if (line > a4line) {
        for (let i = a4line; i < line; i++) {
            if (NoteNames[onNote] === "C" || NoteNames[onNote] === "F") {
                midiNote -= 1;
                onNote -= 1;
            }
            else {
                if (onNote === 0) {
                    onNote = NoteNames.length - 2;
                }
                else {
                    onNote -= 2;
                }
                midiNote -= 2;
            }
        }
    }
    else {
        for (let i = a4line; i > line; i--) {
            console.log("midiNote+1");
            if (NoteNames[onNote] === "B" || NoteNames[onNote] === "E") {
                midiNote += 1;
                if (onNote === NoteNames.length - 1) {
                    onNote = 0;
                }
                else {
                    onNote += 1;
                }
            }
            else {
                midiNote += 2;
                onNote += 2;
            }
        }
    }
    midiNote += acc;
    return midiNote;
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
        if (line <= 0) {
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
function nextLineCounter(counter) {
    let next = counter + 1;
    if (counter + 1 > 11) {
        next = 0;
    }
    return next;
}
function GeneratePitchMap() {
    let map = new Map();
    let midiMap = new Map();
    let noteNameCount = 0;
    let noteNumberCount = 0;
    let lineNum = 16 + 30 - 1;
    let lineCounter = 0;
    let lineMax = 11;
    for (let n = MIDI_START; n <= MIDI_END; n++) {
        if (noteNameCount >= NoteNames.length) {
            noteNameCount = 0;
            noteNumberCount++;
        }
        lineNum = [0, 2, 3, 5, 7, 8, 10].includes(lineCounter) ? lineNum - 1 : lineNum;
        map.set((NoteNames[noteNameCount] + noteNumberCount).toString(), calcPitch(n));
        midiMap.set(n, {
            NoteString: (NoteNames[noteNameCount] + noteNumberCount).toString(),
            Frequency: calcPitch(n),
            Line: lineNum,
            Accidental: NoteNames[noteNameCount].includes("#") ? 1 : 0,
        });
        noteNameCount++;
        if (lineCounter >= lineMax) {
            lineCounter = 0;
        }
        else {
            lineCounter++;
        }
    }
    return midiMap;
}
export { GeneratePitchMap, ReturnMidiNumber, ReturnLineFromMidi };
