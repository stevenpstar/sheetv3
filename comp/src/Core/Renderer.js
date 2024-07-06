import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
const renderDebug = false;
const scaleV = 1;
const Renderer = (c, ctx, measures, pages, hovElements, mousePos, cam, noteInput, restInput, formatting, config, noteValue) => {
    var _a, _b;
    // reset
    ctx.fillStyle = config.Theme.BackgroundColour; //"grey";252c38 16191f
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if ((_a = config.PageSettings) === null || _a === void 0 ? void 0 : _a.RenderBackground) {
        ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.restore();
    if ((_b = config.PageSettings) === null || _b === void 0 ? void 0 : _b.RenderPage) {
        pages.forEach(page => {
            RenderPage(page, c, ctx, cam, formatting, config, measures);
        });
    }
    ctx.fillStyle = config.Theme.NoteElements;
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        const lastMeasure = (i === measures.length - 1);
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos, lastMeasure, noteInput, i, restInput, noteValue, config);
    });
};
const RenderDebug = (c, ctx, sheet, mousePos, cam, selector) => {
    const renderProps = {
        canvas: c,
        context: ctx,
        camera: cam
    };
    //                 RenderPanel(renderProps);
};
export { Renderer, RenderDebug };
