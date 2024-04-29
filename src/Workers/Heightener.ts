import { Camera } from "../Core/Camera.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";

function ManageHeight(msr: Measure, staff: number, x: number, y: number, cam: Camera, measures: Measure[], 
                     dragging: boolean = false): void {
  const msrNotes = msr.Notes.filter(n => n.Staff === staff);
  msrNotes.sort((n: Note, b: Note) => {
    return n.Line - b.Line; 
  });

  // PROTOTYPE: height limits for non-dragging heightening
  const saTopLimit = -5;
  const saBotLimit = 34;

  const sbTopLimit = 1025;
  const sbBotLimit = 1064;

  const line = msr.Line;
  const msrs = measures.filter(m => m.Line === line);

  const highestLine = msrNotes[0].Line;
  const lowestLine = msrNotes[msrNotes.length-1].Line;
  
  let lTop: number = staff === 0 ? 
    msr.SALineTop : msr.SBLineTop;
  let lBot: number = staff === 0 ? 
    msr.SALineTop : msr.SBLineBot;

  if (staff === 0) {
    if (highestLine < msr.SALineTop) {
      msr.SALineTop = highestLine - 1;
      msr.SALineTopSave = msr.SALineTop;
      lTop = msr.SALineTop;
    }
    if (lowestLine > msr.SALineBot) {
      msr.SALineBot = lowestLine + 1;
      msr.SALineBotSave = msr.SALineBot;
      lBot = msr.SALineBot;
    }
  } else if (staff === 1) {
    const hLine = highestLine;
    const lLine = lowestLine;
    if (hLine < msr.SBLineTop) {

      msr.SBLineTop = hLine - 1;
      msr.SBLineTopSave = msr.SBLineTop;
      lTop = msr.SBLineTop;
    }
    if (lLine > msr.SBLineBot) {
      msr.SBLineBot = lLine + 1;
      msr.SBLineBotSave = msr.SBLineBot;
      lBot = msr.SBLineBot;
    }
  }

    const lineOver = Measure.GetLineHovered(y, msr);
//    lineOver.num += msr.SALineTop;
    //    TODO: Fix this prototype code
    if (staff === 0) {
      if (lineOver.num <= saTopLimit || lineOver.num >= saBotLimit) { return; }
      if (lineOver.num <= msr.SALineTop + 1) {
        // resize measure bounds
        ReHeightenTop(true, lineOver.num, msrs);
      } else if(lineOver.num > msr.SALineTop + 2 &&
               lineOver.num < msr.SALineBot - 2) {

        ReHeightenTop(false, lineOver.num, msrs);
        ReHeightenBot(false, lineOver.num, msrs);

      } else if (lineOver.num >= msr.SALineBot - 1) {

        ReHeightenBot(true, lineOver.num, msrs);
      } else if (lineOver.num < msr.SALineBot - 2 &&
                 lineOver.num > msr.SALineTop + 2) {
        ReHeightenBot(false, lineOver.num, msrs);
      }
    }
    else {
      if (lineOver.num <= msr.SBLineTop + 1) {
        // resize measure bounds
        ReHeightenTopGrand(true, lineOver.num, msrs);
      } else if(lineOver.num > msr.SBLineTop + 2 &&
               lineOver.num < msr.SBLineBot - 2) {

        ReHeightenTopGrand(false, lineOver.num, msrs);
        ReHeightenBotGrand(false, lineOver.num, msrs);

      } else if (lineOver.num >= msr.SBLineBot - 1) {

        ReHeightenBotGrand(true, lineOver.num, msrs);
      } else if (lineOver.num < msr.SBLineBot - 2 &&
                 lineOver.num > msr.SBLineTop + 2) {
        ReHeightenBotGrand(false, lineOver.num, msrs);
      }
    }
}

function ReHeightenTop(expand: boolean, lineOver: number, measures: Measure[]): void {
  measures.forEach(m => {
    m.ReHeightenTop(expand, lineOver);
  });
}

function ReHeightenBot(expand: boolean, lineOver: number, measures: Measure[]): void {
  measures.forEach(m => {
    m.ReHeightenBot(expand, lineOver);
  });
}

function ReHeightenTopGrand(expand: boolean, lineOver: number, measures: Measure[]): void {
  measures.forEach(m => {
    m.ReHeightenTopGrand(expand, lineOver);
  });
}

function ReHeightenBotGrand(expand: boolean, lineOver: number, measures: Measure[]): void {
  measures.forEach(m => {
    m.ReHeightenBotGrand(expand, lineOver);
  });
}

export { ManageHeight };
