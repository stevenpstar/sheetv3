import { DynamicSymbol, RenderSymbol, } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
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
        this.Selected = false;
        this.Staff = staff;
        this.Beat = beat;
        this.Bounds = new Bounds(0, 0, 13 * symbol.length, 20);
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
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
    let findDiv = measure.Voices[measure.ActiveVoice].Divisions.filter((d) => d.Beat === dynamic.Beat);
    if (findDiv.length === 0) {
        console.error("(RenderDynamic): Division Beat not matching with dynamic");
        return;
    }
    const div = findDiv[0];
    const divNotes = measure.Voices[measure.ActiveVoice].Notes.filter((n) => n.Beat === div.Beat).sort((a, b) => a.Line - b.Line);
    const minHeight = div.Bounds.y + 11 * 10;
    const noteHeight = divNotes[divNotes.length - 1].Bounds.y;
    const yBuffer = 20; // this will  be changed, needs a minimum y value so the dynamic is not on the staff
    const yPos = minHeight > noteHeight ? minHeight : noteHeight + yBuffer;
    const xBuffer = 8;
    // Updating bounds here is a bit ugly
    dynamic.Bounds.x = div.Bounds.x + xBuffer;
    dynamic.Bounds.y = yPos - 10;
    for (let i = 0; i < dynamic.Symbol.length; i++) {
        RenderSymbol(renderProps, DynamicSymbolMap.get(dynamic.Symbol[i]), div.Bounds.x + xBuffer * (i + 1) + i * 5, yPos, theme, dynamic.Selected);
    }
    RenderBounds(renderProps, dynamic);
}
function RenderBounds(renderProps, dynamic) {
    renderProps.context.strokeStyle = "green";
    renderProps.context.strokeRect(dynamic.Bounds.x + renderProps.camera.x, dynamic.Bounds.y + renderProps.camera.y, dynamic.Bounds.width, dynamic.Bounds.height);
    renderProps.context.strokeStyle = "black";
}
export { Dynamic, RenderDynamic };
