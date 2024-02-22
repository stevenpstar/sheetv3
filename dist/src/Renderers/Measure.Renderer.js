import { Measure } from "../Core/Measure.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderNote, RenderStem } from "./Note.Renderer.js";
var line_space = 10;
var line_width = 1;
var endsWidth = 2;
var debug = true;
// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(c, ctx, msr, hoveredId, mousePos) {
    if (hoveredId === msr.ID) {
        // testing line selection
        var line_1 = Measure.GetLineHovered(mousePos.y, msr);
        ctx.fillStyle = "rgb(0, 0, 255, 0.1)";
        ctx.fillRect(line_1.bounds.x, line_1.num * (line_space / 2) - (line_space / 4), line_1.bounds.width, line_1.bounds.height);
        // now we are going to test "Sections" as they were in v2
        var beatDistr = msr.BeatDistribution;
        beatDistr.forEach(function (s) {
            if (s.bounds.IsHovered(mousePos.x, mousePos.y)) {
                ctx.fillStyle = "rgb(0, 255, 0, 0.1)";
                ctx.fillRect(s.bounds.x, s.bounds.y, s.bounds.width, s.bounds.height);
                RenderNote(c, ctx, s.bounds.x + 18, (line_1.num * (line_space / 2) + (line_space / 2)), false, "blue");
            }
        });
    }
    ctx.fillStyle = "black";
    var measureBegin = "M".concat(msr.Bounds.x, " ").concat((msr.Bounds.height / 2) - (line_space * 2), " h ").concat(endsWidth, " v ").concat(line_space * 4, " h -").concat(endsWidth, " Z");
    var measureEnd = "M".concat(msr.Bounds.x + msr.Bounds.width, " ").concat((msr.Bounds.height / 2) - (line_space * 2), " h ").concat(endsWidth, " v ").concat(line_space * 4, " h -").concat(endsWidth, " Z");
    for (var l = 0; l < 5; l++) {
        var lineString = "M".concat(msr.Bounds.x, " ").concat((msr.Bounds.height / 2) - (line_space * 2) + line_space * l, " h ").concat(msr.Bounds.width.toString(), " v ").concat(line_width, " h -").concat(msr.Bounds.width.toString(), " Z");
        var linePath = new Path2D(lineString);
        ctx.fill(linePath);
    }
    ctx.fill(new Path2D(measureBegin));
    ctx.fill(new Path2D(measureEnd));
    if (msr.RenderClef) {
        RenderMeasureClef(c, ctx, msr, "treble");
    }
    RenderNotes(c, ctx, msr);
}
function RenderMeasureClef(c, ctx, msr, clef) {
    var clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    var clefPath = RenderTrebleClef(msr.Bounds.x + 18, msr.Bounds.y + (msr.Bounds.height / 2 + (line_space * 2)));
    ctx.fill(new Path2D(clefPath));
}
function RenderNotes(c, ctx, msr) {
    // render notes here
    msr.Notes.forEach(function (n) {
        // match to beat distribution
        msr.BeatDistribution.forEach(function (d) {
            if (d.startNumber === n.Beat) {
                var yPos = (n.Line * (line_space / 2) + (line_space / 2));
                RenderNote(c, ctx, d.bounds.x + 18, yPos, n.Selected);
                RenderStem(ctx, msr.Notes, d);
            }
        });
    });
}
export { RenderMeasureBase };
