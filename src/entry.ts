import { App } from "./App.js";
import { Division, Measure } from "./Core/Measure.js";
import { ConfigSettings } from "./Types/Config.js";
import { ISelectable } from "./Types/ISelectable.js";
import { Message } from "./Types/Message.js";
import { KeyMapping } from "./Workers/Mappings.js";

let gSheet: App;

const keymaps: KeyMapping = {
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
}

const test_CONFIG: ConfigSettings = {
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
}

function mouseMove(app: App, canvas: HTMLCanvasElement, e: MouseEvent): void {
  let rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  app.Hover(x, y);
}

function mouseDown(app: App, canvas: HTMLCanvasElement, e: MouseEvent): void {
  e.preventDefault();
  let rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (e.buttons === 1) {
    app.Input(x, y, e.shiftKey);
  } else if (e.buttons === 4) {
    app.SetCameraDragging(true, x, y);
  }
}

function mouseUp(app: App, canvas: HTMLCanvasElement, e: MouseEvent): void {
  let rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  app.SetCameraDragging(false, 0, 0);
  app.StopNoteDrag(x, y);
}

function keyDown(app: App, keymaps: any, e: KeyboardEvent): void {
  const key = e.key;
  app.KeyInput(key, keymaps);
}

function zoom(app: App, e: WheelEvent): void {
    if (e.ctrlKey) {
    e.preventDefault();
    const scale = e.deltaY * -0.01;
    scale > 0 ? app.AlterZoom(0.05) : app.AlterZoom(-0.05);
  }
}

function resize(app: App, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, container: HTMLElement): void {
  canvas.width = container.clientWidth - 50;
  if (app.Config.CameraSettings?.CenterMeasures === true) {
    app.CenterMeasures();
  }
  app.AlterZoom(0);
  app.Update(0, 0);
}

export module sheet {
  export function CreateApp(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    doc: Document,
    keyMap: any,
    notifyCallBack: (msg: Message) => void,
    config: ConfigSettings): App {
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

  // API
  export function ChangeInputMode(): void {
    gSheet.ChangeInputMode();
  } 

  export function Sharpen(): void {
    gSheet.Sharpen();
  }

  export function Flatten(): void {
    gSheet.Flatten();
  }

  export function SetNoteValue(value: number): void {
    gSheet.SetNoteValue(value);
  }

  export function AddMeasure(): void {
    gSheet.AddMeasure();
  }

  export function AddNoteOnMeasure(
    msr: Measure,
    noteVal: number,
    line: number,
    div: Division,
    rest: boolean): void {
    gSheet.AddNoteOnMeasure(
      msr,
      noteVal,
      line,
      div,
      rest);
  }

  export function Delete(): void {
    gSheet.Delete();
  }

  export function SelectById(id: number): ISelectable {
    return gSheet.SelectById(id);
  }

  export function ToggleFormatting(): void {
    gSheet.ToggleFormatting();
  }

  export function DeleteSelected(): void {
    gSheet.Delete();
  }

  export function ChangeTimeSignature(
    top: number,
    bottom: number,
    transpose: boolean = false): void {
      console.log("Changing time sisiigiangiangiang");
      gSheet.ChangeTimeSignature(top, bottom, transpose);
  }
}
//public exports
export * from './Workers/Mappings.js';
export * from './App.js';
export * from './Workers/Loader.js';
export * from './Core/Note.js';
export * from './Workers/Pitcher.js';
export * from './Types/Message.js';
export * from './Types/Config.js';
