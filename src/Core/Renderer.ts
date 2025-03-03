import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
import { ConfigSettings } from "../Types/Config.js";
import { RenderBarline } from "./Barline.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Page } from "./Page.js";

const Renderer = (
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  measures: Measure[],
  pages: Page[],
  mousePos: { x: number; y: number },
  cam: Camera,
  noteInput: boolean,
  restInput: boolean,
  formatting: boolean,
  config: ConfigSettings,
  noteValue: number,
) => {
  ctx.fillStyle = config.Theme.BackgroundColour;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  if (config.PageSettings?.RenderBackground) {
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.restore();
  if (config.PageSettings?.RenderPage) {
    pages.forEach((page) => {
      RenderPage(page, c, ctx, cam, formatting, config, measures);
    });
  }
  ctx.fillStyle = config.Theme.NoteElements;

  measures.forEach((m: Measure, i: number) => {
    const renderProps = {
      context: ctx,
      camera: cam,
      theme: config.Theme,
    };
    const lastMeasure =
      i ===
      measures.filter((msr: Measure) => m.Instrument === msr.Instrument)
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
    );
    if (i > 0) {
      const instrMsrs = measures.filter(
        (msr: Measure) => m.Instrument === msr.Instrument,
      );
      RenderBarline(renderProps, instrMsrs[instrMsrs.length - 1], m, cam);
    }
    RenderBarline(renderProps, null, m, cam);
    RenderBarline(renderProps, m, null, cam);
  });
};

export { Renderer };
