/* Development Mode (getting canvas from document etc.) */
//import * as keymaps from './keymaps.json';
import { App } from './src/App.js';
import { NoteValues } from './src/Core/Values.js';
const keymaps = {
    "rerender": "'",
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
    "flatten": "-"
};
function returnCanvas(id) {
    const canvas = document.getElementById(id);
    const context = canvas.getContext("2d");
    if (canvas === null || canvas === undefined || context === null || context === undefined) {
        console.error("Canvas not found");
    }
    else {
        // set defaults for canvas
        //    canvas.width = 1920;
        //    canvas.height = 1080;
        canvas.style.width = '1920px';
        canvas.style.height = '1080px';
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        //context.scale(4, 4);
    }
    return { canvas: canvas, context: context };
}
/* Globals */
const { canvas, context } = returnCanvas("canvas");
let Application;
/* Canvas event listeners */
window.addEventListener("resize", () => {
    //  canvas.style.width = window.innerWidth + 'px';
    //  canvas.style.height = window.innerHeight + 'px';
});
window.addEventListener("keydown", (e) => {
    const key = e.key;
    switch (key) {
        case keymaps.rerender:
            Application.Test_AddClefMiddle();
            break;
        case keymaps.addmeasure:
            Application.AddMeasure();
            break;
        case keymaps.changeinputmode:
            Application.ChangeInputMode();
            break;
        case keymaps.value1:
            Application.SetNoteValue(0.03125);
            break;
        case keymaps.value2:
            Application.SetNoteValue(0.0625);
            break;
        case keymaps.value3:
            Application.SetNoteValue(0.125);
            break;
        case keymaps.value4:
            Application.SetNoteValue(0.25);
            break;
        case keymaps.value5:
            Application.SetNoteValue(0.5);
            break;
        case keymaps.value6:
            Application.SetNoteValue(NoteValues.n4ddd);
            break;
        case keymaps.restInput:
            Application.RestInput = !Application.RestInput;
            break;
        case keymaps.delete:
            Application.Delete();
            break;
        case keymaps.sharpen:
            Application.Sharpen();
            break;
        case keymaps.flatten:
            Application.Flatten();
            break;
        default:
    }
});
window.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    if (Application && e.buttons === 1) {
        Application.Input(mouseX, mouseY, e.shiftKey);
    }
    if (e.buttons === 4) {
        // set dragging
        Application.SetCameraDragging(true, mouseX, mouseY);
    }
});
window.addEventListener("mouseup", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    Application.SetCameraDragging(false, 0, 0);
    Application.StopNoteDrag(mouseX, mouseY);
});
window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    if (Application) {
        Application.Hover(mouseX, mouseY);
    }
});
window.addEventListener("wheel", (e) => {
    const scale = e.deltaY * -0.01;
    if (scale > 0) {
        Application.AlterZoom(0.1);
    }
    else if (scale < 0) {
        Application.AlterZoom(-0.1);
    }
});
function main() {
    Application = new App(canvas, context);
}
main();
