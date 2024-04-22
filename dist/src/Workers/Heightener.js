import { Measure } from "../Core/Measure.js";
function ManageHeight(msr, staff, x, y, cam) {
    const msrNotes = msr.Notes.filter(n => n.Staff === staff);
    msrNotes.sort((n, b) => {
        return n.Line - b.Line;
    });
    const highestLine = msrNotes[0].Line;
    const lowestLine = msrNotes[msrNotes.length - 1].Line;
    let lTop = staff === 0 ?
        msr.SALineTop : msr.SBLineTop;
    let lBot = staff === 0 ?
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
    }
    else if (staff === 1) {
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
    const lineOver = Measure.GetLineHovered(y, msr, cam);
    console.log("lineOver: ", lineOver);
    //    lineOver.num += msr.SALineTop;
    //    TODO: Fix this prototype code
    if (staff === 0) {
        if (lineOver.num <= msr.SALineTop + 1) {
            // resize measure bounds
            msr.ReHeightenTop(true, lineOver.num);
        }
        else if (lineOver.num > msr.SALineTop + 2 &&
            lineOver.num < msr.SALineBot - 2) {
            msr.ReHeightenTop(false, lineOver.num);
            msr.ReHeightenBot(false, lineOver.num);
        }
        else if (lineOver.num >= msr.SALineBot - 1) {
            msr.ReHeightenBot(true, lineOver.num);
        }
        else if (lineOver.num < msr.SALineBot - 2 &&
            lineOver.num > msr.SALineTop + 2) {
            msr.ReHeightenBot(false, lineOver.num);
        }
    }
    else {
        if (lineOver.num <= msr.SBLineTop + 1) {
            // resize measure bounds
            msr.ReHeightenTopGrand(true, lineOver.num);
        }
        else if (lineOver.num > msr.SBLineTop + 2 &&
            lineOver.num < msr.SBLineBot - 2) {
            msr.ReHeightenTopGrand(false, lineOver.num);
            msr.ReHeightenBotGrand(false, lineOver.num);
        }
        else if (lineOver.num >= msr.SBLineBot - 1) {
            msr.ReHeightenBotGrand(true, lineOver.num);
        }
        else if (lineOver.num < msr.SBLineBot - 2 &&
            lineOver.num > msr.SBLineTop + 2) {
            msr.ReHeightenBotGrand(false, lineOver.num);
        }
    }
}
export { ManageHeight };
