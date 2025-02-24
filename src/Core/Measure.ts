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
} from "./Division.js";
import { Dynamic } from "./Dynamic.js";
import { Instrument, StaffType } from "./Instrument.js";
import { KeySignatures } from "./KeySignatures.js";
import { Note, NoteProps } from "./Note.js";
import { Page } from "./Page.js";
import { GetStaffHeightUntil, GetStaffMiddleLine, Staff } from "./Staff.js";
import { CreateTimeSignature, TimeSignature } from "./TimeSignatures.js";
import { Voice } from "./Voice.js";

interface MeasureProps {
  Instrument: Instrument;
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

class Measure implements ISelectable {
  PrevMeasure: Measure;
  NextMeasure: Measure;
  ID: number;
  Num: number;
  Selected: boolean;
  SelType: SelectableTypes;
  Instrument: Instrument;
  Bounds: Bounds;
  Editable: boolean;
  RenderClef: boolean;
  RenderKey: boolean;
  RenderTimeSig: boolean;
  Camera: Camera;
  Page: Page;
  PageLine: Number;
  Message: (msg: Message) => void;

  TimeSignature: TimeSignature;
  KeySignature: string;

  Voices: Voice[];
  ActiveVoice: number = 0;
  Clefs: Clef[] = [];
  Staves: Staff[];
  Barlines: Barline[];
  Articulations: Articulation[];
  Dynamics: Dynamic[];

  XOffset: number; // not sure if this is what we want to go with

  // Grouping of measures on a line/for formatting
  Line: number;
  RunningID: { count: number };

  constructor(properties: MeasureProps, runningId: { count: number }) {
    this.PrevMeasure = properties.PrevMeasure;
    this.NextMeasure = properties.NextMeasure;
    this.Voices = [new Voice(0), new Voice(1), new Voice(2), new Voice(3)];
    this.Num = 1;
    this.Staves = properties.Staves;
    this.Message = properties.Message;
    this.RunningID = runningId;
    this.ID = 0;
    this.Selected = false;
    this.Editable = true;
    this.SelType = SelectableTypes.Measure;
    this.Instrument = properties.Instrument;
    this.Line = 0;
    this.Bounds = properties.Bounds;
    this.Bounds.height = GetStaffHeightUntil(this.Staves);
    this.TimeSignature = CreateTimeSignature(properties.TimeSignature);
    this.KeySignature = properties.KeySignature;
    this.Voices[this.ActiveVoice].Notes = properties.Notes;
    this.Articulations = [];
    this.Dynamics = [];
    this.RenderClef = properties.RenderClef;
    if (this.Instrument.Staff === StaffType.Rhythm) {
      this.RenderClef = false;
    }
    this.RenderKey = properties.RenderKey;
    this.Camera = properties.Camera;
    this.RenderTimeSig = properties.RenderTimeSig;
    this.Page = properties.Page;
    this.PageLine =
      properties.Page.PageLines[properties.Page.PageLines.length - 1].Number;

    this.SetXOffset();

    this.Barlines = properties.Barlines;

    this.CreateDivisions();

    this.Staves.forEach((s: Staff, i: number) => {
      const clef = new Clef(0, properties.Clefs[i].Type, 1, s.Num);
      clef.SetBounds(this, s.Num);
      this.Clefs.push(clef);
    });
    this.TimeSignature.SetBounds(this);
  }

  GetLineHovered(y: number, staffNum: number): { num: number; bounds: Bounds } {
    const cam = this.Camera;
    const relYPos = y - this.Bounds.y - cam.y;
    let line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
    let actualLine = line;
    const bounds = new Bounds(
      this.Bounds.x,
      0,
      this.Bounds.width + this.XOffset,
      5,
    );
    const staff: Staff = this.Staves.find((s) => s.Num === staffNum);
    const prevStaffLines = GetStaffHeightUntil(this.Staves, staffNum) / 5;
    actualLine = line + staff.TopLine;
    bounds.y = this.Bounds.y + 5 * actualLine;
    return { num: actualLine - prevStaffLines, bounds: bounds };
  }

  GetNotePositionOnLine(line: number, staff: number): number {
    const staffYPos = GetStaffHeightUntil(this.Staves, staff);
    let y = staffYPos + this.Bounds.y + (line - this.Staves[staff].TopLine) * 5;
    return y - 2.5;
  }

  GetBoundsWithOffset(): Bounds {
    return new Bounds(
      this.Bounds.x,
      this.Bounds.y,
      this.Bounds.width + this.XOffset,
      this.Bounds.height,
    );
  }

  SetXOffset(): void {
    this.XOffset = 0;
    if (this.RenderClef) {
      this.XOffset += 30;
    }
    if (this.RenderKey) {
      this.XOffset += KeySignatures.get(this.KeySignature).length * 11;
    }
    if (this.RenderTimeSig) {
      this.XOffset += 30;
    }
    this.TimeSignature.SetBounds(this);
  }

