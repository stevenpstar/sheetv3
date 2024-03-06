import { Sheet } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { InputOnMeasure } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { GetDivisionTotalWidth } from "./Core/Division.js";
class App {
    constructor(canvas, context, load = false) {
        this.Canvas = canvas;
        this.Selector = new Selector();
        this.Context = context;
        this.Load = load;
        this.HoveredElements = { MeasureID: -1 };
        this.Zoom = 1;
        this.CamDragging = false;
        this.DraggingPositions = { x1: 0, y1: 0, x2: 0, y2: 0 };
        this.Camera = new Camera(0, 0);
        this.NoteValue = 0.25;
        if (!this.Load) {
            // Create New Sheet Properties
            const sProps = {
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
    Hover(x, y) {
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
        this.Sheet.Measures.forEach(measure => {
            // TODO: Make this a function of measure probably
            if (measure.GetBoundsWithOffset().IsHovered(x, y, this.Camera)) {
                this.HoveredElements.MeasureID = measure.ID;
            }
        });
        this.Update(x, y);
    }
    Delete() {
        for (let [msr, notes] of this.Selector.Notes) {
            msr.DeleteSelected();
        }
    }
    Input(x, y, shiftKey) {
        // will move this code elsewhere, testing note input
        this.HoveredElements.MeasureID = -1;
        const msrOver = this.Sheet
            .Measures
            .find((msr) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));
        if (msrOver === undefined) {
            if (!shiftKey) {
                this.Selector.DeselectAll();
                this.Update(x, y);
            }
            return;
        } // no measure over
        if (!this.NoteInput) {
            this.Selector.SelectNote(msrOver, x, y, this.Camera, shiftKey);
            if (!this.DraggingNote) {
                this.DraggingNote = true;
            }
            this.StartLine = Measure.GetLineHovered(y, msrOver, this.Camera).num;
            this.Update(0, 0);
            return;
        }
        InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, false);
        this.ResizeMeasures(this.Sheet.Measures);
        this.Update(x, y);
    }
    Update(x, y) {
        // this should be the only place that calls render
        this.Render({ x: x, y: y });
    }
    Render(mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.HoveredElements, mousePos, this.Camera, this.NoteInput, this.RestInput);
    }
    AddMeasure() {
        const line = Math.floor(this.Sheet.Measures.length / 4);
        // TODO: This is a test
        let y = line * 200;
        const newLine = false; //(this.Sheet.Measures.length % 4 === 0 && line !== 0);
        // TODO: End testing for "new line formatting"
        const newMeasureID = this.Sheet.Measures.length;
        const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        let x = 0;
        if (!newLine) {
            x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
            y = prevMsr.Bounds.y;
        }
        const newMeasureBounds = new Bounds(x, y, 150, prevMsr.Bounds.height);
        const newMsr = CreateMeasure(newMeasureID, newMeasureBounds, prevMsr.TimeSignature, newLine);
        this.Sheet.Measures.push(newMsr);
    }
    ChangeInputMode() {
        this.NoteInput = !this.NoteInput;
    }
    DragNote(x, y) {
        const msrOver = this.Sheet
            .Measures.find(m => m.GetBoundsWithOffset().IsHovered(x, y, this.Camera));
        if (msrOver === undefined) {
            this.DraggingNote = false;
            this.StartLine = -1;
            this.EndLine = -1;
            return;
        }
        this.EndLine = Measure.GetLineHovered(y, msrOver, this.Camera).num;
        const lineDiff = this.EndLine - this.StartLine;
        for (let [msr, notes] of this.Selector.Notes) {
            notes.forEach(n => {
                n.Line += lineDiff;
            });
        }
        this.StartLine = this.EndLine;
    }
    StopNoteDrag(x, y) {
        if (this.DraggingNote) {
            this.StartLine = -1;
            this.EndLine = -1;
            this.DraggingNote = false;
        }
    }
    SetCameraDragging(dragging, x, y) {
        this.CamDragging = dragging;
        if (this.CamDragging) {
            // set initial drag position
            this.DraggingPositions.x1 = x;
            this.DraggingPositions.y1 = y;
        }
        else {
            // reset drag positions
            this.DraggingPositions.x1 = 0;
            this.DraggingPositions.y1 = 0;
            this.DraggingPositions.x2 = 0;
            this.DraggingPositions.y2 = 0;
            this.Camera.oldX = this.Camera.x;
            this.Camera.oldY = this.Camera.y;
        }
    }
    AlterZoom(num) {
        this.Zoom += num;
        this.Camera.Zoom = this.Zoom;
        // This kind of works but I will need to change mouse position values etc.
        // Kinda doesn't work, zoom value seems to not reduce consistently.
        //this.Context.scale(this.Zoom, this.Zoom);
    }
    // TEST FUNCTION
    ResizeFirstMeasure() {
        //    this.Sheet.Measures[0].Bounds.width += 50;
        this.Sheet.Measures[0].CreateDivisions();
        for (let i = 1; i < this.Sheet.Measures.length; i++) {
            this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i - 1]);
        }
        this.Update(0, 0);
    }
    ResizeMeasures(measures) {
        measures.forEach((msr, i) => {
            msr.Bounds.width = GetDivisionTotalWidth(msr.Divisions);
            if (i > 0) {
                this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i - 1]);
            }
        });
        this.Update(0, 0);
    }
    SetNoteValue(val) {
        this.NoteValue = val;
    }
}
export { App };
