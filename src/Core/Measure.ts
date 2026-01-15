import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Message, MessageType } from "../Types/Message.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { MeasureSettings } from "../entry.js";
import { Articulation } from "./Articulation.js";
import { Barline } from "./Barline.js";
import { Camera } from "./Camera.js";
import { Clef, GetNoteClefType } from "./Clef.js";
import {
  CreateDivisions,
  type Division,
  ResizeDivisions,
  DivisionMinWidth,
  DivisionMaxWidth,
} from "./Division.js";
import { Dynamic } from "./Dynamic.js";
import { Instrument, StaffType } from "./Instrument.js";
import { KeySignatures } from "./KeySignatures.js";
import { CreateNewNote, Note, NoteProps, SetNoteID } from "./Note.js";
import { Page } from "./Page.js";
import { GetStaffHeightUntil, GetStaffMiddleLine, Staff } from "./Staff.js";
import { CreateTimeSignature, TimeSignature } from "./TimeSignatures.js";
import { Voice } from "./Voice.js";

interface MeasureProps {
  InstrumentID: number;
  PrevMeasure: Measure;
  NextMeasure: Measure;
  Bounds: Bounds;
  TimeSignature: { top: number; bottom: number };
  KeySignature: string;
  Notes: Note[];
  Staves: Staff[];
  Clefs: Clef[];
  RenderClef: boolean;
  RenderTimeSig: boolean;
  RenderKey: boolean;
  Camera: Camera;
  Page: Page;
  Message: (msg: Message) => void;
  Settings?: MeasureSettings;
  Barlines: Barline[];
}

// MEASURE TYPE
type Measure = {

  InstrumentID: number;

  // Measure References
  PrevMeasure: Measure;
  NextMeasure: Measure;

  // NUMBER
  ID: number;
  Num: number;
  XOffset: number; // not sure if msr.is what we want to go with
  PageLine: number;
  Line: number;
  ActiveVoice: number;
  AnacrusisDuration: number;
  RunningID: { count: number };

  // BOOLEAN
  Selected: boolean;
  Editable: boolean;
  RenderClef: boolean;
  RenderKey: boolean;
  RenderTimeSig: boolean;
  IsAnacrusis: boolean;

  SelType: SelectableTypes;

  Bounds: Bounds;

  Camera: Camera;

  Page: Page;

  TimeSignature: TimeSignature;
  KeySignature: string;

  Voices: Voice[];
  Clefs: Clef[];
  Staves: Staff[];
  Barlines: Barline[];
  Articulations: Articulation[];
  Dynamics: Dynamic[];

  Message: (msg: Message) => void;
};

function CreateEmptyMeasure(): Measure {
  let msr: Measure = {
    InstrumentID: 0,
    PrevMeasure: undefined,
    NextMeasure: undefined,
    ID: 0,
    Num: 0,
    XOffset: 0,
    PageLine: 0,
    Line: 0,
    ActiveVoice: 0,
    RunningID: { count: 0 },
    Selected: false,
    Editable: false,
    RenderClef: false,
    RenderKey: false,
    RenderTimeSig: false,
    IsAnacrusis: false,
    AnacrusisDuration: 0,
    SelType: SelectableTypes.Measure,
    Bounds: new Bounds(0, 0, 0, 0),
    Camera: undefined,
    Page: undefined,
    TimeSignature: undefined,
    KeySignature: "",
    Voices: [],
    Clefs: [],
    Staves: [],
    Barlines: [],
    Articulations: [],
    Dynamics: [],
    Message: () => {},
  };

  return msr;
}

