import { Instrument } from './Instrument.js';
import { Measure } from './Measure.js';
import { Page } from './Page.js';

interface SheetProps {
  Instruments: Instrument[];
  KeySignature: { key: string, measureNo: number }[];
  Measures: Measure[];
  Pages: Page[];
}
class Sheet {
  Instruments: Instrument[];
  KeySignature: { key: string, measureNo: number}[];
  Measures: Measure[];
  Pages: Page[];

  constructor(properties: SheetProps) {
    this.Instruments = properties.Instruments; 
    this.KeySignature = properties.KeySignature;
    this.Measures = properties.Measures;
    this.Pages = properties.Pages;
  }
}

export { Sheet, SheetProps };
