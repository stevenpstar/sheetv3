import { Bounds } from '../Types/Bounds.js';
import { Camera } from './Camera.js';
import { Note } from './Note.js';

interface Division {
  Beat: number;
  Duration: number;
  Bounds: Bounds;
}

interface MeasureProps {
  ID: number;
  Bounds: Bounds;
  TimeSignature: { top: number, bottom: number };
  Notes: Note[];
  Divisions: Division[];
  RenderClef: boolean;
}
class Measure {
  ID: number;
  Bounds: Bounds;
  TimeSignature: {top: number, bottom: number}
  Notes: Note[];
  Divisions: Division[];
  RenderClef: boolean;

  XOffset: number; // not sure if this is what we want to go with
  DivisionMinWidth: number;
  DivisionMaxWidth: number;

  constructor(properties: MeasureProps) {
    this.ID = properties.ID;
    this.Bounds = properties.Bounds;
    this.TimeSignature = properties.TimeSignature;
    this.Notes = properties.Notes;
    this.Divisions = properties.Divisions;
    this.RenderClef = properties.RenderClef;
    this.XOffset = 0;
    this.DivisionMinWidth = 30;
    this.DivisionMaxWidth = 40;
    if (this.RenderClef) { this.XOffset = 30; }

    // probably always last
    this.CreateDivisions();
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

  CreateDivisions() {
    this.Divisions = []; // empty
    let nextBeat = 0;
    let runningValue = 0; 
    // sort notes first by beat
    if (this.Notes.length === 0) {
      this.Divisions.push(
        {
          Beat: 1,
          Duration: 1,
          Bounds: this.CreateBeatBounds(1, 1)
        });
    }

    this.Notes.sort((a: Note, b: Note) => {
      return a.Beat - b.Beat;
    });
    this.Notes.forEach(n => {
      if (!this.Divisions.find(div => div.Beat === n.Beat)) {
        this.Divisions.push(
          {
            Beat: n.Beat,
            Duration: n.Duration,
            Bounds: this.CreateBeatBounds(n.Beat, n.Duration)
          });
          nextBeat = n.Beat + (n.Duration * this.TimeSignature.bottom);
          runningValue += n.Duration;
      }
    });
    if (runningValue > 0 && (nextBeat - 1) < this.TimeSignature.bottom) {
      this.Divisions.push({
        Beat: nextBeat,
        Duration: 1 - runningValue,
        Bounds: this.CreateBeatBounds(nextBeat, (1 - runningValue))
      });
    }
    console.log(this.Divisions);
    this.ResizeDivisions(this.Divisions);
  }

  CreateBeatBounds(beat: number, value: number): Bounds {
    const height = this.Bounds.height; // height will always be max
    const width = this.Bounds.width * value; // value will max at 1 (entire measure)
    const y = this.Bounds.y;
    const x = this.Bounds.x + this.XOffset + ((beat - 1) / this.TimeSignature.bottom) * this.Bounds.width;
    return new Bounds(x, y, width, height);
  }

  ResizeDivisions(divisions: Division[]): void {
    divisions.forEach((div: Division, i: number) => {
      if (div.Bounds.width < this.DivisionMinWidth || div.Duration < 0.25) {
        div.Bounds.width = this.DivisionMinWidth;
      }
      if (div.Bounds.width > this.DivisionMaxWidth || div.Duration >= 0.25) {
        div.Bounds.width = this.DivisionMaxWidth;
      }
      if (i > 0) {
        const lastDivEnd = divisions[i-1].Bounds.x + divisions[i-1].Bounds.width;
        if (lastDivEnd !== div.Bounds.x) {
          div.Bounds.x = lastDivEnd;
        }
      }

      if (i === 0 && divisions.length === 1) {
        div.Bounds.width = this.Bounds.width;
      }
    });
  }

  GetDivisionTotalWidth(): number {
    let width = 0;
    this.Divisions.forEach(div => {
      width += div.Bounds.width;
    });
    return width;
  }

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    this.CreateDivisions();
  }

  AddNote(note: Note): void {
    this.Notes.push(note);
  }
}

export { Measure, MeasureProps, Division };
