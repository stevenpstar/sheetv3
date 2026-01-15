import { Articulation, ArticulationType } from "../Core/Articulation.js";
import { Camera } from "../Core/Camera.js";
import { Dynamic } from "../Core/Dynamic.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Clef, CreateMeasureDivisions, Measure } from "../Core/Measure.js";
import { CreateNewNote, Note, NoteProps } from "../Core/Note.js";
import { Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { Staff } from "../Core/Staff.js";
import { Voice } from "../Core/Voice.js";
import { CreateDefaultPiano, CreateMeasure } from "../Factory/Instrument.Factory.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";

interface lNote {
  ID: number;
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  TiedStart: number;
  TiedEnd: number;
  Staff: number;
  Clef: string;
  Editable?: boolean;
  Grace: boolean;
  Voice: number;
  Alter: number;
}

interface lArticulation {
  Type: ArticulationType,
  Beat: number,
  Staff: number,
  Voice: number
};

interface lDynamic {
  Symbol: string,
  Staff: number,
  Beat: number,
};

interface lMeasure {
  InstrumentID: number;
  Clefs: Clef[];
  Staves: Staff[];
  TimeSignature: { top: number; bottom: number };
  KeySignature: string;
  Notes: lNote[];
  Bounds: Bounds;
  ShowClef: boolean;
  ShowTime: boolean;
  Articulations: lArticulation[],
  Dynamics: lDynamic[],
}

interface lInstrument {
  IDNo: number;
  Measures: lMeasure[];
}

interface LoadStructure {
  Instruments: lInstrument[];
}

const LoadSheet = (
  sheet: Sheet,
  page: Page,
  cam: Camera,
  instr: Instrument,
  savedJson: string,
  callback: (msg: Message) => void,
) => {
  let runningId = { count: 0 };
  // TODO: this could error
  const loaded: LoadStructure = JSON.parse(savedJson);
  loaded.Instruments.forEach((ins: lInstrument) => {
  // For each loaded instrument, create an instrument on the sheet, TODO: We
    // should probably clear all instruments before this - instruments will
    // eventually have a type to determine stave count etc.
  let instr_exists: boolean = false;
  sheet.Instruments.forEach((instrument: Instrument) => {
    if (instrument.ID === ins.IDNo) {
      instr_exists = true;
    }
  });
  if (!instr_exists) {
    sheet.Instruments.push(CreateDefaultPiano(ins.IDNo));
  }
  ins.Measures.forEach((m: lMeasure) => {
    //   const msr = CreateDefaultMeasure(runningId, instr, page, cam);
    // TODO: Temporary
    if (instr.Staff === StaffType.Rhythm) {
      m.ShowClef = false;
    }
    const notes: Note[] = [];
    m.Notes.forEach((n: lNote) => {
      const noteProps: NoteProps = {
        Beat: n.Beat,
        Duration: n.Duration,
        Line: n.Line,
        Rest: n.Rest,
        Tied: n.Tied,
        Staff: n.Staff,
        Tuplet: false,
        Clef: n.Clef,
        Editable: true,
        Grace: n.Grace,
        Voice: n.Voice,
        Alter: n.Alter,
      };

      const newNote = CreateNewNote(noteProps);
      newNote.TiedStart = n.TiedStart;
      newNote.TiedEnd = n.TiedEnd;
      notes.push(newNote);
    });
    const msr = CreateMeasure(
      ins.IDNo,
      null, // Prev Measure
      null, // Next Measure, these will need to be fixed when coming back to save/load
      new Bounds(m.Bounds.x, m.Bounds.y, m.Bounds.width, m.Bounds.height),
      m.TimeSignature,
      m.KeySignature,
      m.Clefs,
      m.Staves,
      cam,
      runningId,
      page,
      m.ShowClef,
      callback,
      true,
      notes,
    );

    let loadedArticulations: Articulation[] = [];
    m.Articulations.forEach((lArt: lArticulation) => {
      if (lArt.Voice < msr.Voices.length) {
        let newArticulation: Articulation = new Articulation(
          lArt.Type,
          lArt.Beat,
          lArt.Staff,
          msr.Voices[lArt.Voice],
        );
        loadedArticulations.push(newArticulation);
      }
    });
    msr.Articulations = loadedArticulations;

    let loadedDynamics: Dynamic[] = [];
    m.Dynamics.forEach((lDyn: lDynamic) => {
      let newDynamic: Dynamic = new Dynamic(
        lDyn.Symbol, lDyn.Staff, lDyn.Beat
      );
      loadedDynamics.push(newDynamic);
    });
    msr.Dynamics = loadedDynamics;

    if (sheet.Measures.length > 0) {
      msr.PrevMeasure = sheet.Measures[sheet.Measures.length - 1];
      sheet.Measures[sheet.Measures.length - 1].NextMeasure = msr;
    }
    sheet.Measures.push(msr);
    CreateMeasureDivisions(msr);
  })});
};

const SaveSheet = (sheet: Sheet): string => {
  let saved: LoadStructure = {
    Instruments: [],
  };
  sheet.Instruments.forEach((i: Instrument) => {
    let instr: lInstrument = {
      IDNo: i.ID,
      Measures: [],
    };
    saved.Instruments.push(instr);
    sheet.Measures.filter((fm: Measure) => fm.InstrumentID === i.ID).forEach((m: Measure) => {
      let notes: lNote[] = [];
      m.Voices.forEach((v: Voice, i: number) => {
        v.Notes.forEach((n: Note) => {
          if (n.Rest) {
            return;
          }
          notes.push({
            ID: n.ID,
            Beat: n.Beat,
            Duration: n.Duration,
            Line: n.Line,
            Rest: n.Rest,
            Tied: n.Tied,
            Staff: n.Staff,
            Clef: n.Clef,
            Editable: true,
            Grace: n.Grace,
            Voice: i,
            Alter: n.Alter,
            TiedStart: n.TiedStart,
            TiedEnd: n.TiedEnd,
          });
        });
      });
      let articulations: lArticulation[] = [];
      m.Articulations.forEach((a: Articulation) => {
        articulations.push({
          Voice: a.Voice.ID,
          Type: a.Type,
          Beat: a.Beat,
          Staff: a.Staff,
        });
      });

      let dynamics: lDynamic[] = [];
      m.Dynamics.forEach((d: Dynamic) => {
        dynamics.push({
          Symbol: d.Symbol,
          Staff: d.Staff,
          Beat: d.Beat,
        });
      });

      saved.Instruments[saved.Instruments.length-1].Measures.push({
        InstrumentID: saved.Instruments[saved.Instruments.length-1].IDNo,
        Clefs: m.Clefs,
        Staves: m.Staves,
        TimeSignature: m.TimeSignature,
        KeySignature: m.KeySignature,
        Notes: notes,
        Bounds: m.Bounds,
        ShowClef: m.RenderClef,
        ShowTime: m.RenderTimeSig,
        Articulations: articulations,
        Dynamics: dynamics,
      });
    });
  });

  return JSON.stringify(saved);
};

export { LoadSheet, SaveSheet, LoadStructure, lNote, lMeasure, lArticulation, lDynamic };
