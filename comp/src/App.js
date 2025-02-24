import { CreateDefaultSheet } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Clef } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { AddNoteOnMeasure, CreateTuplet, InputOnMeasure, RecreateDivisionGroups, UpdateNoteBounds, } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { StaffType } from "./Core/Instrument.js";
import { KeyPress } from "./Workers/Mappings.js";
import { SelectableTypes } from "./Types/ISelectable.js";
import { ResizeMeasuresOnPage, SetPagesAndLines } from "./Workers/Formatter.js";
import { LoadSheet, SaveSheet } from "./Workers/Loader.js";
import { allSaves } from "./testsaves.js";
import { ClearMessage, MessageType } from "./Types/Message.js";
import { FromPitchMap, GeneratePitchMap, } from "./Workers/Pitcher.js";
import { GetStaffHeightUntil, Staff } from "./Core/Staff.js";
import { BarlineType, PositionMatch, } from "./Core/Barline.js";
import { Dynamic } from "./Core/Dynamic.js";
import { Articulation } from "./Core/Articulation.js";
class App {
    constructor(canvas, container, context, notifyCallback, config, load = false) {
        var _a, _b;
        this.GraceInput = false;
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
        this.Camera.Zoom = 1;
        this.NoteValue = 0.5;
        // TODO: Remove to formatter
        this.StartDragY = 0;
        this.EndDragY = 0;
        this.DragLining = false;
        if (!this.Load) {
            this.Sheet = CreateDefaultSheet(this.Config, this.Camera, this.NotifyCallback);
        }
        this.NoteInput = false;
        this.RestInput = false;
        this.Formatting = true;
        if ((_b = this.Config.CameraSettings) === null || _b === void 0 ? void 0 : _b.Zoom) {
            this.Camera.Zoom = this.Config.CameraSettings.Zoom;
            this.SetCameraZoom(this.Camera.Zoom);
            this.ResizeMeasures(this.Sheet);
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
        if (this.NoteInput) {
            this.Sheet.InputHover(x, y, this.Camera);
        }
        this.Update(x, y);
    }
    Delete() {
        for (let [msr, _] of this.Selector.Elements) {
            msr.DeleteSelected();
            msr.CreateDivisions();
        }
        this.ResizeMeasures(this.Sheet);
    }
    Input(x, y, shiftKey) {
        // will move this code elsewhere, testing note input
        x = x / this.Camera.Zoom;
        y = y / this.Camera.Zoom;
        //TODO: NOT FINAL THIS IS PROTOTYPING NOT FINAL
        if (!this.NoteInput && this.Formatting) {
            this.SelectLiner(x, y);
        }
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
            const divOver = msrOver.Voices[msrOver.ActiveVoice].Divisions.find((d) => d.Bounds.IsHovered(x, y, this.Camera));
            if (divOver) {
                this.StartLine = msrOver.GetLineHovered(y, divOver.Staff).num;
            }
        }
        else if (this.NoteInput) {
            InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, this.RestInput, this.GraceInput);
            this.ResizeMeasures(this.Sheet);
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
        this.Render({ x: x, y: y });
    }
    Render(mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.Sheet.Pages, mousePos, this.Camera, this.NoteInput, this.RestInput, this.Formatting, this.Config, this.NoteValue);
    }
    AddMeasure() {
        const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        let x = 0;
        this.Sheet.Instruments.forEach((i) => {
            const instrMeasures = this.Sheet.Measures.filter((m) => m.Instrument === i);
            const previousMeasure = instrMeasures[instrMeasures.length - 1];
            let latestLine = this.Sheet.Pages[0].PageLines[this.Sheet.Pages[0].PageLines.length - 1];
            const newMeasureBounds = new Bounds(x, latestLine.LineBounds.y, 150, prevMsr.Bounds.height);
            const newMsr = CreateMeasure(i, previousMeasure, null, newMeasureBounds, prevMsr.TimeSignature, prevMsr.KeySignature, prevMsr.Clefs, prevMsr.Staves, this.Camera, this.RunningID, this.Sheet.Pages[0], // Page will need to be determined
            false, this.NotifyCallback, this.Config.MeasureSettings);
            // add measure number and barlines, will need to be reworked when
            // inserting measures is added
            newMsr.Num =
                this.Sheet.Measures.filter((m) => m.Instrument === i).length +
                    1;
            newMsr.Barlines[1].Type = BarlineType.END;
            if (newMsr.PrevMeasure.Barlines[1].Type === BarlineType.END) {
                newMsr.PrevMeasure.Barlines[1].Type = BarlineType.SINGLE;
            }
            this.Sheet.Measures.push(newMsr);
            previousMeasure.NextMeasure = newMsr;
            this.ResizeMeasures(this.Sheet);
        });
        this.ResizeMeasures(this.Sheet);
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
    DragLiner(_, y) {
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
            this.ResizeMeasures(this.Sheet);
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
        const divOver = msrOver.Voices[msrOver.ActiveVoice].Divisions.find((d) => d.Bounds.IsHovered(x, y, this.Camera));
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
        this.ResizeMeasures(this.Sheet);
    }
    StopNoteDrag() {
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
    AlterZoom(num, mx, my) {
        const originalX = mx / this.Camera.Zoom;
        const ogY = my / this.Camera.Zoom;
        this.Camera.SetZoom(this.Camera.Zoom + num);
        this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
        const newX = mx / this.Camera.Zoom;
        const newY = my / this.Camera.Zoom;
        this.Camera.x += newX - originalX;
        this.Camera.y += newY - ogY;
        this.Camera.oldX = this.Camera.x;
        this.Camera.oldY = this.Camera.y;
        this.Update(0, 0);
    }
    SetCameraZoom(num) {
        this.Camera.SetZoom(num);
        this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
        this.Update(0, 0);
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
    ResizeMeasures(sheet) {
        sheet.Instruments.forEach((i) => {
            var _a, _b, _c;
            const measures = sheet.Measures.filter((m) => m.Instrument === i);
            const lineHeight = measures[0].Instrument.Staff === StaffType.Rhythm ? 400 : 400;
            SetPagesAndLines(measures, this.Sheet.Pages[0], (_a = this.Config.PageSettings) === null || _a === void 0 ? void 0 : _a.UsePages, lineHeight);
            ResizeMeasuresOnPage(this.Sheet, this.Sheet.Pages[0], this.Camera, this.Config);
            if ((_b = this.Config.CameraSettings) === null || _b === void 0 ? void 0 : _b.CenterMeasures) {
                this.CenterMeasures();
            }
            else if ((_c = this.Config.CameraSettings) === null || _c === void 0 ? void 0 : _c.CenterPage) {
                this.CenterPage();
            }
            measures.forEach((m) => {
                RecreateDivisionGroups(m);
                m.Staves.forEach((s) => {
                    UpdateNoteBounds(m, s.Num);
                });
                m.RecalculateBarlines();
            });
        });
        this.Update(0, 0);
    }
    SetNoteValue(val) {
        this.NoteValue = val;
    }
    SetAccidental(acc) {
        for (let [_, elem] of this.Selector.Elements) {
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
        for (let [_, elem] of this.Selector.Elements) {
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
        for (let [_, elem] of this.Selector.Elements) {
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
        }
        else {
            this.Camera.Zoom = 1;
        }
        return this.Camera.Zoom;
    }
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
        this.ResizeMeasures(this.Sheet);
        this.Update(0, 0);
    }
    GetSaveFiles() {
        return allSaves;
    }
    // TODO: Prototype code
    CreateTriplet() {
        this.NoteValue = CreateTuplet(this.Selector.Elements, 3);
        this.ResizeMeasures(this.Sheet);
        this.Update(0, 0);
    }
    ChangeTimeSignature(top, bottom, transpose = false) {
        for (let [msr, _] of this.Selector.Elements) {
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
        this.Camera.oldX = this.Camera.x;
    }
    // Maybe instead of duplicate function we can expose note input function,
    // doesn't matter atm
    AddNoteOnMeasure(msr, noteValue, line, beat, rest) {
        AddNoteOnMeasure(msr, noteValue, line, beat, rest, this.GraceInput);
    }
    BeamSelectedNotes() {
        // currently only implementing for cross staff beaming
        var beamFrom; // which staff to "beam from"
        for (let [msr, elem] of this.Selector.Elements) {
            elem
                .filter((e) => e.SelType === SelectableTypes.Note)
                .forEach((n, i) => {
                if (i == 0) {
                    beamFrom = n.Staff;
                }
                if (n.Staff !== beamFrom) {
                    msr.Voices[msr.ActiveVoice].Notes.filter((note) => note.Staff == n.Staff && note.Beat == n.Beat).forEach((note) => {
                        note.StaffGroup = beamFrom;
                    });
                }
            });
        }
        this.ResizeMeasures(this.Sheet);
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
    // These are test/temp functions (kinda)
    ChangeBarline(type) {
        for (let [_, elem] of this.Selector.Elements) {
            elem
                .filter((e) => e.SelType === SelectableTypes.Barline)
                .forEach((bl) => {
                let positionMatch = PositionMatch(bl.Position, type);
                if (!positionMatch) {
                    return;
                }
                bl.Type = type;
            });
        }
        this.ResizeMeasures(this.Sheet);
    }
    ChangeTimeSig() {
        const msr1 = this.Sheet.Measures[0];
        if (msr1) {
            msr1.ChangeTimeSignature(3, 4, false);
        }
    }
    AddDynamic(dynString) {
        for (let [msr, elem] of this.Selector.Elements) {
            elem
                .filter((e) => e.SelType === SelectableTypes.Note)
                .forEach((n) => {
                msr.Dynamics.push(new Dynamic(dynString, n.Staff, n.Beat));
            });
        }
    }
    AddArticulation(type) {
        for (let [msr, elem] of this.Selector.Elements) {
            elem
                .filter((e) => e.SelType === SelectableTypes.Note)
                .forEach((n) => {
                msr.Articulations.push(new Articulation(type, n.Beat, n.Staff));
            });
        }
    }
    CycleActiveVoice() {
        this.Sheet.Measures.forEach((m) => {
            m.ActiveVoice += 1;
            if (m.ActiveVoice > 3) {
                m.ActiveVoice = 0;
            }
        });
    }
}
export { App };
