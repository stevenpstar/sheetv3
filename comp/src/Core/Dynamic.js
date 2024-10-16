import { RenderSymbol, } from "../Renderers/MusicFont.Renderer.js";
// Trying non-class based to see how it goes, will prob re-write as
// they will need to be selectable/deletable - but may re-write how that
// functions too, wait and see
class Dynamic {
    constructor(symbol, staff, beat) {
        this.Symbol = symbol;
        this.Staff = staff;
        this.Beat = beat;
    }
    IsHovered(x, y, cam) {
        return false;
    }
}
function RenderDynamic(renderProps, measure, dynamic, theme) {
    if (dynamic.Staff >= measure.Staves.length) {
        console.error("(RenderDynamic): Staff out of bounds of measure");
        return;
    }
    let findDiv = measure.Divisions.filter((d) => d.Beat === dynamic.Beat);
    if (findDiv.length === 0) {
        console.error("(RenderDynamic): Division Beat not matching with dynamic");
        return;
    }
    const div = findDiv[0];
    const divNotes = measure.Notes.filter((n) => n.Beat === div.Beat).sort((a, b) => a.Line - b.Line);
    const minHeight = div.Bounds.y + 11 * 10;
    const noteHeight = divNotes[divNotes.length - 1].Bounds.y;
    const yBuffer = 20; // this will  be changed, needs a minimum y value so the dynamic is not on the staff
    const yPos = minHeight > noteHeight ? minHeight : noteHeight + yBuffer;
    RenderSymbol(renderProps, dynamic.Symbol, div.Bounds.x, yPos, theme, false);
}
export { Dynamic, RenderDynamic };
