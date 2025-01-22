import { Clef, Division, Measure } from "../Core/Measure.js";
import { Staff } from "../Core/Staff.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { RenderClef } from "./Clef.Renderer.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { RenderStaff } from "./Staff.Renderer.js";

function RenderMeasureRev(
  measure: Measure,
  renderProps: RenderProperties,
  theme: Theme,
): void {
  // Render Barlines here
  measure.Staves.forEach((s: Staff) => RenderStaff(renderProps, measure, s));
  if (measure.RenderClef)
    measure.Clefs.forEach((c: Clef) => RenderClef(renderProps, c, theme));
  if (measure.RenderKey) {
    measure.Staves.forEach((s: Staff) => {
      // This needs work
      RenderKeySignature(
        renderProps,
        measure,
        measure.KeySignature,
        measure.Clefs[0].Type,
        34, // this needs work
        theme,
        s.Num,
      );
    });
  }
  if (measure.RenderTimeSig)
    measure.TimeSignature.render(renderProps, measure, theme);
  measure.Divisions.forEach((d: Division) => {
    renderProps.context.strokeStyle = "blue";
    renderProps.context.strokeRect(
      d.Bounds.x + renderProps.camera.x,
      d.Bounds.y + renderProps.camera.y,
      d.Bounds.width,
      d.Bounds.height,
    );
    d.Subdivisions.forEach((sd, i) => {
      if (i % 2 == 0) {
        renderProps.context.fillStyle = "rgba(0, 255, 0, 0.2)";
      } else {
        renderProps.context.fillStyle = "rgba(0, 255, 255, 0.2)";
      }
      renderProps.context.fillRect(
        sd.Bounds.x + renderProps.camera.x,
        sd.Bounds.y + renderProps.camera.y,
        sd.Bounds.width,
        sd.Bounds.height,
      );
    });
  });
}

export { RenderMeasureRev };
