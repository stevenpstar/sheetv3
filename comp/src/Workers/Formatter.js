import { StaffType } from "../Core/Instrument.js";
// TODO: Add pages when necessary but for now we do just lines
function SetPagesAndLines(measures, pages, usePage, defaultLineHeight = 1050) {
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
        measures.forEach((m) => {
            m.PageLine = currentLine;
        });
        return;
    }
    measures.forEach((msr) => {
        msrsOnLine++;
        const msrWidth = msr.GetMinimumWidth() + msr.XOffset;
        if (runningWidth + msrWidth > pageWidth || msrsOnLine > 4) {
            currentLine++;
            msrsOnLine = 1;
            if (pages.PageLines.length < currentLine) {
                pages.AddLine(defaultLineHeight);
                console.log("pages: ", pages);
            }
            runningWidth = 0;
        }
        runningWidth += msrWidth;
        msr.Page = pages[currentPage];
        msr.PageLine = currentLine;
    });
}
function GetMaxWidth(page, config) {
    var _a, _b;
    let maxWidth = 0;
    if ((_b = (_a = config.FormatSettings) === null || _a === void 0 ? void 0 : _a.MeasureFormatSettings) === null || _b === void 0 ? void 0 : _b.MaxWidth) {
        maxWidth = config.FormatSettings.MeasureFormatSettings.MaxWidth;
    }
    else {
        maxWidth = page.Bounds.width;
    }
    return maxWidth;
}
function ResizeMeasuresOnPage(sheet, page, cam, config) {
    const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right);
    page.PageLines.forEach((line) => {
        sheet.Instruments.forEach((instr) => {
            const msrs = sheet.Measures.filter((m) => m.PageLine === line.Number && m.Instrument === instr);
            let msrsLineWidth = 0;
            msrs.forEach((m) => {
                msrsLineWidth += m.GetMinimumWidth() + m.XOffset;
            });
            const fillWidth = pageSize - msrsLineWidth;
            msrs.forEach((m, i) => {
                m.Bounds.y = line.LineBounds.y + m.Instrument.Position.y;
                // TODO: We have removed prefboundsY, will likely have to reimplement
                //     m.PrefBoundsY = m.Bounds.y;
                if (i === 0) {
                    m.Bounds.x = page.Bounds.x + page.Margins.left;
                    m.RenderClef = m.Instrument.Staff === StaffType.Rhythm ? false : true;
                    m.RenderTimeSig = true;
                    // TODO: When we work on keys
                    m.RenderKey = true;
                    m.SetXOffset();
                    // the calculated new width of the measure, may need to be overwritten
                    // by config settings if they are set (maxWidth in
                    // measureformatsettings)
                    const maxWidth = GetMaxWidth(page, config);
                    const calculatedWidth = m.GetMinimumWidth() + fillWidth / msrs.length;
                    let mWidth = 0;
                    if (calculatedWidth < maxWidth) {
                        mWidth = calculatedWidth;
                    }
                    else {
                        mWidth = maxWidth;
                    }
                    m.Bounds.width = mWidth;
                    m.CreateDivisions(cam);
                }
                else {
                    m.RenderClef = false;
                    m.RenderTimeSig = false;
                    m.RenderKey = false;
                    m.SetXOffset();
                    const maxWidth = GetMaxWidth(page, config);
                    const calculatedWidth = m.GetMinimumWidth() + fillWidth / msrs.length;
                    var msrWidth = calculatedWidth;
                    // Limit the width if the calculated width exceeds the maximum
                    if (calculatedWidth > maxWidth) {
                        msrWidth = maxWidth;
                    }
                    m.Bounds.width = msrWidth;
                    msrs[i].Reposition(msrs[i - 1]);
                    m.CreateDivisions(cam);
                }
                m.Clefs.forEach((c) => {
                    c.SetBounds(m, c.Staff);
                });
                m.TimeSignature.SetBounds(m);
            });
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
