/* Development Mode (getting canvas from document etc.) */
import { App } from "./src/App.js";
import { Message } from "./src/Types/Message.js";
import { ConfigSettings, Theme, sheet } from "./src/entry.js";

const keymaps = {
  rerender: "'",
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
  test_tuplet: "t",
  debug_clear: "c",
  beam: "b",
  grace: "g",
  change_timesig: "+",
  add_dynamic: "f",
  cycle_voice: "p",
  add_barline: ";",
  add_accent: "]",
  add_clef: "k",
  undo: "ctrl z",
  redo: "ctrl y"
};

interface CanText {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

const defaultTheme: Theme = {
  NoteElements: "black",
  SelectColour: "blue",
  UneditableColour: "gray",
  LineColour: "black",
  BackgroundColour: "darkgray",
  PageColour: "white",
  PageShadowColour: "gray",
};

const _darkTheme: Theme = {
  NoteElements: "#e5e5e5",
  SelectColour: "#f08080",
  UneditableColour: "#303745",
  LineColour: "#c4693d",
  BackgroundColour: "#111111",
  PageColour: "#191919",
  PageShadowColour: "#111111",
};

const test_CONFIG: ConfigSettings = {
  CameraSettings: {
    DragEnabled: true,
    ZoomEnabled: true,
    Zoom: 1.7,
    StartingPosition: { x: 20, y: 20 },
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
  Theme: defaultTheme,
};

function returnCanvas(id: string): CanText {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (
    canvas === null ||
    canvas === undefined ||
    context === null ||
    context === undefined
  ) {
    console.error("Canvas not found");
  } else {
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  return { canvas: canvas, context: context };
}

function notify(msg: Message): void {}

/* Globals */
const { canvas, context } = returnCanvas("canvas");
let Application: App;

function main(): void {
  // Application = new App(canvas, context);
  Application = sheet.CreateApp(
    canvas,
    document.getElementById("canvas-container"),
    document,
    keymaps,
    notify,
    test_CONFIG,
  );
  let smooth_zoom = true;
}

main();
