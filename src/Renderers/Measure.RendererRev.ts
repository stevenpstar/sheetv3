import { Dynamic, RenderDynamic } from "../Core/Dynamic.js";
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
  measure.Clefs.forEach((c: Clef) => {
    if (c.Beat === 1 && measure.PrevMeasure === null) {
      RenderClef(renderProps, c, theme)
    } else if (c.Beat === 1 && measure.PrevMeasure !== null && measure.PrevMeasure.PageLine !== measure.PageLine) {
      RenderClef(renderProps, c, theme)
    } else if (c.Beat > 1) {
      RenderClef(renderProps, c, theme);
    }
  });
  if (measure.RenderKey) {
    measure.Staves.forEach((s: Staff) => {
      if (measure.Clefs.length === 0) {
        console.error("Measure has no clefs, returning early from Rendering Key Signature");
        return;
      }
      RenderKeySignature(
        renderProps,
        measure,
        measure.KeySignature,
        measure.Clefs[0].Type,
        34, // this is xOffset, should not be a constant.
        theme,
        s.Num,
      );
    });
  }
  if (measure.RenderTimeSig)
    measure.TimeSignature.render(renderProps, measure, theme);
  measure.Dynamics.forEach((d: Dynamic) =>
    RenderDynamic(renderProps, measure, d, theme),
  );
  const debug = false;
  if (debug) {
    measure.Voices[measure.ActiveVoice].Divisions.forEach((d: Division) => {
      renderProps.context.strokeStyle = "blue";
      renderProps.context.strokeRect(
        d.Bounds.x + renderProps.camera.x,
        d.Bounds.y + renderProps.camera.y,
        d.Bounds.width,
        d.Bounds.height,
      );
      d.Subdivisions.forEach((sd, i) => {
        if (i % 2 == 0) {
          renderProps.context.fillStyle = "rgba(0, 155, 0, 0.2)";
        } else {
          renderProps.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        }
        renderProps.context.fillRect(
          sd.Bounds.x + renderProps.camera.x,
          sd.Bounds.y + renderProps.camera.y,
          sd.Bounds.width,
          sd.Bounds.height,
        );
        renderProps.context.strokeStyle = "blue";
        renderProps.context.strokeRect(
          sd.Bounds.x + renderProps.camera.x,
          sd.Bounds.y + renderProps.camera.y,
          sd.Bounds.width,
          sd.Bounds.height,
        );
      });
    });

    renderProps.context.strokeStyle = "purple";
    renderProps.context.strokeRect(
      measure.Bounds.x + renderProps.camera.x,
      measure.Bounds.y + renderProps.camera.y,
      measure.Bounds.width,
      measure.Bounds.height
    );
    renderProps.context.strokeStyle = "black";
  }
}

export { RenderMeasureRev };
