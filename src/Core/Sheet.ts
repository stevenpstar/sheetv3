import {
  CreateDefaultMeasure,
  CreateInstrument,
} from "../Factory/Instrument.Factory.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { ConfigSettings, GetBoundsWithOffset, Message } from "../entry.js";
import { Camera } from "./Camera.js";
import { RepositionDivisionsInMeasure, ResizeDivisionsRevised } from "./Division.js";
import { Instrument } from "./Instrument.js";
import { Division, Measure } from "./Measure.js";
import { Page } from "./Page.js";
import { Staff } from "./Staff.js";

interface SheetProps {
  Instruments: Instrument[];
  KeySignature: { key: string; measureNo: number }[];
  Pages: Page[];
  RunningMeasureID: { count: number };
}
type Sheet = {
  Instruments: Instrument[];
  KeySignature: { key: string; measureNo: number }[];
  Pages: Page[];
  RunningMeasureID: { count: number };
  // Sheet / Score config
  // Title/Composer/Metadata
};

function CreateEmptySheet(): Sheet {
  return {
    Instruments: [],
    KeySignature: [],
    Pages: [],
    RunningMeasureID: { count: 0 },
  };
}
  function CreateSheetFromProperties(properties: SheetProps): Sheet {
    let sheet: Sheet = CreateEmptySheet();
    sheet.Instruments = properties.Instruments;
    sheet.KeySignature = properties.KeySignature;
    sheet.Pages = properties.Pages;
    return sheet;
  }

  function SheetInputHover(sheet: Sheet, x: number, y: number, camera: Camera): void {
    sheet.Instruments.forEach((i: Instrument) => {
      i.Measures.forEach((m: Measure) => {
        if (GetBoundsWithOffset(m).IsHovered(x, y, camera)) {
         // ResizeDivisionsRevised(m);
          RepositionDivisionsInMeasure(m);
          m.Voices[m.ActiveVoice].Divisions.forEach((d: Division) => {
            if (d.Bounds.IsHovered(x, y, camera)) {
              m.Staves.forEach((s: Staff) => {
                //UpdateNoteBounds(m, s.Num);
              });
            }
          });
        }
      });

    });
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
    Pages: [newPage],
    RunningMeasureID: { count: 0 },
  };

  const page = sProps.Pages[0];

  sProps.Instruments.push(CreateInstrument(20, config, 0));
  sProps.Instruments.forEach((i: Instrument) => {
    i.Measures.push(
      CreateDefaultMeasure(
        { count: 0 },
        sProps.Instruments[0],
        page,
        camera,
        callback,
        config.MeasureSettings,
      ),
    );
  });

  return CreateSheetFromProperties(sProps);
}

export { Sheet, SheetProps, CreateDefaultSheet, SheetInputHover };
