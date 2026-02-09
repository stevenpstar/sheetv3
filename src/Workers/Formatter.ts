import { Camera } from "../Core/Camera.js";
import { RepositionDivisionsInMeasure, ResizeDivisionsRevised } from "../Core/Division.js";
import { Instrument, StaffType } from "../Core/Instrument.js";
import { Clef, CreateMeasureDivisions, GetMinimumWidth, Measure, RepositionMeasure, SetXOffset } from "../Core/Measure.js";
import { MarginAdjuster, Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { ConfigSettings } from "../Types/Config.js";
import { UpdateNoteBounds } from "./NoteInput.js";

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
  console.log("page lines count: ", page.PageLines);
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
  measures.forEach((msr: Measure) => {
    msrsOnLine++;
    const msrWidth = GetMinimumWidth(msr) + msr.XOffset;
    if (runningWidth + msrWidth > pageWidth || msrsOnLine > 4) {
      currentLine++;
      msrsOnLine = 1;
      if (page.PageLines.length < currentLine && currentLine <= linesPerPage) {
        page.AddLine(defaultLineHeight);
      } else if (currentLine > linesPerPage) {
        // If we are at the last page, we need to add a new one
        if (pages[pages.length-1] === page) {
          pages.push(new Page(0, pages.length * ((297 * 7) + 100), pages.length + 1));
        }
        page = pages[pages.length-1];
        currentPage = pages.length-1;
        currentLine = 1;
        msrsOnLine = 1;

      }
      runningWidth = 0;
    }
    runningWidth += msrWidth;
    msr.Page = pages[currentPage];
    msr.PageLine = currentLine;

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

function ResizeMeasuresOnPageRevised(
  sheet: Sheet,
  page: Page,
  cam: Camera,
  config: ConfigSettings) {
    if (sheet.Instruments.length === 0) { return; } // No instruments means no music
    let pageLine = 0;
    let pageLineWidth = 0;
    const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right + page.Margins.left);
    let minimumMeasureWidth = 200;
  //  if (sheet.Instruments[0].Measures.length > 1) {
  //    minimumMeasureWidth = pageSize / 4;
  //  }

    sheet.Instruments.forEach((instrument: Instrument) => {
      // Trying to make things work here leave me alone
    //  if (sheet.Instruments[0].Measures.length > 1) {
    //    minimumMeasureWidth = pageSize / 4;
    //  }

      instrument.Measures.forEach((msr: Measure, i: number) => {

        // This seems very redundant but my brain is not working
        // properly as I code this
       // let largestMeasureWidth = minimumMeasureWidth;
       // sheet.Instruments.forEach((ins: Instrument) => {
       //   ins.Measures.filter((m: Measure) => m.Num === i)
       //     .forEach((m: Measure) => {
       //       m.Staves.forEach((s: Staff) => {
       //         let msrWidth = ResizeDivisionsRevised(m, s.Num);
       //         if (msrWidth > largestMeasureWidth) {
       //           largestMeasureWidth = msrWidth;
       //         }
       //       });
       //     });
       // });

       // minimumMeasureWidth = largestMeasureWidth;

        if (i === 0) {
          // TODO: Temporary
          msr.RenderClef = true;
          msr.RenderKey = true;
          msr.RenderTimeSig = true;
          //
          msr.Bounds.x = page.Bounds.x + page.Margins.left;
        } 
       // else {
       //   RepositionMeasure(msr, instrument.Measures[i-1]);
       // }

        SetXOffset(msr);
        msr.Bounds.width = ResizeDivisionsRevised(msr);
        if (msr.Bounds.width < minimumMeasureWidth) {
          msr.Bounds.width = minimumMeasureWidth;
        }
       // pageLineWidth += msr.Bounds.width;
       // if (pageLineWidth > pageSize) {
       //   pageLine += 1;
       //   pageLineWidth = msr.Bounds.width;
       //   msr.Bounds.x = page.Bounds.x + page.Margins.left;
       //   msr.RenderClef = true;
       //   msr.RenderKey = true;
       //   msr.RenderTimeSig = true;
       //   msr.PageLine = pageLine;
       //   if (page.PageLines.length < (pageLine - 1)) {
       //     page.AddLine(page.PageLines[pageLine-1].YPos + 100);
       //   }
       // } 

      //  msr.Bounds.y = page.PageLines[pageLine].LineBounds.y 
      //    + instrument.Position.y + (100 * pageLine);
        RepositionDivisionsInMeasure(msr);
        CreateMeasureDivisions(msr);
        msr.Clefs.forEach((c: Clef) => {
          c.SetBounds(msr, c.Staff);
        });
        msr.TimeSignature.SetBounds(msr);
        if (i > 0) {
          RepositionMeasure(msr, instrument.Measures[i-1]);
        }
        msr.Staves.forEach((_: Staff, i: number) => {
          UpdateNoteBounds(msr, i);
        });
      });
    });
  }

function ResizeMeasuresOnPage(
  sheet: Sheet,
  page: Page,
  cam: Camera,
  config: ConfigSettings,
): void {
  console.error("Deprecated function");
  const pageSize = page.Bounds.width - (page.Margins.left + page.Margins.right);
  page.PageLines.forEach((line) => {
    sheet.Instruments.forEach((instr: Instrument) => {
      const msrs = instr.Measures.filter(
        (m) => m.PageLine === line.Number && m.InstrumentID === instr.ID && m.Page === page,
      );
      let msrsLineWidth = 0;
      msrs.forEach((m: Measure) => {
        msrsLineWidth += GetMinimumWidth(m) + m.XOffset;
      });
      const fillWidth = pageSize - msrsLineWidth;
      msrs.forEach((m: Measure, i: number) => {
      let instruments: Instrument[] = sheet.Instruments.filter((i: Instrument) => i.ID === m.InstrumentID);
      if (instruments.length === 0 || instruments.length > 1) {
        console.error("Instrument length: ", instruments.length, ". Needs to be 1");
        return;
      }
      let instr = instruments[0];
     //   console.log("page: ", page.Number);
 //       console.log("line number: ", line.Number);
   //     console.log(m);
     //   console.log("line bounds y: ", line.LineBounds.y);
        m.Bounds.y = line.LineBounds.y + instr.Position.y + (300 * instr.ID);
        // TODO: We have removed prefboundsY, will likely have to reimplement
        //     m.PrefBoundsY = m.Bounds.y;
        if (i === 0) {
          m.Bounds.x = page.Bounds.x + page.Margins.left;
          // y bounds position will need to be updated
          m.RenderClef = instr.Staff === StaffType.Rhythm ? false : true;
          m.RenderTimeSig = true;
          // TODO: When we work on keys
          m.RenderKey = true;
          SetXOffset(m);
          // the calculated new width of the measure, may need to be overwritten
          // by config settings if they are set (maxWidth in
          // measureformatsettings)
          const maxWidth = GetMaxWidth(page, config);
          const calculatedWidth = GetMinimumWidth(m) + fillWidth / msrs.length;
          let mWidth = 0;
          if (calculatedWidth < maxWidth) {
            mWidth = calculatedWidth;
          } else {
            mWidth = calculatedWidth;
          }
          m.Bounds.width = mWidth;
          CreateMeasureDivisions(m);
        } else {
          // TODO: This will have to change here too (some measures mid-line
          // will need to display this information)
          m.RenderClef = false;
          m.RenderTimeSig = false;
          m.RenderKey = false;
          SetXOffset(m);
          const maxWidth = GetMaxWidth(page, config);
          const calculatedWidth = GetMinimumWidth(m) + fillWidth / msrs.length;
          var msrWidth = calculatedWidth;
          // Limit the width if the calculated width exceeds the maximum
          if (calculatedWidth > maxWidth) {
            msrWidth = maxWidth;
          }
          m.Bounds.width = calculatedWidth;
          RepositionMeasure(msrs[i], msrs[i - 1]);
          CreateMeasureDivisions(m);
          m.Bounds.width = ResizeDivisionsRevised(m);
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

export { SetPagesAndLines, ResizeMeasuresOnPage, ResizeMeasuresOnPageRevised };
