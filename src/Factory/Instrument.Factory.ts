import { Barline, BarlinePos, BarlineType } from "../Core/Barline.js";
import { Camera } from "../Core/Camera.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Clef, Measure, MeasureProps } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Note } from "../Core/Note.js";
import { CreateStaff, Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";
import { ConfigSettings, CreateNewMeasure, MeasureSettings } from "../entry.js";

// Defaults, these will be moved somewhere else but fine here for now
const sTopLine = 5;
const sBotLine = 24;
const lineHeight = 5;

const mh = (sBotLine - sTopLine) * lineHeight;

const CreateDefaultPiano = (id: number): Instrument => {
  const defaultPiano: Instrument = {
    ID: id,
    Position: { x: 0, y: 5 },
    Staff: StaffType.Grand,
    Staves: [CreateStaff(0), CreateStaff(1)],
    Measures: [],
  };

  return defaultPiano;
};

function CreateInstrument(y: number, config: ConfigSettings, id: number): Instrument {
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
    ID: id,
    Position: { x: 0, y: y },
    Staff: staff,
    Staves: [CreateStaff(0)],
    Measures: [],
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
    MeasureID: id.count,
    InstrumentID: instr.ID,
    PrevMeasure: null,
    NextMeasure: null,
    Bounds: new Bounds(
      instr.Position.x,
      page.PageLines[page.PageLines.length - 1].LineBounds.y,
      150,
      msrHeight,
    ),
    TimeSignature: { top: 4, bottom: 4 },
    KeySignature: "DMaj/Bmin",
    Notes: [],
    Clefs: [new Clef(0, "treble", 1, 0), new Clef(1, "bass", 1, 1)],
    Staves: [CreateStaff(0), CreateStaff(1)],
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
    IsAnacrusis: false,
  };
  return CreateNewMeasure(props, id);
};

// TODO: Maybe change name to CreateMeasureProps
const CreateMeasure = (
  instrID: number,
  prevMsr: Measure,
  nextMsr: Measure,
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
  loading: boolean = false,
  notes: Note[] = [],
  isAnacrusis: boolean = false,
  settings?: MeasureSettings,
): Measure => {
  const props: MeasureProps = {
    MeasureID: runningId.count,
    InstrumentID: instrID,
    PrevMeasure: prevMsr,
    NextMeasure: nextMsr,
    Bounds: bounds,
    TimeSignature: timeSignature,
    KeySignature: keySignature,
    Notes: notes,
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
    IsAnacrusis: isAnacrusis,
  };
  runningId.count += 1;
  console.log("incrementing running id: ", runningId);
  return CreateNewMeasure(props, runningId, loading);
};

export {
  CreateDefaultPiano,
  CreateDefaultMeasure,
  CreateMeasure,
  CreateInstrument,
};
