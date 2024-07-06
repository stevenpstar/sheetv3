import { Bounds } from '../Types/Bounds.js';
import { SelectableTypes } from '../Types/ISelectable.js';
import { MessageType } from '../Types/Message.js';
import { UpdateNoteBounds } from '../Workers/NoteInput.js';
import { Clef, GetNoteClefType } from './Clef.js';
import { CreateDivisions, ResizeDivisions, DivisionMinWidth } from './Division.js';
import { StaffType } from './Instrument.js';
import { Note } from './Note.js';
import { CreateTimeSignature } from './TimeSignatures.js';
class Measure {
    constructor(properties, runningId) {
        this.Clefs = [];
        this.GrandClefs = [];
        this.Message = properties.Message;
        this.RunningID = runningId;
        this.ID = 0;
        this.Selected = false;
        this.Editable = true;
        this.SelType = SelectableTypes.Measure;
        this.Instrument = properties.Instrument;
        this.Line = 0;
        this.Bounds = properties.Bounds;
        this.TimeSignature = CreateTimeSignature(properties.TimeSignature);
        this.KeySignature = properties.KeySignature;
        this.Notes = properties.Notes;
        this.BNotes = [];
        this.Divisions = [];
        this.BDivisions = [];
        this.RenderClef = properties.RenderClef;
        if (this.Instrument.Staff === StaffType.Rhythm) {
            this.RenderClef = false;
        }
        console.log("RenderingClef: ", this.RenderClef);
        console.log(this.Instrument.Staff);
        this.RenderKey = properties.RenderKey;
        this.Camera = properties.Camera;
        this.RenderTimeSig = properties.RenderTimeSig;
        this.Page = properties.Page;
        this.PageLine = properties.Page.PageLines[0].Number;
        this.PrefBoundsY = this.Bounds.y;
        this.PrevBoundsH = this.Bounds.height;
        this.SetXOffset();
        this.SALineTop = 5;
        this.SALineMid = 15;
        this.SALineBot = 30;
        this.SALineTopSave = this.SALineTop;
        this.SALineBotSave = this.SALineBot;
        this.SALineTopDef = this.SALineTop;
        this.SALineBotDef = this.SALineBot;
        this.SBLineTop = 1035;
        this.SBLineMid = 1045;
        this.SBLineBot = 1054;
        this.SBLineTopSave = this.SBLineTop;
        this.SBLineBotSave = this.SBLineBot;
        this.SBLineTopDef = this.SBLineTop;
        this.SBLineBotDef = this.SBLineBot;
        this.SBOffset = 1000;
        this.CreateDivisions(this.Camera);
        // create default clef
        const trebleClef = new Clef(0, { x: this.Bounds.x + 16,
            y: this.Bounds.y + (5 * Measure.GetMeasureMidLine(this) + (10 * 2)) }, "treble", 1);
        trebleClef.SetBounds(this, 0);
        this.Clefs.push(trebleClef);
        if (this.Instrument.Staff === StaffType.Grand) {
            const bassClef = new Clef(1, {
                x: this.Bounds.x + 30,
                y: this.Bounds.y + this.GetMeasureHeight() + (this.GetGrandMeasureMidLine() * 5) - 2
            }, "bass", 1);
            bassClef.SetBounds(this, 1);
            this.GrandClefs.push(bassClef);
        }
        this.TimeSignature.SetBounds(this, 0);
        this.TimeSignature.SetBounds(this, 1);
    }
    static GetLineHovered(y, msr) {
        const cam = msr.Camera;
        const relYPos = y - msr.Bounds.y - cam.y; //TODO: Dunno about scaling by zoom here
        let line = Math.floor(relYPos / (5)); // this should be a constant, line_height (defined somewhere)
        let actualLine = line + msr.SALineTop;
        const bounds = new Bounds(msr.Bounds.x, 0, msr.Bounds.width + msr.XOffset, (5));
        if (actualLine > msr.SALineBot) {
            const diff = actualLine - msr.SALineBot;
            actualLine = msr.SBLineTop + diff;
            bounds.y = msr.Bounds.y + msr.GetMeasureHeight() + ((diff * (5)) - 2.5);
        }
        else {
            bounds.y = msr.Bounds.y + ((line * (5)) - 2.5);
        }
        return { num: actualLine,
            bounds: bounds };
    }
    //STATIC? WHY? I DUNNO
    // Get note position relative to staff/measure
    static GetNotePositionOnLine(msr, line) {
        const cam = msr.Camera;
        let y = 0;
        if (line <= msr.SALineBot) {
            y = msr.Bounds.y + (line - msr.SALineTop) * (5);
        }
        else {
            y = msr.Bounds.y + msr.GetMeasureHeight() + ((line - msr.SBLineTop) * (5));
        }
        return y - 2.5;
    }
    static GetMeasureHeight(msr, cam) {
        return (msr.SALineTop + msr.SALineBot) * (5);
        // expand on this to include grand staffs and have line height (5) be 
        // a constant that is defined somewhere
    }
    static GetMeasureMidLine(msr) {
        return (msr.SALineMid - msr.SALineTop);
    }
    GetBoundsWithOffset() {
        return new Bounds(this.Bounds.x, this.Bounds.y, this.Bounds.width + this.XOffset, this.Bounds.height);
    }
    SetXOffset() {
        this.XOffset = 0;
        if (this.RenderClef) {
            this.XOffset += (30);
        }
        if (this.RenderKey) {
            this.XOffset += (30);
        }
        if (this.RenderTimeSig) {
            this.XOffset += (30);
        }
    }
    CreateDivisions(cam, afterInput = false) {
        if (afterInput) {
            this.ResetHeight();
        }
        this.Divisions = [];
        this.Divisions.push(...CreateDivisions(this, this.Notes, 0, cam));
        if (this.Instrument.Staff === StaffType.Grand) {
            this.Divisions.push(...CreateDivisions(this, this.Notes, 1, cam));
            ResizeDivisions(this, this.Divisions, 1);
        }
        ResizeDivisions(this, this.Divisions, 0);
        UpdateNoteBounds(this, 0);
        UpdateNoteBounds(this, 1);
    }
    Reposition(prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        this.CreateDivisions(this.Camera);
    }
    // set height of measure based off of notes in measure
    // eventually will be determined by instrument / row etc.
    GetMeasureHeight() {
        const lineHeight = (5); // constant should be set elsewhere
        const topNegative = this.SALineTop < 0;
        const heightInLines = topNegative ?
            this.SALineBot + Math.abs(this.SALineTop) :
            this.SALineBot - this.SALineTop;
        return heightInLines * lineHeight;
    }
    GetGrandMeasureHeight() {
        const lineHeight = (5); // constant should be set elsewhere
        const topStaffHeight = this.GetMeasureHeight();
        const topNegative = (this.SBLineTop - this.SBOffset) < 0;
        const heightInLines = topNegative ?
            (this.SBLineBot - this.SBOffset) + (Math.abs(this.SBLineTop - this.SBOffset)) :
            (this.SBLineBot - this.SBOffset) - (this.SBLineTop - this.SBOffset);
        return topStaffHeight + (heightInLines * lineHeight);
    }
    GetGrandMeasureMidLine() {
        return this.SBLineMid - this.SBLineTop;
    }
    ResetHeight() {
        const height = this.Instrument.Staff === StaffType.Single ?
            this.GetMeasureHeight() : this.GetGrandMeasureHeight();
        this.Bounds.height = height;
        this.PrevBoundsH = height;
        // move this somewhere else
        this.SALineTop = this.SALineTopSave;
        this.SALineBot = this.SALineBotSave;
        this.SBLineTop = this.SBLineTopSave;
        this.SBLineBot = this.SBLineBotSave;
        this.Bounds.y = this.PrefBoundsY;
    }
    // name change later I'm too tired to think of actual function name
    ReHeightenTop(expand, lineOver) {
        if (expand) {
            const dist = lineOver - this.SALineTop;
            this.SALineTop = lineOver - dist - 1;
            this.Bounds.y -= 5;
            this.Bounds.height += 5;
        }
        else {
            if (lineOver >= this.SALineTopSave) {
                this.SALineTop = this.SALineTopSave;
                this.Bounds.y = this.PrefBoundsY;
            }
            else {
                this.SALineTop += 1;
                this.Bounds.y += 5;
            }
        }
        this.CreateDivisions(this.Camera);
    }
    ReHeightenBot(expand, lineOver) {
        if (expand) {
            this.SALineBot = lineOver + 2;
            this.Bounds.height += 5;
        }
        else {
            if (lineOver <= this.SALineBotSave) {
                this.SALineBot = this.SALineBotSave;
                this.Bounds.height = this.PrevBoundsH;
            }
            else {
                this.SALineBot -= 1;
                this.Bounds.height -= 5;
            }
        }
        this.CreateDivisions(this.Camera);
    }
    ReHeightenTopGrand(expand, lineOver) {
        if (expand) {
            const dist = lineOver - this.SBLineTop;
            this.SBLineTop = lineOver - dist - 1;
            this.Bounds.y -= 5;
            this.Bounds.height += 5;
        }
        else {
            if (lineOver >= this.SBLineTopSave) {
                this.SBLineTop = this.SBLineTopSave;
                this.Bounds.y = this.PrefBoundsY;
            }
            else {
                this.SBLineTop += 1;
                this.Bounds.y += 5;
            }
        }
        this.CreateDivisions(this.Camera);
    }
    ReHeightenBotGrand(expand, lineOver) {
        if (expand) {
            this.SBLineBot = lineOver + 2;
            this.Bounds.height += 5;
        }
        else {
            if (lineOver <= this.SBLineBotSave) {
                this.SBLineBot = this.SBLineBotSave;
                this.Bounds.height = this.PrevBoundsH;
            }
            else {
                this.SBLineBot -= 1;
                this.Bounds.height -= 5;
            }
        }
        this.CreateDivisions(this.Camera);
    }
    ResetTopHeight() {
        this.SALineTop = this.SALineTopSave;
        this.Bounds.y = this.PrefBoundsY;
        this.Bounds.height = this.PrevBoundsH;
        this.CreateDivisions(this.Camera);
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
                messageString: 'AddNote',
                messageData: {
                    Message: {
                        msg: "AddingNote",
                        obj: note,
                    },
                    MessageType: MessageType.AddNote,
                }
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
            if (this.Notes[n].Selected) {
                let beat = this.Notes[n].Beat;
                let duration = this.Notes[n].Duration;
                let staff = this.Notes[n].Staff;
                let tuple = this.Notes[n].Tuple;
                let tupleDetails = this.Notes[n].TupleDetails;
                this.Notes.splice(n, 1);
                const notesOnBeat = this.Notes.filter(n => n.Beat === beat);
                if (notesOnBeat.length === 0) {
                    const clefType = GetNoteClefType(this, beat, staff);
                    // beat is empty and requires a rest note
                    const restProps = {
                        Beat: beat,
                        Duration: duration,
                        Line: 15,
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
        if (this.Notes.filter(n => n.Rest !== true).length === 0) {
            return DivisionMinWidth * 4;
        }
        const staffZeroDivs = this.Divisions.filter(div => div.Staff === 0);
        const staffOneDivs = this.Divisions.filter(div => div.Staff === 1);
        const lowestValue = this.Divisions.sort((a, b) => {
            return a.Duration - b.Duration;
        })[0].Duration;
        //const count = 1 / lowestValue;
        const count = staffZeroDivs.length > staffOneDivs.length ? staffZeroDivs.length : staffOneDivs.length;
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
