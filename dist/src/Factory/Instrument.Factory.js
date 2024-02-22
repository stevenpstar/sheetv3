import { Measure } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";
var CreateDefaultPiano = function (id) {
    var defaultPiano = {
        id: id,
        Position: { x: 0, y: 0 }
    };
    return defaultPiano;
};
var CreateDefaultMeasure = function () {
    var props = {
        ID: 0,
        Bounds: new Bounds(0, 0, 150, 150),
        TimeSignature: { top: 4, bottom: 4 },
        Notes: [],
        BeatDistribution: [],
        RenderClef: true
    };
    return new Measure(props);
};
var CreateMeasure = function (id, bounds, timeSignature) {
    var props = {
        ID: id,
        Bounds: bounds,
        TimeSignature: timeSignature,
        Notes: [],
        BeatDistribution: [],
        RenderClef: false
    };
    return new Measure(props);
};
export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure };
