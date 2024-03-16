import { Bounds } from "../Types/Bounds.js";
import { Note } from "./Note.js";
import { GetLargestValues } from "./Values.js";
;
const DivisionMinWidth = 30;
const DivisionMaxWidth = 40;
function CreateDivisions(msr, notes, staff) {
    const divisions = [];
    let nextBeat = 0;
    let runningValue = 0;
    notes.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    if (notes.filter(n => n.Staff === staff).length === 0) {
        console.log("Is 0");
        console.log("staff: ", staff);
        const restProps = {
            Beat: 1,
            Duration: 1,
            Line: 15,
            Rest: true,
            Tied: false,
            Staff: staff
        };
        msr.AddNote(new Note(restProps));
        console.log("?");
        console.log(msr.Notes);
    }
    notes.filter(n => n.Staff === staff).forEach(n => {
        console.log("n : ", n);
        if (!divisions.find(div => div.Beat === n.Beat)) {
            divisions.push({
                Beat: n.Beat,
                Duration: n.Duration,
                Bounds: CreateBeatBounds(msr, n.Beat, n.Duration, staff),
                Staff: staff
            });
            nextBeat = n.Beat + (n.Duration * msr.TimeSignature.bottom);
            runningValue += n.Duration;
        }
    });
    if (runningValue > 0 && (nextBeat - 1) < msr.TimeSignature.bottom) {
        GenerateMissingBeatDivisions(msr, divisions, staff);
    }
    GenerateMissingBeatDivisions(msr, divisions, staff);
    return divisions;
}
function CreateBeatBounds(msr, beat, duration, staff) {
    const height = msr.Bounds.height / 2; // height will always be max
    const width = msr.Bounds.width * duration; // value will max at 1 (entire measure)
    const y = staff === 0 ? msr.Bounds.y : msr.Bounds.y + (msr.Bounds.height / 2);
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
function GenerateMissingBeatDivisions(msr, divisions, staff) {
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
                    Bounds: CreateBeatBounds(msr, sBeat, v, div.Staff),
                    Staff: div.Staff
                });
                sBeat += v * msr.TimeSignature.bottom;
            });
            startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
        }
    });
    // Add divisions created above and then empty
    divisions.push(...divisionsToAdd);
    // add RESTS to division gaps
    divisionsToAdd.forEach(div => {
        const notesOnBeat = msr.Notes.find(n => n.Beat === div.Beat);
        if (notesOnBeat !== undefined) {
            console.error("Note found in division gap");
        }
        const restProps = {
            Beat: div.Beat,
            Duration: div.Duration,
            Line: 15,
            Rest: true,
            Tied: false,
            Staff: div.Staff
        };
        msr.AddNote(new Note(restProps));
    });
    // check remaining measure for empty divisions
    const msrDuration = (msr.TimeSignature.top / msr.TimeSignature.bottom) * msr.TimeSignature.bottom + 1;
    const reSortedDivs = divisions.sort((divA, divB) => {
        return divA.Beat - divB.Beat;
    });
    const lastDiv = reSortedDivs[reSortedDivs.length - 1];
    const lastBeat = lastDiv.Beat +
        lastDiv.Duration * msr.TimeSignature.bottom;
    const lastDivisionsToAdd = [];
    const rem = (msrDuration - lastBeat);
    if (rem > 0) {
        let val = rem / msr.TimeSignature.bottom;
        let newDivs = GetLargestValues(val);
        let sBeat = lastBeat;
        newDivs.sort();
        newDivs.forEach(v => {
            lastDivisionsToAdd.push({
                Beat: sBeat,
                Duration: v,
                Bounds: CreateBeatBounds(msr, sBeat, v, lastDiv.Staff),
                Staff: staff
            });
            sBeat += v * msr.TimeSignature.bottom;
        });
    }
    divisions.push(...lastDivisionsToAdd);
    lastDivisionsToAdd.forEach(div => {
        const notesOnBeat = msr.Notes.find(n => n.Beat === div.Beat);
        if (notesOnBeat !== undefined) {
            console.error("Note found in division gap");
        }
        const restProps = {
            Beat: div.Beat,
            Duration: div.Duration,
            Line: 15,
            Rest: true,
            Tied: false,
            Staff: div.Staff
        };
        msr.AddNote(new Note(restProps));
    });
}
function GetDivisionTotalWidth(divisions) {
    let width = 0;
    divisions.forEach(div => {
        width += div.Bounds.width;
    });
    return width;
}
function GetDivisionGroups(msr, staff) {
    const divGroups = { DivGroups: [] };
    let divs = [];
    let notes = [];
    // started creating a div group or not
    let startFlag = false;
    const mDivs = msr.Divisions.filter(d => d.Staff === staff);
    mDivs.forEach((div, i) => {
        const divNotes = msr.Notes.filter(n => n.Beat === div.Beat);
        divNotes.sort((a, b) => {
            return a.Line - b.Line;
        });
        const restBeat = IsRestOnBeat(div.Beat, divNotes, div.Staff);
        // this can definitely be cleaned up but it seems to
        // work for now, add tests later and then refactor
        if (restBeat && startFlag) {
            divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
            divs = [];
            notes = [];
            startFlag = false;
        }
        else if (!restBeat) {
            if (!startFlag) {
                divs.push(div);
                notes.push(divNotes);
                if (div.Duration > 0.125) {
                    divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
                    divs = [];
                    notes = [];
                }
                else {
                    startFlag = true;
                    if (i === msr.Divisions.length - 1) {
                        // end of measure
                        divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
                        divs = [];
                        notes = [];
                    }
                }
            }
            else {
                if (div.Duration > 0.125) {
                    startFlag = false;
                    divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
                    divs = [];
                    notes = [];
                    divs.push(div);
                    notes.push(divNotes);
                    divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
                    divs = [];
                    notes = [];
                }
                else {
                    divs.push(div);
                    notes.push(divNotes);
                    if (i === msr.Divisions.length - 1) {
                        divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
                        divs = [];
                        notes = [];
                    }
                }
            }
        }
    });
    return divGroups;
}
function IsRestOnBeat(beat, notes, staff) {
    const notesOnBeat = notes.filter(n => n.Beat === beat && n.Staff === staff);
    const restFound = notesOnBeat.find(n => n.Rest);
    if (restFound && notesOnBeat.length > 1) {
        console.error("Rest found on beat with multiple notes, beat: ", beat);
    }
    return restFound !== undefined;
}
export { CreateDivisions, ResizeDivisions, GetDivisionTotalWidth, IsRestOnBeat, GetDivisionGroups };
