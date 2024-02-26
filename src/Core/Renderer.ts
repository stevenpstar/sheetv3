import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";

const renderDebug = false;
const scaleV = 1;

const Renderer = (c: HTMLCanvasElement, 
                  ctx: CanvasRenderingContext2D,
                  measures: Measure[],
                  hovElements: {MeasureID: number},
                  mousePos: {x: number, y: number},
                 cam: Camera) => {
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
    RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos, lastMeasure);
  })
}

export { Renderer };
