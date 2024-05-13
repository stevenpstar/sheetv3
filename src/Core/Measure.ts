import { Bounds } from '../Types/Bounds.js';
import { ISelectable, SelectableTypes } from '../Types/ISelectable.js';
import { UpdateNoteBounds } from '../Workers/NoteInput.js';
import { Camera } from './Camera.js';
import { Clef } from './Clef.js';
import { CreateDivisions, type Division, ResizeDivisions, DivisionMinWidth } from './Division.js';
import { Instrument, StaffType } from './Instrument.js';
import { Note, NoteProps } from './Note.js';
import { Page } from './Page.js';

interface MeasureProps {
  Instrument: Instrument,
  Bounds: Bounds;
  TimeSignature: { top: number, bottom: number };
  KeySignature: string;
  Notes: Note[];
  Clef: string;
  RenderClef: boolean;
  RenderTimeSig: boolean;
  RenderKey: boolean;
  Camera: Camera;
  Page: Page;
}

class Measure implements ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes;
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
  Camera: Camera;
  Page: Page;
  PageLine: Number;

  XOffset: number; // not sure if this is what we want to go with


  // TODO: Move this, this is prototyping and messy
  // Staff line number properties
  // Staff A
  SALineTop: number;
  SALineMid: number;
  SALineBot: number;

  SALineTopSave: number;
  SALineBotSave: number;

  SALineTopDef: number;
  SALineBotDef: number;

  PrefBoundsY: number;
  PrevBoundsH: number;

  // Staff B
  SBLineTop: number;
  SBLineMid: number;
  SBLineBot: number;
  SBLineTopSave: number;
  SBLineBotSave: number;
  SBLineTopDef: number;
  SBLineBotDef: number;

  SBOffset: number;

  // Grouping of measures on a line/for formatting
  Line: number;
  RunningID: { count: number };

  constructor(properties: MeasureProps, runningId: { count: number }) {
    this.RunningID = runningId;
    this.ID = 0;
    this.Selected = false;
    this.SelType = SelectableTypes.Measure;
    this.Instrument = properties.Instrument;
    this.Line = 0;
    this.Bounds = properties.Bounds;
    this.TimeSignature = properties.TimeSignature;
    this.KeySignature = properties.KeySignature;
    this.Notes = properties.Notes;
    this.BNotes = [];
    this.Divisions = [];
    this.BDivisions = [];
    this.RenderClef = properties.RenderClef;
    this.RenderKey = properties.RenderKey;
    this.Camera = properties.Camera;
    this.RenderTimeSig = properties.RenderTimeSig;
    this.Page = properties.Page;
    this.PageLine = properties.Page.PageLines[0].Number;

    this.PrefBoundsY = this.Bounds.y;
    this.PrevBoundsH = this.Bounds.height;
    this.SetXOffset();

    this.SALineTop = 5;
    this.SALineMid = 15;
    this.SALineBot = 24;

    this.SALineTopSave = this.SALineTop;
    this.SALineBotSave = this.SALineBot;

    this.SALineTopDef = this.SALineTop;
    this.SALineBotDef = this.SALineBot;

    this.SBLineTop = 1035;
    this.SBLineMid = 1045;
    this.SBLineBot = 1054;

    this.SBLineTopSave = this.SBLineTop;
    this.SBLineBotSave = this.SBLineBot;

    this.SBLineTopDef = this.SBLineTop;
    this.SBLineBotDef = this.SBLineBot;

    this.SBOffset = 1000;
    // create default clef
    const trebleClef = new Clef(0, {x: 
      this.Bounds.x + 16, 
      y: this.Bounds.y + (5 * Measure.GetMeasureMidLine(this) + (10 * 2))}, "treble", 1);
    trebleClef.SetBounds(this, 0);

    this.Clefs.push(trebleClef);
    if (this.Instrument.Staff === StaffType.Grand) {
      const bassClef = new Clef(1, { 
        x: this.Bounds.x + 30,
        y: this.Bounds.y + this.GetMeasureHeight() + (this.GetGrandMeasureMidLine() * 5) - 2 
      }, "bass", 1);
      bassClef.SetBounds(this, 1);
      this.GrandClefs.push(bassClef);
    }
    
    // probably always last
    this.CreateDivisions(this.Camera);
  }

  static GetLineHovered(y: number, msr: Measure): { num: number, bounds: Bounds } {
    const cam = msr.Camera;
    const relYPos = y - msr.Bounds.y - cam.y; //TODO: Dunno about scaling by zoom here
    let line = Math.floor(relYPos / (5)); // this should be a constant, line_height (defined somewhere)
    let actualLine = line + msr.SALineTop;
    const bounds = new Bounds(msr.Bounds.x, 0, msr.Bounds.width + msr.XOffset, (5));
    if (actualLine > msr.SALineBot) {
      const diff = actualLine - msr.SALineBot;
      actualLine = msr.SBLineTop + diff;
      bounds.y = msr.Bounds.y + msr.GetMeasureHeight() + ((diff * (5)) - 2.5);
    } else {
      bounds.y = msr.Bounds.y + ((line * (5)) - 2.5);
    }
    return { num: actualLine, 
      bounds: bounds};
  }

  //STATIC? WHY? I DUNNO
  // Get note position relative to staff/measure
  static GetNotePositionOnLine(msr: Measure, line: number): number {
    const cam = msr.Camera;
    let y = 0;
    if (line <= msr.SALineBot) {
      y = msr.Bounds.y + (line - msr.SALineTop) * (5);
    } else {
      y = msr.Bounds.y + msr.GetMeasureHeight() + ((line - msr.SBLineTop) * (5));
    }
    return y - 2.5;
  }

  static GetMeasureHeight(msr: Measure, cam: Camera): number {
    return ( msr.SALineTop + msr.SALineBot ) * (5);
    // expand on this to include grand staffs and have line height (5) be 
    // a constant that is defined somewhere
  }

  static GetMeasureMidLine(msr: Measure): number {
    return ( msr.SALineMid - msr.SALineTop);
  }

  GetBoundsWithOffset(): Bounds {
    return new Bounds(this.Bounds.x, 
                      this.Bounds.y,
                      this.Bounds.width + this.XOffset,
                      this.Bounds.height);
  }

  SetXOffset(): void {
    this.XOffset = 0;
    if (this.RenderClef) { this.XOffset += (30); }
    if (this.RenderKey) { this.XOffset += (30); }
    if (this.RenderTimeSig) { this.XOffset += (30); }
  }

  CreateDivisions(cam: Camera, afterInput: boolean = false) {
    if (afterInput) {
      this.ResetHeight();
    }
    this.Divisions = [];
    this.Divisions.push(...CreateDivisions(this, this.Notes, 0, cam));
    if (this.Instrument.Staff === StaffType.Grand) {
      this.Divisions.push(...CreateDivisions(this, this.Notes, 1, cam));
      ResizeDivisions(this, this.Divisions, 1);
    }
  ResizeDivisions(this, this.Divisions, 0);
  UpdateNoteBounds(this, 0);
  UpdateNoteBounds(this, 1);
}

  Reposition(prevMsr: Measure): void {
    this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    this.CreateDivisions(this.Camera);
  }

  // set height of measure based off of notes in measure
  // eventually will be determined by instrument / row etc.
  
  GetMeasureHeight(): number {
    const lineHeight = (5); // constant should be set elsewhere
    const topNegative = this.SALineTop < 0;
    const heightInLines = topNegative ? 
      this.SALineBot + Math.abs(this.SALineTop) :
      this.SALineBot - this.SALineTop;
    return heightInLines * lineHeight;
  }

  GetGrandMeasureHeight(): number {
    const lineHeight = (5); // constant should be set elsewhere
    const topStaffHeight = this.GetMeasureHeight();
    const topNegative = (this.SBLineTop - this.SBOffset) < 0;
    const heightInLines = topNegative ?
      (this.SBLineBot - this.SBOffset) + (Math.abs(this.SBLineTop - this.SBOffset)) :
      (this.SBLineBot - this.SBOffset) - (this.SBLineTop - this.SBOffset);
    return topStaffHeight + (heightInLines * lineHeight);
  }

  GetGrandMeasureMidLine(): number {
    return this.SBLineMid - this.SBLineTop;
  }

  ResetHeight(): void {
    const height = this.Instrument.Staff === StaffType.Single ? 
      this.GetMeasureHeight() : this.GetGrandMeasureHeight();
    this.Bounds.height = height;
    this.PrevBoundsH = height;
    // move this somewhere else
    this.SALineTop = this.SALineTopSave;
    this.SALineBot = this.SALineBotSave;
    this.SBLineTop = this.SBLineTopSave;
    this.SBLineBot = this.SBLineBotSave;
    this.Bounds.y = this.PrefBoundsY;
  }

  // name change later I'm too tired to think of actual function name
  ReHeightenTop(expand: boolean, lineOver: number): void {
    if (expand) {
      const dist = lineOver - this.SALineTop;
      this.SALineTop = lineOver - dist - 1;
      this.Bounds.y -= 5;
      this.Bounds.height += 5;
    } else {
      if (lineOver >= this.SALineTopSave) {
        this.SALineTop = this.SALineTopSave;
        this.Bounds.y = this.PrefBoundsY;
      } else {
        this.SALineTop += 1;
        this.Bounds.y += 5;
      }
    }
    this.CreateDivisions(this.Camera);
  }

  ReHeightenBot(expand: boolean, lineOver: number): void {
    if (expand) {
      this.SALineBot = lineOver + 2;
      this.Bounds.height += 5;
    } else {
      if (lineOver <= this.SALineBotSave) {
        this.SALineBot = this.SALineBotSave;
        this.Bounds.height = this.PrevBoundsH;
      } else {
        this.SALineBot -= 1;
        this.Bounds.height -= 5;
      }
    }
    this.CreateDivisions(this.Camera);
  }

  ReHeightenTopGrand(expand: boolean, lineOver: number): void {
    if (expand) {
      const dist = lineOver - this.SBLineTop;
      this.SBLineTop = lineOver - dist - 1;
      this.Bounds.y -= 5;
      this.Bounds.height += 5;
    } else {
      if (lineOver >= this.SBLineTopSave) {
        this.SBLineTop = this.SBLineTopSave;
        this.Bounds.y = this.PrefBoundsY;
      } else {
        this.SBLineTop += 1;
        this.Bounds.y += 5;
      }
    }
    this.CreateDivisions(this.Camera);
  }

  ReHeightenBotGrand(expand: boolean, lineOver: number): void {
    if (expand) {
      this.SBLineBot = lineOver + 2;
      this.Bounds.height += 5;
    } else {
      if (lineOver <= this.SBLineBotSave) {
        this.SBLineBot = this.SBLineBotSave;
        this.Bounds.height = this.PrevBoundsH;
      } else {
        this.SBLineBot -= 1;
        this.Bounds.height -= 5;
      }
    }
    this.CreateDivisions(this.Camera);
  }

  ResetTopHeight(): void {
    this.SALineTop = this.SALineTopSave;
    this.Bounds.y = this.PrefBoundsY;
    this.Bounds.height = this.PrevBoundsH;
    this.CreateDivisions(this.Camera);
  }

  AddNote(note: Note): void {
    if (note.Rest) {
      this.ClearNonRestNotes(note.Beat, note.Staff);
    } else {
      this.ClearRestNotes(note.Beat, note.Staff);
    }
    note.SetID(this.RunningID.count);
    this.RunningID.count++;
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
            Staff: staff,
            Tuple: false,
            TupleIndex: 0,
            TupleCount: 1
          }

          this.AddNote(new Note(restProps));
        }
      }
    }
  }

  GetMinimumWidth(): number {
    if (this.Notes.filter(n => n.Rest !== true).length === 0) {
      return DivisionMinWidth * 4;
    }
    const staffZeroDivs = this.Divisions.filter(div => div.Staff === 0);
    const staffOneDivs = this.Divisions.filter(div => div.Staff === 1);
    const lowestValue = this.Divisions.sort((a: Division, b: Division) => {
      return a.Duration - b.Duration;
    })[0].Duration;
    const count = 1 / lowestValue;

    //const count = staffZeroDivs.length > staffOneDivs.length ? staffZeroDivs.length : staffOneDivs.length;
    return count * DivisionMinWidth;
  }

  ReturnSelectableElements(): ISelectable[] {
    const sel: ISelectable[] = [];
    sel.push(...this.Notes);
    sel.push(...this.Clefs);
    return sel;
  }
}

export { Measure, MeasureProps, Division, Clef };
