import { Sheet } from "./Core/Sheet.js";
import { RenderDebug, Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { InputOnMeasure, UpdateNoteBounds } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { GetDivisionTotalWidth } from "./Core/Division.js";
import { KeyPress } from "./Workers/Mappings.js";
import { Page } from "./Core/Page.js";
class App {
    constructor(canvas, container, context, notifyCallback, load = false) {
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
        // TODO: Remove to formatter
        this.StartDragY = 0;
        this.EndDragY = 0;
        this.DragLining = false;
        if (!this.Load) {
            // Create New Sheet Properties
            const sProps = {
                Instruments: [],
                KeySignature: [{ key: "CMaj", measureNo: 0 }],
                Measures: [],
                Pages: [new Page(0, 0, 1)]
            };
            const page = sProps.Pages[0];
            sProps.Instruments.push(CreateDefaultPiano());
            sProps.Measures.push(CreateDefaultMeasure(this.RunningID, sProps.Instruments[0], page, this.Camera));
            this.Sheet = new Sheet(sProps);
        }
        this.NoteInput = false;
        this.RestInput = false;
        this.Formatting = true;
        this.Update(0, 0);
    }
    Hover(x, y) {
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
        if (this.Formatting && this.DragLining) {
            this.DragLiner(x, y);
        }
        this.HoveredElements.MeasureID = -1;
        // TODO: Move all this elsewhere
        if (this.NoteInput) {
            this.Sheet.Measures.forEach((m) => {
                if (m.GetBoundsWithOffset().IsHovered(x, y, this.Camera)) {
                    m.Divisions.forEach((d) => {
                        if (d.Bounds.IsHovered(x, y, this.Camera)) {
                            //ManageHeight(m, d.Staff, x, y, this.Camera, this.Sheet.Measures);
                            // TODO: Move this so it only is called 
                            // at the appropriate time
                            UpdateNoteBounds(m, 0);
                            UpdateNoteBounds(m, 1);
                        }
                    });
                }
                else {
                    m.ResetHeight();
                }
            });
        }
        this.Update(x, y);
    }
    Delete() {
        for (let [msr, notes] of this.Selector.Notes) {
            msr.DeleteSelected();
        }
    }
    Input(x, y, shiftKey) {
        // will move this code elsewhere, testing note input
        x = x / this.Camera.Zoom;
        y = y / this.Camera.Zoom;
        //TODO: NOT FINAL THIS IS PROTOTYPING NOT FINAL 
        if (!this.NoteInput && this.Formatting) {
            this.SelectLiner(x, y);
        }
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
        if (!this.NoteInput && !this.Formatting) {
            this.Selector.SelectNote(msrOver, x, y, this.Camera, shiftKey);
            if (!this.DraggingNote) {
                this.DraggingNote = true;
            }
            this.StartLine = Measure.GetLineHovered(y, msrOver).num;
            this.Update(x, y);
            return;
        }
        if (this.NoteInput) {
            InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, this.RestInput);
            this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === msrOver.Instrument));
        }
        this.Update(x, y);
        this.NotifyCallback("notify");
    }
    Update(x, y) {
        //    this.Canvas.width = this.Container.clientWidth;
        //    this.Canvas.height = 4000;
        //    this.Container.style.height = this.Canvas.height + 'px';
        // this should be the only place that calls render
        this.Render({ x: x, y: y });
    }
    Render(mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.Sheet.Pages, this.HoveredElements, mousePos, this.Camera, this.NoteInput, this.RestInput, this.Formatting);
        if (this.Debug) {
            RenderDebug(this.Canvas, this.Context, this.Sheet, mousePos, this.Camera, this.Selector);
        }
    }
    AddMeasure() {
        const newMeasureID = this.Sheet.Measures.length;
        const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        let x = 0;
        this.Sheet.Instruments.forEach(i => {
            let latestLine = this.Sheet.Pages[0].PageLines[this.Sheet.Pages[0].PageLines.length - 1];
            const msrCountOnLine = this.Sheet.Measures.filter(m => m.PageLine === latestLine.Number);
            if (msrCountOnLine.length > 3) {
                latestLine = this.Sheet.Pages[0].AddLine();
            }
            console.log(this.Sheet.Pages[0]);
            const newMeasureBounds = new Bounds(x, latestLine.LineBounds.y, 150, prevMsr.Bounds.height);
            const newMsr = CreateMeasure(i, newMeasureBounds, prevMsr.TimeSignature, prevMsr.KeySignature, "treble", this.Camera, this.RunningID, this.Sheet.Pages[0], // Page will need to be determined
            false);
            newMsr.PageLine = latestLine.Number;
            this.Sheet.Measures.push(newMsr);
            this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === i));
        });
    }
    ChangeInputMode() {
        this.NoteInput = !this.NoteInput;
    }
    //TODO: Prototype page line formatting nonsense
    SelectLiner(x, y) {
        // get liner here
        let liner;
        if (!this.DragLining) {
            this.LineNumber = -1;
        }
        this.Sheet.Pages.forEach(page => {
            page.PageLines.forEach(line => {
                if (line.LineBounds.IsHovered(x, y, this.Camera)) {
                    liner = line.LineBounds;
                    if (!this.DragLining) {
                        this.StartDragY = y;
                        this.DragLining = true;
                        this.LinerBounds = liner;
                        this.LineNumber = line.Number;
                    }
                }
            });
        });
        return liner;
    }
    DragLiner(x, y) {
        if (this.LinerBounds) {
            this.LinerBounds.y = this.LinerBounds.y + (y - this.StartDragY);
            const page = this.Sheet.Pages[0];
            if (this.LinerBounds.y + 12.5 <= page.Bounds.y + page.Margins.top) {
                this.LinerBounds.y = (page.Bounds.y + page.Margins.top) - 12.5;
            }
            this.StartDragY = y;
            // TODO: Super SCUFFED TEST PROTOTYPE NOT FINAL
            this.Sheet.Measures.forEach(m => {
                if (m.PageLine === this.LineNumber) {
                    m.Bounds.y = this.LinerBounds.y;
                    m.PrefBoundsY = m.Bounds.y;
                    m.CreateDivisions(this.Camera);
                }
            });
        }
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
        this.EndLine = Measure.GetLineHovered(y, msrOver).num;
        const lineDiff = this.EndLine - this.StartLine;
        for (let [msr, notes] of this.Selector.Notes) {
            notes.forEach(n => {
                n.Line += lineDiff;
                UpdateNoteBounds(msr, n.Staff);
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
        if (this.DragLining) {
            this.DragLining = false;
        }
    }
    SetCameraDragging(dragging, x, y) {
        this.CamDragging = dragging;
        if (this.CamDragging) {
            // set initial drag position
            this.DraggingPositions.x1 = (x / this.Camera.Zoom);
            this.DraggingPositions.y1 = (y / this.Camera.Zoom);
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
        this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
        this.Update(0, 0);
    }
    // TEST FUNCTION
    ResizeFirstMeasure() {
        //    this.Sheet.Measures[0].Bounds.width += 50;
        this.Sheet.Measures[0].CreateDivisions(this.Camera);
        for (let i = 1; i < this.Sheet.Measures.length; i++) {
            this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i - 1]);
        }
        this.Update(0, 0);
    }
    ResizeMeasures(measures) {
        // TODO: Prototyping stuff so refactor later
        const maxMeasuresPerLine = 4;
        const minMeasuresPerLine = 3;
        const page = this.Sheet.Pages[0];
        const msrOnPage1 = measures.filter(m => m.Page.Number === 1);
        const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right);
        msrOnPage1.forEach((msr, i) => {
            //      msr.Bounds.width = GetDivisionTotalWidth(msr.Divisions);
            //
            const msrPageLine = msr.PageLine;
            const msrsOnLine = msrOnPage1.filter(m => m.PageLine === msrPageLine);
            if (msrsOnLine.length < 3) {
                msr.Bounds.width = GetDivisionTotalWidth(msr.Divisions);
            }
            else {
                msr.Bounds.width = (pageSize / msrsOnLine.length) - msr.XOffset - 2;
            }
            if (msr === msrsOnLine[0]) {
                msr.Bounds.x = msr.Page.Bounds.x + msr.Page.Margins.left;
                console.log(msr.Bounds.x);
                // TODO: STILL PROTOTYPING BASICALLY THIS WHOLE METHOD
                msr.RenderClef = true;
                msr.RenderTimeSig = true;
                msr.SetXOffset();
                msr.CreateDivisions(this.Camera);
            }
            else {
                measures[i].Reposition(measures[i - 1]);
            }
        });
        this.Update(0, 0);
    }
    SetNoteValue(val) {
        this.NoteValue = val;
    }
    Sharpen() {
        for (let [msr, notes] of this.Selector.Notes) {
            notes.forEach(n => {
                n.Accidental += 1;
                if (n.Accidental > 2) {
                    n.Accidental = 2;
                }
            });
        }
        this.Update(0, 0);
    }
    Flatten() {
        for (let [msr, notes] of this.Selector.Notes) {
            notes.forEach(n => {
                n.Accidental -= 1;
                if (n.Accidental < -2) {
                    n.Accidental = -2;
                }
            });
        }
        this.Update(0, 0);
    }
    //TODO: Remove this test function
    ScaleToggle() {
        if (this.Camera.Zoom !== 1) {
            this.Camera.Zoom = 1;
            this.Zoom = 1;
        }
        else {
            this.Camera.Zoom = 1;
        }
        return this.Camera.Zoom;
    }
    Test_AddClefMiddle() {
        const msr = this.Sheet.Measures[0];
        const clef = { Type: "bass", Beat: 3 };
        let clefExist = false;
        msr.Clefs.forEach((c) => {
            if (c.Beat === clef.Beat && c.Type === clef.Type) {
                clefExist = true;
            }
        });
        if (!clefExist)
            msr.Clefs.push(clef);
    }
    KeyInput(key, keymaps) {
        KeyPress(this, key, keymaps);
        this.NotifyCallback("notify");
    }
    SelectById(id) {
        const sel = this.Selector.SelectById(this.Sheet.Measures, id);
        this.Update(0, 0);
        return sel;
    }
    ToggleFormatting() {
        this.Formatting = !this.Formatting;
        if (this.Formatting) {
            this.NoteInput = false;
            this.RestInput = false;
        }
    }
}
export { App };
