import { Camera } from "../Core/Camera.js";
import { Instrument } from "../Core/Instrument.js";
import { Clef } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";
interface lNote {
    ID: number;
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Staff: number;
    Clef: string;
    Editable?: boolean;
}
interface lMeasure {
    Clefs: Clef[];
    Staves: Staff[];
    TimeSignature: {
        top: number;
        bottom: number;
    };
    KeySignature: string;
    Notes: lNote[];
    Bounds: Bounds;
    ShowClef: boolean;
    ShowTime: boolean;
}
interface LoadStructure {
    Measures: lMeasure[];
}
declare const LoadSheet: (sheet: Sheet, page: Page, cam: Camera, instr: Instrument, savedJson: string, callback: (msg: Message) => void) => void;
declare const SaveSheet: (sheet: Sheet) => string;
export { LoadSheet, SaveSheet, LoadStructure, lNote, lMeasure };
//# sourceMappingURL=Loader.d.ts.map