import { Bounds } from "../Types/Bounds.js";
import { GetLargestValues } from "./Values.js";
const DivisionMinWidth = 30;
const DivisionMaxWidth = 40;
function CreateDivisions(msr, notes) {
    const divisions = [];
    let nextBeat = 0;
    let runningValue = 0;
    notes.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    if (notes.length === 0) {
        divisions.push({
            Beat: 1,
            Duration: 1,
            Bounds: CreateBeatBounds(msr, 1, 1)
        });
    }
    notes.forEach(n => {
        if (!divisions.find(div => div.Beat === n.Beat)) {
            divisions.push({
                Beat: n.Beat,
                Duration: n.Duration,
                Bounds: CreateBeatBounds(msr, n.Beat, n.Duration)
            });
            nextBeat = n.Beat + (n.Duration * msr.TimeSignature.bottom);
            runningValue += n.Duration;
        }
    });
    if (runningValue > 0 && (nextBeat - 1) < msr.TimeSignature.bottom) {
        GenerateMissingBeatDivisions(msr, divisions);
        //    divisions.push({
        //      Beat: nextBeat,
        //      Duration: 1 - runningValue,
        //      Bounds: CreateBeatBounds(msr, nextBeat, (1 - runningValue))
        //    });
    }
    GenerateMissingBeatDivisions(msr, divisions);
    return divisions;
}
function CreateBeatBounds(msr, beat, duration) {
    const height = msr.Bounds.height; // height will always be max
    const width = msr.Bounds.width * duration; // value will max at 1 (entire measure)
    const y = msr.Bounds.y;
    const x = msr.Bounds.x + msr.XOffset + ((beat - 1) / msr.TimeSignature.bottom) * msr.Bounds.width;
    return new Bounds(x, y, width, height);
}
function ResizeDivisions(msr, divisions) {
    divisions.forEach((div, i) => {
        if (div.Bounds.width < DivisionMinWidth || div.Duration < 0.25) {
            div.Bounds.width = DivisionMinWidth;
        }
        if (div.Bounds.width > DivisionMaxWidth || div.Duration >= 0.25) {
            div.Bounds.width = DivisionMaxWidth;
        }
        if (i > 0) {
            const lastDivEnd = divisions[i - 1].Bounds.x + divisions[i - 1].Bounds.width;
            if (lastDivEnd !== div.Bounds.x) {
                div.Bounds.x = lastDivEnd;
            }
        }
        if (i === 0 && divisions.length === 1) {
            div.Bounds.width = msr.Bounds.width;
        }
    });
}
function GenerateMissingBeatDivisions(msr, divisions) {
    const sortedDivs = divisions.sort((divA, divB) => {
        return divA.Beat - divB.Beat;
    });
    let startingBeat = 1; // always start at the beginning
    const divisionsToAdd = [];
    sortedDivs.forEach((div, i) => {
        if (div.Beat === startingBeat) {
            // there is a div for this beat, set the startingBeat to the next
            // expected division
            startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
        }
        else {
            let val = (div.Beat - startingBeat) / msr.TimeSignature.bottom;
            let newDivs = GetLargestValues(val);
            let sBeat = startingBeat;
            newDivs.sort();
            newDivs.forEach(v => {
                divisionsToAdd.push({
                    Beat: sBeat,
                    Duration: v,
                    Bounds: CreateBeatBounds(msr, sBeat, v)
                });
                sBeat += v * msr.TimeSignature.bottom;
            });
            startingBeat += val * msr.TimeSignature.bottom;
        }
    });
    // check remaining measure for empty divisions
    const msrDuration = (msr.TimeSignature.top / msr.TimeSignature.bottom) * msr.TimeSignature.bottom + 1;
    const rem = (msrDuration - startingBeat);
    if (rem > 0) {
        let val = rem / msr.TimeSignature.bottom;
        let newDivs = GetLargestValues(val);
        let sBeat = startingBeat;
        newDivs.sort();
        newDivs.forEach(v => {
            divisionsToAdd.push({
                Beat: sBeat,
                Duration: v,
                Bounds: CreateBeatBounds(msr, sBeat, v)
            });
            sBeat += v * msr.TimeSignature.bottom;
        });
    }
    divisions.push(...divisionsToAdd);
}
function GetDivisionTotalWidth(divisions) {
    let width = 0;
    divisions.forEach(div => {
        width += div.Bounds.width;
    });
    return width;
}
export { CreateDivisions, ResizeDivisions, GetDivisionTotalWidth };
