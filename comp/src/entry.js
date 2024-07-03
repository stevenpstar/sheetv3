import { App } from "./App.js";
let gSheet;
const keymaps = {
    "addmeasure": "a",
    "changeinputmode": "n",
    "value1": "1",
    "value2": "2",
    "value3": "3",
    "value4": "4",
    "value5": "5",
    "value6": "6",
    "restInput": "r",
    "delete": "d",
    "sharpen": "+",
    "flatten": "-",
    "scaleToggle": "'",
    "save": "s",
    "load": "l",
    "test_triplet": "t"
};
const test_CONFIG = {
    CameraSettings: {
        DragEnabled: false,
        ZoomEnabled: false,
        Zoom: 1,
        StartingPosition: { x: 0, y: 0 },
        CenterMeasures: true,
    },
    FormatSettings: {
        MeasureFormatSettings: { MaxWidth: 100, Selectable: false },
    },
    NoteSettings: {
        InputValue: 0.5,
    },
    PageSettings: {
        RenderPage: false,
        RenderBackground: false,
        ContainerWidth: false,
    },
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
    app.StopNoteDrag(x, y);
}
function keyDown(app, keymaps, e) {
    const key = e.key;
    app.KeyInput(key, keymaps);
}
function zoom(app, e) {
    if (e.ctrlKey) {
        e.preventDefault();
        const scale = e.deltaY * -0.01;
        scale > 0 ? app.AlterZoom(0.05) : app.AlterZoom(-0.05);
    }
}
function resize(app, context, canvas, container) {
    var _a;
    canvas.width = container.clientWidth - 50;
    if (((_a = app.Config.CameraSettings) === null || _a === void 0 ? void 0 : _a.CenterMeasures) === true) {
        app.CenterMeasures();
    }
    app.AlterZoom(0);
    app.Update(0, 0);
}
export var sheet;
(function (sheet) {
    function CreateApp(canvas, container, doc, keyMap, notifyCallBack, config) {
        const ctx = canvas.getContext("2d");
        const app = new App(canvas, container, ctx, notifyCallBack, config);
        canvas.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
        canvas.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
        canvas.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
        doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
        window.addEventListener("resize", () => resize(app, app.Context, canvas, container));
        canvas.addEventListener("wheel", (e) => zoom(app, e));
        gSheet = app;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        app.Update(0, 0);
        app.AlterZoom(test_CONFIG.CameraSettings.Zoom);
        app.CenterMeasures();
        return app;
    }
    sheet.CreateApp = CreateApp;
    // API
    function ChangeInputMode() {
        gSheet.ChangeInputMode();
    }
    sheet.ChangeInputMode = ChangeInputMode;
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
        console.log("Changing time sisiigiangiangiang");
        gSheet.ChangeTimeSignature(top, bottom, transpose);
    }
    sheet.ChangeTimeSignature = ChangeTimeSignature;
})(sheet || (sheet = {}));
//public exports
export * from './Workers/Mappings.js';
export * from './App.js';
export * from './Workers/Loader.js';
export * from './Core/Note.js';
export * from './Workers/Pitcher.js';
export * from './Types/Message.js';
export * from './Types/Config.js';
