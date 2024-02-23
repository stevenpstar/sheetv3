/* Development Mode (getting canvas from document etc.) */
//import * as keymaps from './keymaps.json';
import { App } from './src/App.js';

const keymaps = {
  "rerender": "r",
  "addmeasure": "a",
  "changeinputmode": "n"
}

interface CanText {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

function returnCanvas(id: string): CanText {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (canvas === null || canvas === undefined || context === null || context === undefined) {
    console.error("Canvas not found");
  } else {
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
const {canvas, context} = returnCanvas("canvas");
let Application: App;

/* Canvas event listeners */
window.addEventListener("resize", () => {
//  canvas.style.width = window.innerWidth + 'px';
//  canvas.style.height = window.innerHeight + 'px';
});

window.addEventListener("keydown", (e) => {
  const key = e.key;
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

window.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;
  if (Application && e.buttons === 1) {
    Application.Input(mouseX, mouseY);
  }
  if (e.buttons === 4) {
    // set dragging
    Application.SetDragging(true, mouseX, mouseY);
  }
});

window.addEventListener("mouseup", (e) => {
  Application.SetDragging(false, 0, 0)
})

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
  if (scale > 0) { Application.AlterZoom(0.1); }
  else if (scale < 0) { Application.AlterZoom(-0.1); }
})

function main(): void {
  Application = new App(canvas, context);
}

main();
