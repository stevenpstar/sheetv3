import { Instrument } from './Instrument.js';
import { Measure } from './Measure.js';

interface SheetProps {
  Instruments: Instrument[];
  KeySignature: { key: string, measureNo: number }[];
  Measures: Measure[];
}
class Sheet {
  Instruments: Instrument[];
  KeySignature: { key: string, measureNo: number}[];
  Measures: Measure[];

  constructor(properties: SheetProps) {
    this.Instruments = properties.Instruments; 
    this.KeySignature = properties.KeySignature;
    this.Measures = properties.Measures;
  }
}

export { Sheet, SheetProps };
