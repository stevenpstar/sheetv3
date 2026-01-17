import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ConfigSettings } from "../Types/Config.js";
import { RenderBarline } from "./Barline.js";
import { Camera } from "./Camera.js";
import { Instrument } from "./Instrument.js";
import { GetBoundsWithOffset, Measure } from "./Measure.js";
import { Page } from "./Page.js";
import { Sheet } from "./Sheet.js";

const Renderer = (
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  sheet: Sheet,
  mousePos: { x: number; y: number },
  cam: Camera,
  noteInput: boolean,
  restInput: boolean,
  formatting: boolean,
  config: ConfigSettings,
  noteValue: number,
  renderBounds: Bounds,
  optimise: boolean,
  debug: boolean
) => {

  if (sheet.Instruments.length === 0) {
    return;
  }
  ctx.fillStyle = config.Theme.BackgroundColour;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  if (config.PageSettings?.RenderBackground) {
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.restore();
  if (config.PageSettings?.RenderPage) {
    sheet.Pages.forEach((page) => {
      RenderPage(page, c, ctx, cam, true, config, sheet.Instruments[0].Measures);
    });
  }
  ctx.fillStyle = config.Theme.NoteElements;
  sheet.Instruments.forEach((instrument: Instrument) => {
    instrument.Measures.forEach((m: Measure, i: number) => {
      if (optimise) {
        if (GetBoundsWithOffset(m).Intersects(renderBounds) === false) {
          return;
        }
      }
        const renderProps = {
        context: ctx,
        camera: cam,
        theme: config.Theme,
      };
      const lastMeasure =
        i ===
        instrument.Measures.filter((msr: Measure) => m.InstrumentID === msr.InstrumentID)
          .length -
          1;

      RenderMeasure(
        m,
        renderProps,
        mousePos,
        lastMeasure,
        noteInput,
        i,
        restInput,
        noteValue,
        config,
        debug
      );
      if (i > 0) {
        RenderBarline(renderProps, instrument.Measures[instrument.Measures.length - 1], m, cam);
      }
      RenderBarline(renderProps, null, m, cam);
      RenderBarline(renderProps, m, null, cam);
    });
  });

  if (optimise && debug) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.strokeRect(renderBounds.x + cam.x,
                   renderBounds.y + cam.y,
                   renderBounds.width, renderBounds.height);
  }
  ctx.strokeStyle = "black";
};

export { Renderer };