  CreateDivisions() {
    this.Voices.forEach((v: Voice) => {
      v.Divisions = [];
      this.Staves.forEach((s: Staff) => {
        v.Divisions.push(...CreateDivisions(this, v.Notes, s.Num, v));
        ResizeDivisions(this, v.Divisions, s.Num);
        UpdateNoteBounds(this, s.Num);
      });
    });
  }

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    this.CreateDivisions();
  }

  GetMeasureHeight(): number {
    return GetStaffHeightUntil(this.Staves);
  }

  AddNote(
    note: Note,
    fromInput: boolean = false,
    voice: Voice = this.Voices[this.ActiveVoice],
  ): void {
    if (note.Rest) {
      this.ClearNonRestNotes(note.Beat, note.Staff);
    } else {
      this.ClearRestNotes(note.Beat, note.Staff);
    }
    note.SetID(this.RunningID.count);
    this.RunningID.count++;
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
      this.Message(msg);
    }
  }

  ClearNonRestNotes(beat: number, staff: number): void {
    for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        this.Voices[this.ActiveVoice].Notes[n].Beat === beat &&
        this.Voices[this.ActiveVoice].Notes[n].Rest === false &&
        this.Voices[this.ActiveVoice].Notes[n].Staff === staff
      ) {
        this.Voices[this.ActiveVoice].Notes.splice(n, 1);
      }
    }
  }

  ClearRestNotes(beat: number, staff: number): void {
    for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        this.Voices[this.ActiveVoice].Notes[n].Beat === beat &&
        this.Voices[this.ActiveVoice].Notes[n].Rest === true &&
        this.Voices[this.ActiveVoice].Notes[n].Staff === staff
      ) {
        this.Voices[this.ActiveVoice].Notes.splice(n, 1);
      }
    }
  }

  ClearMeasure(ignoreNotes?: Note[]): void {
    for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        this.Voices[this.ActiveVoice].Notes[n].Editable &&
        !ignoreNotes.includes(this.Voices[this.ActiveVoice].Notes[n])
      ) {
        this.Voices[this.ActiveVoice].Notes.splice(n, 1);
      }
    }
  }

  DeleteSelected(): void {
    for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
      if (
        this.Voices[this.ActiveVoice].Notes[n].Selected &&
        this.Voices[this.ActiveVoice].Notes[n].Editable
      ) {
        let beat = this.Voices[this.ActiveVoice].Notes[n].Beat;
        let duration = this.Voices[this.ActiveVoice].Notes[n].Duration;
        let staff = this.Voices[this.ActiveVoice].Notes[n].Staff;
        let tuple = this.Voices[this.ActiveVoice].Notes[n].Tuple;
        let tupleDetails = this.Voices[this.ActiveVoice].Notes[n].TupleDetails;
        this.Voices[this.ActiveVoice].Notes.splice(n, 1);
        const notesOnBeat = this.Voices[this.ActiveVoice].Notes.filter(
          (n) => n.Beat === beat,
        );
        if (notesOnBeat.length === 0) {
          const clefType = GetNoteClefType(this, beat, staff);
          // beat is empty and requires a rest note
          const restProps: NoteProps = {
            Beat: beat,
            Duration: duration,
            Line: GetStaffMiddleLine(this.Staves, staff),
            Rest: true,
            Tied: false,
            Staff: staff,
            Tuple: tuple,
            TupleDetails: tupleDetails,
            Clef: clefType,
            Grace: false,
          };

          this.AddNote(new Note(restProps));
        }
      }
    }
    for (let d = this.Dynamics.length - 1; d >= 0; d--) {
      if (this.Dynamics[d].Selected) {
        this.Dynamics.splice(d, 1);
      }
    }
  }

  GetMinimumWidth(): number {
    if (
      this.Voices[this.ActiveVoice].Notes.filter((n) => n.Rest !== true)
        .length === 0
    ) {
      return DivisionMinWidth * 4;
    }
    const lowestVal = this.Voices[this.ActiveVoice].Notes.sort(
      (a: Note, b: Note) => {
        return a.Duration - b.Duration;
      },
    )[0];
    const count = 1 / lowestVal.Duration;
    return count * DivisionMinWidth;
  }

  ReturnSelectableElements(): ISelectable[] {
    const sel: ISelectable[] = [];
    sel.push(...this.Voices[this.ActiveVoice].Notes);
    sel.push(...this.Clefs);
    return sel;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.GetBoundsWithOffset().IsHovered(x, y, cam);
  }

  ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void {
    this.TimeSignature.top = top;
    this.TimeSignature.bottom = bottom;
  }

  RecalculateBarlines(): void {
    this.Barlines[0].Bounds = new Bounds(
      this.Bounds.x,
      this.Bounds.y,
      10,
      this.GetMeasureHeight(),
    );

    this.Barlines[1].Bounds = new Bounds(
      this.Bounds.x + this.GetBoundsWithOffset().width - 10,
      this.Bounds.y,
      10,
      this.GetMeasureHeight(),
    );
  }
}

export { Measure, MeasureProps, Division, Clef };
