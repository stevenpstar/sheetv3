/* Development Mode (getting canvas from document etc.) */
//import * as keymaps from './keymaps.json';
import { App } from './src/App.js';
import { NoteValues } from './src/Core/Values.js';
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
  "load": "l"

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
//    canvas.style.width = '1920px';
//    canvas.style.height = '1080px';
//    canvas.width = canvas.clientWidth;
//    canvas.height = canvas.clientHeight;
    context.setTransform(1 ,0, 0, 1, 0, 0);
  }

  return { canvas: canvas, context: context };
}

function notify(msg: string): void {
  console.log(msg);
}

/* Globals */
const {canvas, context} = returnCanvas("canvas");
let Application: App;

function main(): void {
 // Application = new App(canvas, context);
  Application = sheet.CreateApp(canvas, document.getElementById("canvas-container"), document, keymaps, notify);
}

main();
