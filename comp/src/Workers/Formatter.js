import { StaffType } from "../Core/Instrument.js";
// TODO: Add pages when necessary but for now we do just lines
function SetPagesAndLines(measures, pages, usePage, defaultLineHeight = 150) {
    let page = pages;
    if (!page) {
        console.error("No page found!");
        return;
    }
    let runningWidth = 0;
    let currentPage = 0;
    let currentLine = 1;
    let msrsOnLine = 0;
    let pageWidth = page.Bounds.width - (page.Margins.left + page.Margins.right);
    if (usePage === false && usePage !== null) {
        // set each measure to line 1
        measures.forEach(m => {
            m.PageLine = currentLine;
        });
        return;
    }
    measures.forEach((msr, i) => {
        msrsOnLine++;
        const msrWidth = msr.GetMinimumWidth() + msr.XOffset;
        if (runningWidth + msrWidth > pageWidth || msrsOnLine > 4) {
            currentLine++;
            msrsOnLine = 1;
            if (pages.PageLines.length < currentLine) {
                pages.AddLine(defaultLineHeight);
            }
            runningWidth = 0;
        }
        runningWidth += msrWidth;
        msr.Page = pages[currentPage];
        msr.PageLine = currentLine;
    });
}
function GetMaxWidth(page, config, cam) {
    var _a, _b;
    let maxWidth = 0;
    if ((_b = (_a = config.FormatSettings) === null || _a === void 0 ? void 0 : _a.MeasureFormatSettings) === null || _b === void 0 ? void 0 : _b.MaxWidth) {
        maxWidth = config.FormatSettings.MeasureFormatSettings.MaxWidth;
    }
    else {
        maxWidth = 350; //= (page.Bounds.width * cam.Zoom) - 50;
    }
    return maxWidth;
}
function ResizeMeasuresOnPage(measures, page, cam, config) {
    const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right);
    page.PageLines.forEach(line => {
        const msrs = measures.filter(m => m.PageLine === line.Number);
        let msrsLineWidth = 0;
        msrs.forEach((m, i) => {
            msrsLineWidth += m.GetMinimumWidth() + m.XOffset;
        });
        const fillWidth = pageSize - msrsLineWidth;
        msrs.forEach((m, i) => {
            m.Bounds.y = line.LineBounds.y;
            // TODO: We have removed prefboundsY, will likely have to reimplement
            //     m.PrefBoundsY = m.Bounds.y;
            if (i === 0) {
                m.Bounds.x = page.Bounds.x + page.Margins.left;
                m.RenderClef = m.Instrument.Staff === StaffType.Rhythm ? false : true;
                m.RenderTimeSig = true;
                // TODO: When we work on keys
                m.RenderKey = false;
                m.SetXOffset();
                // the calculated new width of the measure, may need to be overwritten
                // by config settings if they are set (maxWidth in
                // measureformatsettings)
                const maxWidth = GetMaxWidth(page, config, cam);
                const calculatedWidth = m.GetMinimumWidth() + (fillWidth / msrs.length);
                const msrWidth = maxWidth ?
                    calculatedWidth > maxWidth ? maxWidth : calculatedWidth :
                    calculatedWidth;
                m.Bounds.width = msrWidth;
                m.CreateDivisions(cam);
            }
            else {
                m.RenderClef = false;
                m.RenderTimeSig = false;
                // TODO: When we work on keys
                m.RenderKey = false;
                m.SetXOffset();
                const maxWidth = GetMaxWidth(page, config, cam);
                const calculatedWidth = m.GetMinimumWidth() + (fillWidth / msrs.length);
                const msrWidth = maxWidth ?
                    calculatedWidth > maxWidth ? maxWidth : calculatedWidth :
                    calculatedWidth;
                m.Bounds.width = msrWidth;
                msrs[i].Reposition(msrs[i - 1]);
                m.CreateDivisions(cam);
            }
            m.Clefs.forEach(c => {
                c.SetBounds(m, c.Staff);
            });
            m.GrandClefs.forEach(c => {
                c.SetBounds(m, 1);
            });
            m.TimeSignature.SetBounds(m, 0);
            if (m.Instrument.Staff === StaffType.Grand) {
                m.TimeSignature.SetBounds(m, 1);
            }
        });
    });
}
function GetAdjuster(x, y, page, cam) {
    let adjuster;
    page.MarginAdj.forEach((adj) => {
        if (adj.Bounds.IsHovered(x, y, cam)) {
            // TODO: Complete
        }
    });
    return adjuster;
}
export { SetPagesAndLines, ResizeMeasuresOnPage };
