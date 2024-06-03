import { Camera } from "../Core/Camera.js";
import { Instrument } from "../Core/Instrument.js";
import { Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { Bounds } from "../Types/Bounds.js";
interface lNote {
    ID: number;
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Staff: number;
    Clef: string;
}
interface lMeasure {
    Clef: string;
    TimeSignature: {
        top: number;
        bottom: number;
    };
    Notes: lNote[];
    Bounds: Bounds;
    ShowClef: boolean;
    ShowTime: boolean;
}
interface LoadStructure {
    Measures: lMeasure[];
}
declare const LoadSheet: (sheet: Sheet, page: Page, cam: Camera, instr: Instrument, savedJson: string) => void;
declare const SaveSheet: (sheet: Sheet) => string;
export { LoadSheet, SaveSheet, LoadStructure };
//# sourceMappingURL=Loader.d.ts.map