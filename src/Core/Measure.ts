import { Bounds } from '../Types/Bounds.js';
import { Camera } from './Camera.js';
import { CreateDivisions, Division, ResizeDivisions } from './Division.js';
import { Instrument, StaffType } from './Instrument.js';
import { Note, NoteProps } from './Note.js';

interface MeasureProps {
  Instrument: Instrument,
  Bounds: Bounds;
  TimeSignature: { top: number, bottom: number };
  KeySignature: string;
  Notes: Note[];
  Divisions: Division[];
  Clef: string;
  RenderClef: boolean;
  RenderTimeSig: boolean;
  RenderKey: boolean;
}

interface Clef {
  Type: string;
  Beat: number;
}

class Measure {
  Instrument: Instrument;
  Bounds: Bounds;
  Clefs: Clef[] = [];
  GrandClefs: Clef[] = [];
  TimeSignature: {top: number, bottom: number}
  KeySignature: string;
  Notes: Note[];
  BNotes: Note[];
  Divisions: Division[];
  BDivisions: Division[];
  RenderClef: boolean;
  RenderKey: boolean;
  RenderTimeSig: boolean;

  XOffset: number; // not sure if this is what we want to go with

  // Staff line number properties
  // Staff A
  SALineTop: number;
  SALineMid: number;
  SALineBot: number;
  // Staff B
  SBLineTop: number;
  SBLineMid: number;
  SBLineBot: number;
  SBOffset: number;

  constructor(properties: MeasureProps) {
    this.Instrument = properties.Instrument;
    this.Bounds = properties.Bounds;
    this.TimeSignature = properties.TimeSignature;
    this.KeySignature = properties.KeySignature;
    this.Notes = properties.Notes;
    this.BNotes = [];
    this.Divisions = properties.Divisions;
    this.BDivisions = [];
    this.RenderClef = properties.RenderClef;
    this.RenderKey = properties.RenderKey;
    this.RenderTimeSig = properties.RenderTimeSig;
    this.Clefs.push({Type: properties.Clef, Beat: 1});
    if (this.Instrument.Staff === StaffType.Grand) {
      this.GrandClefs.push({Type: "bass", Beat: 1});
    }
    this.SetXOffset();
    
    // probably always last
    this.CreateDivisions();

    this.SALineTop = 5;
    this.SALineMid = 15;
    this.SALineBot = 24;

    this.SBLineTop = 1035;
    this.SBLineMid = 1045;
    this.SBLineBot = 1044;

    this.SBOffset = 1000;
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

  SetXOffset(): void {
    this.XOffset = 0;
    if (this.RenderClef) { this.XOffset += 30; }
    if (this.RenderKey) { this.XOffset += 30; }
    if (this.RenderTimeSig) { this.XOffset += 30; }
  }

  CreateDivisions() {
    this.Divisions = [];
    this.BDivisions = [];
    this.Divisions.push(...CreateDivisions(this, this.Notes, 0));
    if (this.Instrument.Staff === StaffType.Grand) {
      this.Divisions.push(...CreateDivisions(this, this.Notes, 1));
      ResizeDivisions(this, this.Divisions, 1);
    }
  ResizeDivisions(this, this.Divisions, 0);
  }

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    this.CreateDivisions();
  }

  AddNote(note: Note): void {
    if (note.Rest) {
      this.ClearNonRestNotes(note.Beat, note.Staff);
    } else {
      this.ClearRestNotes(note.Beat, note.Staff);
    }
    this.Notes.push(note);
  }

  ClearNonRestNotes(beat: number, staff: number): void {
    for (let n = this.Notes.length - 1;n >= 0; n--) {
      if (this.Notes[n].Beat === beat &&
          this.Notes[n].Rest === false &&
          this.Notes[n].Staff === staff) {
        this.Notes.splice(n, 1);
      }
    }
  }

  ClearRestNotes(beat: number, staff: number): void {
    for (let n = this.Notes.length - 1;n >= 0; n--) {
      if (this.Notes[n].Beat === beat &&
          this.Notes[n].Rest === true &&
          this.Notes[n].Staff === staff) {
        this.Notes.splice(n, 1);
      }
    }
  }

  DeleteSelected(): void {
    for (let n = this.Notes.length - 1; n >= 0; n--) {
      if (this.Notes[n].Selected) {
        let beat = this.Notes[n].Beat;
        let duration = this.Notes[n].Duration;
        let staff = this.Notes[n].Staff;
        this.Notes.splice(n, 1);
        const notesOnBeat = this.Notes.filter(n => n.Beat === beat);
        if (notesOnBeat.length === 0) {
          // beat is empty and requires a rest note
          const restProps: NoteProps = {
            Beat: beat,
            Duration: duration,
            Line: 15,
            Rest: true,
            Tied: false,
            Staff: staff
          }

          this.AddNote(new Note(restProps));
        }
      }
    }
  }
}

export { Measure, MeasureProps, Division, Clef };
