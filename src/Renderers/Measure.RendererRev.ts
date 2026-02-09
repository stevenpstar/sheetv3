import { Camera } from "../Core/Camera.js";
import { Dynamic, RenderDynamic } from "../Core/Dynamic.js";
import { Clef, Division, Measure } from "../Core/Measure.js";
import { Staff } from "../Core/Staff.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { BeatPosition, GetBoundsWithOffset, Theme } from "../entry.js";
import { RenderClef } from "./Clef.Renderer.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { RenderStaff } from "./Staff.Renderer.js";

function RenderMeasureRev(
  measure: Measure,
  renderProps: RenderProperties,
  theme: Theme,
  debug: boolean
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

  if (true) {

  measure.Voices[measure.ActiveVoice].Divisions.forEach((d: Division) => {
   //   renderProps.context.strokeStyle = "rgba(0, 255, 0, 255)";
   //   renderProps.context.lineWidth = 2;
   //   renderProps.context.beginPath();
   //   renderProps.context.setLineDash([0, 0]);
   //   renderProps.context.moveTo(d.Bounds.x + renderProps.camera.x,
   //                              d.Bounds.y + (d.Bounds.height / 2) + renderProps.camera.y);
   //   renderProps.context.lineTo(d.Bounds.x + d.NoteXBuffer + renderProps.camera.x, 
   //                              d.Bounds.y + (d.Bounds.height / 2) + renderProps.camera.y);
   //   renderProps.context.stroke();
   //   renderProps.context.closePath();

   //   renderProps.context.fillStyle = "black";
   //   renderProps.context.font = "12px Bravura";
   //   renderProps.context.fillText(d.NoteXBuffer.toString(), d.Bounds.x + renderProps.camera.x + 2,
   //                                d.Bounds.y + (d.Bounds.height / 2) + renderProps.camera.y + 4)
  });

    measure.Voices[measure.ActiveVoice].Divisions.forEach((d: Division, di: number) => {
      

      renderProps.context.fillStyle = "rgba(0, 0, 255, 0.2)";
      if (di % 2 == 0) {
        renderProps.context.fillStyle = "rgba(255, 0, 0, 0.2)";
      }  
      renderProps.context.lineWidth = 1;
     // renderProps.context.strokeRect(
     //   d.Bounds.x + renderProps.camera.x,
     //   d.Bounds.y + renderProps.camera.y,
     //   d.Bounds.width,
     //   d.Bounds.height,
     // );
    //  d.Subdivisions.forEach((sd, i) => {
    //    if (i % 2 == 0) {
    //      renderProps.context.fillStyle = "rgba(0, 0, 255, 0.2)";
    //    } else {
    //      renderProps.context.fillStyle = "rgba(255, , 0, 0.2)";
    //    }
    //    renderProps.context.strokeRect(
    //      sd.Bounds.x + renderProps.camera.x,
    //      sd.Bounds.y + renderProps.camera.y,
    //      sd.Bounds.width,
    //      sd.Bounds.height,
    //    );
    //    renderProps.context.strokeStyle = "blue";
    //    renderProps.context.strokeRect(
    //      sd.Bounds.x + renderProps.camera.x,
    //      sd.Bounds.y + renderProps.camera.y,
    //      sd.Bounds.width,
    //      sd.Bounds.height,
    //    );
    //  });
    renderProps.context.font = "12px Bravura";
    renderProps.context.fillText(d.Bounds.width.toString(), d.Bounds.x + renderProps.camera.x + 2,
                                   d.Bounds.y + (d.Bounds.height) + renderProps.camera.y + 4 + (5 * di))
    renderProps.context.fillText(d.Bounds.x.toString(), d.Bounds.x + renderProps.camera.x + 2,
                                   d.Bounds.y + (d.Bounds.height) + renderProps.camera.y + 15 + (5 * di))


   // }

    });

    renderProps.context.strokeStyle = "purple";
    renderProps.context.strokeRect(
      GetBoundsWithOffset(measure).x + renderProps.camera.x,
      GetBoundsWithOffset(measure).y + renderProps.camera.y,
      GetBoundsWithOffset(measure).width,
      GetBoundsWithOffset(measure).height
    );
    renderProps.context.strokeStyle = "black";

    renderProps.context.strokeStyle = "orange";
    measure.FormattingData.BeatPositions.forEach((bp: BeatPosition) => {

      renderProps.context.beginPath();
      renderProps.context.moveTo(bp.Position + renderProps.camera.x,
                                 measure.Bounds.y + renderProps.camera.y);
      renderProps.context.lineTo(bp.Position + renderProps.camera.x,
                                 measure.Bounds.y + measure.Bounds.height + renderProps.camera.y);
      renderProps.context.stroke();
      renderProps.context.closePath();


    });

   
  }
}

export { RenderMeasureRev };
