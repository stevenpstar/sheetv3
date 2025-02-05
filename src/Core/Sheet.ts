import {
  CreateDefaultMeasure,
  CreateInstrument,
} from "../Factory/Instrument.Factory.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { ConfigSettings, Message } from "../entry.js";
import { Camera } from "./Camera.js";
import { Instrument } from "./Instrument.js";
import { Division, Measure } from "./Measure.js";
import { Page } from "./Page.js";
import { Staff } from "./Staff.js";

interface SheetProps {
  Instruments: Instrument[];
  KeySignature: { key: string; measureNo: number }[];
  Measures: Measure[];
  Pages: Page[];
}
class Sheet {
  Instruments: Instrument[];
  KeySignature: { key: string; measureNo: number }[];
  Measures: Measure[];
  Pages: Page[];

  constructor(properties: SheetProps) {
    this.Instruments = properties.Instruments;
    this.KeySignature = properties.KeySignature;
    this.Measures = properties.Measures;
    this.Pages = properties.Pages;
  }

  InputHover(x: number, y: number, camera: Camera): void {
    this.Measures.forEach((m: Measure) => {
      if (m.GetBoundsWithOffset().IsHovered(x, y, camera)) {
        m.Voices[m.ActiveVoice].Divisions.forEach((d: Division) => {
          if (d.Bounds.IsHovered(x, y, camera)) {
            m.Staves.forEach((s: Staff) => {
              UpdateNoteBounds(m, s.Num);
            });
          }
        });
      }
    });
  }
}

function CreateDefaultSheet(
  config: ConfigSettings,
  camera: Camera,
  callback: (msg: Message) => void,
): Sheet {
  let newPage: Page = new Page(0, 0, 1);
  if (config.PageSettings?.PageWidth) {
    newPage.Bounds.width = config.PageSettings.PageWidth;
  }

  const sProps: SheetProps = {
    Instruments: [],
    KeySignature: [{ key: "CMaj/Amin", measureNo: 0 }],
    Measures: [],
    Pages: [newPage],
  };

  const page = sProps.Pages[0];

  sProps.Instruments.push(CreateInstrument(20, config));
  sProps.Measures.push(
    CreateDefaultMeasure(
      { count: 0 },
      sProps.Instruments[0],
      page,
      camera,
      callback,
      config.MeasureSettings,
    ),
  );
  return new Sheet(sProps);
}

export { Sheet, SheetProps, CreateDefaultSheet };
