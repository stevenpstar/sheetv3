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
        this.SetXOffset();
        // probably always last
        this.CreateDivisions();
    }
    static GetLineHovered(y, msr, cam) {
        const relYPos = y - msr.Bounds.y - cam.y;
        const line = Math.floor(relYPos / 5); // this should be a constant, line_height (defined somewhere)
        return { num: line,
            bounds: new Bounds(msr.Bounds.x, msr.Bounds.y + ((line * 5) - 2.5), msr.Bounds.width + msr.XOffset, 5) };
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
    CreateDivisions() {
        this.Divisions = [];
        this.BDivisions = [];
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
