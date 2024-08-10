import { Camera } from "../Core/Camera.js";
import { Instrument } from "../Core/Instrument.js";
import { Clef, Measure } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { Message } from "../Types/Message.js";
import { ConfigSettings, MeasureSettings } from "../entry.js";
declare const CreateDefaultPiano: () => Instrument;
declare function CreateInstrument(y: number, config: ConfigSettings): Instrument;
declare const CreateDefaultMeasure: (id: {
    count: number;
}, instr: Instrument, page: Page, cam: Camera, callback: (msg: Message) => void, settings?: MeasureSettings) => Measure;
declare const CreateMeasure: (instr: Instrument, bounds: Bounds, timeSignature: {
    top: number;
    bottom: number;
}, keySignature: string, clef: Clef[], staves: Staff[], cam: Camera, runningId: {
    count: number;
}, page: Page, renderClef: boolean, callback: (msg: Message) => void, settings?: MeasureSettings) => Measure;
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument, };
//# sourceMappingURL=Instrument.Factory.d.ts.map