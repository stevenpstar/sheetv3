import { App } from "./App.js";
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
  "load": "l"
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

function resize(app: App, canvas: HTMLCanvasElement, container: HTMLElement): void {
  canvas.width = container.clientWidth;
  app.Update(0, 0);
}

export module sheet {
  export function CreateApp(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    doc: Document,
    keyMap: any,
    notifyCallBack: (msg: Message) => void): App {
    const ctx = canvas.getContext("2d");
    const app = new App(canvas, container, ctx, notifyCallBack);
    canvas.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
    canvas.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
    canvas.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
    doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
    window.addEventListener("resize", () => resize(app, canvas, container));
    canvas.addEventListener("wheel", (e) => zoom(app, e));
    gSheet = app;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    return app;
  }

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
}
