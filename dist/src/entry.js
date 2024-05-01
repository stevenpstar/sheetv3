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
    "scaleToggle": "s"
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
    console.log("zooming? ");
    console.log(e.ctrlKey);
    if (e.ctrlKey) {
        e.preventDefault();
        const scale = e.deltaY * -0.01;
        scale > 0 ? app.AlterZoom(0.05) : app.AlterZoom(-0.05);
    }
}
function resize(canvas, container) {
    canvas.width = container.clientWidth;
}
export var sheet;
(function (sheet) {
    function CreateApp(canvas, container, doc, keyMap, notifyCallBack) {
        const ctx = canvas.getContext("2d");
        const app = new App(canvas, container, ctx, notifyCallBack);
        canvas.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
        canvas.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
        canvas.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
        doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
        doc.addEventListener("resize", () => resize(canvas, container));
        canvas.addEventListener("wheel", (e) => zoom(app, e));
        gSheet = app;
        canvas.width = container.clientWidth;
        canvas.height = 4000;
        return app;
    }
    sheet.CreateApp = CreateApp;
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
        gSheet.SelectById(id);
    }
    sheet.SelectById = SelectById;
})(sheet || (sheet = {}));