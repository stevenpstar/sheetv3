import { Bounds } from '../Types/Bounds.js';
import { Camera } from './Camera.js';
import { Note } from './Note.js';

interface BeatDistribution {
  startNumber: number;
  value: number;
  bounds: Bounds;
}

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

  XOffset: number; // not sure if this is what we want to go with

  constructor(properties: MeasureProps) {
    this.ID = properties.ID;
    this.Bounds = properties.Bounds;
    this.TimeSignature = properties.TimeSignature;
    this.Notes = properties.Notes;
    this.BeatDistribution = properties.BeatDistribution
    this.RenderClef = properties.RenderClef;
    this.XOffset = 0;
    if (this.RenderClef) { this.XOffset = 30; }

    // probably always last
    this.CreateBeatDistribution();
  }

  static GetLineHovered(y: number, msr: Measure, cam: Camera): { num: number, bounds: Bounds } {
    const relYPos = y - msr.Bounds.y - cam.y;
    const line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
    return { num: line, 
      bounds: new Bounds(msr.Bounds.x, msr.Bounds.y + ((line * 5) - 2.5),
                         msr.Bounds.width + msr.XOffset, 5) };
  }

  GetBoundsWithOffset(): Bounds {
    return new Bounds(this.Bounds.x, 
                      this.Bounds.y,
                      this.Bounds.width + this.XOffset,
                      this.Bounds.height);
  }

  CreateBeatDistribution() {
    this.BeatDistribution = []; // empty
    let nextBeat = 0;
    let runningValue = 0; 
    // sort notes first by beat
    if (this.Notes.length === 0) {
      this.BeatDistribution.push(
        {
          startNumber: 1,
          value: 1,
          bounds: this.CreateBeatBounds(1, 1)
        });
    }

    this.Notes.sort((a: Note, b: Note) => {
      return a.Beat - b.Beat;
    });
    this.Notes.forEach(n => {
      if (!this.BeatDistribution.find(div => div.startNumber === n.Beat)) {
        this.BeatDistribution.push(
          {
            startNumber: n.Beat,
            value: n.Duration,
            bounds: this.CreateBeatBounds(n.Beat, n.Duration)
          });
          nextBeat = n.Beat + (n.Duration * this.TimeSignature.bottom);
          runningValue += n.Duration;
      }
    });
    if (runningValue > 0 && nextBeat <= this.TimeSignature.bottom) {
      this.BeatDistribution.push({
        startNumber: nextBeat,
        value: 1 - runningValue,
        bounds: this.CreateBeatBounds(nextBeat, (1 - runningValue))
      });
    }
  }

  CreateBeatBounds(beat: number, value: number): Bounds {
    const height = this.Bounds.height; // height will always be max
    const width = this.Bounds.width * value; // value will max at 1 (entire measure)
    const y = this.Bounds.y;
    const x = this.Bounds.x + this.XOffset + ((beat - 1) / this.TimeSignature.bottom) * this.Bounds.width;
    return new Bounds(x, y, width, height);
  }

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    this.CreateBeatDistribution();
  }

  AddNote(note: Note): void {
    this.Notes.push(note);
  }
}

export { Measure, MeasureProps, BeatDistribution };
