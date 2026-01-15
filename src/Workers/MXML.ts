// Converting parsed Music XML into format Sheet can read (LoadStructure)
//
//  Temporarily redefining data structures, these should be separate or exported
//  as types from Music XML parser.

export enum XMLArticulationType {
  NONE = 0,
  ACCENT = 1,
  STACCATO = 2,
  MARCATO = 3,
}

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
   TiedStart: number;
   TiedEnd: number;
}
// This should be a separate library that is included and shared maybe?
export type XMLArticulation = {
  Type: XMLArticulationType,
  Beat: number,
  Staff: number,
  Voice: number,
};

export type XMLDynamic = {
  Symbol: string,
  Staff: number,
  Beat: number,
}

export type XMLMeasure = {
  ID: number,
  Clefs: XMLClef[],
  Staves: XMLStaff[],
  Key: string,
  TimeSignature: { top: number, bottom: number },
  Notes: XMLNote[],
  Articulations: XMLArticulation[],
  Dynamics: XMLDynamic[],
};

export type XMLInstrument = {
  IDNo: number,
  ID: string,
  Measures: XMLMeasure[],
};

export type XMLScore = {
  Instruments: XMLInstrument[]
}
import { ArticulationType } from "../Core/Articulation.js";
import { Clef } from "../Core/Clef.js";
import { CreateStaff, Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { LoadStructure, lArticulation, lDynamic, lMeasure, lNote } from "./Loader.js";
import { GeneratePitchMap, MappedMidi } from "./Pitcher.js";


function LoadFromMXML(score: XMLScore): LoadStructure {
  let loadedStruct: LoadStructure = { Instruments: [] };
  // This could maybe be passed in instead of generated
  let pitchMap = GeneratePitchMap();
  let currentTimeSignature: { top: number, bottom: number} = { top: 4, bottom: 3 };
  let currentKeySig: string = "CMaj/Amin";
  let currentClefs: XMLClef[] = [];
  let currentStaves: XMLStaff[] = [];

  score.Instruments.forEach((_: XMLInstrument, i: number) => {
   // score.Instruments.push(m);
    loadedStruct.Instruments.push({ IDNo: i, Measures: [] });
    score.Instruments[i].Measures.forEach((m: XMLMeasure, mi: number) => {
      // Temporary while we are only supporting one staff/clef
      let staves = [];
      let clefs = [];
      m.Staves.forEach((s: XMLStaff) => {
        staves.push(CreateStaff(s.Number));
      });
      m.Clefs.forEach((c: XMLClef, ci: number) => {
        clefs.push(new Clef(ci, c.Type, 1, c.Staff));
      })

      if (mi === 0) {
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
            Tied: n.Tied,
            Staff: n.Staff,
            Clef: clef_string,
            Editable: true,
            Grace: false,
            Voice: 0,
            Alter: n.Alter,
            TiedStart: n.TiedStart,
            TiedEnd: n.TiedEnd,
          }
        );
      });
      let lArticulations: lArticulation[] = [];
      m.Articulations.forEach((xmlArt: XMLArticulation) => {
        let newArticulation: lArticulation = {
          Type: XMlArtToLArt(xmlArt),
          Voice: xmlArt.Voice,
          Beat: xmlArt.Beat,
          Staff: xmlArt.Staff,
        };
        lArticulations.push(newArticulation);
      });

      let lDynamics: lDynamic[] = [];
      m.Dynamics.forEach((xmlDyn: XMLDynamic) => {
        let newDynamic: lDynamic = {
          Symbol: xmlDyn.Symbol,
          Staff: xmlDyn.Staff,
          Beat: xmlDyn.Beat,
        };
        lDynamics.push(newDynamic);
      });

      let lmsr: lMeasure = {
        InstrumentID: score.Instruments[i].IDNo,
        Clefs: clefs,
        Staves: staves,
        TimeSignature: currentTimeSignature,
        KeySignature: currentKeySig,
        Notes: notes,
        Bounds: new Bounds(0,0,0,0),
        ShowClef: false,
        ShowTime: false,
        Articulations: lArticulations,
        Dynamics: lDynamics,
      };
      loadedStruct.Instruments[loadedStruct.Instruments.length-1].Measures.push(lmsr);
    });
  });

  return loadedStruct;
}

// I feel like there's definitely a way to do this without this switch statement
// but I'm tired writing this code
function XMlArtToLArt(mxmlArtType: XMLArticulation): ArticulationType {
  switch (mxmlArtType.Type) {
    case XMLArticulationType.NONE:
      return ArticulationType.NONE;
    case XMLArticulationType.ACCENT:
      return ArticulationType.ACCENT;
    case XMLArticulationType.STACCATO:
      return ArticulationType.STACCATO;
    case XMLArticulationType.MARCATO:
      return ArticulationType.MARCATO;
    default:
      return ArticulationType.NONE;
  }
}

export { LoadFromMXML };
