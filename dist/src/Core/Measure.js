import { Bounds } from '../Types/Bounds.js';
import { CreateDivisions, ResizeDivisions } from './Division.js';
import { StaffType } from './Instrument.js';
import { Note } from './Note.js';
class Measure {
    constructor(properties) {
        this.Clefs = [];
        this.GrandClefs = [];
        this.Instrument = properties.Instrument;
        this.Bounds = properties.Bounds;
        this.TimeSignature = properties.TimeSignature;
        this.KeySignature = properties.KeySignature;
        this.Notes = properties.Notes;
        this.BNotes = [];
        this.Divisions = properties.Divisions;
        this.BDivisions = [];
        this.RenderClef = properties.RenderClef;
        this.RenderKey = properties.RenderKey;
        this.RenderTimeSig = properties.RenderTimeSig;
        this.Clefs.push({ Type: properties.Clef, Beat: 1 });
        if (this.Instrument.Staff === StaffType.Grand) {
            this.GrandClefs.push({ Type: "bass", Beat: 1 });
        }
        this.PrefBoundsY = this.Bounds.y;
        this.PrevBoundsH = this.Bounds.height;
        this.SetXOffset();
        this.SALineTop = 5;
        this.SALineMid = 15;
        this.SALineBot = 24;
        this.SALineTopSave = this.SALineTop;
        this.SALineBotSave = this.SALineBot;
        this.SALineTopDef = this.SALineTop;
        this.SALineBotDef = this.SALineBot;
        this.SBLineTop = 1035;
        this.SBLineMid = 1045;
        this.SBLineBot = 1044;
        this.SBOffset = 1000;
        // probably always last
        this.CreateDivisions();
    }
    static GetLineHovered(y, msr, cam) {
        const relYPos = y - msr.Bounds.y - cam.y;
        const line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
        return { num: line,
            bounds: new Bounds(msr.Bounds.x, msr.Bounds.y + ((line * 5) - 2.5), msr.Bounds.width + msr.XOffset, 5) };
    }
    static GetMeasureHeight(msr) {
        return (msr.SALineTop + msr.SALineBot) * 5;
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
            this.XOffset += 30;
        }
        if (this.RenderKey) {
            this.XOffset += 30;
        }
        if (this.RenderTimeSig) {
            this.XOffset += 30;
        }
    }
    CreateDivisions(afterInput = false) {
        if (afterInput) {
            this.ResetHeight();
        }
        this.Divisions = [];
        this.Divisions.push(...CreateDivisions(this, this.Notes, 0));
        if (this.Instrument.Staff === StaffType.Grand) {
            this.Divisions.push(...CreateDivisions(this, this.Notes, 1));
            ResizeDivisions(this, this.Divisions, 1);
        }
        ResizeDivisions(this, this.Divisions, 0);
    }
    Reposition(prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        this.CreateDivisions();
    }
    // set height of measure based off of notes in measure
    // eventually will be determined by instrument / row etc.
    GetMeasureHeight() {
        const lineHeight = 5; // constant should be set elsewhere
        const topNegative = this.SALineTop < 0;
        const heightInLines = topNegative ?
            this.SALineBot + Math.abs(this.SALineTop) :
            this.SALineBot - this.SALineTop;
        return heightInLines * lineHeight;
    }
    ResetHeight() {
        const height = this.GetMeasureHeight();
        this.Bounds.height = height;
        this.PrevBoundsH = height;
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
        this.CreateDivisions();
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
        this.CreateDivisions();
    }
    ResetTopHeight() {
        this.SALineTop = this.SALineTopSave;
        this.Bounds.y = this.PrefBoundsY;
        this.Bounds.height = this.PrevBoundsH;
        this.CreateDivisions();
    }
    AddNote(note) {
        if (note.Rest) {
            this.ClearNonRestNotes(note.Beat, note.Staff);
        }
        else {
            this.ClearRestNotes(note.Beat, note.Staff);
        }
        this.Notes.push(note);
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
    DeleteSelected() {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Selected) {
                let beat = this.Notes[n].Beat;
                let duration = this.Notes[n].Duration;
                let staff = this.Notes[n].Staff;
                this.Notes.splice(n, 1);
                const notesOnBeat = this.Notes.filter(n => n.Beat === beat);
                if (notesOnBeat.length === 0) {
                    // beat is empty and requires a rest note
                    const restProps = {
                        Beat: beat,
                        Duration: duration,
                        Line: 15,
                        Rest: true,
                        Tied: false,
                        Staff: staff
                    };
                    this.AddNote(new Note(restProps));
                }
            }
        }
    }
}
export { Measure };
