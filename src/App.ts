import { Sheet, SheetProps } from "./Core/Sheet.js";
import { RenderDebug, Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateInstrument, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Clef, Division, Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";
import { Camera } from "./Core/Camera.js";
import { InputOnMeasure, UpdateNoteBounds } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { GetDivisionTotalWidth } from "./Core/Division.js";
import { Instrument } from "./Core/Instrument.js";
import { ManageHeight } from "./Workers/Heightener.js";
import { KeyMapping, KeyPress } from "./Workers/Mappings.js";

class App { 
  Canvas: HTMLCanvasElement;
  Container: HTMLElement;
  Context: CanvasRenderingContext2D;
  Load: boolean;
  Sheet: Sheet;
  HoveredElements: { MeasureID: number };
  NoteInput: boolean;
  RestInput: boolean;
  Zoom: number;
  Camera: Camera;
  CamDragging: boolean;
  DraggingPositions: { x1: number, y1: number, x2: number, y2: number };
  NoteValue: number;
  Selector: Selector;
  NotifyCallback: (msg: string) => void;
  RunningID: { count: number };

  // TODO: Off load some of this work to other classes/functions 
  // For now we prototype here
  DraggingNote: boolean;
  StartLine: number;
  EndLine: number;

  Debug: boolean;

  constructor (canvas: HTMLCanvasElement, 
               container: HTMLElement,
             context: CanvasRenderingContext2D,
             notifyCallback: (msg: string) => void,
              load = false) {
    this.NotifyCallback = notifyCallback;
    this.Debug = true;
    this.Canvas = canvas;
    this.Container = container;
    this.Selector = new Selector();
    this.Context = context;
    this.Load = load;
    this.HoveredElements = { MeasureID: -1 };
    this.Zoom = 1;
    this.RunningID = { count: 0 };
    this.CamDragging = false;
    this.DraggingPositions = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.Camera = new Camera(0, 0);
    this.Camera.Zoom = 1;
    this.NoteValue = 0.25;

    if (!this.Load) {
      // Create New Sheet Properties
      const sProps: SheetProps = {
        Instruments: [],
        KeySignature: [{ key: "CMaj", measureNo: 0 }],
        Measures: []
      };

      sProps.Instruments.push(CreateDefaultPiano());
      sProps.Measures.push(CreateDefaultMeasure(this.RunningID, sProps.Instruments[0], this.Camera));

      this.Sheet = new Sheet(sProps);
    }
    this.NoteInput = false;
    this.RestInput = false;
    this.Update(0, 0);
  }

  Hover(x: number, y: number): void {
    x = x / this.Camera.Zoom;
    y = y / this.Camera.Zoom;

    this.Context.fillStyle = "black";
    this.Context.font = "12px serif";
    if (this.CamDragging) {
      this.Camera.x = Math.floor(this.Camera.oldX + x - this.DraggingPositions.x1);
      this.Camera.y = Math.floor(this.Camera.oldY + y - this.DraggingPositions.y1);
      this.Update(x, y);
      return;
    }
    if (this.DraggingNote) {
      this.DragNote(x, y);
    }
    this.HoveredElements.MeasureID = -1;
    // TODO: Move all this elsewhere
    if (this.NoteInput) {
      this.Sheet.Measures.forEach((m: Measure) => {
        if (m.GetBoundsWithOffset().IsHovered(x, y, this.Camera)) {
          m.Divisions.forEach((d: Division) => {
            if (d.Bounds.IsHovered(x, y, this.Camera)) {
              ManageHeight(m, d.Staff, x, y, this.Camera, this.Sheet.Measures);
              // TODO: Move this so it only is called 
              // at the appropriate time
              UpdateNoteBounds(m, 0);
              UpdateNoteBounds(m, 1);
            }
          })
        } else { 
          m.ResetHeight(); }
      });
    }
    this.Update(x, y);
  }

  Delete(): void {
    for (let [ msr, notes ] of this.Selector.Notes ) {
      msr.DeleteSelected();
    }
  }

  Input(x: number, y: number, shiftKey: boolean): void {
    // will move this code elsewhere, testing note input
    x = x / this.Camera.Zoom;
    y = y / this.Camera.Zoom;
    this.HoveredElements.MeasureID = -1;
    const msrOver: Measure | undefined = this.Sheet
      .Measures
      .find( (msr: Measure) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));

    if (msrOver === undefined) { 
      if (!shiftKey) {
        this.Selector.DeselectAll();
        this.Update(x, y);
      }
      return;
    } // no measure over

    if (!this.NoteInput) {
      this.Selector.SelectNote(msrOver, x, y, this.Camera, shiftKey);
      if (!this.DraggingNote) { this.DraggingNote = true; }
      this.StartLine = Measure.GetLineHovered(y, msrOver).num;
      this.Update(x, y);
      return;
    }
    InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, this.RestInput);
    this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === msrOver.Instrument));

    this.Update(x, y);
    this.NotifyCallback("notify");
  }
  Update(x: number, y : number): void {
//    this.Canvas.width = this.Container.clientWidth;
//    this.Canvas.height = 4000;
//    this.Container.style.height = this.Canvas.height + 'px';
    // this should be the only place that calls render
    this.Render({ x: x, y: y });
  }
  Render(mousePos: {x: number, y: number}): void {
    Renderer(this.Canvas,
             this.Context,
             this.Sheet.Measures,
             this.HoveredElements,
             mousePos, 
             this.Camera,
             this.NoteInput,
             this.RestInput);
    if (this.Debug) {
      RenderDebug(this.Canvas,
                  this.Context,
                  this.Sheet,
                  mousePos,
                  this.Camera,
                  this.Selector);
    }
  }

  AddMeasure(): void {
    const line = Math.floor(this.Sheet.Measures.length / 4);
    // TODO: This is a test
    let y = line * 200;
    const newLine = false;//(this.Sheet.Measures.length % 4 === 0 && line !== 0);
    // TODO: End testing for "new line formatting"
    const newMeasureID = this.Sheet.Measures.length;
    const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length-1];
    let x = 0;
    if (!newLine) {
      x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
      y = prevMsr.Bounds.y;
    } 
    this.Sheet.Instruments.forEach(i => {
      const newMeasureBounds = new Bounds(x, i.Position.y, 150, prevMsr.Bounds.height);
      const newMsr = CreateMeasure(
        i,
       newMeasureBounds,
       prevMsr.TimeSignature,
       prevMsr.KeySignature,
       "treble",
       this.Camera,
       this.RunningID,
       newLine);
      this.Sheet.Measures.push(newMsr);
      this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === i));
    })
  }

  ChangeInputMode(): void {
    this.NoteInput = !this.NoteInput;
  }

  DragNote(x: number, y: number): void {
    const msrOver = this.Sheet
      .Measures.find(m => m.GetBoundsWithOffset().IsHovered(x, y, this.Camera));

    if (msrOver === undefined) { 
      this.DraggingNote = false;
      this.StartLine = -1;
      this.EndLine = -1;
      return; 
    }

    this.EndLine = Measure.GetLineHovered(y, msrOver).num;
    const lineDiff = this.EndLine - this.StartLine;
    for (let [msr, notes] of this.Selector.Notes) {
      notes.forEach(n => {
        n.Line += lineDiff;
        UpdateNoteBounds(msr, n.Staff);
      })
    }
    this.StartLine = this.EndLine;
  }

  StopNoteDrag(x: number, y: number): void {
    if (this.DraggingNote) {
      this.StartLine = -1;
      this.EndLine = -1;
      this.DraggingNote = false;
    }
  }

  SetCameraDragging(dragging: boolean, x: number, y: number): void {
    this.CamDragging = dragging;
    if (this.CamDragging) {
      // set initial drag position
      this.DraggingPositions.x1 = (x / this.Camera.Zoom);
      this.DraggingPositions.y1 = (y / this.Camera.Zoom);
    } else {
      // reset drag positions
      this.DraggingPositions.x1 = 0;
      this.DraggingPositions.y1 = 0;
      this.DraggingPositions.x2 = 0;
      this.DraggingPositions.y2 = 0;
      this.Camera.oldX = this.Camera.x;
      this.Camera.oldY = this.Camera.y;
    }
  }

  AlterZoom(num: number): void {
    this.Zoom += num;
    this.Camera.Zoom = this.Zoom;
    this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
    this.Update(0, 0);
  }

  // TEST FUNCTION
  ResizeFirstMeasure(): void {
//    this.Sheet.Measures[0].Bounds.width += 50;
    this.Sheet.Measures[0].CreateDivisions(this.Camera);
    for (let i = 1; i < this.Sheet.Measures.length; i++) {
      this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i-1]);
    }
    this.Update(0, 0);
  }

  ResizeMeasures(measures: Measure[]): void {
    measures.forEach((msr: Measure, i: number) => {
      msr.Bounds.width = GetDivisionTotalWidth(msr.Divisions);
      if (i > 0) {
        measures[i].Reposition(measures[i-1]);
      }
    });
    this.Update(0, 0);
  }

  SetNoteValue(val: number): void {
    this.NoteValue = val;
  }

  Sharpen(): void {
    for (let [ msr, notes ] of this.Selector.Notes ) {
      notes.forEach(n => {
        n.Accidental += 1;
        if (n.Accidental > 2) { n.Accidental = 2; }
      });
    }
    this.Update(0, 0);
  }
  Flatten(): void {
    for (let [ msr, notes ] of this.Selector.Notes ) {
      notes.forEach(n => {
        n.Accidental -= 1;
        if (n.Accidental < -2) { n.Accidental = -2; }
      })
    }
    this.Update(0, 0);
  }

  //TODO: Remove this test function
  ScaleToggle(): number {
    if (this.Camera.Zoom !== 1) {
      this.Camera.Zoom = 1;
      this.Zoom = 1;
    } else {
      this.Camera.Zoom = 1;
    }
    return this.Camera.Zoom;
  }

  Test_AddClefMiddle(): void {
    const msr = this.Sheet.Measures[0];
    const clef: Clef = {Type: "bass", Beat: 3};
    let clefExist = false;
    msr.Clefs.forEach((c: Clef) => {
      if (c.Beat === clef.Beat && c.Type === clef.Type) {
        clefExist = true;
      }
    });
    if (!clefExist)
      msr.Clefs.push(clef);
  }

  KeyInput(key: string, keymaps: KeyMapping): void {
    KeyPress(this, key, keymaps);
    this.NotifyCallback("notify");
  }

  SelectById(id: number): void {
    this.Selector.SelectById(this.Sheet.Measures, id);
  }
}

export { App };
