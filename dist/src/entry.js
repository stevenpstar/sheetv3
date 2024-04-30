import { App } from "./App.js";
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
    const scale = e.deltaY * -0.01;
    scale > 0 ? app.AlterZoom(0.05) : app.AlterZoom(-0.05);
}
export var sheet;
(function (sheet) {
    function CreateApp(canvas, doc, keyMap, notifyCallBack) {
        const ctx = canvas.getContext("2d");
        const app = new App(canvas, ctx, notifyCallBack);
        doc.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
        doc.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
        doc.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
        doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
        doc.addEventListener("wheel", (e) => zoom(app, e));
        return app;
    }
    sheet.CreateApp = CreateApp;
})(sheet || (sheet = {}));
