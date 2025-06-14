import { App } from "./App.js";
import { ArticulationType } from "./Core/Articulation.js";
import { Division, Measure } from "./Core/Measure.js";
import { ConfigSettings, Theme } from "./Types/Config.js";
import { ISelectable } from "./Types/ISelectable.js";
import { Message } from "./Types/Message.js";
import { KeyMapping } from "./Workers/Mappings.js";

let gSheet: App;
const hotReload = false;

const keymaps: KeyMapping = {
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
  change_timesig: "z",
  add_dynamic: "f",
  cycle_voice: "p",
  add_barline: ";",
  add_accent: "]",
  add_clef: "k",
  undo: "ctrl-z",
  redo: "ctrl-y"
};

const defaultTheme: Theme = {
  NoteElements: "black",
  SelectColour: "blue",
  UneditableColour: "gray",
  LineColour: "black",
  BackgroundColour: "gray",
  PageColour: "white",
  PageShadowColour: "darkgray",
};

const test_CONFIG: ConfigSettings = {
  CameraSettings: {
    DragEnabled: true,
    ZoomEnabled: true,
    Zoom: 4,
    StartingPosition: { x: 0, y: 0 },
    CenterMeasures: false,
  },
  FormatSettings: {
    MeasureFormatSettings: { Selectable: false },
  },
  NoteSettings: {
    InputValue: 0.5,
  },
  PageSettings: {
    UsePages: false,
    RenderPage: false,
    RenderBackground: false,
    ContainerWidth: false,
  },
  Theme: defaultTheme,
};

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
  app.StopNoteDrag();
}

function keyDown(app: App, keymaps: any, e: KeyboardEvent): void {
  const key = e.key;
  app.KeyInput(e, keymaps);
}

function zoom(app: App, canvas: HTMLCanvasElement, e: WheelEvent): void {
  if (e.ctrlKey) {
    let rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    e.preventDefault();
    const scale = e.deltaY * -0.01;
    scale > 0 ? app.AlterZoom(0.075, x, y) : app.AlterZoom(-0.075, x, y);
  }
}

function resize(
  app: App,
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
): void {
  canvas.width = container.clientWidth - 50;
  if (app.Config.CameraSettings?.CenterMeasures === true) {
    app.CenterMeasures();
  } else if (app.Config.CameraSettings?.CenterPage) {
    app.CenterPage();
  }
  app.AlterZoom(0, 0, 0);
  app.Update(0, 0);
}

export module sheet {
  export function CreateApp(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    doc: Document,
    keyMap: any,
    notifyCallBack: (msg: Message) => void,
    config: ConfigSettings,
  ): App {
    const ctx = canvas.getContext("2d");
    const app = new App(canvas, container, ctx, notifyCallBack, config);
    canvas.addEventListener("mousemove", (e) => mouseMove(app, canvas, e));
    canvas.addEventListener("mousedown", (e) => mouseDown(app, canvas, e));
    canvas.addEventListener("mouseup", (e) => mouseUp(app, canvas, e));
    doc.addEventListener("keydown", (e) => keyDown(app, keyMap, e));
    window.addEventListener("resize", () =>
      resize(app, app.Context, canvas, container),
    );
    canvas.addEventListener("wheel", (e) => zoom(app, canvas, e));
    screen.orientation.addEventListener("change", (_) =>
      resize(app, app.Context, canvas, container),
    );
    gSheet = app;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    app.Update(0, 0);
    if (config.CameraSettings?.Zoom) {
      app.SetCameraZoom(config.CameraSettings.Zoom);
    }
    if (config.CameraSettings?.CenterMeasures) {
      app.CenterMeasures();
    }
    // DEBUG SETTINGS FOR "HOT RELOADING"
    if (hotReload) {
      const persistedData = localStorage.getItem("persist");
      if (persistedData !== null) {
        const cameraData = JSON.parse(localStorage.getItem("camera_data"));
        app.LoadSheet(persistedData);
        app.SetCameraZoom(cameraData.Zoom);
        app.Camera.x = cameraData.X;
        app.Camera.y = cameraData.Y;
        app.ResizeMeasures(app.Sheet);
      }
      //
    }

    return app;
  }

  // API
  export function ChangeInputMode(): void {
    gSheet.ChangeInputMode();
  }

  export function SetAccidental(acc: number): void {
    gSheet.SetAccidental(acc);
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

  export function AddArticulation(type: ArticulationType): void {
    gSheet.AddArticulation(type);
  }

  export function AddStaff(instrIndex: number, clefString: string): void {
    gSheet.AddStaff(instrIndex, clefString);
  }

  export function AddNoteOnMeasure(
    msr: Measure,
    noteVal: number,
    line: number,
    div: Division,
    rest: boolean,
  ): void {
    gSheet.AddNoteOnMeasure(msr, noteVal, line, div, rest);
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
    transpose: boolean = false,
  ): void {
    gSheet.ChangeTimeSignature(top, bottom, transpose);
  }
}
//public exports
export * from "./Workers/Mappings.js";
export * from "./App.js";
export * from "./Workers/Loader.js";
export * from "./Core/Note.js";
export * from "./Workers/Pitcher.js";
export * from "./Types/Message.js";
export * from "./Types/Config.js";
