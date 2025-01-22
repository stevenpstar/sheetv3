import { Camera } from "../Core/Camera.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Clef, Measure } from "../Core/Measure.js";
import { Note, NoteProps } from "../Core/Note.js";
import { Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { Staff } from "../Core/Staff.js";
import { CreateMeasure } from "../Factory/Instrument.Factory.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";

interface lNote {
  ID: number;
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  Staff: number;
  Clef: string;
  Editable?: boolean;
  Grace: boolean;
}
interface lMeasure {
  Clefs: Clef[];
  Staves: Staff[];
  TimeSignature: { top: number; bottom: number };
  KeySignature: string;
  Notes: lNote[];
  Bounds: Bounds;
  ShowClef: boolean;
  ShowTime: boolean;
}
interface LoadStructure {
  Measures: lMeasure[];
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
  // loading onto a single instrument to begin with
  loaded.Measures.forEach((m: lMeasure, i: number) => {
    //   const msr = CreateDefaultMeasure(runningId, instr, page, cam);
    // TODO: Temporary
    if (instr.Staff === StaffType.Rhythm) {
      m.ShowClef = false;
    }
    const notes: Note[] = [];
    m.Notes.forEach((n: lNote, i: number) => {
      const noteProps: NoteProps = {
        Beat: n.Beat,
        Duration: n.Duration,
        Line: n.Line,
        Rest: n.Rest,
        Tied: n.Tied,
        Staff: n.Staff,
        Tuple: false,
        Clef: n.Clef,
        Editable: true,
        Grace: n.Grace,
      };
      const newNote = new Note(noteProps);
      notes.push(newNote);
    });
    const msr = CreateMeasure(
      instr,
      m.Bounds,
      m.TimeSignature,
      m.KeySignature,
      m.Clefs,
      m.Staves,
      cam,
      runningId,
      page,
      m.ShowClef,
      callback,
    );
    msr.Notes = notes;
    sheet.Measures.push(msr);
    msr.CreateDivisions(cam);
  });
};

const SaveSheet = (sheet: Sheet): string => {
  let saved: LoadStructure = {
    Measures: [],
  };
  sheet.Measures.forEach((m: Measure, i: number) => {
    let notes: lNote[] = [];
    m.Notes.forEach((n: Note, i: number) => {
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
      });
    });
    saved.Measures.push({
      Clefs: m.Clefs,
      Staves: m.Staves,
      TimeSignature: m.TimeSignature,
      KeySignature: m.KeySignature,
      Notes: notes,
      Bounds: m.Bounds,
      ShowClef: m.RenderClef,
      ShowTime: m.RenderTimeSig,
    });
  });

  //  console.log(JSON.stringify(saved));
  return JSON.stringify(saved);
};

export { LoadSheet, SaveSheet, LoadStructure, lNote, lMeasure };
