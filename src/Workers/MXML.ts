// Converting parsed Music XML into format Sheet can read (LoadStructure)
//
//  Temporarily redefining data structures, these should be separate or exported
//  as types from Music XML parser.

export enum XMLClef {
  G,
}

type XMLNote = {
   ID: number;
   Beat: number;
   Duration: number; // should be divided by 4 from XML value
   NoteName: string;
   Tied: boolean;
   Staff: number;
   Grace: boolean;
   Voice: number;
}

type XMLMeasure = {
  ID: number,
  Clef: XMLClef,
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

  score.Measures.forEach((m: XMLMeasure, i: number) => {
    // Temporary while we are only supporting one staff/clef
    let staff: Staff = new Staff(0);
    let clef: Clef = new Clef(0, "treble", 1, 0);
    let notes: lNote[] = [];
    if (m.TimeSignature.top !== 0 && m.TimeSignature.bottom !== 0) {
      currentTimeSignature = m.TimeSignature;
    }
    if (m.Key !== "") {
      currentKeySig = m.Key;
    }
    m.Notes.forEach((n: XMLNote) => {
      // THIS IS BAD FOR NOW ITS OK
      let line = 0;
      pitchMap.forEach((value: MappedMidi) => {
        if (value.NoteString === n.NoteName) {
          line = value.Line;
          return;
        }
      }); 
      notes.push(
        {
          ID: n.ID,
          Beat: n.Beat,
          Duration: n.Duration,
          Line: line,
          Rest: false,
          Tied: false,
          Staff: 0,
          Clef: "treble",
          Editable: true,
          Grace: false,
          Voice: 0,
        }
      );
    });
    let lmsr: lMeasure = {
      Clefs: [clef],
      Staves: [staff],
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
