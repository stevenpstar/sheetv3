import { StaffType } from "../Core/Instrument.js";
import { Measure } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";
// Defaults, these will be moved somewhere else but fine here for now
const sTopLine = 5;
const sBotLine = 24;
const lineHeight = 5;
const mh = (sBotLine - sTopLine) * lineHeight;
const CreateDefaultPiano = () => {
    const defaultPiano = {
        Position: { x: 0, y: 0 },
        Staff: StaffType.Single
    };
    return defaultPiano;
};
function CreateInstrument(y) {
    const instr = {
        Position: { x: 0, y: y },
        Staff: StaffType.Single
    };
    return instr;
}
const CreateDefaultMeasure = (instr) => {
    const msrHeight = instr.Staff === StaffType.Grand ? mh * 2 : mh;
    console.log('mh: ', mh);
    const props = {
        Instrument: instr,
        Bounds: new Bounds(0, instr.Position.y, 150, msrHeight),
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
        RenderClef: false,
        RenderTimeSig: false,
        RenderKey: false
    };
    return new Measure(props);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
