import { App } from "./App.js";
import { KeyMapping } from "./Workers/Mappings.js";

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
  "scaleToggle": "s"
}

function mouseMove(app: App, canvas: HTMLCanvasElement, e: MouseEvent): void {
  let rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  app.Hover(x, y);
}

function mouseDown(app: App, canvas: HTMLCanvasElement, e: MouseEvent): void {
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
  const scale = e.deltaY * -0.01;
  scale > 0 ? app.AlterZoom(0.05) : app.AlterZoom(-0.05);
}

export module sheet {
  export function CreateApp(
    canvas: HTMLCanvasElement,
    doc: Document,
    keyMap: any,
    notifyCallBack: (msg: string) => void): App {
    const ctx = canvas.getContext("2d");
    const app = new App(canvas, ctx, notifyCallBack);
    doc.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
    doc.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
    doc.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
    doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
    doc.addEventListener("wheel", (e) => zoom(app, e));
    return app;
  }
}
