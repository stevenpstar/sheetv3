import { RenderPanel } from "../Renderers/Debug.Renderer.js";
import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
import { ConfigSettings } from "../Types/Config.js";
import { Selector } from "../Workers/Selector.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Page } from "./Page.js";
import { Sheet } from "./Sheet.js";

const renderDebug = false;
const scaleV = 1;

const Renderer = (c: HTMLCanvasElement, 
                  ctx: CanvasRenderingContext2D,
                  measures: Measure[],
                  pages: Page[],
                  hovElements: {MeasureID: number},
                  mousePos: {x: number, y: number},
                 cam: Camera,
                 noteInput: boolean,
                 restInput: boolean,
                 formatting: boolean,
                  config: ConfigSettings,
                 noteValue: number) => {
  // reset
  ctx.fillStyle = "grey";

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  if (config.PageSettings.RenderBackground) {
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.restore();
  if (config.PageSettings.RenderPage) {
    pages.forEach(page => {
      RenderPage(page, c, ctx, cam, formatting, config);
    });
  }
  ctx.fillStyle = "black";

  measures.forEach((m: Measure, i: number) => {
    const renderProps = {
      canvas: c,
      context: ctx,
      camera: cam
    }
    const lastMeasure = (i === measures.length - 1);
    RenderMeasure(m,
                  renderProps,
                  hovElements.MeasureID,
                  mousePos,
                  lastMeasure,
                  noteInput,
                  i,
                  restInput,
                 noteValue);
  })
}

const RenderDebug = (c: HTMLCanvasElement,
                  ctx: CanvasRenderingContext2D,
                  sheet: Sheet,
                  mousePos: {x: number, y: number },
                  cam: Camera,
                  selector: Selector): void => {
                    const renderProps = {
                      canvas: c,
                      context: ctx,
                      camera: cam
                    };
   //                 RenderPanel(renderProps);
                  }

export { Renderer, RenderDebug };
