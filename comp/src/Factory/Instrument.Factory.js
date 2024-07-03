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
        Position: { x: 0, y: 5 },
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
const CreateDefaultMeasure = (id, instr, page, cam, callback) => {
    const msrHeight = instr.Staff === StaffType.Single ? mh * 2 : mh;
    const props = {
        Instrument: instr,
        Bounds: new Bounds(instr.Position.x, page.PageLines[0].LineBounds.y, 150, msrHeight),
        TimeSignature: { top: 4, bottom: 4 },
        KeySignature: "CMaj/Amin",
        Notes: [],
        Clef: "treble",
        RenderClef: true,
        RenderTimeSig: true,
        RenderKey: false,
        Camera: cam,
        Page: page,
        Message: callback,
    };
    return new Measure(props, id);
};
const CreateMeasure = (instr, bounds, timeSignature, keySignature, clef, cam, runningId, page, renderClef = false, callback) => {
    const props = {
        Instrument: instr,
        Bounds: bounds,
        TimeSignature: timeSignature,
        KeySignature: keySignature,
        Notes: [],
        Clef: clef,
        RenderClef: false,
        RenderTimeSig: false,
        RenderKey: false,
        Camera: cam,
        Page: page,
        Message: callback,
    };
    return new Measure(props, runningId);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
