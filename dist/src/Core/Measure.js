import { Bounds } from '../Types/Bounds.js';
import { CreateDivisions, ResizeDivisions } from './Division.js';
class Measure {
    constructor(properties) {
        this.ID = properties.ID;
        this.Bounds = properties.Bounds;
        this.TimeSignature = properties.TimeSignature;
        this.Notes = properties.Notes;
        this.Divisions = properties.Divisions;
        this.RenderClef = properties.RenderClef;
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
        this.Divisions = CreateDivisions(this, this.Notes);
        ResizeDivisions(this, this.Divisions);
    }
    Reposition(prevMsr) {
        this.Bounds.x = prevMsr.Bounds.x + prevMsr.Bounds.width + prevMsr.XOffset;
        this.CreateDivisions();
    }
    AddNote(note) {
        this.Notes.push(note);
    }
    DeleteSelected() {
        for (let n = this.Notes.length - 1; n >= 0; n--) {
            if (this.Notes[n].Selected) {
                this.Notes.splice(n, 1);
            }
        }
    }
}
export { Measure };
