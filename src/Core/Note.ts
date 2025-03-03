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
  Tuple: boolean;
  TupleDetails?: TupleDetails;
  Clef: string;
  Editable?: boolean;
  Grace: boolean;
}

class Note implements ISelectable {
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  Accidental: number;
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

  Tuple: boolean;
  TupleDetails?: TupleDetails;

  constructor(props: NoteProps) {
    this.Beat = props.Beat;
    this.Duration = props.Duration;
    this.Line = props.Line;
    this.Rest = props.Rest;
    this.Tied = props.Tied;
    this.Accidental = 0;
    this.Staff = props.Staff;
    this.Clef = props.Clef;
    this.Grace = props.Grace;
    // Out of bounds may happen when changing time signatures (4th beat in a 3/4 bar for example)
    this.OutOfBounds = false;

    this.Selected = false;
    this.SelType = SelectableTypes.Note;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Bounds.width = 12;
    this.Bounds.height = 10;
    this.Editable = props.Editable !== undefined ? props.Editable : true;
    this.ID = -1;

    this.Tuple = props.Tuple;
    if (props.TupleDetails) {
      this.TupleDetails = props.TupleDetails;
    }
    this.Opacity = 1.0;
  }

  SetBounds(bounds: Bounds): void {
    this.Bounds = bounds;
  }

  SetID(id: number): void {
    this.ID = id;
  }

  SetTiedStartEnd(s: number, e: number): void {
    this.TiedStart = s;
    this.TiedEnd = e;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  GetMidiNumber(): number {
    const line = this.Staff === 0 ? this.Line : this.Line - 1000;
    return ReturnMidiNumber(this.Clef, line, this.Staff);
  }
}

export { Note, NoteProps, TupleDetails };
