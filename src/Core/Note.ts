import { Bounds } from "../Types/Bounds.js";

interface NoteProps {
  Beat: number;
  Duration: number;
  Line: number;
}
class Note {
  Beat: number;
  Duration: number;
  Line: number;
  Bounds: Bounds;
  Selected: boolean;

  constructor(props: NoteProps) {
    this.Beat = props.Beat;
    this.Duration = props.Duration;
    this.Line = props.Line;
    this.Selected = false;
  }

  SetBounds(bounds: Bounds): void {
    this.Bounds = bounds;
  }
}

export { Note }
