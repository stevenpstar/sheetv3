import { Sheet } from "./Core/Sheet.js";
import { Renderer } from "./Core/Renderer.js";
import { CreateDefaultMeasure, CreateDefaultPiano, CreateMeasure } from "./Factory/Instrument.Factory.js";
import { Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Note } from "./Core/Note.js";
var App = /** @class */ (function () {
    function App(canvas, context, load) {
        if (load === void 0) { load = false; }
        this.Canvas = canvas;
        this.Context = context;
        this.Load = load;
        this.HoveredElements = { MeasureID: -1 };
        this.Zoom = 1;
        if (!this.Load) {
            // Create New Sheet Properties
            var sProps = {
                Instruments: [],
                KeySignature: [{ key: "CMaj", measureNo: 0 }],
                Measures: []
            };
            sProps.Instruments.push(CreateDefaultPiano(0));
            sProps.Measures.push(CreateDefaultMeasure());
            this.Sheet = new Sheet(sProps);
        }
        this.NoteInput = false;
    }
    App.prototype.Hover = function (x, y) {
        var _this = this;
        this.HoveredElements.MeasureID = -1;
        this.Sheet.Measures.forEach(function (measure) {
            if (measure.Bounds.IsHovered(x, y)) {
                _this.HoveredElements.MeasureID = measure.ID;
            }
        });
        this.Update(x, y);
    };
    App.prototype.Input = function (x, y) {
        var _this = this;
        // will move this code elsewhere, testing note input
        if (!this.NoteInput) {
            return;
        }
        this.HoveredElements.MeasureID = -1;
        this.Sheet.Measures.forEach(function (measure) {
            if (measure.Bounds.IsHovered(x, y)) {
                _this.HoveredElements.MeasureID = measure.ID;
                // add note
                measure.BeatDistribution.forEach(function (d) {
                    var line = Measure.GetLineHovered(y, measure);
                    if (d.bounds.IsHovered(x, y)) {
                        var noteProps = {
                            Beat: d.startNumber,
                            Duration: d.value,
                            Line: line.num
                        };
                        var newNote = new Note(noteProps);
                        newNote.SetBounds(line.bounds);
                        measure.AddNote(newNote);
                    }
                });
            }
        });
        this.Update(x, y);
    };
    App.prototype.Update = function (x, y) {
        // this should be the only place that calls render
        this.Render({ x: x, y: y });
    };
    App.prototype.Render = function (mousePos) {
        Renderer(this.Canvas, this.Context, this.Sheet.Measures, this.HoveredElements, mousePos);
    };
    App.prototype.AddMeasure = function () {
        var newMeasureID = this.Sheet.Measures.length;
        var prevMsr = this.Sheet.Measures[this.Sheet.Measures.length - 1];
        var x = prevMsr.Bounds.x + prevMsr.Bounds.width;
        var newMeasureBounds = new Bounds(x, prevMsr.Bounds.y, prevMsr.Bounds.width, prevMsr.Bounds.height);
        var newMsr = CreateMeasure(newMeasureID, newMeasureBounds, prevMsr.TimeSignature);
        this.Sheet.Measures.push(newMsr);
    };
    App.prototype.ChangeInputMode = function () {
        this.NoteInput = !this.NoteInput;
    };
    App.prototype.AlterZoom = function (num) {
        this.Zoom += num;
        this.Context.scale(this.Zoom, this.Zoom);
    };
    // TEST FUNCTION
    App.prototype.ResizeFirstMeasure = function () {
        this.Sheet.Measures[0].Bounds.width += 50;
        this.Sheet.Measures[0].CreateBeatDistribution();
        for (var i = 1; i < this.Sheet.Measures.length; i++) {
            this.Sheet.Measures[i].Reposition(this.Sheet.Measures[i - 1]);
        }
        this.Update(0, 0);
    };
    return App;
}());
export { App };
