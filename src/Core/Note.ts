import { Bounds } from "../Types/Bounds.js";
import ISelectable from "../Types/ISelectable.js";

interface NoteProps {
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  Staff: number;
}

class Note implements ISelectable {
  Beat: number;
  Duration: number;
  Line: number;
  Rest: boolean;
  Tied: boolean;
  Accidental: number
  ID: number;

  TiedStart: number; // beat
  TiedEnd: number; // beat

  Bounds: Bounds;
  Selected: boolean;

  Staff: number;

  constructor(props: NoteProps) {
    this.Beat = props.Beat;
    this.Duration = props.Duration;
    this.Line = props.Line;
    this.Rest = props.Rest;
    this.Tied = props.Tied;
    this.Accidental = 0;
    this.Staff = props.Staff;

    this.Selected = false;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Bounds.width = 12;
    this.Bounds.height = 10;
    this.ID = -1;
    // note position is not based on bounds property
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
}

export { Note, NoteProps }
