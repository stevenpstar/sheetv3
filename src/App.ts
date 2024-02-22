import { Sheet, SheetProps } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";

class App { 
  Canvas: HTMLCanvasElement;
  Context: CanvasRenderingContext2D;
  Load: boolean;
  Sheet: Sheet;
  HoveredElements: { MeasureID: number };
  NoteInput: boolean;
  Zoom: number;
  constructor (canvas: HTMLCanvasElement, 
             context: CanvasRenderingContext2D,
             load: boolean = false) {
    this.Canvas = canvas;
    this.Context = context;
    this.Load = load;
    this.HoveredElements = { MeasureID: -1 };
    this.Zoom = 1;
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
  }

  Hover(x: number, y: number): void {
    this.HoveredElements.MeasureID = -1;
    this.Sheet.Measures.forEach(measure => {
      if (measure.Bounds.IsHovered(x, y)) { 
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

      this.Sheet.Measures.forEach(measure => {
        if (measure.Bounds.IsHovered(x, y)) { 
          this.HoveredElements.MeasureID = measure.ID; 

          // add note
          measure.BeatDistribution.forEach(d => {
            const line = Measure.GetLineHovered(y, measure);
            if (d.bounds.IsHovered(x, y)) {
              const noteProps = {
                Beat: d.startNumber,
                Duration: d.value,
                Line: line.num
              };
              const newNote: Note = new Note(noteProps);
              newNote.SetBounds(line.bounds);
              measure.AddNote(newNote);
            }
          })

        }
    });

    this.Update(x, y);
  }
  Update(x: number, y : number): void {

    // this should be the only place that calls render
    this.Render({ x: x, y: y });
  }
  Render(mousePos: {x: number, y: number}): void {
    Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.HoveredElements, mousePos);
  }

  AddMeasure(): void {
    const newMeasureID = this.Sheet.Measures.length;
    const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length-1];
    const x = prevMsr.Bounds.x + prevMsr.Bounds.width;
    const newMeasureBounds = new Bounds(x, prevMsr.Bounds.y, prevMsr.Bounds.width, prevMsr.Bounds.height);
    const newMsr = CreateMeasure(newMeasureID, newMeasureBounds, prevMsr.TimeSignature);
    this.Sheet.Measures.push(newMsr);
  }

  ChangeInputMode(): void {
    this.NoteInput = !this.NoteInput;
  }

  AlterZoom(num: number): void {
    this.Zoom += num;
    // This kind of works but I will need to change mouse position values etc.
//    this.Context.scale(this.Zoom, this.Zoom);
  }

  // TEST FUNCTION
  ResizeFirstMeasure(): void {
    this.Sheet.Measures[0].Bounds.width += 50;
    this.Sheet.Measures[0].CreateBeatDistribution();
    for (let i = 1; i < this.Sheet.Measures.length; i++) {
      this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i-1]);
    }
    this.Update(0, 0);
  }
}

export { App };
