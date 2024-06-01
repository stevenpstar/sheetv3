import { Instrument } from './Instrument.js';
import { Measure } from './Measure.js';
import { Page } from './Page.js';
interface SheetProps {
    Instruments: Instrument[];
    KeySignature: {
        key: string;
        measureNo: number;
    }[];
    Measures: Measure[];
    Pages: Page[];
}
declare class Sheet {
    Instruments: Instrument[];
    KeySignature: {
        key: string;
        measureNo: number;
    }[];
    Measures: Measure[];
    Pages: Page[];
    constructor(properties: SheetProps);
}
export { Sheet, SheetProps };
//# sourceMappingURL=Sheet.d.ts.map