import { RenderClef } from "./Clef.Renderer.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { RenderStaff } from "./Staff.Renderer.js";
function RenderMeasureRev(measure, renderProps, theme) {
    // Render Barlines here
    measure.Staves.forEach((s) => RenderStaff(renderProps, measure, s));
    if (measure.RenderClef)
        measure.Clefs.forEach((c) => RenderClef(renderProps, c, theme));
    if (measure.RenderKey) {
        measure.Staves.forEach((s) => {
            // This needs work
            RenderKeySignature(renderProps, measure, measure.KeySignature, measure.Clefs[0].Type, 34, // this needs work
            theme, s.Num);
        });
    }
    if (measure.RenderTimeSig)
        measure.TimeSignature.render(renderProps, measure, theme);
    measure.Divisions.forEach((d) => {
        renderProps.context.strokeStyle = "blue";
        renderProps.context.strokeRect(d.Bounds.x + renderProps.camera.x, d.Bounds.y + renderProps.camera.y, d.Bounds.width, d.Bounds.height);
    });
}
export { RenderMeasureRev };
