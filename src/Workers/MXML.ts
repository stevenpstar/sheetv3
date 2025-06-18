// Converting parsed Music XML into format Sheet can read (LoadStructure)
//
//  Temporarily redefining data structures, these should be separate or exported
//  as types from Music XML parser.

export type XMLClef = {
  Type: string;
  Staff: number;
}

export type XMLStaff = {
  Number: number;
}

export type XMLNote = {
   ID: number;
   Beat: number;
   Duration: number; // should be divided by 4 from XML value
   NoteName: string;
   Tied: boolean;
   Staff: number;
   Grace: boolean;
   Voice: number;
   Alter: number;
}

export type XMLMeasure = {
  ID: number,
  Clefs: XMLClef[],
  Staves: XMLStaff[],
  Key: string,
  TimeSignature: { top: number, bottom: number },
  Notes: XMLNote[],
};

export type XMLScore = {
  Measures: XMLMeasure[]
}
import { Clef } from "../Core/Clef.js";
import { Staff } from "../Core/Staff.js";
import { TimeSignature } from "../Core/TimeSignatures.js";
import { Bounds } from "../Types/Bounds.js";
import { LoadStructure, lMeasure, lNote } from "./Loader.js";
import { GeneratePitchMap, MappedMidi } from "./Pitcher.js";


function LoadFromMXML(score: XMLScore): LoadStructure {
  let loadedStruct: LoadStructure = { Measures: [] };
  // This could maybe be passed in instead of generated
  let pitchMap = GeneratePitchMap();
  let currentTimeSignature: { top: number, bottom: number} = { top: 4, bottom: 3 };
  let currentKeySig: string = "CMaj/Amin";
  let currentClefs: XMLClef[] = [];
  let currentStaves: XMLStaff[] = [];

  score.Measures.forEach((m: XMLMeasure, i: number) => {
    // Temporary while we are only supporting one staff/clef
    let staves = [];
    let clefs = [];
    m.Staves.forEach((s: XMLStaff) => {
      staves.push(new Staff(s.Number));
    });
    m.Clefs.forEach((c: XMLClef, i: number) => {
      clefs.push(new Clef(i, c.Type, 1, c.Staff));
    })

    if (i === 0) {
      currentClefs = clefs;
      currentStaves = staves;
    }
    if (clefs.length === 0) {
      clefs = currentClefs;
    }
    if (staves.length !== currentStaves.length) {
      // Staves should not change between measures
      staves = currentStaves;
    }
    let notes: lNote[] = [];
    if (m.TimeSignature.top !== 0 && m.TimeSignature.bottom !== 0) {
      currentTimeSignature = m.TimeSignature;
    }
    if (m.Key !== "") {
      currentKeySig = m.Key;
    }
    m.Notes.forEach((n: XMLNote) => {
      let clef_string = "treble";
      let clef = clefs.find((c: XMLClef) => c.Staff === n.Staff);
      if (clef) {
        clef_string = clef.Type;
      }
      // THIS IS BAD FOR NOW ITS OK
      let line = 0;
      pitchMap.forEach((value: MappedMidi) => {
        if (value.NoteString === n.NoteName) {
          line = value.Line;
          return;
        }
      }); 
      if (clef_string === "bass") {
        // This will be rewritten
        line -= 12;
      }
      notes.push(
        {
          ID: n.ID,
          Beat: n.Beat,
          Duration: n.Duration,
          Line: line,
          Rest: false,
          Tied: false,
          Staff: n.Staff,
          Clef: clef_string,
          Editable: true,
          Grace: false,
          Voice: 0,
          Accidental: n.Alter,
        }
      );
    });
    let lmsr: lMeasure = {
      Clefs: clefs,
      Staves: staves,
      TimeSignature: currentTimeSignature,
      KeySignature: currentKeySig,
      Notes: notes,
      Bounds: new Bounds(0,0,0,0),
      ShowClef: false,
      ShowTime: false,
    };
    loadedStruct.Measures.push(lmsr);
  });

  return loadedStruct;
}

export { LoadFromMXML };
