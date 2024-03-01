import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
const renderDebug = false;
const scaleV = 1;
const Renderer = (c, ctx, measures, hovElements, mousePos, cam, noteInput, restInput) => {
    // reset
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        const lastMeasure = (i === measures.length - 1);
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos, lastMeasure, noteInput, i, restInput);
    });
};
export { Renderer };
