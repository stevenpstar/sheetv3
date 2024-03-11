import { Measure } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";
const CreateDefaultPiano = () => {
    const defaultPiano = {
        Position: { x: 0, y: 0 }
    };
    return defaultPiano;
};
function CreateInstrument(y) {
    const instr = {
        Position: { x: 0, y: y }
    };
    return instr;
}
const CreateDefaultMeasure = (instr) => {
    const props = {
        Instrument: instr,
        Bounds: new Bounds(0, instr.Position.y, 150, 150),
        TimeSignature: { top: 4, bottom: 4 },
        Notes: [],
        Divisions: [],
        RenderClef: true,
        RenderTimeSig: true,
    };
    return new Measure(props);
};
const CreateMeasure = (instr, bounds, timeSignature, renderClef = false) => {
    const props = {
        Instrument: instr,
        Bounds: bounds,
        TimeSignature: timeSignature,
        Notes: [],
        Divisions: [],
        RenderClef: false,
        RenderTimeSig: false
    };
    return new Measure(props);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
