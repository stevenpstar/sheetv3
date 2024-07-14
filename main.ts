/* Development Mode (getting canvas from document etc.) */
//import * as keymaps from './keymaps.json';
import { App } from './src/App.js';
import { NoteValues } from './src/Core/Values.js';
import { Message } from './src/Types/Message.js';
import { ConfigSettings, Theme, sheet } from './src/entry.js';
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
}

interface CanText {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

const defaultTheme: Theme = {
  NoteElements: "black",
  SelectColour: "blue",
  UneditableColour: "gray",
  LineColour: "black",
  BackgroundColour: "gray",
  PageColour: "white",
  PageShadowColour: "darkgray",
}

const darkTheme: Theme = {
  NoteElements: "black",
  SelectColour: "#f08080",
  UneditableColour: "#303745",
  LineColour: "#465063",
  BackgroundColour: "black",
  PageColour: "#262b36",
  PageShadowColour: "#15191f",
}

const test_CONFIG: ConfigSettings = {
  CameraSettings: {
    DragEnabled: true,
    ZoomEnabled: true,
    Zoom: 0.5,
    StartingPosition: { x: 0, y: 0 },
    CenterMeasures: false,
    CenterPage: false,
  },
  FormatSettings: {
    MeasureFormatSettings: { Selectable: false },
  },
  NoteSettings: {
    InputValue: 0.5,
  },
  PageSettings: {
    UsePages: true,
    RenderPage: true,
    RenderBackground: true,
    ContainerWidth: false,
    AutoSize: false,
  },
  DefaultStaffType: "single",
  Theme: defaultTheme
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

function notify(msg: Message): void {
//  console.log(msg);
}

/* Globals */
const {canvas, context} = returnCanvas("canvas");
let Application: App;

function main(): void {
 // Application = new App(canvas, context);
  Application = sheet.CreateApp(canvas, document.getElementById("canvas-container"), document, keymaps, notify, test_CONFIG);
}

main();
