import { DynamicSymbol, RenderSymbol, } from "../Renderers/MusicFont.Renderer.js";
const DynamicSymbolMap = new Map([
    ["p", DynamicSymbol.Piano],
    ["m", DynamicSymbol.Mezzo],
    ["f", DynamicSymbol.Forte],
    ["r", DynamicSymbol.Rinforzando],
    ["s", DynamicSymbol.SForzando],
    ["z", DynamicSymbol.Z],
    ["n", DynamicSymbol.N],
]);
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
    if (dynamic.Symbol === "") {
        console.error("(RenderDynamic): No Symbol String");
        return;
    }
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
    const xBuffer = 16;
    for (let i = 0; i < dynamic.Symbol.length; i++) {
        RenderSymbol(renderProps, DynamicSymbolMap.get(dynamic.Symbol[i]), div.Bounds.x + xBuffer * i, yPos, theme, false);
    }
}
export { Dynamic, RenderDynamic };
