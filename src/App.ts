import { CreateDefaultSheet, Sheet, SheetInputHover } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateMeasure } from "./Factory/Instrument.Factory.js";
import { ChangeTimeSignature, Clef, CreateMeasureDivisions, DeleteSelectedMeasure, Division, GetBoundsWithOffset, GetLineHovered, Measure, RecalculateBarlines } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";
import { Camera } from "./Core/Camera.js";
import {
  AddNoteOnMeasure,
  CreateTuplet,
  InputOnMeasure,
  RecreateDivisionGroups,
  RecreateStemAndBeams,
  UpdateNoteBounds,
} from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { Instrument } from "./Core/Instrument.js";
import { KeyMapping, KeyPress } from "./Workers/Mappings.js";
import { ISelectable, SelectableTypes } from "./Types/ISelectable.js";
import { ResizeMeasuresOnPageRevised, SetPagesAndLines } from "./Workers/Formatter.js";
import { LoadSheet, SaveSheet } from "./Workers/Loader.js";
import { allSaves, saveFile } from "./testsaves.js";
import { ClearMessage, Message, MessageType } from "./Types/Message.js";
import {
  FromPitchMap,
  GeneratePitchMap,
  MappedMidi,
} from "./Workers/Pitcher.js";
import { ConfigSettings } from "./Types/Config.js";
import { CreateStaff, GetStaffHeightUntil, Staff } from "./Core/Staff.js";
import {
  Barline,
  BarlineType,
  PositionMatch,
} from "./Core/Barline.js";
import { Dynamic } from "./Core/Dynamic.js";
import { Articulation, ArticulationType } from "./Core/Articulation.js";
import { AddToUndoStack, LoadNextState, LoadPreviousState } from "./Workers/UndoRedo.js";
import { LoadFromMXML, type XMLScore } from "./Workers/MXML.js";
import { Page } from "./Core/Page.js";
import { RepositionDivisionsInMeasure, ResizeDivisionsRevised } from "./Core/Division.js";

class App {
  Config: ConfigSettings;
  Message: Message;
  Canvas: HTMLCanvasElement;
  Container: HTMLElement;
  Context: CanvasRenderingContext2D;
  Load: boolean;
  Sheet: Sheet;
  NoteInput: boolean;
  RestInput: boolean;
  GraceInput: boolean = false;
  Formatting: boolean;
  Zoom: number;
  Camera: Camera;
  CamDragging: boolean;
  DraggingPositions: { x1: number; y1: number; x2: number; y2: number };
  NoteValue: number;
  Selector: Selector;
  NotifyCallback: (msg: Message) => void;
  RunningID: { count: number };
  PitchMap: Map<number, MappedMidi>;
  PlaybackTimer: number = 0.0;
  Playing: boolean = false;
  PlaybackTempo: number = 120;
  PlaybackMeasureIndex: number = 0;
  AudioContext: AudioContext = null;

  DraggingNote: boolean;
  StartLine: number;
  EndLine: number;

  // TODO: Move this to a formatter
  StartDragY: number;
  EndDragY: number;
  DragLining: boolean;
  LinerBounds: Bounds;
  LineNumber: Number;

  Debug: boolean;

  StateStack: string[] = [];
  StateIndex: { index: number } = { index: 0 };

