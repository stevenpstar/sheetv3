import { Measure } from "../Core/Measure.js";
function ManageHeight(msr, staff, x, y, cam) {
    const msrNotes = msr.Notes.filter(n => n.Staff === staff);
    msrNotes.sort((n, b) => {
        return n.Line - b.Line;
    });
    if (staff === 1) {
        return;
    }
    const highestLine = msrNotes[0].Line;
    const lowestLine = msrNotes[msrNotes.length - 1].Line;
    if (staff === 0) {
        if (highestLine < msr.SALineTop) {
            msr.SALineTop = highestLine - 1;
            msr.SALineTopSave = msr.SALineTop;
        }
        if (lowestLine > msr.SALineBot) {
            msr.SALineBot = lowestLine + 1;
            msr.SALineBotSave = msr.SALineBot;
        }
    }
    if (msr.GetBoundsWithOffset().IsHovered(x, y, cam)) {
        const lineOver = Measure.GetLineHovered(y, msr, cam);
        lineOver.num += msr.SALineTop;
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
        msr.ResetTopHeight();
    }
}
export { ManageHeight };
