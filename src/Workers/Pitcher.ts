const MIDI_START = 21;
const MIDI_C_START = 24;
const MIDI_END = 127;

const A4Midi: number = 69;
const A4Hz: number = 440;

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

const NoteNamesC = [
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
  "B",
];


// Clef type to line number of A4 (440hz)
const ClefPitchRef: Map<string, number> = new Map<string, number>([
  ["treble", 16],
  ["bass", 4],
]);

// midiNumber = the integer assigned to the note value, A4 = 69 = 440hz
function calcPitch(midiNumber: number): number {
  return (
    Math.floor(A4Hz * Math.pow(2, (midiNumber - A4Midi) / 12) * 1000) / 1000
  );
}

function ReturnLineFromMidi(
  clef: string,
  midi: number,
  staff: number = 0,
): number {
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
      if (NoteNames[onNote] === "C" || NoteNames[onNote] === "F") {
        line -= 0;
        if (onNote === 0) {
          onNote = NoteNames.length - 1;
        } else {
          onNote -= 1;
        }
      } else {
        line -= 1;
        onNote -= 1;
      }
    }
  } else if (a4Midi > midi) {
    for (let i = a4Midi; i > midi; i--) {
      if (NoteNames[onNote] === "B" || NoteNames[onNote] === "E") {
        line += 0;
        if (onNote === NoteNames.length - 1) {
          onNote = 0;
        } else {
          onNote += 1;
        }
      } else {
        line += 1;
        onNote += 1;
      }
    }
  }
  return line;
}

function ReturnMidiNumber(
  clef: string,
  line: number,
  acc: number = 0,
  staff: number = 0,
): number {
  let onNote = 0; // A entry in NoteNames array
  let a4line = ClefPitchRef.get(clef);
  let midiNumber = 69;
  let midiNote = midiNumber;
  if (line === a4line) {
    return midiNumber + acc;
  } else if (line > a4line) {
    for (let i = a4line; i < line; i++) {
      if (NoteNames[onNote] === "C" || NoteNames[onNote] === "F") {
        midiNote -= 1;
        onNote -= 1;
      } else {
        if (onNote === 0) {
          onNote = NoteNames.length - 2;
        } else {
          onNote -= 2;
        }
        midiNote -= 2;
      }
    }
  } else {
    for (let i = a4line; i > line; i--) {
      if (NoteNames[onNote] === "B" || NoteNames[onNote] === "E") {
        midiNote += 1;
        if (onNote === NoteNames.length - 1) {
          onNote = 0;
        } else {
          onNote += 1;
        }
      } else {
        midiNote += 2;
        onNote += 2;
      }
    }
  }

  midiNote += acc;

  return midiNote;
}

function ReturnFrequency(clef: string, line: number): number {
  const a4line = ClefPitchRef.get(clef);
  let diff = 0;
  let midiNumber = 69;
  if (line === a4line) {
    return A4Hz;
  }

  if (line > a4line) {
    diff = line - a4line;
    midiNumber += diff;
  } else {
    if (line <= 0) {
      diff = a4line - line;
      midiNumber -= diff;
    } else {
      diff = a4line + -line;
      midiNumber -= diff;
    }
  }

  return calcPitch(midiNumber);
}

type MappedMidi = {
  NoteString: string;
  Frequency: number;
  // only for treble clef atm
  Line: number;
  Accidental: number;
};

function nextLineCounter(counter: number): number {
  let next = counter + 1;
  if (counter + 1 > 11) {
    next = 0;
  }
  return next;
}

function GeneratePitchMap(): Map<number, MappedMidi> {
  let map = new Map<string, number>();
  let midiMap = new Map<number, MappedMidi>();
  let noteNameCount = 0;
  let noteNumberCount = 1;
  let lineNum = 16 + 30 - 3;
  let lineCounter = 0;
  let lineMax = 11;
  for (let n = MIDI_C_START; n <= MIDI_END; n++) {
    if (noteNameCount >= NoteNamesC.length) {
      noteNameCount = 0;
      noteNumberCount++;
    }
    lineNum = [0, 2, 3, 5, 7, 8, 10].includes(lineCounter)
      ? lineNum - 1
      : lineNum;
    map.set(
      (NoteNamesC[noteNameCount] + noteNumberCount).toString(),
      calcPitch(n),
    );
    midiMap.set(n, {
      NoteString: (NoteNamesC[noteNameCount] + noteNumberCount).toString(),
      Frequency: calcPitch(n),
      Line: lineNum,
      Accidental: NoteNamesC[noteNameCount].includes("#") ? 1 : 0,
    });
    noteNameCount++;

    if (lineCounter >= lineMax) {
      lineCounter = 0;
    } else {
      lineCounter++;
    }
  }
  console.log("midiMap: ", midiMap);

  return midiMap;
}

function FromPitchMap(
  midiNote: number,
  map: Map<number, MappedMidi>,
  clef: string,
): MappedMidi {
  const mapped: MappedMidi = map.get(midiNote);

  let alteredNote: MappedMidi = {
    NoteString: mapped.NoteString,
    Line: mapped.Line,
    Frequency: mapped.Frequency,
    Accidental: mapped.Accidental,
  };

  // if the clef is not a treble clef we need to alter the line returned by a
  // set amount
  if (clef === "bass") {
    alteredNote.Line -= 12;
  }
  return alteredNote;
}

export {
  GeneratePitchMap,
  ReturnMidiNumber,
  ReturnLineFromMidi,
  MappedMidi,
  FromPitchMap,
};
