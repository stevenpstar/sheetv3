import { Measure } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";
const CreateDefaultPiano = (id) => {
    const defaultPiano = {
        id: id,
        Position: { x: 0, y: 0 }
    };
    return defaultPiano;
};
const CreateDefaultMeasure = () => {
    const props = {
        ID: 0,
        Bounds: new Bounds(0, 0, 150, 150),
        TimeSignature: { top: 4, bottom: 4 },
        Notes: [],
        Divisions: [],
        RenderClef: true,
        RenderTimeSig: true,
    };
    return new Measure(props);
};
const CreateMeasure = (id, bounds, timeSignature, renderClef = false) => {
    const props = {
        ID: id,
        Bounds: bounds,
        TimeSignature: timeSignature,
        Notes: [],
        Divisions: [],
        RenderClef: false,
        RenderTimeSig: false
    };
    return new Measure(props);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure };
