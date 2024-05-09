// TODO: Add pages when necessary but for now we do just lines
function SetPagesAndLines(measures, pages) {
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
    measures.forEach((msr, i) => {
        msrsOnLine++;
        const msrWidth = msr.GetMinimumWidth() + msr.XOffset;
        if (runningWidth + msrWidth > pageWidth || msrsOnLine > 4) {
            currentLine++;
            msrsOnLine = 1;
            if (pages.PageLines.length < currentLine) {
                pages.AddLine();
            }
            runningWidth = 0;
        }
        runningWidth += msrWidth;
        msr.Page = pages[currentPage];
        msr.PageLine = currentLine;
    });
}
function ResizeMeasuresOnPage(measures, page, cam) {
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
            m.PrefBoundsY = m.Bounds.y;
            if (i === 0) {
                m.Bounds.x = page.Bounds.x + page.Margins.left;
                m.RenderClef = true;
                m.RenderTimeSig = true;
                // TODO: When we work on keys
                m.RenderKey = false;
                m.SetXOffset();
                m.CreateDivisions(cam);
                m.Bounds.width = m.GetMinimumWidth() + (fillWidth / msrs.length);
            }
            else {
                m.RenderClef = false;
                m.RenderTimeSig = false;
                // TODO: When we work on keys
                m.RenderKey = false;
                m.SetXOffset();
                m.Bounds.width = m.GetMinimumWidth() + (fillWidth / msrs.length);
                msrs[i].Reposition(msrs[i - 1]);
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
