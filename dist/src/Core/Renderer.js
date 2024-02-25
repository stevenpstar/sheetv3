import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
const renderDebug = false;
const scaleV = 1;
const Renderer = (c, ctx, measures, hovElements, mousePos, cam) => {
    // reset
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos);
    });
};
export { Renderer };
