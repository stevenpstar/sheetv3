import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { MessageType } from "../Types/Message.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { Clef, GetNoteClefType } from "./Clef.js";
import { CreateDivisions, ResizeDivisions, DivisionMinWidth, } from "./Division.js";
import { StaffType } from "./Instrument.js";
import { Note } from "./Note.js";
import { GetStaffHeightUntil, GetStaffMiddleLine } from "./Staff.js";
import { CreateTimeSignature } from "./TimeSignatures.js";
class Measure {
    constructor(properties, runningId) {
        // TODO: Clefs should just be one array, each clef should have which staff they are
        // on
        this.Clefs = [];
        this.Num = 1;
        this.Staves = properties.Staves;
        //    this.Staves.push(new Staff(1));
        this.Message = properties.Message;
        this.RunningID = runningId;
        this.ID = 0;
        this.Selected = false;
        this.Editable = true;
        this.SelType = SelectableTypes.Measure;
        this.Instrument = properties.Instrument;
        this.Line = 0;
        this.Bounds = properties.Bounds;
        // TODO: This is not where measure bounds will be set
        this.Bounds.height = GetStaffHeightUntil(this.Staves);
        //
        this.TimeSignature = CreateTimeSignature(properties.TimeSignature);
        this.KeySignature = properties.KeySignature;
        this.Notes = properties.Notes;
        this.Divisions = [];
        this.RenderClef = properties.RenderClef;
        if (this.Instrument.Staff === StaffType.Rhythm) {
            this.RenderClef = false;
        }
        this.RenderKey = properties.RenderKey;
        this.Camera = properties.Camera;
        this.RenderTimeSig = properties.RenderTimeSig;
        this.Page = properties.Page;
        this.PageLine = properties.Page.PageLines[0].Number;
        this.SetXOffset();
        this.CreateDivisions(this.Camera);
        this.Staves.forEach((s, i) => {
            const clef = new Clef(0, properties.Clefs[i].Type, 1, s.Num);
            clef.SetBounds(this, s.Num);
            this.Clefs.push(clef);
        });
        this.TimeSignature.SetBounds(this, 0);
        this.TimeSignature.SetBounds(this, 1);
    }
    // Gets line hovered relative to staff (15 will always be middle of staff for
    // example)
    GetLineHovered(y, staffNum) {
        const cam = this.Camera;
        const relYPos = y - this.Bounds.y - cam.y; //TODO: Dunno about scaling by zoom here
        let line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
        let actualLine = line;
        const bounds = new Bounds(this.Bounds.x, 0, this.Bounds.width + this.XOffset, 5);
        const staff = this.Staves.find((s) => s.Num === staffNum);
        const prevStaffLines = GetStaffHeightUntil(this.Staves, staffNum) / 5;
        actualLine = line + staff.TopLine;
        const testLine = actualLine - prevStaffLines;
        const relativeLine = staff.TopLine < 0
            ? actualLine + Math.abs(staff.TopLine)
            : actualLine - staff.TopLine;
        bounds.y = this.Bounds.y - 27.5 + 5 * actualLine;
        return { num: testLine, bounds: bounds };
    }
    // Get note position relative to staff/measure
    GetNotePositionOnLine(line, staff) {
        const staffYPos = GetStaffHeightUntil(this.Staves, staff);
        let y = staffYPos + this.Bounds.y + (line - this.Staves[staff].TopLine) * 5;
        return y - 2.5;
    }
    GetBoundsWithOffset() {
        return new Bounds(this.Bounds.x, this.Bounds.y, this.Bounds.width + this.XOffset, this.Bounds.height);
    }
    SetXOffset() {
        this.XOffset = 0;
        if (this.RenderClef) {
            this.XOffset += 30;
        }
        if (this.RenderKey) {
            this.XOffset += 30;
        }
        if (this.RenderTimeSig) {
            this.XOffset += 30;
        }
    }
    CreateDivisions(cam, afterInput = false) {
        this.Divisions = [];
        this.Staves.forEach((s) => {
            this.Divisions.push(...CreateDivisions(this, this.Notes, s.Num, cam));
            ResizeDivisions(this, this.Divisions, s.Num);
            UpdateNoteBounds(this, s.Num);
        });
    }
    Reposition(prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        this.CreateDivisions(this.Camera);
    }
    // set height of measure based off of notes in measure
    // eventually will be determined by instrument / row etc.
    // TODO: Remove these three methods (doing now)
    GetMeasureHeight() {
        return GetStaffHeightUntil(this.Staves);
    }
    GetGrandMeasureHeight() {
        return 0;
    }
    GetGrandMeasureMidLine() {
        return 0;
    }
    /* End TODO
     */
    // Gets total height of measure (all staffs)
    NEW_GetMeasureHeight() {
        return GetStaffHeightUntil(this.Staves);
    }
    AddNote(note, fromInput = false) {
        if (note.Rest) {
            this.ClearNonRestNotes(note.Beat, note.Staff);
        }
        else {
            this.ClearRestNotes(note.Beat, note.Staff);
        }
        note.SetID(this.RunningID.count);
        this.RunningID.count++;
        this.Notes.push(note);
        if (fromInput) {
            const msg = {
                messageString: "AddNote",
                messageData: {
                    Message: {
                        msg: "AddingNote",
                        obj: note,
                    },
                    MessageType: MessageType.AddNote,
                },
            };
            this.Message(msg);
        }
    }
    ClearNonRestNotes(beat, staff) {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Beat === beat &&
                this.Notes[n].Rest === false &&
                this.Notes[n].Staff === staff) {
                this.Notes.splice(n, 1);
            }
        }
    }
    ClearRestNotes(beat, staff) {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Beat === beat &&
                this.Notes[n].Rest === true &&
                this.Notes[n].Staff === staff) {
                this.Notes.splice(n, 1);
            }
        }
    }
    ClearMeasure(ignoreNotes) {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Editable && !ignoreNotes.includes(this.Notes[n])) {
                this.Notes.splice(n, 1);
            }
        }
    }
    DeleteSelected() {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Selected && this.Notes[n].Editable) {
                let beat = this.Notes[n].Beat;
                let duration = this.Notes[n].Duration;
                let staff = this.Notes[n].Staff;
                let tuple = this.Notes[n].Tuple;
                let tupleDetails = this.Notes[n].TupleDetails;
                this.Notes.splice(n, 1);
                const notesOnBeat = this.Notes.filter((n) => n.Beat === beat);
                if (notesOnBeat.length === 0) {
                    const clefType = GetNoteClefType(this, beat, staff);
                    // beat is empty and requires a rest note
                    const restProps = {
                        Beat: beat,
                        Duration: duration,
                        Line: GetStaffMiddleLine(this.Staves, staff),
                        Rest: true,
                        Tied: false,
                        Staff: staff,
                        Tuple: tuple,
                        TupleDetails: tupleDetails,
                        Clef: clefType,
                    };
                    this.AddNote(new Note(restProps));
                }
            }
        }
    }
    GetMinimumWidth() {
        if (this.Notes.filter((n) => n.Rest !== true).length === 0) {
            return DivisionMinWidth * 4;
        }
        const staffZeroDivs = this.Divisions.filter((div) => div.Staff === 0);
        const staffOneDivs = this.Divisions.filter((div) => div.Staff === 1);
        const lowestValue = this.Divisions.sort((a, b) => {
            return a.Duration - b.Duration;
        })[0].Duration;
        //const count = 1 / lowestValue;
        const count = staffZeroDivs.length > staffOneDivs.length
            ? staffZeroDivs.length
            : staffOneDivs.length;
        return count * DivisionMinWidth;
    }
    ReturnSelectableElements() {
        const sel = [];
        sel.push(...this.Notes);
        sel.push(...this.Clefs);
        return sel;
    }
    IsHovered(x, y, cam) {
        return this.GetBoundsWithOffset().IsHovered(x, y, cam);
    }
    ChangeTimeSignature(top, bottom, transpose) {
        this.TimeSignature.top = top;
        this.TimeSignature.bottom = bottom;
    }
}
export { Measure, Clef };
