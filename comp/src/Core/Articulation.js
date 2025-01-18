import { ArticulationSymbol, RenderSymbol, } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { GetStaffMiddleLine } from "./Staff.js";
var ArticulationType;
(function (ArticulationType) {
    ArticulationType[ArticulationType["NONE"] = 0] = "NONE";
    ArticulationType[ArticulationType["ACCENT"] = 1] = "ACCENT";
})(ArticulationType || (ArticulationType = {}));
class Articulation {
    constructor(type, beat, staff) {
        this.Type = type;
        this.Beat = beat;
        this.Staff = staff;
    }
    Render(renderProps, notes, staves, div, theme) {
        RenderArticulation(renderProps, this.Type, div, staves, notes, theme);
    }
}
function RenderArticulation(renderProps, type, div, staves, notes, theme) {
    if (notes.length == 1 && notes[0].Rest) {
        console.error("Trying to render accent when there are no notes");
        return;
    }
    notes.sort((a, b) => {
        return a.Line - b.Line;
    });
    var accentYPos = 0;
    if (div.Direction == StemDirection.Up) {
        accentYPos = notes[notes.length - 1].Bounds.y + 20;
    }
    else {
        accentYPos = notes[0].Bounds.y - 6;
    }
    // Articulations need to be rendered above or below the stave
    const lineHeight = 5;
    // the 4 in this equation is number of lines from middle to top of stave
    const staveTop = div.Bounds.y +
        GetStaffMiddleLine(staves, div.Staff) * lineHeight -
        4 * lineHeight -
        6; // 6 is a small buffer so the articulation is not directly on top of stave may be configurable later
    const staveBot = div.Bounds.y +
        GetStaffMiddleLine(staves, div.Staff) * lineHeight +
        4 * lineHeight +
        16; // 6 is a small buffer so the articulation is not directly on top of stave may be configurable later
    if (accentYPos > staveTop && div.Direction == StemDirection.Down) {
        accentYPos = staveTop;
    }
    else if (accentYPos < staveBot && div.Direction == StemDirection.Up) {
        accentYPos = staveBot;
    }
    var symbol;
    switch (type) {
        case ArticulationType.ACCENT:
            if (div.Direction == StemDirection.Up) {
                symbol = ArticulationSymbol.AccentBelow;
            }
            else {
                symbol = ArticulationSymbol.AccentAbove;
            }
        default:
            symbol = ArticulationSymbol.AccentAbove;
    }
    RenderSymbol(renderProps, symbol, div.Bounds.x + div.NoteXBuffer, accentYPos, theme, false);
}
export { Articulation, ArticulationType };
