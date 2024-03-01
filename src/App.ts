import { Sheet, SheetProps } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";
import { Camera } from "./Core/Camera.js";
import { InputOnMeasure } from "./Workers/NoteInput.js";

class App { 
  Canvas: HTMLCanvasElement;
  Context: CanvasRenderingContext2D;
  Load: boolean;
  Sheet: Sheet;
  HoveredElements: { MeasureID: number };
  NoteInput: boolean;
  RestInput: boolean;
  Zoom: number;
  Camera: Camera;
  Dragging: boolean;
  DraggingPositions: { x1: number, y1: number, x2: number, y2: number };
  NoteValue: number;

  constructor (canvas: HTMLCanvasElement, 
             context: CanvasRenderingContext2D,
             load: boolean = false) {
    this.Canvas = canvas;
    this.Context = context;
    this.Load = load;
    this.HoveredElements = { MeasureID: -1 };
    this.Zoom = 1;
    this.Dragging = false;
    this.DraggingPositions = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.Camera = new Camera(0, 0);
    this.NoteValue = 0.25;

    if (!this.Load) {
      // Create New Sheet Properties
      const sProps: SheetProps = {
        Instruments: [],
        KeySignature: [{ key: "CMaj", measureNo: 0 }],
        Measures: []
      };

      sProps.Instruments.push(CreateDefaultPiano(0));
      sProps.Measures.push(CreateDefaultMeasure());

      this.Sheet = new Sheet(sProps);
    }
    this.NoteInput = false;
    this.RestInput = false;
    this.Update(0, 0);
  }

  Hover(x: number, y: number): void {
    if (this.Dragging) {
      this.Camera.x = Math.floor(this.Camera.oldX + x - this.DraggingPositions.x1);
      this.Camera.y = Math.floor(this.Camera.oldY + y - this.DraggingPositions.y1);
      this.Update(x, y);
      return;
    }
    this.HoveredElements.MeasureID = -1;
    this.Sheet.Measures.forEach(measure => {
      // TODO: Make this a function of measure probably
      if (measure.GetBoundsWithOffset().IsHovered(x, y, this.Camera)) { 
        this.HoveredElements.MeasureID = measure.ID; 
      }
    })
    this.Update(x, y);
  }
  Input(x: number, y: number): void {
    // will move this code elsewhere, testing note input
    if (!this.NoteInput) {
      return;
    }
    this.HoveredElements.MeasureID = -1;
    const msrOver: Measure | undefined = this.Sheet
      .Measures
      .find( (msr: Measure) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));

    if (msrOver === undefined) { return; } // no measure over

    InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, false);
    this.ResizeMeasures(this.Sheet.Measures);

    this.Update(x, y);
  }
  Update(x: number, y : number): void {

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
  }

  AddMeasure(): void {
    const newMeasureID = this.Sheet.Measures.length;
    const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length-1];
    const x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
    const newMeasureBounds = new Bounds(x, prevMsr.Bounds.y, 150, prevMsr.Bounds.height);
    const newMsr = CreateMeasure(newMeasureID, newMeasureBounds, prevMsr.TimeSignature);
    this.Sheet.Measures.push(newMsr);
  }

  ChangeInputMode(): void {
    this.NoteInput = !this.NoteInput;
  }

  SetDragging(dragging: boolean, x: number, y: number): void {
    this.Dragging = dragging;
    if (this.Dragging) {
      // set initial drag position
      this.DraggingPositions.x1 = x;
      this.DraggingPositions.y1 = y;
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
    // This kind of works but I will need to change mouse position values etc.
    // Kinda doesn't work, zoom value seems to not reduce consistently.
    //this.Context.scale(this.Zoom, this.Zoom);
  }

  // TEST FUNCTION
  ResizeFirstMeasure(): void {
//    this.Sheet.Measures[0].Bounds.width += 50;
    this.Sheet.Measures[0].CreateDivisions();
    for (let i = 1; i < this.Sheet.Measures.length; i++) {
      this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i-1]);
    }
    this.Update(0, 0);
  }

  ResizeMeasures(measures: Measure[]): void {
    measures.forEach((msr: Measure, i: number) => {
      msr.Bounds.width = msr.GetDivisionTotalWidth();
      if (i > 0) {
        this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i-1]);
      }
    });
    this.Update(0, 0);
  }

  SetNoteValue(val: number): void {
    this.NoteValue = val;
  }
}

export { App };
