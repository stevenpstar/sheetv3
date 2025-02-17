import { RenderDynamic } from "../Core/Dynamic.js";
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
            RenderKeySignature(renderProps, measure, measure.KeySignature, measure.Clefs[0].Type, 34, // this is xOffset, should not be a constant.
            theme, s.Num);
        });
    }
    if (measure.RenderTimeSig)
        measure.TimeSignature.render(renderProps, measure, theme);
    measure.Dynamics.forEach((d) => RenderDynamic(renderProps, measure, d, theme));
    const debug = false;
    if (debug) {
        measure.Voices[measure.ActiveVoice].Divisions.forEach((d) => {
            renderProps.context.strokeStyle = "blue";
            renderProps.context.strokeRect(d.Bounds.x + renderProps.camera.x, d.Bounds.y + renderProps.camera.y, d.Bounds.width, d.Bounds.height);
            d.Subdivisions.forEach((sd, i) => {
                if (i % 2 == 0) {
                    renderProps.context.fillStyle = "rgba(0, 155, 0, 0.2)";
                }
                else {
                    renderProps.context.fillStyle = "rgba(255, 0, 0, 0.2)";
                }
                renderProps.context.fillRect(sd.Bounds.x + renderProps.camera.x, sd.Bounds.y + renderProps.camera.y, sd.Bounds.width, sd.Bounds.height);
                renderProps.context.strokeStyle = "blue";
                renderProps.context.strokeRect(sd.Bounds.x + renderProps.camera.x, sd.Bounds.y + renderProps.camera.y, sd.Bounds.width, sd.Bounds.height);
            });
        });
    }
}
export { RenderMeasureRev };
