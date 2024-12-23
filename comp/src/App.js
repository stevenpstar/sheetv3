import { Sheet } from "./Core/Sheet.js";
import { RenderDebug, Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateInstrument, CreateMeasure, } from "./Factory/Instrument.Factory.js";
import { Clef } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { AddNoteOnMeasure, CreateTuplet, InputOnMeasure, UpdateNoteBounds, } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { StaffType } from "./Core/Instrument.js";
import { KeyPress } from "./Workers/Mappings.js";
import { SelectableTypes } from "./Types/ISelectable.js";
import { Page } from "./Core/Page.js";
import { ResizeMeasuresOnPage, SetPagesAndLines } from "./Workers/Formatter.js";
import { LoadSheet, SaveSheet } from "./Workers/Loader.js";
import { allSaves } from "./testsaves.js";
import { ClearMessage, MessageType } from "./Types/Message.js";
import { FromPitchMap, GeneratePitchMap, } from "./Workers/Pitcher.js";
import { GetStaffHeightUntil, Staff } from "./Core/Staff.js";
class App {
    constructor(canvas, container, context, notifyCallback, config, load = false) {
        var _a, _b, _c;
        this.Config = config;
        this.PitchMap = GeneratePitchMap();
        this.Message = ClearMessage();
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
        let camStartX = 0;
        let camStartY = 20;
        if ((_a = this.Config.CameraSettings) === null || _a === void 0 ? void 0 : _a.StartingPosition) {
            camStartX = this.Config.CameraSettings.StartingPosition.x;
            camStartY = this.Config.CameraSettings.StartingPosition.y;
        }
        this.Camera = new Camera(camStartX, camStartY);
        this.Camera.Zoom = 1; //this.Config.CameraSettings.Zoom ? this.Config.CameraSettings.Zoom : 1;
        this.NoteValue = 0.5; //this.Config?.NoteSettings?.InputValue ?
        //      this.Config.NoteSettings.InputValue : 0.25;
        // TODO: Remove to formatter
        this.StartDragY = 0;
        this.EndDragY = 0;
        this.DragLining = false;
        if (!this.Load) {
            // Create New Sheet Properties
            let newPage = new Page(0, 0, 1);
            if ((_b = this.Config.PageSettings) === null || _b === void 0 ? void 0 : _b.PageWidth) {
                newPage.Bounds.width = this.Config.PageSettings.PageWidth;
            }
            const sProps = {
                Instruments: [],
                KeySignature: [{ key: "CMaj/Amin", measureNo: 0 }],
                Measures: [],
                Pages: [newPage],
            };
            const page = sProps.Pages[0];
            sProps.Instruments.push(CreateInstrument(20, this.Config));
            sProps.Measures.push(CreateDefaultMeasure(this.RunningID, sProps.Instruments[0], page, this.Camera, this.NotifyCallback, this.Config.MeasureSettings));
            this.Sheet = new Sheet(sProps);
        }
        this.NoteInput = false;
        this.RestInput = false;
        this.Formatting = true;
        if ((_c = this.Config.CameraSettings) === null || _c === void 0 ? void 0 : _c.Zoom) {
            this.Camera.Zoom = this.Config.CameraSettings.Zoom;
            this.SetCameraZoom(this.Camera.Zoom);
            this.ResizeMeasures(this.Sheet.Measures);
        }
        this.Update(0, 0);
    }
    Hover(x, y) {
        x = x / this.Camera.Zoom;
        y = y / this.Camera.Zoom;
        if (this.Camera.DragCamera(x, y)) {
            this.Update(x, y);
            return;
        }
        if (this.DraggingNote) {
            this.DragNote(x, y);
            this.Update(x, y);
        }
        if (this.Formatting && this.DragLining) {
            this.DragLiner(x, y);
            this.Update(x, y);
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
                    //         m.ResetHeight();
                }
            });
        }
        // This shouldn't always update but will need to do serious work to figure
        // out all bugs involved when it doesn't
        this.Update(x, y);
    }
    Delete() {
        for (let [msr, elem] of this.Selector.Elements) {
            msr.DeleteSelected();
            msr.CreateDivisions(this.Camera);
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
        const msrOver = this.Sheet.Measures.find((msr) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));
        if (msrOver === undefined) {
            if (!shiftKey) {
                this.Selector.DeselectAll();
                this.Message = ClearMessage();
                this.Message.messageString = "msr undefined";
                this.NotifyCallback(this.Message);
                this.Update(x, y);
            }
            return;
        } // no measure over
        if (!this.NoteInput) {
            let selectedMeasureElement = false;
            // Measure Element selection, should be moved elsewhere eventually
            // (probably Measure? Maybe somewhere else)
            if (!shiftKey) {
                this.Selector.Elements = this.Selector.DeselectAllElements(this.Selector.Elements);
            }
            const elem = this.Selector.TrySelectElement(msrOver, x, y, this.Camera, shiftKey, this.NotifyCallback, this.Selector.Elements);
            if ((elem === undefined &&
                this.Config.FormatSettings.MeasureFormatSettings.Selectable ===
                    true) ||
                this.Config.FormatSettings.MeasureFormatSettings.Selectable ===
                    undefined) {
                this.Selector.SelectMeasure(msrOver);
            }
            if (!this.DraggingNote) {
                this.DraggingNote = true;
            }
            const divOver = msrOver.Divisions.find((d) => d.Bounds.IsHovered(x, y, this.Camera));
            if (divOver) {
                this.StartLine = msrOver.GetLineHovered(y, divOver.Staff).num;
            }
        }
        else if (this.NoteInput) {
            InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, this.RestInput);
            this.ResizeMeasures(this.Sheet.Measures.filter((m) => m.Instrument === msrOver.Instrument));
        }
        //  this.NotifyCallback(this.Message);
        const persist = SaveSheet(this.Sheet);
        localStorage.setItem("persist", persist);
        localStorage.setItem("camera_data", JSON.stringify({
            Zoom: this.Camera.Zoom,
            X: this.Camera.x,
            Y: this.Camera.y,
        }));
        this.Update(x, y);
    }
    Update(x, y) {
        // this should be the only place that calls render
        // this.NotifyCallback(this.Message);
        this.Render({ x: x, y: y });
    }
    Render(mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.Sheet.Pages, this.HoveredElements, mousePos, this.Camera, this.NoteInput, this.RestInput, this.Formatting, this.Config, this.NoteValue);
        if (this.Debug) {
            RenderDebug(this.Canvas, this.Context, this.Sheet, mousePos, this.Camera, this.Selector);
        }
    }
    AddMeasure() {
        const newMeasureID = this.Sheet.Measures.length;
        const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        let x = 0;
        this.Sheet.Instruments.forEach((i) => {
            let latestLine = this.Sheet.Pages[0].PageLines[this.Sheet.Pages[0].PageLines.length - 1];
            const newMeasureBounds = new Bounds(x, latestLine.LineBounds.y, 150, prevMsr.Bounds.height);
            const newMsr = CreateMeasure(i, newMeasureBounds, prevMsr.TimeSignature, prevMsr.KeySignature, prevMsr.Clefs, prevMsr.Staves, this.Camera, this.RunningID, this.Sheet.Pages[0], // Page will need to be determined
            false, this.NotifyCallback, this.Config.MeasureSettings);
            // add measure number
            newMsr.Num = this.Sheet.Measures.length + 1;
            this.Sheet.Measures.push(newMsr);
            this.ResizeMeasures(this.Sheet.Measures.filter((m) => m.Instrument === i));
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
        this.Sheet.Pages.forEach((page) => {
            page.PageLines.forEach((line) => {
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
                this.LinerBounds.y = page.Bounds.y + page.Margins.top - 12.5;
            }
            this.StartDragY = y;
            // TODO: Super SCUFFED TEST PROTOTYPE NOT FINAL
            this.Sheet.Measures.forEach((m) => {
                if (m.PageLine === this.LineNumber) {
                    m.Bounds.y = this.LinerBounds.y;
                }
            });
            this.ResizeMeasures(this.Sheet.Measures);
        }
    }
    DragNote(x, y) {
        const msrOver = this.Sheet.Measures.find((m) => m.GetBoundsWithOffset().IsHovered(x, y, this.Camera));
        if (msrOver === undefined) {
            this.DraggingNote = false;
            this.StartLine = -1;
            this.EndLine = -1;
            return;
        }
        const divOver = msrOver.Divisions.find((d) => d.Bounds.IsHovered(x, y, this.Camera));
        if (divOver) {
            this.EndLine = msrOver.GetLineHovered(y, divOver.Staff).num;
        }
        const lineDiff = this.EndLine - this.StartLine;
        for (let [msr, elem] of this.Selector.Elements) {
            elem
                .filter((e) => e.SelType === SelectableTypes.Note)
                .forEach((n) => {
                // Should never be selected, currently band-aid fix for bug. Address
                // when re-implementing dragging notes/selectables
                if (n.Selected && n.Editable) {
                    n.Line += lineDiff;
                    UpdateNoteBounds(msr, n.Staff);
                    // send message about note update
                    if (lineDiff !== 0) {
                        const m = {
                            messageData: {
                                MessageType: MessageType.Selection,
                                Message: {
                                    msg: "selected",
                                    obj: n,
                                },
                            },
                            messageString: "Selected Note",
                        };
                        this.Message = m;
                        this.NotifyCallback(this.Message);
                    }
                }
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
        this.Camera.SetDragging(dragging, x, y, this.Config, this.Camera);
    }
    AlterZoom(num) {
        this.Zoom += num;
        this.Camera.SetZoom(this.Zoom);
        this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
        this.Update(0, 0);
    }
    SetCameraZoom(num) {
        this.Zoom = num;
        this.Camera.SetZoom(this.Zoom);
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
        var _a, _b, _c;
        // TODO: Prototyping stuff so refactor later
        const maxMeasuresPerLine = 4;
        const minMeasuresPerLine = 3;
        const lineHeight = measures[0].Instrument.Staff === StaffType.Rhythm ? 200 : 200;
        SetPagesAndLines(measures, this.Sheet.Pages[0], (_a = this.Config.PageSettings) === null || _a === void 0 ? void 0 : _a.UsePages, lineHeight);
        ResizeMeasuresOnPage(measures, this.Sheet.Pages[0], this.Camera, this.Config);
        if ((_b = this.Config.CameraSettings) === null || _b === void 0 ? void 0 : _b.CenterMeasures) {
            this.CenterMeasures();
        }
        else if ((_c = this.Config.CameraSettings) === null || _c === void 0 ? void 0 : _c.CenterPage) {
            this.CenterPage();
        }
        this.Update(0, 0);
    }
    SetNoteValue(val) {
        this.NoteValue = val;
    }
    SetAccidental(acc) {
        for (let [msr, elem] of this.Selector.Elements) {
            elem.forEach((n) => {
                if (n.SelType === SelectableTypes.Note) {
                    const note = n;
                    note.Accidental = acc;
                    this.Message = ClearMessage();
                    const m = {
                        messageData: {
                            MessageType: MessageType.Selection,
                            Message: {
                                msg: "selected",
                                obj: note,
                            },
                        },
                        messageString: "Selected Note",
                    };
                    this.Message = m;
                    this.NotifyCallback(m);
                }
            });
        }
        this.Update(0, 0);
    }
    Sharpen() {
        for (let [msr, elem] of this.Selector.Elements) {
            elem.forEach((n) => {
                if (n.SelType === SelectableTypes.Note) {
                    const note = n;
                    note.Accidental += 1;
                    if (note.Accidental > 2) {
                        note.Accidental = 2;
                    }
                }
            });
        }
        this.Update(0, 0);
    }
    Flatten() {
        for (let [msr, elem] of this.Selector.Elements) {
            elem.forEach((e) => {
                if (e.SelType === SelectableTypes.Note) {
                    const n = e;
                    n.Accidental -= 1;
                    if (n.Accidental < -2) {
                        n.Accidental = -2;
                    }
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
    // Test_AddClefMiddle(): void {
    //   const msr = this.Sheet.Measures[0];
    //   const clef: Clef = {Type: "bass", Beat: 3};
    //   let clefExist = false;
    //   msr.Clefs.forEach((c: Clef) => {
    //     if (c.Beat === clef.Beat && c.Type === clef.Type) {
    //       clefExist = true;
    //     }
    //   });
    //   if (!clefExist)
    //     msr.Clefs.push(clef);
    // }
    KeyInput(key, keymaps) {
        KeyPress(this, key, keymaps);
        //    this.NotifyCallback(this.Message);
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
    Save() {
        SaveSheet(this.Sheet);
    }
    LoadSheet(sheet) {
        //Clear measures
        this.Sheet.Measures = [];
        LoadSheet(this.Sheet, this.Sheet.Pages[0], this.Camera, this.Sheet.Instruments[0], sheet, this.NotifyCallback);
        this.ResizeMeasures(this.Sheet.Measures);
        this.Update(0, 0);
    }
    GetSaveFiles() {
        return allSaves;
    }
    // TODO: Prototype code
    CreateTriplet() {
        this.NoteValue = CreateTuplet(this.Selector.Elements, 3);
        this.ResizeMeasures(this.Sheet.Measures);
        this.Update(0, 0);
    }
    ChangeTimeSignature(top, bottom, transpose = false) {
        for (let [msr, elem] of this.Selector.Elements) {
            msr.ChangeTimeSignature(top, bottom, transpose);
        }
    }
    CenterMeasures() {
        var _a, _b, _c;
        // This measure is currently only being used for mtrainer
        let msrWidth = 100;
        if ((_b = (_a = this.Config.FormatSettings) === null || _a === void 0 ? void 0 : _a.MeasureFormatSettings) === null || _b === void 0 ? void 0 : _b.MaxWidth) {
            msrWidth = this.Config.FormatSettings.MeasureFormatSettings.MaxWidth;
        }
        const padding = (this.Canvas.clientWidth - (msrWidth + msrWidth / 2) * this.Camera.Zoom) /
            4;
        this.Camera.x = padding;
        if (this.Canvas.clientWidth < msrWidth * this.Camera.Zoom) {
            this.SetCameraZoom(this.Canvas.clientWidth / msrWidth);
        }
        else {
            const z = ((_c = this.Config.CameraSettings) === null || _c === void 0 ? void 0 : _c.Zoom)
                ? this.Config.CameraSettings.Zoom
                : 1;
            this.SetCameraZoom(z);
        }
    }
    CenterPage() {
        var _a;
        const page = this.Sheet.Pages[0];
        const pageW = page.Bounds.width;
        const sidePadding = 20;
        const totalWidth = pageW + sidePadding;
        if (this.Canvas.clientWidth < totalWidth) {
            //set zoom of camera
            this.SetCameraZoom(this.Canvas.clientWidth / totalWidth);
        }
        else {
            const z = ((_a = this.Config.CameraSettings) === null || _a === void 0 ? void 0 : _a.Zoom)
                ? this.Config.CameraSettings.Zoom
                : 1;
            this.SetCameraZoom(z);
        }
        const emptySpace = this.Canvas.clientWidth - totalWidth * this.Camera.Zoom;
        this.Camera.x = emptySpace / 2;
    }
    // Maybe instead of duplicate function we can expose note input function,
    // doesn't matter atm
    AddNoteOnMeasure(msr, noteValue, line, beat, rest) {
        AddNoteOnMeasure(msr, noteValue, line, beat, rest);
    }
    AddStaff(instrNum, clef) {
        const instr = this.Sheet.Instruments[instrNum];
        if (!instr) {
            return;
        }
        const newStaff = new Staff(instr.Staves.length);
        instr.Staves.push(new Staff(instr.Staves.length));
        const msrs = this.Sheet.Measures.filter((m) => m.Instrument === instr);
        msrs.forEach((m) => {
            m.Staves.push(newStaff);
            m.Clefs.push(new Clef(m.Clefs.length - 1, clef, 1, newStaff.Num));
            // TODO: Temporarry measure height being set
            m.Bounds.height = GetStaffHeightUntil(m.Staves);
        });
    }
    // TODO: Move
    FromPitchMap(midiNote, clef) {
        const midiMapped = FromPitchMap(midiNote, this.PitchMap, clef);
        return midiMapped;
    }
}
export { App };
