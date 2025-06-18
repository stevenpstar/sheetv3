import { Camera } from "../Core/Camera.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Measure } from "../Core/Measure.js";
import { MarginAdjuster, Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { ConfigSettings } from "../Types/Config.js";

// TODO: Add pages when necessary but for now we do just lines
function SetPagesAndLines(
  measures: Measure[],
  pages: Page[],
  usePage: boolean | null,
  defaultLineHeight: number = 1050,
): void {
  // temp constant here
  const linesPerPage = 5;
  if (pages.length === 0) {
    return;
  }
  // empty pages and create new array each time (temporary)
  let page: Page = pages[0];
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
  console.log("Setting pages for measures ----");
  measures.forEach((msr: Measure, i: number) => {
    msrsOnLine++;
    const msrWidth = msr.GetMinimumWidth() + msr.XOffset;
    if (runningWidth + msrWidth > pageWidth || msrsOnLine > 4) {
      currentLine++;
      msrsOnLine = 1;
      if (page.PageLines.length < currentLine && currentLine <= linesPerPage) {
        page.AddLine(defaultLineHeight);
      } else if (currentLine > linesPerPage) {
        console.log("Considering adding a page because current line is: ", currentLine);
        // If we are at the last page, we need to add a new one
        if (pages[pages.length-1] === page) {
          pages.push(new Page(0, pages.length * ((297 * 7) + 100), pages.length + 1));
          console.log("Adding a page!");
        }
        page = pages[pages.length-1];
        currentPage = pages.length-1;
        currentLine = 1;
        msrsOnLine = 1;
       // page.AddLine(defaultLineHeight);

      }
      runningWidth = 0;
    }
    runningWidth += msrWidth;
    msr.Page = pages[currentPage];
    msr.PageLine = currentLine;
    if (i > 19) {
     // console.log("current page: ", currentPage);
     // console.log(msr);
    }

  });
}

function GetMaxWidth(page: Page, config: ConfigSettings): number {
  let maxWidth = 0;
  if (config.FormatSettings?.MeasureFormatSettings?.MaxWidth) {
    maxWidth = config.FormatSettings.MeasureFormatSettings.MaxWidth;
  } else {
    maxWidth = page.Bounds.width;
  }
  return maxWidth;
}

function ResizeMeasuresOnPage(
  sheet: Sheet,
  page: Page,
  cam: Camera,
  config: ConfigSettings,
): void {
  const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right);
  page.PageLines.forEach((line) => {
    sheet.Instruments.forEach((instr: Instrument) => {
      const msrs = sheet.Measures.filter(
        (m) => m.PageLine === line.Number && m.Instrument === instr && m.Page === page,
      );
      let msrsLineWidth = 0;
      msrs.forEach((m: Measure) => {
        msrsLineWidth += m.GetMinimumWidth() + m.XOffset;
      });
      const fillWidth = pageSize - msrsLineWidth;
      msrs.forEach((m: Measure, i: number) => {
     //   console.log("page: ", page.Number);
     //   console.log("line number: ", line.Number);
     //   console.log("line bounds y: ", line.LineBounds.y);
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
          } else {
            mWidth = maxWidth;
          }
          m.Bounds.width = mWidth;
          m.CreateDivisions();
        } else {
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
          m.CreateDivisions();
        }
        m.Clefs.forEach((c) => {
          c.SetBounds(m, c.Staff);
        });
        m.TimeSignature.SetBounds(m);
      });
    });
  });
}

function GetAdjuster(
  x: number,
  y: number,
  page: Page,
  cam: Camera,
): MarginAdjuster | undefined {
  let adjuster: MarginAdjuster;
  page.MarginAdj.forEach((adj: MarginAdjuster) => {
    if (adj.Bounds.IsHovered(x, y, cam)) {
      // TODO: Complete
    }
  });
  return adjuster;
}

export { SetPagesAndLines, ResizeMeasuresOnPage };
