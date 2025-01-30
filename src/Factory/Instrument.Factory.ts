import { Barline, BarlinePos, BarlineType } from "../Core/Barline.js";
import { Camera } from "../Core/Camera.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Clef, Measure, MeasureProps } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";
import { ConfigSettings, MeasureSettings } from "../entry.js";

// Defaults, these will be moved somewhere else but fine here for now
const sTopLine = 5;
const sBotLine = 24;
const lineHeight = 5;

const mh = (sBotLine - sTopLine) * lineHeight;

const CreateDefaultPiano = (): Instrument => {
  const defaultPiano: Instrument = {
    Position: { x: 0, y: 5 },
    Staff: StaffType.Grand,
    Staves: [new Staff(0), new Staff(1)],
  };

  return defaultPiano;
};

function CreateInstrument(y: number, config: ConfigSettings): Instrument {
  let staff: StaffType = StaffType.Single;
  if (config.DefaultStaffType) {
    switch (config.DefaultStaffType) {
      case "rhythm":
        staff = StaffType.Rhythm;
        break;
      case "grand":
        staff = StaffType.Grand;
        break;
      case "single":
      default:
        staff = StaffType.Single;
    }
  }
  const instr: Instrument = {
    Position: { x: 0, y: y },
    Staff: staff,
    Staves: [new Staff(0)],
  };

  return instr;
}

const CreateDefaultMeasure = (
  id: { count: number },
  instr: Instrument,
  page: Page,
  cam: Camera,
  callback: (msg: Message) => void,
  settings?: MeasureSettings,
): Measure => {
  const msrHeight = instr.Staff === StaffType.Single ? mh * 2 : mh;
  const props: MeasureProps = {
    Instrument: instr,
    Bounds: new Bounds(
      instr.Position.x,
      page.PageLines[0].LineBounds.y,
      150,
      msrHeight,
    ),
    TimeSignature: { top: 4, bottom: 4 },
    KeySignature: "DMaj/Bmin",
    Notes: [],
    Clefs: [new Clef(0, "treble", 1, 0), new Clef(1, "bass", 1, 1)],
    Staves: [new Staff(0), new Staff(1)],
    RenderClef: true,
    RenderTimeSig: true,
    RenderKey: true,
    Camera: cam,
    Page: page,
    Message: callback,
    Settings: settings,
    Barlines: [
      new Barline(BarlinePos.START, BarlineType.SINGLE),
      new Barline(BarlinePos.END, BarlineType.END),
    ],
  };
  return new Measure(props, id);
};

const CreateMeasure = (
  instr: Instrument,
  bounds: Bounds,
  timeSignature: { top: number; bottom: number },
  keySignature: string,
  clef: Clef[],
  staves: Staff[],
  cam: Camera,
  runningId: { count: number },
  page: Page,
  renderClef: boolean = false,
  callback: (msg: Message) => void,
  settings?: MeasureSettings,
): Measure => {
  const props: MeasureProps = {
    Instrument: instr,
    Bounds: bounds,
    TimeSignature: timeSignature,
    KeySignature: keySignature,
    Notes: [],
    Clefs: clef,
    Staves: staves,
    RenderClef: renderClef,
    RenderTimeSig: false,
    RenderKey: false,
    Camera: cam,
    Page: page,
    Message: callback,
    Settings: settings,
    Barlines: [
      new Barline(BarlinePos.START, BarlineType.SINGLE),
      new Barline(BarlinePos.END, BarlineType.SINGLE),
    ],
  };
  return new Measure(props, runningId);
};

export {
  CreateDefaultPiano,
  CreateDefaultMeasure,
  CreateMeasure,
  CreateInstrument,
};
