import { Camera } from "../Core/Camera.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";

function ManageHeight(msr: Measure, staff: number, x: number, y: number, cam: Camera): void {
  const msrNotes = msr.Notes.filter(n => n.Staff === staff);
  msrNotes.sort((n: Note, b: Note) => {
    return n.Line - b.Line; 
  });

  const highestLine = msrNotes[0].Line;
  const lowestLine = msrNotes[msrNotes.length-1].Line;

  let lTop: number = highestLine;
  let lBot: number = lowestLine;

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
    if (highestLine < msr.SBLineTop) {
      msr.SBLineTop = highestLine - 1;
      msr.SBLineTopSave = msr.SBLineTop;
      lTop = msr.SBLineTop;
    }
    if (lowestLine > msr.SBLineBot) {
      msr.SBLineBot = lowestLine + 1;
      msr.SBLineBotSave = msr.SBLineBot;
      lBot = msr.SBLineBot;
    }
  }

  if (msr.GetBoundsWithOffset().IsHovered(x, y, cam)) {
    const lineOver = Measure.GetLineHovered(y, msr, cam);
    lineOver.num += msr.SALineTop;
    if (lineOver.num <= msr.SALineTop + 1) {
      // resize measure bounds
      msr.ReHeightenTop(true, lineOver.num);
    } else if(lineOver.num > msr.SALineTop + 2 &&
             lineOver.num < msr.SALineBot - 2) {

      msr.ReHeightenTop(false, lineOver.num);
      msr.ReHeightenBot(false, lineOver.num);

    } else if (lineOver.num >= msr.SALineBot - 1) {

      msr.ReHeightenBot(true, lineOver.num);
    } else if (lineOver.num < msr.SALineBot - 2 &&
               lineOver.num > msr.SALineTop + 2) {
      msr.ReHeightenBot(false, lineOver.num);
    }
  } else {
    msr.ResetTopHeight();
  }
}

export { ManageHeight };
