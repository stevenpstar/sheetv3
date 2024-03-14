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
        KeySignature: "CMaj/Amin",
        Notes: [],
        Divisions: [],
        Clef: "treble",
        RenderClef: true,
        RenderTimeSig: true,
        RenderKey: false
    };
    return new Measure(props);
};
const CreateMeasure = (instr, bounds, timeSignature, keySignature, clef, renderClef = false) => {
    const props = {
        Instrument: instr,
        Bounds: bounds,
        TimeSignature: timeSignature,
        KeySignature: keySignature,
        Notes: [],
        Divisions: [],
        Clef: clef,
        RenderClef: true,
        RenderTimeSig: false,
        RenderKey: false
    };
    return new Measure(props);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
