import { Bounds } from '../Types/Bounds.js';
var Measure = /** @class */ (function () {
    function Measure(properties) {
        this.ID = properties.ID;
        this.Bounds = properties.Bounds;
        this.TimeSignature = properties.TimeSignature;
        this.Notes = properties.Notes;
        this.BeatDistribution = properties.BeatDistribution;
        this.RenderClef = properties.RenderClef;
        this.CreateBeatDistribution();
    }
    Measure.GetLineHovered = function (y, msr) {
        var relYPos = y - msr.Bounds.y;
        var line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
        return { num: line, bounds: new Bounds(msr.Bounds.x, (line * 5) - 2.5, msr.Bounds.width, 5) };
    };
    Measure.prototype.CreateBeatDistribution = function () {
        this.BeatDistribution = []; // empty
        // TODO: this is a test implementation during development at this point
        var quarterMeasure = { startNumber: 1, value: 0.25,
            bounds: this.CreateBeatBounds(1, 0.25) };
        var quarterMeasure2 = { startNumber: 2, value: 0.25,
            bounds: this.CreateBeatBounds(2, 0.25) };
        var halfMeasure2 = { startNumber: 3, value: 0.5,
            bounds: this.CreateBeatBounds(3, 0.5) };
        this.BeatDistribution.push(quarterMeasure);
        this.BeatDistribution.push(quarterMeasure2);
        this.BeatDistribution.push(halfMeasure2);
    };
    Measure.prototype.CreateBeatBounds = function (beat, value) {
        var height = this.Bounds.height; // height will always be max
        var width = this.Bounds.width * value; // value will max at 1 (entire measure)
        var y = this.Bounds.y;
        var x = this.Bounds.x + ((beat - 1) / this.TimeSignature.bottom) * this.Bounds.width;
        return new Bounds(x, y, width, height);
    };
    Measure.prototype.Reposition = function (prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width;
    };
    Measure.prototype.AddNote = function (note) {
        this.Notes.push(note);
    };
    return Measure;
}());
export { Measure };
