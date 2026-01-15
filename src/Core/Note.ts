import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { ReturnMidiNumber } from "../Workers/Pitcher.js";
import { Camera } from "./Camera.js";

interface TupleDetails {
  StartBeat: number;
  EndBeat: number;
  Value: number; // Total tuple value, not value of individual note
  Count: number; // Total tuple count (3 for triplet etc.)
}
interface NoteProps {
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  Staff: number;
  Clef: string;
  Grace: boolean;
  Voice: number;
  Alter: number;
  Tuplet: boolean;
  TupletDetails?: TupleDetails;
  Accidental?: string;
  Editable?: boolean;
}

interface Note extends ISelectable {
  Beat: number;
  // Order is always the same as Beat, unless the note is a Grace note.
  Order: number;
  Duration: number;
  Line: number;
  Voice: number;

  Rest: boolean;
  Tied: boolean;
  Alter: number;
  Accidental: string;
  ID: number;
  SelType: SelectableTypes;
  Clef: string;
  Editable: boolean;
  Grace: boolean;
  OutOfBounds: boolean;

  // TEST FOR ANIMATION:
  Opacity: number;

  TiedStart: number; // beat
  TiedEnd: number; // beat

  Bounds: Bounds;
  Selected: boolean;

  Staff: number;
  // Staff Group will be if notes need to interact between staffs (beaming
  // across staffs for example)
  StaffGroup: number;

  Tuplet: boolean;
  TupletDetails?: TupleDetails;
}

function CreateEmptyNote(): Note {
  return {
    Voice: 0,
    Beat: 0,
    Order: 0,
    Grace: false,
    Duration: 0,
    Line: 0,
    Rest: false,
    Tied: false,
    TiedStart: 0,
    TiedEnd: 0,
    Alter: 0,
    Accidental: "",
    Staff: 0,
    StaffGroup: -1,
    Clef: "",
    OutOfBounds: false,
    Selected: false,
    SelType: SelectableTypes.Note,
    Bounds: new Bounds(0, 0, 0, 0),
    Editable: false,
    ID: -1,
    Tuplet: false,
    Opacity: 1.0, // Remove this 
  };
}

function CreateNewNote(props: NoteProps): Note {
  let note = CreateEmptyNote();
  note.Voice = props.Voice;
  note.Beat = props.Beat;
  note.Order = 0;
  if (!props.Grace) {
    note.Order = note.Beat;
  }
  note.Duration = props.Duration;
  note.Line = props.Line;
  note.Rest = props.Rest;
  note.Tied = props.Tied;
  note.Alter = props.Alter;
  if (props.Accidental) {
    note.Accidental = props.Accidental;
  }
  note.Staff = props.Staff;
  note.Clef = props.Clef;
  note.Grace = props.Grace;
  // Out of bounds may happen when changing time signatures (4th beat in a 3/4 bar for example)
  note.OutOfBounds = false;

  note.Selected = false;
  note.SelType = SelectableTypes.Note;
  note.Bounds = new Bounds(0, 0, 0, 0);
  note.Bounds.width = 12;
  note.Bounds.height = 10;
  note.Editable = props.Editable !== undefined ? props.Editable : true;
  note.ID = -1;

  note.Tuplet = props.Tuplet;
  if (props.TupletDetails) {
    note.TupletDetails = props.TupletDetails;
  }
  note.Opacity = 1.0;
  return note;
}

  function SetNoteBounds(note: Note, bounds: Bounds): void {
    note.Bounds = bounds;
  }

  function SetNoteID(note: Note, id: number): void {
    note.ID = id;
  }

  function SetTiedStartEnd(note: Note, s: number, e: number): void {
    note.TiedStart = s;
    note.TiedEnd = e;
  }

  function IsNoteHovered(note: Note, x: number, y: number, cam: Camera): boolean {
    return note.Bounds.IsHovered(x, y, cam);
  }

  function GetMidiNumber(note: Note): number {
    const line = note.Staff === 0 ? note.Line : note.Line - 1000;
    return ReturnMidiNumber(note.Clef, line, note.Staff);
  }

export { Note, NoteProps, TupleDetails ,
CreateNewNote,
SetNoteBounds,
SetNoteID,
SetTiedStartEnd,
IsNoteHovered,
GetMidiNumber};
