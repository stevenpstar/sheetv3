import { Camera } from "../Core/Camera.js";
import { Instrument } from "../Core/Instrument.js";
import { Measure } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Bounds } from "../Types/Bounds.js";
declare const CreateDefaultPiano: () => Instrument;
declare function CreateInstrument(y: number): Instrument;
declare const CreateDefaultMeasure: (id: {
    count: number;
}, instr: Instrument, page: Page, cam: Camera) => Measure;
declare const CreateMeasure: (instr: Instrument, bounds: Bounds, timeSignature: {
    top: number;
    bottom: number;
}, keySignature: string, clef: string, cam: Camera, runningId: {
    count: number;
}, page: Page, renderClef?: boolean) => Measure;
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
//# sourceMappingURL=Instrument.Factory.d.ts.map