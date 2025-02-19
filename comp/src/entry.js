import { App } from "./App.js";
let gSheet;
const hotReload = false;
const keymaps = {
    addmeasure: "a",
    changeinputmode: "n",
    value1: "1",
    value2: "2",
    value3: "3",
    value4: "4",
    value5: "5",
    value6: "6",
    restInput: "r",
    delete: "d",
    sharpen: "+",
    flatten: "-",
    scaleToggle: "'",
    save: "s",
    load: "l",
    test_triplet: "t",
    debug_clear: "c",
    beam: "b",
    grace: "g",
    change_timesig: "z",
    add_dynamic: "f",
    cycle_voice: "p",
};
const defaultTheme = {
    NoteElements: "black",
    SelectColour: "blue",
    UneditableColour: "gray",
    LineColour: "black",
    BackgroundColour: "gray",
    PageColour: "white",
    PageShadowColour: "darkgray",
};
const test_CONFIG = {
    CameraSettings: {
        DragEnabled: true,
        ZoomEnabled: true,
        Zoom: 4,
        StartingPosition: { x: 0, y: 0 },
        CenterMeasures: false,
    },
    FormatSettings: {
        MeasureFormatSettings: { Selectable: false },
    },
    NoteSettings: {
        InputValue: 0.5,
    },
    PageSettings: {
        UsePages: false,
        RenderPage: false,
        RenderBackground: false,
        ContainerWidth: false,
    },
    Theme: defaultTheme,
};
function mouseMove(app, canvas, e) {
    let rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    app.Hover(x, y);
}
function mouseDown(app, canvas, e) {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (e.buttons === 1) {
        app.Input(x, y, e.shiftKey);
    }
    else if (e.buttons === 4) {
        app.SetCameraDragging(true, x, y);
    }
}
function mouseUp(app, canvas, e) {
    let rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    app.SetCameraDragging(false, 0, 0);
    app.StopNoteDrag();
}
function keyDown(app, keymaps, e) {
    const key = e.key;
    app.KeyInput(key, keymaps);
}
function zoom(app, canvas, e) {
    if (e.ctrlKey) {
        let rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.preventDefault();
        const scale = e.deltaY * -0.01;
        scale > 0 ? app.AlterZoom(0.075, x, y) : app.AlterZoom(-0.075, x, y);
    }
}
function resize(app, context, canvas, container) {
    var _a, _b;
    canvas.width = container.clientWidth - 50;
    if (((_a = app.Config.CameraSettings) === null || _a === void 0 ? void 0 : _a.CenterMeasures) === true) {
        app.CenterMeasures();
    }
    else if ((_b = app.Config.CameraSettings) === null || _b === void 0 ? void 0 : _b.CenterPage) {
        app.CenterPage();
    }
    app.AlterZoom(0, 0, 0);
    app.Update(0, 0);
}
export var sheet;
(function (sheet) {
    function CreateApp(canvas, container, doc, keyMap, notifyCallBack, config) {
        var _a, _b;
        const ctx = canvas.getContext("2d");
        const app = new App(canvas, container, ctx, notifyCallBack, config);
        canvas.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
        canvas.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
        canvas.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
        doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
        window.addEventListener("resize", () => resize(app, app.Context, canvas, container));
        canvas.addEventListener("wheel", (e) => zoom(app, canvas, e));
        screen.orientation.addEventListener("change", (_) => resize(app, app.Context, canvas, container));
        gSheet = app;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        app.Update(0, 0);
        if ((_a = config.CameraSettings) === null || _a === void 0 ? void 0 : _a.Zoom) {
            app.SetCameraZoom(config.CameraSettings.Zoom);
        }
        if ((_b = config.CameraSettings) === null || _b === void 0 ? void 0 : _b.CenterMeasures) {
            app.CenterMeasures();
        }
        // DEBUG SETTINGS FOR "HOT RELOADING"
        if (hotReload) {
            const persistedData = localStorage.getItem("persist");
            if (persistedData !== null) {
                const cameraData = JSON.parse(localStorage.getItem("camera_data"));
                app.LoadSheet(persistedData);
                app.SetCameraZoom(cameraData.Zoom);
                app.Camera.x = cameraData.X;
                app.Camera.y = cameraData.Y;
                app.ResizeMeasures(app.Sheet);
            }
            //
        }
        return app;
    }
    sheet.CreateApp = CreateApp;
    // API
    function ChangeInputMode() {
        gSheet.ChangeInputMode();
    }
    sheet.ChangeInputMode = ChangeInputMode;
    function SetAccidental(acc) {
        gSheet.SetAccidental(acc);
    }
    sheet.SetAccidental = SetAccidental;
    function Sharpen() {
        gSheet.Sharpen();
    }
    sheet.Sharpen = Sharpen;
    function Flatten() {
        gSheet.Flatten();
    }
    sheet.Flatten = Flatten;
    function SetNoteValue(value) {
        gSheet.SetNoteValue(value);
    }
    sheet.SetNoteValue = SetNoteValue;
    function AddMeasure() {
        gSheet.AddMeasure();
    }
    sheet.AddMeasure = AddMeasure;
    function AddArticulation(type) {
        gSheet.AddArticulation(type);
    }
    sheet.AddArticulation = AddArticulation;
    function AddStaff(instrIndex, clefString) {
        gSheet.AddStaff(instrIndex, clefString);
    }
    sheet.AddStaff = AddStaff;
    function AddNoteOnMeasure(msr, noteVal, line, div, rest) {
        gSheet.AddNoteOnMeasure(msr, noteVal, line, div, rest);
    }
    sheet.AddNoteOnMeasure = AddNoteOnMeasure;
    function Delete() {
        gSheet.Delete();
    }
    sheet.Delete = Delete;
    function SelectById(id) {
        return gSheet.SelectById(id);
    }
    sheet.SelectById = SelectById;
    function ToggleFormatting() {
        gSheet.ToggleFormatting();
    }
    sheet.ToggleFormatting = ToggleFormatting;
    function DeleteSelected() {
        gSheet.Delete();
    }
    sheet.DeleteSelected = DeleteSelected;
    function ChangeTimeSignature(top, bottom, transpose = false) {
        gSheet.ChangeTimeSignature(top, bottom, transpose);
    }
    sheet.ChangeTimeSignature = ChangeTimeSignature;
})(sheet || (sheet = {}));
//public exports
export * from "./Workers/Mappings.js";
export * from "./App.js";
export * from "./Workers/Loader.js";
export * from "./Core/Note.js";
export * from "./Workers/Pitcher.js";
export * from "./Types/Message.js";
export * from "./Types/Config.js";
