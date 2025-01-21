import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { GetNoteClefType } from "./Clef.js";
import { Note } from "./Note.js";
import { GetStaffHeight, GetStaffHeightUntil, GetStaffMiddleLine, } from "./Staff.js";
import { GetLargestValues } from "./Values.js";
const DivisionMinWidth = 30;
const DivisionMaxWidth = 40;
function CreateDivisions(msr, notes, staff, cam) {
    const divisions = [];
    let nextBeat = 0;
    let runningValue = 0;
    notes.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    if (notes.filter((n) => n.Staff === staff).length === 0) {
        const restProps = {
            Beat: 1,
            Duration: 1,
            Line: GetStaffMiddleLine(msr.Staves, staff),
            Rest: true,
            Tied: false,
            Staff: staff,
            Tuple: false,
            Clef: staff === 0 ? "treble" : "bass",
        };
        // TODO: Clef should not be determined by staff that makes no sense
        msr.AddNote(new Note(restProps));
    }
    notes
        .filter((n) => n.Staff === staff)
        .forEach((n) => {
        if (!divisions.find((div) => div.Beat === n.Beat && div.Staff === n.Staff)) {
            divisions.push({
                Beat: n.Beat,
                Duration: n.Duration,
                Bounds: CreateBeatBounds(msr, n.Beat, n.Duration, staff),
                Staff: staff,
                StaffGroup: n.StaffGroup,
                Direction: StemDirection.Up,
                NoteXBuffer: 0,
            });
            if (!n.Tuple) {
                nextBeat = n.Beat + n.Duration * msr.TimeSignature.bottom;
            }
            else {
                nextBeat =
                    n.Beat +
                        (n.Duration / n.TupleDetails.Count) * msr.TimeSignature.bottom;
            }
            runningValue += n.Duration;
        }
    });
    if (runningValue > 0 && nextBeat - 1 < msr.TimeSignature.bottom) {
        GenerateMissingBeatDivisions(msr, divisions, staff);
    }
    GenerateMissingBeatDivisions(msr, divisions, staff);
    UpdateNoteBounds(msr, staff);
    return divisions;
}
function CreateBeatBounds(msr, beat, duration, staff) {
    // single height
    const width = msr.Bounds.width * duration; // value will max at 1 (entire measure)
    const height = GetStaffHeight(msr.Staves, staff);
    const x = msr.Bounds.x +
        msr.XOffset +
        ((beat - 1) / msr.TimeSignature.bottom) * msr.Bounds.width;
    const y = msr.Bounds.y + GetStaffHeightUntil(msr.Staves, staff);
    return new Bounds(x, y, width, height);
}
function PositionDivByBeat(msr, divisions) {
    const s0divs = divisions.filter((d) => d.Staff === 0);
    const s1divs = divisions.filter((d) => d.Staff === 1);
    if (s1divs.length > s0divs.length) {
        divisions.forEach((div) => {
            div.Bounds.x = 0;
        });
    }
    else {
    }
}
function ResizeDivisions(msr, divisions, staff) {
    const divs = divisions.filter((d) => d.Staff === staff);
    const s0divs = divisions.filter((d) => d.Staff === 0);
    const s1divs = divisions.filter((d) => d.Staff === 1);
    let divCount = s1divs.length > s0divs.length ? s1divs.length : s0divs.length;
    const minWidth = DivisionMinWidth * divCount;
    const space = msr.Bounds.width - minWidth;
    const xBuffer = space / divCount;
    divs.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    divs.forEach((div, i) => {
        div.Bounds.width = div.Duration * msr.Bounds.width;
        if (i > 0) {
            const lastDivEnd = divs[i - 1].Bounds.x + divs[i - 1].Bounds.width;
            if (lastDivEnd !== div.Bounds.x) {
                div.Bounds.x = lastDivEnd;
            }
        }
        if (i === 0 && divs.length === 1) {
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
    sortedDivs
        .filter((d) => d.Staff === staff)
        .forEach((div, i) => {
        const notesOnDiv = msr.Notes.filter((n) => n.Beat === div.Beat);
        if (div.Beat === startingBeat) {
            // there is a div for this beat, set the startingBeat to the next
            // expected division
            startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
            if (notesOnDiv[0].Tuple) {
                // TODO: This is not finished, currently skipping tuplet divisions
                // But there may be cases where we need to generate missiong divisions
                // within a tuplet group (maybe), and this will need to be revisited
                startingBeat = notesOnDiv[0].TupleDetails.EndBeat;
            }
        }
        else if (div.Beat >= startingBeat) {
            let val = (div.Beat - startingBeat) / msr.TimeSignature.bottom;
            let newDivs = GetLargestValues(val);
            let sBeat = startingBeat;
            newDivs.sort();
            newDivs.forEach((v) => {
                divisionsToAdd.push({
                    Beat: sBeat,
                    Duration: v,
                    Bounds: CreateBeatBounds(msr, sBeat, v, div.Staff),
                    Staff: div.Staff,
                    StaffGroup: notesOnDiv[0].StaffGroup,
                    Direction: StemDirection.Up,
                    NoteXBuffer: 0,
                });
                sBeat += v * msr.TimeSignature.bottom;
            });
            startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
        }
    });
    // Add divisions created above and then empty
    divisions.push(...divisionsToAdd);
    // add RESTS to division gaps
    divisionsToAdd.forEach((div) => {
        const notesOnBeat = msr.Notes.find((n) => n.Beat === div.Beat);
        if (notesOnBeat !== undefined) {
            console.error("Note found in division gap");
        }
        const clefType = GetNoteClefType(msr, div.Beat, staff);
        const restProps = {
            Beat: div.Beat,
            Duration: div.Duration,
            Line: GetStaffMiddleLine(msr.Staves, staff),
            Rest: true,
            Tied: false,
            Staff: div.Staff,
            Tuple: false,
            Clef: clefType,
        };
        msr.AddNote(new Note(restProps));
    });
    // check remaining measure for empty divisions
    const msrDuration = (msr.TimeSignature.top / msr.TimeSignature.bottom) *
        msr.TimeSignature.bottom +
        1;
    let reSortedDivs = divisions.filter((div) => div.Staff === staff);
    reSortedDivs = divisions.sort((divA, divB) => {
        return divA.Beat - divB.Beat;
    });
    const lastDiv = reSortedDivs[reSortedDivs.length - 1];
    const lastBeat = lastDiv.Beat + lastDiv.Duration * msr.TimeSignature.bottom;
    const lastDivisionsToAdd = [];
    const rem = msrDuration - lastBeat;
    if (rem > 0) {
        let val = rem / msr.TimeSignature.bottom;
        let newDivs = GetLargestValues(val);
        let sBeat = lastBeat;
        newDivs.sort();
        newDivs.forEach((v) => {
            lastDivisionsToAdd.push({
                Beat: sBeat,
                Duration: v,
                Bounds: CreateBeatBounds(msr, sBeat, v, lastDiv.Staff),
                Staff: staff,
            });
            sBeat += v * msr.TimeSignature.bottom;
        });
    }
    divisions.push(...lastDivisionsToAdd);
    lastDivisionsToAdd.forEach((div) => {
        const notesOnBeat = msr.Notes.find((n) => n.Beat === div.Beat && n.Staff === div.Staff);
        if (notesOnBeat !== undefined) {
            console.error("Note found in division gap");
        }
        const clefType = GetNoteClefType(msr, div.Beat, staff);
        const restProps = {
            Beat: div.Beat,
            Duration: div.Duration,
            Line: GetStaffMiddleLine(msr.Staves, staff),
            Rest: true,
            Tied: false,
            Staff: div.Staff,
            Tuple: false,
            Clef: clefType,
        };
        msr.AddNote(new Note(restProps));
    });
}
function GetDivisionTotalWidth(divisions) {
    let width = 0;
    let staff0w = 0;
    let staff1w = 0;
    divisions
        .filter((d) => d.Staff === 0)
        .forEach((div) => {
        staff0w += div.Bounds.width;
    });
    divisions
        .filter((d) => d.Staff === 1)
        .forEach((div) => {
        staff1w += div.Bounds.width;
    });
    width = staff0w > staff1w ? staff0w : staff1w;
    return width;
}
function GetDivisionGroups(msr, staff) {
    const divGroups = { DivGroups: [] };
    let divs = [];
    let notes = [];
    let crossStaff = false;
    // started creating a div group or not
    let startFlag = false;
    const mDivs = msr.Divisions.filter((d) => d.Staff === staff || d.StaffGroup === staff).sort((a, b) => {
        return a.Beat - b.Beat;
    });
    mDivs.forEach((div, i) => {
        if (div.Staff !== staff) {
            crossStaff = true;
        }
        const divNotes = msr.Notes.filter((n) => n.Beat === div.Beat && (n.Staff === staff || n.StaffGroup === staff));
        divNotes.sort((a, b) => {
            return a.Line - b.Line;
        });
        const restBeat = IsRestOnBeat(div.Beat, divNotes, staff);
        // this can definitely be cleaned up but it seems to
        // work for now, add tests later and then refactor
        if (restBeat && startFlag) {
            divGroups.DivGroups.push({
                Divisions: divs,
                Notes: notes,
                CrossStaff: crossStaff,
                Staff: staff,
                Stems: [],
                Beams: [],
            });
            divs = [];
            notes = [];
            startFlag = false;
        }
        else if (!restBeat) {
            if (!startFlag) {
                divs.push(div);
                notes.push(divNotes);
                if (div.Duration > 0.125) {
                    divGroups.DivGroups.push({
                        Divisions: divs,
                        Notes: notes,
                        CrossStaff: crossStaff,
                        Staff: staff,
                        Stems: [],
                        Beams: [],
                    });
                    divs = [];
                    notes = [];
                }
                else {
                    startFlag = true;
                    if (i ===
                        msr.Divisions.filter((d) => d.Staff === staff || d.StaffGroup === staff).length -
                            1) {
                        // end of measure
                        divGroups.DivGroups.push({
                            Divisions: divs,
                            Notes: notes,
                            CrossStaff: crossStaff,
                            Staff: staff,
                            Stems: [],
                            Beams: [],
                        });
                        divs = [];
                        notes = [];
                    }
                }
            }
            else {
                if (div.Duration > 0.125) {
                    startFlag = false;
                    divGroups.DivGroups.push({
                        Divisions: divs,
                        Notes: notes,
                        CrossStaff: crossStaff,
                        Staff: staff,
                        Stems: [],
                        Beams: [],
                    });
                    divs = [];
                    notes = [];
                    divs.push(div);
                    notes.push(divNotes);
                    divGroups.DivGroups.push({
                        Divisions: divs,
                        Notes: notes,
                        CrossStaff: crossStaff,
                        Staff: staff,
                        Stems: [],
                        Beams: [],
                    });
                    divs = [];
                    notes = [];
                }
                else {
                    // breakpoint check TODO: Actually implement this is prototype code
                    if (div.Beat === 3) {
                        divGroups.DivGroups.push({
                            Divisions: divs,
                            Notes: notes,
                            CrossStaff: crossStaff,
                            Staff: staff,
                            Stems: [],
                            Beams: [],
                        });
                        divs = [];
                        notes = [];
                    }
                    divs.push(div);
                    notes.push(divNotes);
                    if (i ===
                        msr.Divisions.filter((d) => d.Staff === staff || d.StaffGroup === staff).length -
                            1) {
                        divGroups.DivGroups.push({
                            Divisions: divs,
                            Notes: notes,
                            CrossStaff: crossStaff,
                            Staff: staff,
                            Stems: [],
                            Beams: [],
                        });
                        divs = [];
                        notes = [];
                    }
                }
            }
        }
    });
    return divGroups.DivGroups;
}
function IsRestOnBeat(beat, notes, staff) {
    const notesOnBeat = notes.filter((n) => n.Beat === beat && (n.Staff === staff || n.StaffGroup === staff));
    var restFound = !notesOnBeat.find((n) => !n.Rest);
    if (restFound === undefined) {
        restFound = false;
    }
    //  if (restFound && notesOnBeat.length > 1) {
    //    console.error("Rest found on beat with multiple notes, beat: ", beat);
    //  }
    return restFound;
}
export { CreateDivisions, ResizeDivisions, GetDivisionTotalWidth, IsRestOnBeat, GetDivisionGroups, DivisionMinWidth, DivisionMaxWidth, };
