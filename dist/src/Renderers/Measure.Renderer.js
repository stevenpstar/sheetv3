import { Measure } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderNote, RenderStem } from "./Note.Renderer.js";
var line_space = 10;
var line_width = 1;
var endsWidth = 2;
var debug = true;
function RenderMeasure(measure, renderProps, hovId, mousePos) {
    if (hovId === measure.ID)
        RenderHovered(measure, renderProps, hovId, mousePos);
    RenderMeasureBase(measure, renderProps, mousePos);
    RenderNotes(measure, renderProps);
}
function RenderHovered(measure, renderProps, hovId, mousePos) {
    var canvas = renderProps.canvas, context = renderProps.context, camera = renderProps.camera;
    var line = Measure.GetLineHovered(mousePos.y, measure, camera);
    context.fillStyle = "rgb(0, 0, 255, 0.1)";
    var lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
    context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
    // now we are going to test "Sections" as they were in v2
    var beatDistr = measure.BeatDistribution;
    beatDistr.forEach(function (s) {
        if (s.bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
            var onLedger = ((line.num < 10 || line.num > 20) && line.num % 2 !== 0);
            context.fillStyle = "rgb(0, 255, 0, 0.1)";
            context.fillRect(s.bounds.x + camera.x, s.bounds.y + camera.y, s.bounds.width, s.bounds.height);
            var noteY = measure.Bounds.y + (line.num * (line_space / 2) + (line_space / 2));
            //          RenderNote(c, ctx, s.bounds.x + 18 + cam.x, noteY + cam.y, false, onLedger, 0.25, "blue",);
        }
    });
}
// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(msr, renderProps, mousePos) {
    var canvas = renderProps.canvas, context = renderProps.context, camera = renderProps.camera;
    context.fillStyle = "black";
    var measureBegin = "M".concat(msr.Bounds.x + camera.x, " ").concat((msr.Bounds.height / 2) - (line_space * 2) + camera.y, " h ").concat(endsWidth, " v ").concat(line_space * 4, " h -").concat(endsWidth, " Z");
    var measureEnd = "M".concat(msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x, " ").concat((msr.Bounds.height / 2) - (line_space * 2) + camera.y, " h ").concat(endsWidth, " v ").concat(line_space * 4, " h -").concat(endsWidth, " Z");
    for (var l = 0; l < 5; l++) {
        var lineString = "M".concat(msr.Bounds.x + camera.x, " ").concat((msr.Bounds.height / 2) - (line_space * 2) + line_space * l + camera.y, " h ").concat(msr.Bounds.width + msr.XOffset, " v ").concat(line_width, " h -").concat(msr.Bounds.width + msr.XOffset, " Z");
        var linePath = new Path2D(lineString);
        context.fill(linePath);
    }
    context.fill(new Path2D(measureBegin));
    context.fill(new Path2D(measureEnd));
    if (msr.RenderClef) {
        RenderMeasureClef(canvas, context, msr, "treble", camera);
    }
}
function RenderMeasureClef(c, ctx, msr, clef, cam) {
    var clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    var clefPath = RenderTrebleClef(msr.Bounds.x + 18 + cam.x, msr.Bounds.y + cam.y + (msr.Bounds.height / 2 + (line_space * 2)));
    ctx.fill(new Path2D(clefPath));
}
function RenderNotes(msr, renderProps) {
    var canvas = renderProps.canvas, context = renderProps.context, camera = renderProps.camera;
    // render notes here
    msr.Notes.forEach(function (n) {
        // match to beat distribution, this will change
        msr.BeatDistribution.forEach(function (d) {
            if (d.startNumber === n.Beat) {
                var onLedger = ((n.Line < 10 || n.Line > 20) && n.Line % 2 !== 0);
                var yPos = (msr.Bounds.y + camera.y) + (n.Line * (line_space / 2) + 5);
                RenderNote(n, renderProps, new Bounds(d.bounds.x + 18 + camera.x, yPos, 0, 0), n.Selected);
                RenderStem(context, msr.Notes, d, camera);
            }
        });
    });
}
export { RenderMeasure };
