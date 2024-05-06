import { Camera } from "../Core/Camera.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Measure, MeasureProps } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Bounds } from "../Types/Bounds.js";

// Defaults, these will be moved somewhere else but fine here for now
const sTopLine = 5;
const sBotLine = 24;
const lineHeight = 5;

const mh = (sBotLine - sTopLine) * lineHeight;

const CreateDefaultPiano = (): Instrument => {
  const defaultPiano: Instrument = {
    Position: {x: 100, y: 100},
    Staff: StaffType.Grand
  }

  return defaultPiano;
}

function CreateInstrument(y: number): Instrument {
  const instr: Instrument = {
    Position: { x: 0, y: y },
    Staff: StaffType.Grand
  }

  return instr;
}

const CreateDefaultMeasure = (id: { count: number }, instr: Instrument, page: Page, cam: Camera): Measure => {

  const msrHeight = instr.Staff === StaffType.Grand ? mh * 2 : mh;

  const props: MeasureProps = {
    Instrument: instr,
    Bounds: new Bounds(instr.Position.x, page.PageLines[0].LineBounds.y, 150, msrHeight),
    TimeSignature: { top: 4, bottom: 4 },
    KeySignature: "CMaj/Amin",
    Notes: [],
    Divisions: [],
    Clef: "treble",
    RenderClef: true,
    RenderTimeSig: true,
    RenderKey: false,
    Camera: cam,
    Page: page,
  }
  return new Measure(props, id);
}

const CreateMeasure = (instr: Instrument, 
                    bounds: Bounds,
                    timeSignature: { top: number, bottom: number },
                    keySignature: string,
                    clef: string,
                    cam: Camera,
                    runningId: { count: number },
                    page: Page,
                    renderClef: boolean = false): Measure =>
  {
    const props: MeasureProps = {
      Instrument: instr,
      Bounds: bounds,
      TimeSignature: timeSignature,
      KeySignature: keySignature,
      Notes: [],
      Divisions: [],
      Clef: clef,
      RenderClef: false,
      RenderTimeSig: false,
      RenderKey: false,
      Camera: cam,
      Page: page
    }
    return new Measure(props, runningId);
  }


export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
