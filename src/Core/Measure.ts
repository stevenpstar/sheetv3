import { Bounds } from '../Types/Bounds.js';
import { Note } from './Note.js';

interface MeasureProps {
  ID: number;
  Bounds: Bounds;
  TimeSignature: { top: number, bottom: number };
  Notes: Note[];
  BeatDistribution: { startNumber: number, value: number, bounds: Bounds }[];
  RenderClef: boolean;
}
class Measure {
  ID: number;
  Bounds: Bounds;
  TimeSignature: {top: number, bottom: number}
  Notes: Note[];
  BeatDistribution: { startNumber: number, value: number, bounds: Bounds }[];
  RenderClef: boolean;

  constructor(properties: MeasureProps) {
    this.ID = properties.ID;
    this.Bounds = properties.Bounds;
    this.TimeSignature = properties.TimeSignature;
    this.Notes = properties.Notes;
    this.BeatDistribution = properties.BeatDistribution
    this.RenderClef = properties.RenderClef;
    this.CreateBeatDistribution();
  }

  static GetLineHovered(y: number, msr: Measure): { num: number, bounds: Bounds } {
    const relYPos = y - msr.Bounds.y;
    const line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
    return { num: line, bounds: new Bounds(msr.Bounds.x, (line * 5) - 2.5, msr.Bounds.width, 5) };
  }

  CreateBeatDistribution() {
    this.BeatDistribution = []; // empty
    // TODO: this is a test implementation during development at this point
    const quarterMeasure = { startNumber: 1, value: 0.25,
      bounds: this.CreateBeatBounds(1, 0.25)  };
    const quarterMeasure2 = { startNumber: 2, value: 0.25,
      bounds: this.CreateBeatBounds(2, 0.25)  };
    const halfMeasure2 = { startNumber: 3, value: 0.5,
      bounds: this.CreateBeatBounds(3, 0.5) };
    this.BeatDistribution.push(quarterMeasure);
    this.BeatDistribution.push(quarterMeasure2);
    this.BeatDistribution.push(halfMeasure2);
  }

  CreateBeatBounds(beat: number, value: number): Bounds {
    const height = this.Bounds.height; // height will always be max
    const width = this.Bounds.width * value; // value will max at 1 (entire measure)
    const y = this.Bounds.y;
    const x = this.Bounds.x + ((beat - 1) / this.TimeSignature.bottom) * this.Bounds.width;
    return new Bounds(x, y, width, height);
  }

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width;
  }

  AddNote(note: Note): void {
    this.Notes.push(note);
  }
}

export { Measure, MeasureProps };
