import { Sheet } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { InputOnMeasure } from "./Workers/NoteInput.js";
class App {
    constructor(canvas, context, load = false) {
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
    }
    Hover(x, y) {
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
        });
        this.Update(x, y);
    }
    Input(x, y) {
        // will move this code elsewhere, testing note input
        if (!this.NoteInput) {
            return;
        }
        this.HoveredElements.MeasureID = -1;
        const msrOver = this.Sheet
            .Measures
            .find((msr) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));
        if (msrOver === undefined) {
            return;
        } // no measure over
        InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera);
        this.Update(x, y);
    }
    Update(x, y) {
        // this should be the only place that calls render
        this.Render({ x: x, y: y });
    }
    Render(mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.HoveredElements, mousePos, this.Camera);
    }
    AddMeasure() {
        const newMeasureID = this.Sheet.Measures.length;
        const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        const x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        const newMeasureBounds = new Bounds(x, prevMsr.Bounds.y, prevMsr.Bounds.width, prevMsr.Bounds.height);
        const newMsr = CreateMeasure(newMeasureID, newMeasureBounds, prevMsr.TimeSignature);
        this.Sheet.Measures.push(newMsr);
    }
    ChangeInputMode() {
        this.NoteInput = !this.NoteInput;
    }
    SetDragging(dragging, x, y) {
        this.Dragging = dragging;
        if (this.Dragging) {
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
        this.Sheet.Measures[0].Bounds.width += 50;
        this.Sheet.Measures[0].CreateBeatDistribution();
        for (let i = 1; i < this.Sheet.Measures.length; i++) {
            this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i - 1]);
        }
        this.Update(0, 0);
    }
    SetNoteValue(val) {
        this.NoteValue = val;
    }
}
export { App };