function CreateNewMeasure(properties: MeasureProps, runningId: { count: number }, loading: boolean = false): Measure {
    let msr: Measure = CreateEmptyMeasure();
    msr.Staves = properties.Staves;
    msr.PrevMeasure = properties.PrevMeasure;
    msr.NextMeasure = properties.NextMeasure;
    msr.RunningID = runningId;
    msr.ID = 0;
    msr.Num = 1;
    msr.Voices = [new Voice(0), new Voice(1), new Voice(2), new Voice(3)];
    if (loading && properties.Notes.length > 0) {
      // Add notes to assigned voices before division creation
      properties.Notes.forEach((n: Note) => {
        if (msr.Voices[n.Voice] !== undefined || msr.Voices[n.Voice] !== null) {
          // Add notes to voices from load
          AddNote(msr, n, false, msr.Voices[n.Voice]);
        }
      });

    }
    msr.Message = properties.Message;
    msr.Selected = false;
    msr.Editable = true;
    msr.SelType = SelectableTypes.Measure;
    msr.InstrumentID = properties.InstrumentID;
    msr.Line = 0;
    msr.Bounds = properties.Bounds;
    msr.Bounds.height = GetStaffHeightUntil(msr.Staves);
    msr.TimeSignature = CreateTimeSignature(properties.TimeSignature);
    msr.KeySignature = properties.KeySignature;
   // msr.Voices[msr.ActiveVoice].Notes = properties.Notes;
    msr.Articulations = [];
    msr.Dynamics = [];
    msr.RenderClef = properties.RenderClef;
   // if (msr.Instrument.Staff === StaffType.Rhythm) {
   //   msr.RenderClef = false;
   // }
    msr.RenderKey = properties.RenderKey;
    msr.Camera = properties.Camera;
    msr.RenderTimeSig = properties.RenderTimeSig;
    msr.Page = properties.Page;
    msr.PageLine =
      properties.Page.PageLines[properties.Page.PageLines.length - 1].Number;

    SetXOffset(msr);

    msr.Barlines = properties.Barlines;

    CreateMeasureDivisions(msr);

    msr.Staves.forEach((s: Staff, i: number) => {
      if (i < properties.Clefs.length) {
        const clef = new Clef(0, properties.Clefs[i].Type, 1, s.Num);
        clef.SetBounds(msr, s.Num);
        msr.Clefs.push(clef);
      }
    });
    msr.TimeSignature.SetBounds(msr);
    return msr;
}

  function GetLineHovered(msr: Measure, y: number, staffNum: number): { num: number; bounds: Bounds } {
    const cam = msr.Camera;
    const relYPos = y - msr.Bounds.y - cam.y;
    let line = Math.floor(relYPos / 5); // msr.should be a constant, line_height (defined somewhere)
    let actualLine = line;
    const bounds = new Bounds(
      msr.Bounds.x,
      0,
      msr.Bounds.width + msr.XOffset,
      5,
    );
    const staff: Staff = msr.Staves.find((s) => s.Num === staffNum);
    const prevStaffLines = GetStaffHeightUntil(msr.Staves, staffNum) / 5;
    actualLine = line + staff.TopLine;
    bounds.y = msr.Bounds.y + 5 * actualLine;
    return { num: actualLine - prevStaffLines, bounds: bounds };
  }

  function GetNotePositionOnLine(msr: Measure, line: number, staff: number): number {
    const staffYPos = GetStaffHeightUntil(msr.Staves, staff);
    let y = staffYPos + msr.Bounds.y + (line - msr.Staves[staff].TopLine) * 5;
    return y - 2.5;
  }

  function GetBoundsWithOffset(msr: Measure): Bounds {
    return new Bounds(
      msr.Bounds.x,
      msr.Bounds.y,
      msr.Bounds.width + msr.XOffset,
      msr.Bounds.height,
    );
  }

  function SetXOffset(msr: Measure): void {
    msr.XOffset = 0;
    if (msr.RenderClef) {
      msr.XOffset += 30;
    }
    if (msr.RenderKey) {
      msr.XOffset += KeySignatures.get(msr.KeySignature).length * 11;
    }
    if (msr.RenderTimeSig) {
      msr.XOffset += 30;
    }
    msr.TimeSignature.SetBounds(msr);
  }

  function CreateMeasureDivisions(msr: Measure) {
    msr.Voices.forEach((v: Voice, i: number) => {
      v.Divisions = [];
      msr.Staves.forEach((s: Staff) => {
        v.Divisions.push(...CreateDivisions(msr, v.Notes, s.Num, v, i));
        ResizeDivisions(msr, v.Divisions, s.Num);
        UpdateNoteBounds(msr, s.Num);
      });
    });
  }

  function RepositionMeasure(msr: Measure, prevMsr: Measure): void {
    msr.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    CreateMeasureDivisions(msr);
  }

  function GetMeasureHeight(msr: Measure): number {
    return GetStaffHeightUntil(msr.Staves);
  }

  function GetVoiceIndex(msr: Measure, voice: Voice): number {
    let index = 0;
    let found = false;
    msr.Voices.forEach((v: Voice, i: number) => {
      if (v === voice) {
        index = i;
        found = true;
        return;
      }
    });

    if (!found) {
      console.error("Voice not found in measure!");
    }
    return index;
  }

  function AddNote(
    msr: Measure,
    note: Note,
    fromInput: boolean = false,
    voice: Voice = msr.Voices[msr.ActiveVoice],
  ): void {
      const voiceIndex = GetVoiceIndex(msr, voice);
    if (note.Rest) {
      ClearNonRestNotes(msr, note.Beat, note.Staff, voiceIndex);
      note.Line = GetStaffMiddleLine(msr.Staves, note.Staff);
    } else {
      ClearRestNotes(msr, note.Beat, note.Staff, voiceIndex);
    }
    SetNoteID(note, msr.RunningID.count);
    msr.RunningID.count++;
    voice.Notes.push(note);

    if (fromInput) {
      const msg: Message = {
        messageString: "AddNote",
        messageData: {
          Message: {
            msg: "AddingNote",
            obj: note,
          },
          MessageType: MessageType.AddNote,
        },
      };
      msr.Message(msg);
    }
  }

  function ClearNonRestNotes(msr: Measure, beat: number, staff: number, voiceIndex: number): void {
    for (let n = msr.Voices[voiceIndex].Notes.length - 1; n >= 0; n--) {
      if (
        msr.Voices[voiceIndex].Notes[n].Beat === beat &&
        msr.Voices[voiceIndex].Notes[n].Rest === false &&
        msr.Voices[voiceIndex].Notes[n].Staff === staff
      ) {
        msr.Voices[voiceIndex].Notes.splice(n, 1);
      }
    }
  }

  function ClearRestNotes(msr: Measure, beat: number, staff: number, voiceIndex: number): void {
    for (let n = msr.Voices[voiceIndex].Notes.length - 1; n >= 0; n--) {
      if (
        msr.Voices[voiceIndex].Notes[n].Beat === beat &&
        msr.Voices[voiceIndex].Notes[n].Rest === true &&
        msr.Voices[voiceIndex].Notes[n].Staff === staff
      ) {
        msr.Voices[voiceIndex].Notes.splice(n, 1);
      }
    }
  }

  function ClearMeasure(msr: Measure, ignoreNotes?: Note[]): void {
    for (let n = msr.Voices[msr.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        msr.Voices[msr.ActiveVoice].Notes[n].Editable &&
        !ignoreNotes.includes(msr.Voices[msr.ActiveVoice].Notes[n])
      ) {
        msr.Voices[msr.ActiveVoice].Notes.splice(n, 1);
      }
    }
  }

  function DeleteSelectedMeasure(msr: Measure): void {
    for (let n = msr.Voices[msr.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        msr.Voices[msr.ActiveVoice].Notes[n].Selected &&
        msr.Voices[msr.ActiveVoice].Notes[n].Editable
      ) {
        let beat = msr.Voices[msr.ActiveVoice].Notes[n].Beat;
        let duration = msr.Voices[msr.ActiveVoice].Notes[n].Duration;
        let staff = msr.Voices[msr.ActiveVoice].Notes[n].Staff;
        let tuplet = msr.Voices[msr.ActiveVoice].Notes[n].Tuplet;
        let tupletDetails = msr.Voices[msr.ActiveVoice].Notes[n].TupletDetails;
        msr.Voices[msr.ActiveVoice].Notes.splice(n, 1);
        const notesOnBeat = msr.Voices[msr.ActiveVoice].Notes.filter(
          (n) => n.Beat === beat,
        );
        if (notesOnBeat.length === 0) {
          const clefType = GetNoteClefType(msr, beat, staff);
          // beat is empty and requires a rest note
          const restProps: NoteProps = {
            Beat: beat,
            Duration: duration,
            Line: GetStaffMiddleLine(msr.Staves, staff),
            Rest: true,
            Tied: false,
            Staff: staff,
            Tuplet: tuplet,
            TupletDetails: tupletDetails,
            Clef: clefType,
            Grace: false,
            Voice: msr.ActiveVoice,
            Alter: 0,
          };
          console.log("Adding rest after note deletion at beat: ", beat);
// TODO: Side effect, maybe check after deleting selected note if the measure
          // has division gap and create there if true.
          AddNote(msr, CreateNewNote(restProps));
        }
      }
    }
    for (let d = msr.Dynamics.length - 1; d >= 0; d--) {
      if (msr.Dynamics[d].Selected) {
        msr.Dynamics.splice(d, 1);
      }
    }
  }

  function GetMinimumWidth(msr: Measure): number {
    if (
      msr.Voices[msr.ActiveVoice].Notes.filter((n) => n.Rest !== true)
        .length === 0
    ) {
      return DivisionMinWidth * 4;
    }
    const count = 1;
//    const lowestVal = msr.Voices[msr.ActiveVoice].Notes.sort(
//      (a: Note, b: Note) => {
//        return a.Duration - b.Duration;
//      },
//    )[0];
//    const count = (1 * (msr.TimeSignature.top / msr.TimeSignature.bottom)) / lowestVal.Duration;
 //   return count * DivisionMinWidth;
    return msr.Voices[msr.ActiveVoice].Divisions.length * DivisionMaxWidth;
  }

  function ReturnSelectableElements(msr: Measure): ISelectable[] {
    const sel: ISelectable[] = [];
    sel.push(...msr.Voices[msr.ActiveVoice].Notes);
    sel.push(...msr.Clefs);
    return sel;
  }

  function IsHovered(msr: Measure, x: number, y: number, cam: Camera): boolean {
    return GetBoundsWithOffset(msr).IsHovered(x, y, cam);
  }

  function ChangeTimeSignature(msr: Measure, top: number, bottom: number, transpose: boolean): void {
    msr.TimeSignature.top = top;
    msr.TimeSignature.bottom = bottom;
  }

  function RecalculateBarlines(msr: Measure): void {
    msr.Barlines[0].Bounds = new Bounds(
      msr.Bounds.x,
      msr.Bounds.y,
      10,
      GetMeasureHeight(msr),
    );

    msr.Barlines[1].Bounds = new Bounds(
      msr.Bounds.x + GetBoundsWithOffset(msr).width - 10,
      msr.Bounds.y,
      10,
      GetMeasureHeight(msr),
    );
  }

  function GetLastClef(msr: Measure, staff: number): Clef {
    const staffClefs = msr.Clefs.filter((c: Clef) => c.Staff === staff).sort(
      (a: Clef, b: Clef) => {
        return b.Beat - a.Beat;
      },
    );
    if (staffClefs.length === 0) {
      console.error(
        "A clef should exist on msr.staff, in msr.measure. Returning default Clef",
      );
      return new Clef(0, "treble", 1, 0);
    }
    return staffClefs[0];
  }

export { Measure, MeasureProps, Division, Clef, 
  DeleteSelectedMeasure,
  CreateMeasureDivisions,
  GetBoundsWithOffset,
  GetLineHovered,
  GetNotePositionOnLine,
  RepositionMeasure,
  RecalculateBarlines,
  ChangeTimeSignature,
  ClearRestNotes,
  AddNote,
  GetMinimumWidth,
  SetXOffset,
  CreateNewMeasure,
  GetMeasureHeight,
};
