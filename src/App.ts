import { Sheet, SheetProps } from "./Core/Sheet.js";
import { RenderDebug, Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateInstrument, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Clef, Division, Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";
import { Camera } from "./Core/Camera.js";
import { AddNoteOnMeasure, CreateTuplet, InputOnMeasure, UpdateNoteBounds } from "./Workers/NoteInput.js";
import { Selector } from "./Workers/Selector.js";
import { GetDivisionTotalWidth } from "./Core/Division.js";
import { Instrument, StaffType } from "./Core/Instrument.js";
import { KeyMapping, KeyPress } from "./Workers/Mappings.js";
import { ISelectable, SelectableTypes } from "./Types/ISelectable.js";
import { Page } from "./Core/Page.js";
import { ResizeMeasuresOnPage, SetPagesAndLines } from "./Workers/Formatter.js";
import { LoadSheet, SaveSheet } from "./Workers/Loader.js";
import { allSaves, canonSave, intervalTest, saveFile } from "./testsaves.js";
import { ClearMessage, Message, MessageType } from "./Types/Message.js";
import { GeneratePitchMap, MappedMidi } from "./Workers/Pitcher.js";
import { ConfigSettings } from "./Types/Config.js";

class App { 
  Config: ConfigSettings;
  Message: Message;
  Canvas: HTMLCanvasElement;
  Container: HTMLElement;
  Context: CanvasRenderingContext2D;
  Load: boolean;
  Sheet: Sheet;
  HoveredElements: { MeasureID: number };
  NoteInput: boolean;
  RestInput: boolean;
  Formatting: boolean;
  Zoom: number;
  Camera: Camera;
  CamDragging: boolean;
  DraggingPositions: { x1: number, y1: number, x2: number, y2: number };
  NoteValue: number;
  Selector: Selector;
  NotifyCallback: (msg: Message) => void;
  RunningID: { count: number };
  PitchMap: Map<number, MappedMidi>;

  // TODO: Off load some of this work to other classes/functions 
  // For now we prototype here
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

  constructor (canvas: HTMLCanvasElement, 
               container: HTMLElement,
             context: CanvasRenderingContext2D,
             notifyCallback: (msg: Message) => void,
              config: ConfigSettings,
              load = false) {
    this.Config = config;
    this.PitchMap = GeneratePitchMap();
    this.Message = ClearMessage();
    this.NotifyCallback = notifyCallback;
    this.Debug = true;
    this.Canvas = canvas;
    this.Container = container;
    this.Selector = new Selector();
    this.Context = context;
    this.Load = load;
    this.HoveredElements = { MeasureID: -1 };
    this.Zoom = 1;
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
    this.Camera.Zoom = 1;//this.Config.CameraSettings.Zoom ? this.Config.CameraSettings.Zoom : 1;
    this.NoteValue = 0.5;//this.Config?.NoteSettings?.InputValue ? 
//      this.Config.NoteSettings.InputValue : 0.25;

    // TODO: Remove to formatter
    this.StartDragY = 0;
    this.EndDragY = 0;
    this.DragLining = false;

    if (!this.Load) {
      // Create New Sheet Properties
      let newPage: Page = new Page(0, 0, 1);
      if (this.Config.PageSettings?.PageWidth) {
        newPage.Bounds.width = this.Config.PageSettings.PageWidth;
      }
      
      const sProps: SheetProps = {
        Instruments: [],
        KeySignature: [{ key: "CMaj", measureNo: 0 }],
        Measures: [],
        Pages: [newPage],
      };

      const page = sProps.Pages[0];

      sProps.Instruments.push(CreateInstrument(20, this.Config));
      sProps.Measures.push(CreateDefaultMeasure(this.RunningID,
                                                sProps.Instruments[0],
                                                page,this.Camera,
                                                this.NotifyCallback,
                                                this.Config.MeasureSettings));

      this.Sheet = new Sheet(sProps);
    }
    this.NoteInput = false;
    this.RestInput = false;
    this.Formatting = false;

    if (this.Config.CameraSettings?.Zoom) {
      this.Camera.Zoom = this.Config.CameraSettings.Zoom;
      this.SetCameraZoom(this.Camera.Zoom);
      this.ResizeMeasures(this.Sheet.Measures);
    }

    this.Update(0, 0);
  }

  Hover(x: number, y: number): void {
    x = x / this.Camera.Zoom;
    y = y / this.Camera.Zoom;

    if (this.CamDragging) {
      this.Camera.x = Math.floor(this.Camera.oldX + x - this.DraggingPositions.x1);
      this.Camera.y = Math.floor(this.Camera.oldY + y - this.DraggingPositions.y1);
      this.Update(x, y);
      return;
    }
    if (this.DraggingNote) {
      this.DragNote(x, y);
      this.Update(x, y);
    }
    if (this.Formatting && this.DragLining) {
      this.DragLiner(x, y);
      this.Update(x, y);
    }
    this.HoveredElements.MeasureID = -1;
    // TODO: Move all this elsewhere
    if (this.NoteInput) {
      this.Sheet.Measures.forEach((m: Measure) => {
        if (m.GetBoundsWithOffset().IsHovered(x, y, this.Camera)) {
          m.Divisions.forEach((d: Division) => {
            if (d.Bounds.IsHovered(x, y, this.Camera)) {
              //ManageHeight(m, d.Staff, x, y, this.Camera, this.Sheet.Measures);
              // TODO: Move this so it only is called 
              // at the appropriate time
              UpdateNoteBounds(m, 0);
              UpdateNoteBounds(m, 1);
            }
          })
        } else { 
          console.log("We were resetting height here for some reason!");
 //         m.ResetHeight();         
        }
      });
    }
    // This shouldn't always update but will need to do serious work to figure
    // out all bugs involved when it doesn't
    this.Update(x, y);
  }

  Delete(): void {
    for (let [ msr, elem ] of this.Selector.Elements ) {
      msr.DeleteSelected();
      msr.CreateDivisions(this.Camera);
    }
  }

  Input(x: number, y: number, shiftKey: boolean): void {
    // will move this code elsewhere, testing note input
    x = x / this.Camera.Zoom;
    y = y / this.Camera.Zoom;

    //TODO: NOT FINAL THIS IS PROTOTYPING NOT FINAL 
   if (!this.NoteInput && this.Formatting) {
      this.SelectLiner(x, y);
    }

    this.HoveredElements.MeasureID = -1;
    const msrOver: Measure | undefined = this.Sheet
      .Measures
      .find( (msr: Measure) => msr.GetBoundsWithOffset().IsHovered(x, y, this.Camera));

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
      let selectedMeasureElement: boolean = false;
      // Measure Element selection, should be moved elsewhere eventually
      // (probably Measure? Maybe somewhere else)
      if (!shiftKey) {
        this.Selector.Elements = this.Selector.DeselectAllElements(this.Selector.Elements);
      }
      const elem = this.Selector.TrySelectElement(msrOver, x, y, this.Camera, shiftKey, this.NotifyCallback, this.Selector.Elements);
      if (elem === undefined && this.Config.FormatSettings.MeasureFormatSettings.Selectable === true || 
          this.Config.FormatSettings.MeasureFormatSettings.Selectable === undefined)  {
        this.Selector.SelectMeasure(msrOver);
      } 
      if (!this.DraggingNote) { this.DraggingNote = true; }
      const divOver = msrOver.Divisions.find(d => d.Bounds.IsHovered(x, y, this.Camera));
      if (divOver) {
        this.StartLine = msrOver.GetLineHovered(y, divOver.Staff).num;
      }
    } 
    else if (this.NoteInput) {
      InputOnMeasure(msrOver, this.NoteValue, x, y, this.Camera, this.RestInput);
      this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === msrOver.Instrument));
    }
  //  this.NotifyCallback(this.Message);
    this.Update(x, y);
  }
  Update(x: number, y : number): void {
    // this should be the only place that calls render
   // this.NotifyCallback(this.Message);
    this.Render({ x: x, y: y });
  }
  Render(mousePos: {x: number, y: number}): void {
    Renderer(this.Canvas,
             this.Context,
             this.Sheet.Measures,
             this.Sheet.Pages,
             this.HoveredElements,
             mousePos, 
             this.Camera,
             this.NoteInput,
             this.RestInput,
             this.Formatting,
             this.Config,
             this.NoteValue);
    if (this.Debug) {
      RenderDebug(this.Canvas,
                  this.Context,
                  this.Sheet,
                  mousePos,
                  this.Camera,
                  this.Selector);
    }
  }

  AddMeasure(): void {
    const newMeasureID = this.Sheet.Measures.length;
    const prevMsr = this.Sheet.Measures[this.Sheet.Measures.length-1];
    let x = 0;
    this.Sheet.Instruments.forEach(i => {
      let latestLine = this.Sheet.Pages[0].PageLines[this.Sheet.Pages[0].PageLines.length - 1];
  //    const msrCountOnLine = this.Sheet.Measures.filter(m => m.PageLine === latestLine.Number);
  //    if (msrCountOnLine.length > 3) {
  //      latestLine = this.Sheet.Pages[0].AddLine();
  //    }
      const newMeasureBounds = new Bounds(x, latestLine.LineBounds.y, 150, prevMsr.Bounds.height);
      const newMsr = CreateMeasure(
        i,
       newMeasureBounds,
       prevMsr.TimeSignature,
       prevMsr.KeySignature,
       "treble",
       this.Camera,
       this.RunningID,
       this.Sheet.Pages[0], // Page will need to be determined
       false,
       this.NotifyCallback,
       this.Config.MeasureSettings);
 //      newMsr.PageLine = latestLine.Number;
      this.Sheet.Measures.push(newMsr);
      this.ResizeMeasures(this.Sheet.Measures.filter(m => m.Instrument === i));
    })
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
    this.Sheet.Pages.forEach(page => {
      page.PageLines.forEach(line => {
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

  DragLiner(x: number, y: number): void {
    if (this.LinerBounds) {
      this.LinerBounds.y = this.LinerBounds.y + (y - this.StartDragY);
      const page = this.Sheet.Pages[0];
      if (this.LinerBounds.y + 12.5 <= page.Bounds.y + page.Margins.top) {
        this.LinerBounds.y = (page.Bounds.y + page.Margins.top) - 12.5;
      }
      this.StartDragY = y;
      // TODO: Super SCUFFED TEST PROTOTYPE NOT FINAL
      this.Sheet.Measures.forEach(m => {
        if (m.PageLine === this.LineNumber) {
          m.Bounds.y = this.LinerBounds.y
        }
      });
      this.ResizeMeasures(this.Sheet.Measures);
    }
  }

  DragNote(x: number, y: number): void {
    const msrOver = this.Sheet
      .Measures.find(m => m.GetBoundsWithOffset().IsHovered(x, y, this.Camera));

    if (msrOver === undefined) { 
      this.DraggingNote = false;
      this.StartLine = -1;
      this.EndLine = -1;
      return; 
    }

    const divOver = msrOver.Divisions.find(d => d.Bounds.IsHovered(x, y, this.Camera));
    if (divOver) {
      this.EndLine = msrOver.GetLineHovered(y, divOver.Staff).num;
    }
    const lineDiff = this.EndLine - this.StartLine;
    for (let [msr, elem] of this.Selector.Elements) {
        elem.filter((e: ISelectable) => e.SelType === SelectableTypes.Note).forEach((n: Note) => {
        // Should never be selected, currently band-aid fix for bug. Address
        // when re-implementing dragging notes/selectables
        if (n.Selected && n.Editable) {
          n.Line += lineDiff;
          UpdateNoteBounds(msr, n.Staff);
          // send message about note update
          if (lineDiff !== 0) {
            const m: Message = {
            messageData: {
              MessageType: MessageType.Selection,
              Message: {
                msg: 'selected',
                obj: n,
                },
              },
              messageString: 'Selected Note'
            }
            this.Message = m;
            this.NotifyCallback(this.Message);
          }
        }
      })
    }
    this.StartLine = this.EndLine;
  }

  StopNoteDrag(x: number, y: number): void {
    if (this.DraggingNote) {
      this.StartLine = -1;
      this.EndLine = -1;
      this.DraggingNote = false;
    }
    if (this.DragLining) { this.DragLining = false; }
  }

  SetCameraDragging(dragging: boolean, x: number, y: number): void {
    if (this.Config.CameraSettings?.DragEnabled === false) {
      this.CamDragging = false;
      return;
    }
    this.CamDragging = dragging;
    if (this.CamDragging) {
      // set initial drag position
      this.DraggingPositions.x1 = (x / this.Camera.Zoom);
      this.DraggingPositions.y1 = (y / this.Camera.Zoom);
    } else {
      // reset drag positions
      this.DraggingPositions.x1 = 0;
      this.DraggingPositions.y1 = 0;
      this.DraggingPositions.x2 = 0;
      this.DraggingPositions.y2 = 0;
      this.Camera.oldX = this.Camera.x;
      this.Camera.oldY = this.Camera.y;
    }
  }

  AlterZoom(num: number): void {
    this.Zoom += num;
    this.Camera.Zoom = this.Zoom;
    this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
    this.Update(0, 0);
  }

  SetCameraZoom(num: number): void {
    this.Zoom = num;
    this.Camera.Zoom = this.Zoom;
    this.Context.setTransform(this.Camera.Zoom, 0, 0, this.Camera.Zoom, 0, 0);
    this.Update(0, 0);
  }

  // TEST FUNCTION
  ResizeFirstMeasure(): void {
//    this.Sheet.Measures[0].Bounds.width += 50;
    this.Sheet.Measures[0].CreateDivisions(this.Camera);
    for (let i = 1; i < this.Sheet.Measures.length; i++) {
      this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i-1]);
    }
    this.Update(0, 0);
  }

  ResizeMeasures(measures: Measure[]): void {
    // TODO: Prototyping stuff so refactor later
    const maxMeasuresPerLine = 4;
    const minMeasuresPerLine = 3;
    const lineHeight = measures[0].Instrument.Staff === StaffType.Rhythm ? 200 : 200;
    SetPagesAndLines(measures, this.Sheet.Pages[0], this.Config.PageSettings?.UsePages, lineHeight);
    ResizeMeasuresOnPage(measures, this.Sheet.Pages[0], this.Camera, this.Config);
    if (this.Config.CameraSettings?.CenterMeasures) {
      this.CenterMeasures();
    } else if (this.Config.CameraSettings?.CenterPage) {
      this.CenterPage();
    }

    this.Update(0, 0);
  }

  SetNoteValue(val: number): void {
    this.NoteValue = val;
  }

  SetAccidental(acc: number): void {
    for (let [ msr, elem ] of this.Selector.Elements ) {
      elem.forEach(n => {
            if (n.SelType === SelectableTypes.Note) {
              const note = n as Note;
              note.Accidental = acc;
              this.Message = ClearMessage();
              const m: Message = {
                messageData: {
                MessageType: MessageType.Selection,
                Message: {
                  msg: 'selected',
                  obj: note,
                  },
                },
                messageString: 'Selected Note'
              }
              this.Message = m;
              this.NotifyCallback(m);
            }
      });
    }
    this.Update(0, 0);
  }

  Sharpen(): void {
    for (let [ msr, elem ] of this.Selector.Elements ) {
      elem.forEach(n => {
        if (n.SelType === SelectableTypes.Note) {
          const note = n as Note;
          note.Accidental += 1;
          if (note.Accidental > 2) { note.Accidental = 2; }
        }
      });
    }
    this.Update(0, 0);
  }
  Flatten(): void {
    for (let [ msr, elem ] of this.Selector.Elements ) {
      elem.forEach(e => {
        if (e.SelType === SelectableTypes.Note) {
          const n = e as Note;
          n.Accidental -= 1;
          if (n.Accidental < -2) { n.Accidental = -2; }
        }
      })
    }
    this.Update(0, 0);
  }

  //TODO: Remove this test function
  ScaleToggle(): number {
    if (this.Camera.Zoom !== 1) {
      this.Camera.Zoom = 1;
      this.Zoom = 1;
    } else {
      this.Camera.Zoom = 1;
    }
    return this.Camera.Zoom;
  }

 // Test_AddClefMiddle(): void {
 //   const msr = this.Sheet.Measures[0];
 //   const clef: Clef = {Type: "bass", Beat: 3};
 //   let clefExist = false;
 //   msr.Clefs.forEach((c: Clef) => {
 //     if (c.Beat === clef.Beat && c.Type === clef.Type) {
 //       clefExist = true;
 //     }
 //   });
 //   if (!clefExist)
 //     msr.Clefs.push(clef);
 // }

  KeyInput(key: string, keymaps: KeyMapping): void {
    KeyPress(this, key, keymaps);
//    this.NotifyCallback(this.Message);
  }

  SelectById(id: number): ISelectable {
    const sel = this.Selector.SelectById(this.Sheet.Measures, id);
    this.Update(0, 0);
    return sel;
  }

  ToggleFormatting(): void {
    this.Formatting = !this.Formatting;
    if (this.Formatting) {
      this.NoteInput = false;
      this.RestInput = false;
    }
  }

  Save(): void {
    SaveSheet(this.Sheet);
  }

  LoadSheet(sheet: string): void {
    //Clear measures
    this.Sheet.Measures = [];
    LoadSheet(this.Sheet,
              this.Sheet.Pages[0],
              this.Camera,
              this.Sheet.Instruments[0], sheet,
              this.NotifyCallback);
    this.ResizeMeasures(this.Sheet.Measures);
    this.Update(0, 0);
  }

  GetSaveFiles(): saveFile[] {
    return allSaves;
  }

  // TODO: Prototype code
  CreateTriplet(): void {
    this.NoteValue = CreateTuplet(this.Selector.Notes, 3);
    this.ResizeMeasures(this.Sheet.Measures);
    this.Update(0, 0);
  }

  ChangeTimeSignature(top: number, bottom: number, transpose: boolean = false): void {
    for (let [ msr, elem ] of this.Selector.Elements) {
      msr.ChangeTimeSignature(top, bottom, transpose);
    }
  }

  CenterMeasures(): void {
    // This measure is currently only being used for mtrainer
    let msrWidth = 100;
    if (this.Config.FormatSettings?.MeasureFormatSettings?.MaxWidth) {
      msrWidth = this.Config.FormatSettings.MeasureFormatSettings.MaxWidth
    }
    const padding = (this.Canvas.clientWidth - ((msrWidth + (msrWidth / 2)) * this.Camera.Zoom)) / 4;
    this.Camera.x = padding;
    if (this.Canvas.clientWidth < (msrWidth * this.Camera.Zoom)) {
      this.SetCameraZoom(this.Canvas.clientWidth / msrWidth);
    } else {
      const z = this.Config.CameraSettings?.Zoom ? this.Config.CameraSettings.Zoom : 1;
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
      const z = this.Config.CameraSettings?.Zoom ? this.Config.CameraSettings.Zoom : 1;
      this.SetCameraZoom(z);
    }
    
    const emptySpace = this.Canvas.clientWidth - (totalWidth * this.Camera.Zoom);
    this.Camera.x = emptySpace / 2;
  }

  // Maybe instead of duplicate function we can expose note input function,
  // doesn't matter atm
  AddNoteOnMeasure(msr: Measure,
                   noteValue: number,
                   line: number,
                   beat: Division,
                   rest: boolean): void { AddNoteOnMeasure(msr, noteValue, line, beat, rest); }
}

export { App };
