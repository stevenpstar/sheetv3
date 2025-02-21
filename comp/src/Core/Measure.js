import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { MessageType } from "../Types/Message.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { Clef, GetNoteClefType } from "./Clef.js";
import { CreateDivisions, ResizeDivisions, DivisionMinWidth, } from "./Division.js";
import { StaffType } from "./Instrument.js";
import { KeySignatures } from "./KeySignatures.js";
import { Note } from "./Note.js";
import { GetStaffHeightUntil, GetStaffMiddleLine } from "./Staff.js";
import { CreateTimeSignature } from "./TimeSignatures.js";
import { Voice } from "./Voice.js";
class Measure {
    constructor(properties, runningId) {
        this.ActiveVoice = 0;
        this.Clefs = [];
        this.PrevMeasure = properties.PrevMeasure;
        this.NextMeasure = properties.NextMeasure;
        this.Voices = [new Voice(), new Voice(), new Voice(), new Voice()];
        this.Num = 1;
        this.Staves = properties.Staves;
        this.Message = properties.Message;
        this.RunningID = runningId;
        this.ID = 0;
        this.Selected = false;
        this.Editable = true;
        this.SelType = SelectableTypes.Measure;
        this.Instrument = properties.Instrument;
        this.Line = 0;
        this.Bounds = properties.Bounds;
        this.Bounds.height = GetStaffHeightUntil(this.Staves);
        this.TimeSignature = CreateTimeSignature(properties.TimeSignature);
        this.KeySignature = properties.KeySignature;
        this.Voices[this.ActiveVoice].Notes = properties.Notes;
        this.Articulations = [];
        this.Dynamics = [];
        this.RenderClef = properties.RenderClef;
        if (this.Instrument.Staff === StaffType.Rhythm) {
            this.RenderClef = false;
        }
        this.RenderKey = properties.RenderKey;
        this.Camera = properties.Camera;
        this.RenderTimeSig = properties.RenderTimeSig;
        this.Page = properties.Page;
        this.PageLine =
            properties.Page.PageLines[properties.Page.PageLines.length - 1].Number;
        this.SetXOffset();
        this.Barlines = properties.Barlines;
        this.CreateDivisions(this.Camera);
        this.Staves.forEach((s, i) => {
            const clef = new Clef(0, properties.Clefs[i].Type, 1, s.Num);
            clef.SetBounds(this, s.Num);
            this.Clefs.push(clef);
        });
        this.TimeSignature.SetBounds(this);
    }
    GetLineHovered(y, staffNum) {
        const cam = this.Camera;
        const relYPos = y - this.Bounds.y - cam.y;
        let line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
        let actualLine = line;
        const bounds = new Bounds(this.Bounds.x, 0, this.Bounds.width + this.XOffset, 5);
        const staff = this.Staves.find((s) => s.Num === staffNum);
        const prevStaffLines = GetStaffHeightUntil(this.Staves, staffNum) / 5;
        actualLine = line + staff.TopLine;
        bounds.y = this.Bounds.y + 5 * actualLine;
        return { num: actualLine - prevStaffLines, bounds: bounds };
    }
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
            this.XOffset += KeySignatures.get(this.KeySignature).length * 11;
        }
        if (this.RenderTimeSig) {
            this.XOffset += 30;
        }
        this.TimeSignature.SetBounds(this);
    }
    CreateDivisions(cam) {
        this.Voices[this.ActiveVoice].Divisions = [];
        this.Staves.forEach((s) => {
            this.Voices[this.ActiveVoice].Divisions.push(...CreateDivisions(this, this.Voices[this.ActiveVoice].Notes, s.Num));
            ResizeDivisions(this, this.Voices[this.ActiveVoice].Divisions, s.Num);
            UpdateNoteBounds(this, s.Num);
        });
    }
    Reposition(prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        this.CreateDivisions(this.Camera);
    }
    GetMeasureHeight() {
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
        this.Voices[this.ActiveVoice].Notes.push(note);
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
        for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
            if (this.Voices[this.ActiveVoice].Notes[n].Beat === beat &&
                this.Voices[this.ActiveVoice].Notes[n].Rest === false &&
                this.Voices[this.ActiveVoice].Notes[n].Staff === staff) {
                this.Voices[this.ActiveVoice].Notes.splice(n, 1);
            }
        }
    }
    ClearRestNotes(beat, staff) {
        for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
            if (this.Voices[this.ActiveVoice].Notes[n].Beat === beat &&
                this.Voices[this.ActiveVoice].Notes[n].Rest === true &&
                this.Voices[this.ActiveVoice].Notes[n].Staff === staff) {
                this.Voices[this.ActiveVoice].Notes.splice(n, 1);
            }
        }
    }
    ClearMeasure(ignoreNotes) {
        for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
            if (this.Voices[this.ActiveVoice].Notes[n].Editable &&
                !ignoreNotes.includes(this.Voices[this.ActiveVoice].Notes[n])) {
                this.Voices[this.ActiveVoice].Notes.splice(n, 1);
            }
        }
    }
    DeleteSelected() {
        for (let n = this.Voices[this.ActiveVoice].Notes.length - 1; n >= 0; n--) {
            if (this.Voices[this.ActiveVoice].Notes[n].Selected &&
                this.Voices[this.ActiveVoice].Notes[n].Editable) {
                let beat = this.Voices[this.ActiveVoice].Notes[n].Beat;
                let duration = this.Voices[this.ActiveVoice].Notes[n].Duration;
                let staff = this.Voices[this.ActiveVoice].Notes[n].Staff;
                let tuple = this.Voices[this.ActiveVoice].Notes[n].Tuple;
                let tupleDetails = this.Voices[this.ActiveVoice].Notes[n].TupleDetails;
                this.Voices[this.ActiveVoice].Notes.splice(n, 1);
                const notesOnBeat = this.Voices[this.ActiveVoice].Notes.filter((n) => n.Beat === beat);
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
                        Grace: false,
                    };
                    this.AddNote(new Note(restProps));
                }
            }
        }
        for (let d = this.Dynamics.length - 1; d >= 0; d--) {
            if (this.Dynamics[d].Selected) {
                this.Dynamics.splice(d, 1);
            }
        }
    }
    GetMinimumWidth() {
        if (this.Voices[this.ActiveVoice].Notes.filter((n) => n.Rest !== true)
            .length === 0) {
            return DivisionMinWidth * 4;
        }
        const lowestVal = this.Voices[this.ActiveVoice].Notes.sort((a, b) => {
            return a.Duration - b.Duration;
        })[0];
        const count = 1 / lowestVal.Duration;
        return count * DivisionMinWidth;
    }
    ReturnSelectableElements() {
        const sel = [];
        sel.push(...this.Voices[this.ActiveVoice].Notes);
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
    RecalculateBarlines() {
        this.Barlines[0].Bounds = new Bounds(this.Bounds.x, this.Bounds.y, 10, this.GetMeasureHeight());
        this.Barlines[1].Bounds = new Bounds(this.Bounds.x + this.GetBoundsWithOffset().width - 10, this.Bounds.y, 10, this.GetMeasureHeight());
    }
}
export { Measure, Clef };