  MouseX: number;
  MouseY: number;
  CanDragCamera: boolean = true;
  RenderBounds: Bounds = new Bounds(400, 400, 800, 800);
  Optimise: boolean = true;
  OptBuffer: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    context: CanvasRenderingContext2D,
    notifyCallback: (msg: Message) => void,
    config: ConfigSettings,
    load = false,
  ) {
    this.Config = config;
    this.PitchMap = GeneratePitchMap();
    this.Message = ClearMessage();
    this.NotifyCallback = notifyCallback;
    this.Debug = false;
    this.Canvas = canvas;
    this.Container = container;
    this.Selector = new Selector();
    this.Context = context;
    this.Load = load;
    this.RunningID = { count: 0 };
    this.CamDragging = false;
    this.DraggingPositions = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let camStartX = 0;
    let camStartY = 20;
    if (this.Config.CameraSettings?.StartingPosition) {
      camStartX = this.Config.CameraSettings.StartingPosition.x;
      camStartY = this.Config.CameraSettings.StartingPosition.y;
    }
    this.Camera = new Camera(camStartX, camStartY);
    this.Camera.Zoom = 1;
    this.NoteValue = 0.5;

    // TODO: Remove to formatter
    this.StartDragY = 0;
    this.EndDragY = 0;
    this.DragLining = false;
    if (!this.Load) {
      this.Sheet = CreateDefaultSheet(
        this.Config,
        this.Camera,
        this.NotifyCallback,
      );
    }
    this.NoteInput = false;
    this.RestInput = false;
    this.Formatting = false;

    if (this.Config.CameraSettings?.Zoom) {
      this.Camera.Zoom = this.Config.CameraSettings.Zoom;
      this.SetCameraZoom(this.Camera.Zoom);
      this.ResizeMeasures(this.Sheet);
    }

    this.Update(0, 0);
    this.SaveToUndoStack();
    this.RealtimeUpdate(this);
  }

  Hover(x: number, y: number): void {
    this.MouseX = x;
    this.MouseY = y;
    x = x / (this.Camera.Zoom * this.Camera.ScaleFactor);
    y = y / (this.Camera.Zoom * this.Camera.ScaleFactor);
    if (this.CanDragCamera && this.Camera) {
      if (this.Camera.DragCamera(x, y)) {
        this.Update(x, y);
        return;
      }
    }
    if (this.DraggingNote) {
      this.DragNote(x, y);
      this.Update(x, y);
    }
    if (this.Formatting && this.DragLining) {
      this.DragLiner(x, y);
      this.Update(x, y);
    }
    if (this.NoteInput) {
      SheetInputHover(this.Sheet, x, y, this.Camera);
    }
    this.Update(x, y);
  }

  Delete(): void {
    for (let [msr, _] of this.Selector.Elements) {
      DeleteSelectedMeasure(msr);
      CreateMeasureDivisions(msr);
    }
    this.ResizeMeasures(this.Sheet);
  }

  Input(x: number, y: number, shiftKey: boolean): void {
    // will move this code elsewhere, testing note input
    x = x / (this.Camera.Zoom * this.Camera.ScaleFactor);
    y = y / (this.Camera.Zoom * this.Camera.ScaleFactor);

    //TODO: NOT FINAL THIS IS PROTOTYPING NOT FINAL
    if (!this.NoteInput && this.Formatting) {
      this.SelectLiner(x, y);
    }

    let msrOver: Measure | undefined = undefined;
    this.Sheet.Instruments.forEach((instrument: Instrument) => {
      msrOver = instrument.Measures.find((measure: Measure) => GetBoundsWithOffset(measure).IsHovered(x, y, this.Camera));
    });

    if (msrOver === undefined) {
      if (!shiftKey) {
        this.Selector.DeselectAll();
        this.Message = ClearMessage();
        this.Message.messageString = "msr undefined";
        this.NotifyCallback(this.Message);
        this.Update(x, y);
      }
      return;
    } // no measure over

    if (!this.NoteInput) {
      if (!shiftKey) {
        this.Selector.Elements = this.Selector.DeselectAllElements(
          this.Selector.Elements,
        );
      }
      const elem = this.Selector.TrySelectElement(
        msrOver,
        x,
        y,
        this.Camera,
        shiftKey,
        this.NotifyCallback,
        this.Selector.Elements,
      );
      if ( (elem === undefined && this.Config.FormatSettings.MeasureFormatSettings.Selectable === true) ||
        this.Config.FormatSettings.MeasureFormatSettings.Selectable === undefined) {
        this.Selector.SelectMeasure(msrOver);
      }
      if (!this.DraggingNote) {
        this.DraggingNote = true;
      }
      const divOver = msrOver.Voices[msrOver.ActiveVoice].Divisions.find((d) =>
        d.Bounds.IsHovered(x, y, this.Camera),
      );
      if (divOver) {
        this.StartLine = GetLineHovered(msrOver, y, divOver.Staff).num;
      }
    } else if (this.NoteInput) {
      InputOnMeasure(
        this.Sheet,
        msrOver,
        this.NoteValue,
        x,
        y,
        this.Camera,
        this.RestInput,
        this.GraceInput,
      );
      RecreateDivisionGroups(msrOver);
      //ResizeMeasuresOnPageRevised(this.Sheet, this.Sheet.Pages[0], this.Camera, this.Config);
      //const _ = ResizeMeasuresOnPageRevised(this.Sheet, this.Sheet.Pages[0],
                                            //this.Camera, this.Config);

      // TODO: This is uncommented for now until formatting is reworked. 
      // Otherwise divisions are not created correctly when inputting notes
      // (only on the same staff for some reason) - 04-May-26
      this.ResizeMeasures(this.Sheet);

      RecreateStemAndBeams(msrOver);
      console.log(this.Sheet);
      this.SaveToUndoStack();
    }
    //  this.NotifyCallback(this.Message);
    const persist = SaveSheet(this.Sheet);
    localStorage.setItem("persist", persist);
    localStorage.setItem(
      "camera_data",
      JSON.stringify({
        Zoom: this.Camera.Zoom,
        X: this.Camera.x,
        Y: this.Camera.y,
      }),
    );
    this.Update(x, y);
  }
  Update(x: number, y: number): void {
    // Update render bounds
    this.RenderBounds.x = -this.Camera.x + this.OptBuffer;
    this.RenderBounds.y = -this.Camera.y + this.OptBuffer;
    this.RenderBounds.width = this.Canvas.clientWidth / this.Camera.Zoom - this.OptBuffer * 2;
    this.RenderBounds.height = this.Canvas.clientHeight / this.Camera.Zoom - this.OptBuffer * 2;
    this.Render({ x: x, y: y });
  }
  Render(mousePos: { x: number; y: number }): void {
    Renderer(
      this.Canvas,
      this.Context,
      this.Sheet,
      mousePos,
      this.Camera,
      this.NoteInput,
      this.RestInput,
      this.Formatting,
      this.Config,
      this.NoteValue,
      this.RenderBounds,
      this.Optimise,
      this.Debug
    );

  }

  RealtimeUpdate(app: App): void {
    return;

    if (app.Camera) {
      const zoomThreshold = 0.02;
      if (app.Camera.Zoom < app.Camera.ZoomTarget - zoomThreshold || app.Camera.Zoom > app.Camera.ZoomTarget + zoomThreshold) {
        app.CanDragCamera = false;
        const nextZoom = app.Camera.Zoom + (app.Camera.ZoomTarget - app.Camera.Zoom) * 0.1;
        const originalX = app.MouseX / app.Camera.Zoom;
        const ogY = app.MouseY / app.Camera.Zoom;
        app.Camera.SetZoom(nextZoom);
        app.Context.setTransform(app.Camera.Zoom * app.Camera.ScaleFactor, 0, 0, app.Camera.Zoom * app.Camera.ScaleFactor, 0.5, 0.5);
        const newX = app.MouseX / app.Camera.Zoom;
        const newY = app.MouseY / app.Camera.Zoom;
        app.Camera.x += newX - originalX;
        app.Camera.y += newY - ogY;
        app.Camera.oldX = app.Camera.x;
        app.Camera.oldY = app.Camera.y;
        app.Update(0, 0);
      } else {
        app.CanDragCamera = true;
      }
    }

    if (this.Playing) {
      this.Update(0, 0);
      if (this.Sheet.Instruments.length === 0) { return; }
      // render code should not be in this class
      if (this.PlaybackMeasureIndex >= this.Sheet.Instruments[0].Measures.length) {
        this.Playing = false;
        return;
      }
      let msr = this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex];
      let time_diff = this.AudioContext.currentTime - this.PlaybackTimer;
      let measureTime = msr.TimeSignature.top / msr.TimeSignature.bottom * this.PlaybackTempo / 60.0;
      if (time_diff > measureTime) {
        this.PlaybackTimer += measureTime;
        if (this.PlaybackMeasureIndex < this.Sheet.Instruments[0].Measures.length) {
          this.PlaybackMeasureIndex += 1;
          msr = this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex];
          if (!msr) {
            this.Playing = false;
            this.PlaybackMeasureIndex = 0;
            this.AudioContext = null;
            this.PlaybackTimer = 0;
          } else {
          time_diff = this.AudioContext.currentTime - this.PlaybackTimer;
          measureTime = msr.TimeSignature.top * this.PlaybackTempo / 60.0;
          }
        } else {
          this.Playing = false;
          this.PlaybackMeasureIndex = 0;
          this.PlaybackTimer = 0;
        }
      }

      if (msr) {

        let tracker_x = this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex].Bounds.x;
        let msr_width = this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex].Bounds.width;
        let percentage_traveled = time_diff / measureTime * 100;
        let percentage_across = (percentage_traveled / 100) * msr_width;
        tracker_x = msr.Bounds.x + msr.XOffset + percentage_across + this.Camera.x;
        this.Context.fillStyle = "rgba(149,184,209, 0.8)";
        this.Context.fillRect(
          tracker_x - 2.5,
          this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex].Bounds.y + this.Camera.y,
          5,
          this.Sheet.Instruments[0].Measures[this.PlaybackMeasureIndex].Bounds.height
        );
        this.Context.fillStyle = "black";

        // move camera to playback
        let target = -(msr.Bounds.y - 300);
        let nextY = this.Camera.y + (target - this.Camera.y) * 0.02;
        this.Camera.y = Math.round(nextY);
        this.Camera.oldY = this.Camera.y;
      }
      
    }

    requestAnimationFrame(() => {
      app.RealtimeUpdate(this);
    });
  }

  AddMeasure(): void {
    const prevMsr = this.Sheet.Instruments[0].Measures[this.Sheet.Instruments[0].Measures.length - 1];
    let x = 0;
    this.Sheet.Instruments.forEach((i) => {
      const instrMeasures = this.Sheet.Instruments[0].Measures.filter(
        (m: Measure) => m.InstrumentID === i.ID,
      );
      const previousMeasure = instrMeasures[instrMeasures.length - 1];
      let latestLine =
        this.Sheet.Pages[this.Sheet.Pages.length-1].PageLines[this.Sheet.Pages[this.Sheet.Pages.length-1].PageLines.length - 1];
      const newMeasureBounds = new Bounds(
        x,
        latestLine.LineBounds.y,
        150,
        prevMsr.Bounds.height,
      );
      const newMsr = CreateMeasure(
        i.ID,
        previousMeasure,
        null,
        newMeasureBounds,
        prevMsr.TimeSignature,
        prevMsr.KeySignature,
        prevMsr.Clefs,
        prevMsr.Staves,
        this.Camera,
        this.Sheet.RunningMeasureID,
        this.Sheet.Pages[this.Sheet.Pages.length - 1], // Page will need to be determined
        false,
        this.NotifyCallback,
        false,
        [], // not loading so empty note array
        false,
        this.Config.MeasureSettings,
      );
      // add measure number and barlines, will need to be reworked when
      // inserting measures is added
      newMsr.Num =
        this.Sheet.Instruments[0].Measures.filter((m: Measure) => m.InstrumentID === i.ID).length +
        1;
      newMsr.Barlines[1].Type = BarlineType.END;
      if (newMsr.PrevMeasure.Barlines[1].Type === BarlineType.END) {
        newMsr.PrevMeasure.Barlines[1].Type = BarlineType.SINGLE;
      }
      this.Sheet.Instruments[0].Measures.push(newMsr);
      previousMeasure.NextMeasure = newMsr;
      this.ResizeMeasures(this.Sheet);
    });
    this.ResizeMeasures(this.Sheet);
    this.SaveToUndoStack();
  }

  ChangeInputMode(): void {
    this.NoteInput = !this.NoteInput;
  }

  //TODO: Prototype page line formatting nonsense
  SelectLiner(x: number, y: number): Bounds | undefined {
    // get liner here
    let liner: Bounds;
    if (!this.DragLining) {
      this.LineNumber = -1;
    }
    this.Sheet.Pages.forEach((page) => {
      page.PageLines.forEach((line) => {
        if (line.LineBounds.IsHovered(x, y, this.Camera)) {
          liner = line.LineBounds;
          if (!this.DragLining) {
            this.StartDragY = y;
            this.DragLining = true;
            this.LinerBounds = liner;
            this.LineNumber = line.Number;
          }
        }
      });
    });
    return liner;
  }

  DragLiner(_: number, y: number): void {
    if (this.LinerBounds) {
      this.LinerBounds.y = this.LinerBounds.y + (y - this.StartDragY);
      const page = this.Sheet.Pages[0];
      if (this.LinerBounds.y + 12.5 <= page.Bounds.y + page.Margins.top) {
        this.LinerBounds.y = page.Bounds.y + page.Margins.top - 12.5;
      }
      this.StartDragY = y;
      // TODO: Super SCUFFED TEST PROTOTYPE NOT FINAL
      this.Sheet.Instruments[0].Measures.forEach((m) => {
        if (m.PageLine === this.LineNumber) {
          m.Bounds.y = this.LinerBounds.y;
        }
      });
      this.ResizeMeasures(this.Sheet);
    }
  }

  DragNote(x: number, y: number): void {
    const msrOver = this.Sheet.Instruments[0].Measures.find((m) =>
      GetBoundsWithOffset(m).IsHovered(x, y, this.Camera),
    );

    if (msrOver === undefined) {
      this.DraggingNote = false;
      this.StartLine = -1;
      this.EndLine = -1;
      return;
    }

    const divOver = msrOver.Voices[msrOver.ActiveVoice].Divisions.find((d) =>
      d.Bounds.IsHovered(x, y, this.Camera),
    );
    if (divOver) {
      this.EndLine = GetLineHovered(msrOver, y, divOver.Staff).num;
    }
    const lineDiff = this.EndLine - this.StartLine;
    for (let [msr, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Note)
        .forEach((n: Note) => {
          if (n.Selected && n.Editable) {
            n.Line += lineDiff;
            ResizeDivisionsRevised(msr);
            RepositionDivisionsInMeasure(msr);
            UpdateNoteBounds(msr, n.Staff);
            // send message about note update
            if (lineDiff !== 0) {
              const m: Message = {
                messageData: {
                  MessageType: MessageType.Selection,
                  Message: {
                    msg: "selected",
                    obj: n,
                  },
                },
                messageString: "Selected Note",
              };
              this.Message = m;
              this.NotifyCallback(this.Message);
            }
          }
        });
    }
    this.StartLine = this.EndLine;
    this.ResizeMeasures(this.Sheet);
  }

  StopNoteDrag(): void {
    if (this.DraggingNote) {
      this.StartLine = -1;
      this.EndLine = -1;
      this.DraggingNote = false;
      this.SaveToUndoStack();
    }
    if (this.DragLining) {
      this.DragLining = false;
    }
    // TODO: Only set undo/redo state when a note is moved, this will 
    // currently trigger when camera is moved
  }

  SetCameraDragging(dragging: boolean, x: number, y: number): void {
    if (!this.CanDragCamera) { return; }
    this.Camera.SetDragging(dragging, x, y, this.Config, this.Camera);
  }

  AlterZoom(num: number, mx: number, my: number, smooth: boolean = true): void {
    console.log("dpi: ", window.devicePixelRatio);
    if (!smooth) {
      const originalX = mx / (this.Camera.Zoom * this.Camera.ScaleFactor);
      const ogY = my / (this.Camera.Zoom * this.Camera.ScaleFactor);
      this.Camera.SetZoom(this.Camera.Zoom + num);
      this.Context.setTransform(this.Camera.Zoom * this.Camera.ScaleFactor, 0, 0, this.Camera.Zoom * this.Camera.ScaleFactor, 0.5, 0.5);
      const newX = mx / (this.Camera.Zoom * this.Camera.ScaleFactor);
      const newY = my / (this.Camera.Zoom * this.Camera.ScaleFactor);
      this.Camera.x += newX - originalX;
      this.Camera.y += newY - ogY;
      this.Camera.oldX = this.Camera.x;
      this.Camera.oldY = this.Camera.y;
    } else {
      this.Camera.ZoomTarget = this.Camera.Zoom + num;
    }

    this.Update(0, 0);
  }

  SetCameraZoom(num: number): void {
    this.Camera.SetZoom(num);
    this.Camera.ZoomTarget = this.Camera.Zoom;
    this.Context.setTransform(this.Camera.Zoom * this.Camera.ScaleFactor, 0, 0, this.Camera.Zoom * this.Camera.ScaleFactor, 0.5, 0.5);
    this.Update(0, 0);
  }

  SetSmoothCameraZoom(num: number): void {
    this.Camera.ZoomTarget = num;
  }

  Scroll(amount: number): void {
    this.Camera.y += amount;
    this.Camera.oldY = this.Camera.y;
    this.Update(0, 0);
  }
  
  ResizeMeasures(sheet: Sheet): void {
    sheet.Instruments.forEach((i: Instrument) => {
        const measures = i.Measures.filter(
          (m: Measure) => m.InstrumentID === i.ID,
        );
        if (measures.length == 0) {
          return;
        }
        this.Sheet.Pages = [];
        this.Sheet.Pages.push(new Page(0, 0, 1));
        // TODO: I don't even know what this is for but ok
        const lineHeight = 400;
//      const lineHeight =
//        measures[0].Instrument.Staff === StaffType.Rhythm ? 400 : 400;
      SetPagesAndLines(
        measures,
        this.Sheet.Pages,
        this.Config.PageSettings?.UsePages,
        lineHeight,
      );
      this.Sheet.Pages.forEach((page: Page) => {
        ResizeMeasuresOnPageRevised(
          this.Sheet,
          page,
          this.Camera,
          this.Config,
        );
      });
    //  if (this.Config.CameraSettings?.CenterMeasures) {
    //    this.CenterMeasures();
    //  } else if (this.Config.CameraSettings?.CenterPage) {
    //    this.CenterPage();
    //  }
    //  measures.forEach((m: Measure) => {
    //    RecreateDivisionGroups(m);
    //    m.Staves.forEach((s: Staff) => {
    //      UpdateNoteBounds(m, s.Num);
    //    });
    //    RecalculateBarlines(m);
    //  });
    });
    this.Update(0, 0);
    console.log(sheet);
  }

  SetNoteValue(val: number): void {
    this.NoteValue = val;
  }

  SetAccidental(acc: number): void {
    for (let [_, elem] of this.Selector.Elements) {
      elem.forEach((n) => {
        if (n.SelType === SelectableTypes.Note) {
          const note = n as Note;
          note.Alter = acc;
          this.Message = ClearMessage();
          const m: Message = {
            messageData: {
              MessageType: MessageType.Selection,
              Message: {
                msg: "selected",
                obj: note,
              },
            },
            messageString: "Selected Note",
          };
          this.Message = m;
          this.NotifyCallback(m);
        }
      });
    }
    this.Update(0, 0);
    this.SaveToUndoStack();
  }

  // Sharpen/Flatten implementation should be in accidentaler(?)
  Sharpen(): void {
    console.log("Sharpening!\n");
    for (let [_, elem] of this.Selector.Elements) {
      elem.forEach((n) => {
        if (n.SelType === SelectableTypes.Note) {
          const note = n as Note;
          note.Alter += 1;
          if (note.Alter > 2) {
            note.Alter = 2;
          }
        }
      });
    }
    this.Update(0, 0);
    this.SaveToUndoStack();
  }
  Flatten(): void {
    console.log("Flat!\n");
    for (let [_, elem] of this.Selector.Elements) {
      elem.forEach((e) => {
        if (e.SelType === SelectableTypes.Note) {
          const n = e as Note;
          n.Alter -= 1;
          if (n.Alter < -2) {
            n.Alter = -2;
          }
        }
      });
    }
    this.Update(0, 0);
    this.SaveToUndoStack();
  }

  //TODO: Remove this test function
  ScaleToggle(): number {
    if (this.Camera.Zoom !== 1) {
      this.Camera.Zoom = 1;
    } else {
      this.Camera.Zoom = 1;
    }
    return this.Camera.Zoom;
  }

  KeyInput(keyEvent: KeyboardEvent, keymaps: KeyMapping): void {
    let prefix = '';
    if (keyEvent.ctrlKey) {
      prefix += "ctrl ";
    } 
    if (keyEvent.altKey) {
      prefix += "alt ";
    }
    if (keyEvent.shiftKey) {
      prefix += "shift ";
    }
    let key = prefix + keyEvent.key;
    KeyPress(this, key, keymaps);
    //    this.NotifyCallback(this.Message);
  }

  SelectById(id: number): ISelectable {
   // const sel = this.Selector.SelectById(this.Sheet.Measures, id);
   // this.Update(0, 0);
   // return sel;
   return null;
  }

  ToggleFormatting(): void {
    this.Formatting = !this.Formatting;
    if (this.Formatting) {
      this.NoteInput = false;
      this.RestInput = false;
    }
  }

  SaveToUndoStack(): void {
    AddToUndoStack(this.StateStack, this.Save(), this.StateIndex);
    this.Message = ClearMessage();
    const m: Message = {
      messageData: {
        MessageType: MessageType.StateChange,
        Message: {
          msg: "statechanged",
          obj: this.StateStack[this.StateIndex.index],
        },
      },
      messageString: "Latest State",
    };
    this.Message = m;
    this.NotifyCallback(m);

  }

  Undo(): void {
    LoadPreviousState(this);
    this.ResizeMeasures(this.Sheet);

  }
  Redo(): void {
    LoadNextState(this);
    this.ResizeMeasures(this.Sheet);
  }

  Save(): string {
    return SaveSheet(this.Sheet);
  }

  LoadSheet(sheet: string): void {
    //Clear measures
    this.Sheet.Instruments.forEach((i: Instrument) => {
      i.Measures = [];
    });

    LoadSheet(
      this.Sheet,
      this.Sheet.Pages[0],
      this.Camera,
      this.Sheet.Instruments[0],
      sheet,
      this.NotifyCallback,
    );
    this.ResizeMeasures(this.Sheet);
    this.Update(0, 0);
  }

  LoadFromMXML(score: XMLScore): void {
    this.Sheet.Instruments.forEach((i: Instrument) => {
      i.Measures = [];
    });

    let loadStruct = LoadFromMXML(score);
    this.LoadSheet(JSON.stringify(loadStruct));
    this.ResizeMeasures(this.Sheet);
    this.Update(0, 0);

    this.SaveToUndoStack();
  }

  GetSaveFiles(): saveFile[] {
    return allSaves;
  }

  CreateTuplet(count: number): void {
    this.NoteValue = CreateTuplet(this.Selector.Elements, count);
    this.ResizeMeasures(this.Sheet);
    this.Update(0, 0);
  }

  ChangeTimeSignature(
    top: number,
    bottom: number,
    transpose: boolean = false,
  ): void {
    for (let [msr, _] of this.Selector.Elements) {
      ChangeTimeSignature(msr, top, bottom, transpose);
    }

    this.SaveToUndoStack();
  }

  CenterMeasures(): void {
// Reworking because I don't know what was going on below
    // for now assume camera zoom = 1 and only 1 instrument.
    var pageWidth = this.Canvas.clientWidth;
    var total_measures_width = 0;
    var first_measure_x = 0.0;
    this.Sheet.Instruments[0].Measures.forEach((m: Measure, i: number) => {
      if (i == 0) {
        first_measure_x = m.Bounds.x;
      }
      total_measures_width += GetBoundsWithOffset(m).width;
    });
    total_measures_width *= this.Camera.Zoom;
    if (pageWidth < total_measures_width) { console.log("measures are not fitting onto page: ", pageWidth, ", ", total_measures_width); 
    return;}
    var difference = pageWidth - total_measures_width;
    var diff_halved = difference / 2.0;
    var camera_x = diff_halved - first_measure_x;
    console.log("diff_halved = ", diff_halved);
    console.log("camera_x: ", camera_x);
    this.Camera.x = camera_x;
    this.Camera.x = (-first_measure_x) + diff_halved / this.Camera.Zoom;

    return;
    // This measure is currently only being used for mtrainer
    let msrWidth = 100;
    if (this.Config.FormatSettings?.MeasureFormatSettings?.MaxWidth) {
      msrWidth = this.Config.FormatSettings.MeasureFormatSettings.MaxWidth;
    }
    const padding =
      (this.Canvas.clientWidth - (msrWidth + msrWidth / 2) * this.Camera.Zoom) /
      4;
    this.Camera.x = padding;
    if (this.Canvas.clientWidth < msrWidth * this.Camera.Zoom) {
      this.SetCameraZoom(this.Canvas.clientWidth / msrWidth);
    } else {
      const z = this.Config.CameraSettings?.Zoom
        ? this.Config.CameraSettings.Zoom
        : 1;
      this.SetCameraZoom(z);
    }
  }

  CenterPage(): void {
    const page = this.Sheet.Pages[0];
    const pageW = page.Bounds.width;
    const sidePadding = 20;
    const totalWidth = pageW + sidePadding;
    if (this.Canvas.clientWidth < totalWidth) {
      //set zoom of camera
      this.SetCameraZoom(this.Canvas.clientWidth / totalWidth);
    } else {
      const z = this.Config.CameraSettings?.Zoom
        ? this.Config.CameraSettings.Zoom
        : 1;
      this.SetCameraZoom(z);
    }

    const emptySpace = this.Canvas.clientWidth - totalWidth * this.Camera.Zoom;
    this.Camera.x = emptySpace / 2;
    this.Camera.oldX = this.Camera.x;
  }

  // Maybe instead of duplicate function we can expose note input function,
  // doesn't matter atm
  AddNoteOnMeasure(
    msr: Measure,
    noteValue: number,
    line: number,
    beat: Division,
    rest: boolean,
  ): void {
    AddNoteOnMeasure(this.Sheet, msr, noteValue, line, beat, rest, this.GraceInput);

    this.SaveToUndoStack();
  }

  BeamSelectedNotes(): void {
    // currently only implementing for cross staff beaming
    var beamFrom: number; // which staff to "beam from"
    for (let [msr, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Note)
        .forEach((n: Note, i: number) => {
          if (i == 0) {
            beamFrom = n.Staff;
          }
          if (n.Staff !== beamFrom) {
            msr.Voices[msr.ActiveVoice].Notes.filter(
              (note: Note) => note.Staff == n.Staff && note.Beat == n.Beat,
            ).forEach((note: Note) => {
              note.StaffGroup = beamFrom;
            });
          }
        });
    }
    this.ResizeMeasures(this.Sheet);
  }

  AddStaff(instrNum: number, clef: string): void {
    const instr = this.Sheet.Instruments[instrNum];
    if (!instr) {
      return;
    }
    const newStaff = CreateStaff(instr.Staves.length);
    instr.Staves.push(newStaff);
    const msrs: Measure[] = instr.Measures.filter(
      (m) => m.InstrumentID === instr.ID,
    );
    msrs.forEach((m) => {
      m.Staves.push(newStaff);
      m.Clefs.push(new Clef(m.Clefs.length - 1, clef, 1, newStaff.Num));
      // TODO: Temporarry measure height being set
      m.Bounds.height = GetStaffHeightUntil(m.Staves);
    });
  }

  // TODO: Move
  FromPitchMap(midiNote: number, clef: string): MappedMidi {
    const midiMapped: MappedMidi = FromPitchMap(midiNote, this.PitchMap, clef);
    return midiMapped;
  }

  // These are test/temp functions (kinda)

  ChangeBarline(type: BarlineType): void {
    for (let [_, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Barline)
        .forEach((bl: Barline) => {
          let positionMatch = PositionMatch(bl.Position, type);
          if (!positionMatch) {
            return;
          }
          bl.Type = type;
        });
    }
    this.ResizeMeasures(this.Sheet);

    this.SaveToUndoStack();
  }

  AddClef(): void {
    // TODO: Get selected clef here, for now default to treble
    const clef = "treble";
    for (let [msr, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Note)
        .forEach((n: Note) => {
          msr.Clefs.push(new Clef(0, clef, n.Beat, n.Staff));
        });
    }

    this.SaveToUndoStack();
  }

  // TODO: This function was a test, keeping it here as there is a keybind (also
  // commented out) - need to fully implement this functionality
