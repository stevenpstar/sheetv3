import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
import { RenderBarline } from "./Barline.js";
const Renderer = (c, ctx, measures, pages, mousePos, cam, noteInput, restInput, formatting, config, noteValue) => {
    var _a, _b;
    ctx.fillStyle = config.Theme.BackgroundColour;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if ((_a = config.PageSettings) === null || _a === void 0 ? void 0 : _a.RenderBackground) {
        ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.restore();
    if ((_b = config.PageSettings) === null || _b === void 0 ? void 0 : _b.RenderPage) {
        pages.forEach((page) => {
            RenderPage(page, c, ctx, cam, formatting, config, measures);
        });
    }
    ctx.fillStyle = config.Theme.NoteElements;
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam,
        };
        const lastMeasure = i ===
            measures.filter((msr) => m.Instrument === msr.Instrument)
                .length -
                1;
        RenderMeasure(m, renderProps, mousePos, lastMeasure, noteInput, i, restInput, noteValue, config);
        if (i > 0) {
            const instrMsrs = measures.filter((msr) => m.Instrument === msr.Instrument);
            RenderBarline(renderProps, instrMsrs[instrMsrs.length - 1], m, cam);
        }
        RenderBarline(renderProps, null, m, cam);
        RenderBarline(renderProps, m, null, cam);
    });
};
export { Renderer };
