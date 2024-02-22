/* Development Mode (getting canvas from document etc.) */
//import * as keymaps from './keymaps.json';
import { App } from './src/App.js';
var keymaps = {
    "rerender": "r",
    "addmeasure": "a",
    "changeinputmode": "n"
};
function returnCanvas(id) {
    var canvas = document.getElementById(id);
    var context = canvas.getContext("2d");
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
        //    context.scale(4, 4);
    }
    return { canvas: canvas, context: context };
}
/* Globals */
var _a = returnCanvas("canvas"), canvas = _a.canvas, context = _a.context;
var Application;
/* Canvas event listeners */
window.addEventListener("resize", function () {
    //  canvas.style.width = window.innerWidth + 'px';
    //  canvas.style.height = window.innerHeight + 'px';
});
window.addEventListener("keydown", function (e) {
    var key = e.key;
    switch (key) {
        case keymaps.rerender:
            //      if (Application) { Application.Render({x: 0,y: 0}); };
            Application.ResizeFirstMeasure();
            break;
        case keymaps.addmeasure:
            Application.AddMeasure();
        case keymaps.changeinputmode:
            Application.ChangeInputMode();
        default:
    }
});
window.addEventListener("mousedown", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    if (Application) {
        Application.Input(mouseX, mouseY);
    }
});
window.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    if (Application) {
        Application.Hover(mouseX, mouseY);
    }
});
window.addEventListener("wheel", function (e) {
    var scale = e.deltaY * -0.01;
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
