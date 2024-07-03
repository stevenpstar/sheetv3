import { sheet } from './src/entry.js';
//import { sheet } from './src/entry.js';
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
    "flatten": "-",
    "scaleToggle": "'",
    "save": "s",
    "load": "l",
    "test_triplet": "t",
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
        //    canvas.style.width = '1920px';
        //    canvas.style.height = '1080px';
        //    canvas.width = canvas.clientWidth;
        //    canvas.height = canvas.clientHeight;
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
    return { canvas: canvas, context: context };
}
function notify(msg) {
    //  console.log(msg);
}
/* Globals */
const { canvas, context } = returnCanvas("canvas");
let Application;
function main() {
    // Application = new App(canvas, context);
    Application = sheet.CreateApp(canvas, document.getElementById("canvas-container"), document, keymaps, notify, {});
}
main();
