import { RenderPanel } from "../Renderers/Debug.Renderer.js";
import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { Selector } from "../Workers/Selector.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Sheet } from "./Sheet.js";

const renderDebug = false;
const scaleV = 1;

const Renderer = (c: HTMLCanvasElement, 
                  ctx: CanvasRenderingContext2D,
                  measures: Measure[],
                  hovElements: {MeasureID: number},
                  mousePos: {x: number, y: number},
                 cam: Camera,
                 noteInput: boolean,
                 restInput: boolean) => {
  // reset
  ctx.clearRect(0, 0, c.width, c.height);
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
                  restInput);
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
                    RenderPanel(renderProps);
                  }

export { Renderer, RenderDebug };
