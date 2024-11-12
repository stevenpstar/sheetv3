import { StaffType } from "../Core/Instrument.js";
import { Clef, Measure } from "../Core/Measure.js";
import { Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
// Defaults, these will be moved somewhere else but fine here for now
const sTopLine = 5;
const sBotLine = 24;
const lineHeight = 5;
const mh = (sBotLine - sTopLine) * lineHeight;
const CreateDefaultPiano = () => {
    const defaultPiano = {
        Position: { x: 0, y: 5 },
        Staff: StaffType.Grand,
        Staves: [new Staff(0), new Staff(1)],
    };
    return defaultPiano;
};
function CreateInstrument(y, config) {
    let staff = StaffType.Single;
    if (config.DefaultStaffType) {
        switch (config.DefaultStaffType) {
            case "rhythm":
                staff = StaffType.Rhythm;
                break;
            case "grand":
                staff = StaffType.Grand;
                break;
            case "single":
            default:
                staff = StaffType.Single;
        }
    }
    const instr = {
        Position: { x: 0, y: y },
        Staff: staff,
        Staves: [new Staff(0)],
    };
    return instr;
}
const CreateDefaultMeasure = (id, instr, page, cam, callback, settings) => {
    const msrHeight = instr.Staff === StaffType.Single ? mh * 2 : mh;
    const props = {
        Instrument: instr,
        Bounds: new Bounds(instr.Position.x, page.PageLines[0].LineBounds.y, 150, msrHeight),
        TimeSignature: { top: 4, bottom: 4 },
        KeySignature: "DMaj/Bmin",
        Notes: [],
        Clefs: [new Clef(0, "treble", 1, 0), new Clef(1, "bass", 1, 1)],
        Staves: [new Staff(0), new Staff(1)],
        RenderClef: true,
        RenderTimeSig: true,
        RenderKey: true,
        Camera: cam,
        Page: page,
        Message: callback,
        Settings: settings,
    };
    return new Measure(props, id);
};
const CreateMeasure = (instr, bounds, timeSignature, keySignature, clef, staves, cam, runningId, page, renderClef = false, callback, settings) => {
    const props = {
        Instrument: instr,
        Bounds: bounds,
        TimeSignature: timeSignature,
        KeySignature: keySignature,
        Notes: [],
        Clefs: clef,
        Staves: staves,
        RenderClef: false,
        RenderTimeSig: false,
        RenderKey: false,
        Camera: cam,
        Page: page,
        Message: callback,
        Settings: settings,
    };
    return new Measure(props, runningId);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument, };