//  ChangeTimeSig(): void {
//    const msr1 = this.Sheet.Measures[0];
//    if (msr1) {
//      ChangeTimeSignature(msr1, 3, 4, false);
//    }
//
//    this.SaveToUndoStack();
//  }

  AddDynamic(dynString: string): void {
    for (let [msr, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Note)
        .forEach((n: Note) => {
          msr.Dynamics.push(new Dynamic(dynString, n.Staff, n.Beat));
        });
    }

    this.SaveToUndoStack();
  }

  AddArticulation(type: ArticulationType): void {
    for (let [msr, elem] of this.Selector.Elements) {
      elem
        .filter((e: ISelectable) => e.SelType === SelectableTypes.Note)
        .forEach((n: Note) => {
          msr.Articulations.push(
            new Articulation(
              type,
              n.Beat,
              n.Staff,
              msr.Voices[msr.ActiveVoice],
            ),
          );
        });
    }

    this.SaveToUndoStack();
  }

  CycleActiveVoice(): void {
    this.Sheet.Instruments.forEach((instrument: Instrument) => {
      instrument.Measures.forEach((m: Measure) => {
        m.ActiveVoice += 1;
        if (m.ActiveVoice > 3) {
          m.ActiveVoice = 0;
        }
      });
    });
  }

  // TODO: Move this to a class to handle playback separately.
  SetPlaying(playing: boolean, tempo: number, aContext: AudioContext): void {
    this.Playing = playing;
    this.PlaybackTempo = tempo;
    this.AudioContext = aContext;
    this.PlaybackTimer = aContext.currentTime;
    this.PlaybackMeasureIndex = 0;
  }

  ToggleOpt(): void {
    this.Optimise = !this.Optimise;
  }

  ToggleDebug(): void {
    this.Debug = !this.Debug;
  }

  // TODO: For development/testing purposes
  PreviewOpt(): void {
    if (this.OptBuffer === 0) {
      this.OptBuffer = 300;
    } else {
      this.OptBuffer = 0;
    }
  }
}

export { App };
