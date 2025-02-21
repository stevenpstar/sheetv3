import { ConfigSettings, Message } from "../entry.js";
import { Camera } from "./Camera.js";
import { Instrument } from "./Instrument.js";
import { Measure } from "./Measure.js";
import { Page } from "./Page.js";
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
    InputHover(x: number, y: number, camera: Camera): void;
}
declare function CreateDefaultSheet(config: ConfigSettings, camera: Camera, callback: (msg: Message) => void): Sheet;
export { Sheet, SheetProps, CreateDefaultSheet };
//# sourceMappingURL=Sheet.d.ts.map