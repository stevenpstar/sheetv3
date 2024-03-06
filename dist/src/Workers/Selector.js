import { Bounds } from "../Types/Bounds.js";
class Selector {
    constructor() {
        this.Measures = [];
        this.Notes = new Map();
    }
    DeselectAll() {
        // TODO: Measure selection
        for (let [measure, notes] of this.Notes) {
            notes.forEach(note => {
                note.Selected = false;
            });
            this.Notes.delete(measure);
        }
        ;
    }
    DeselectNote(note) {
        let noteIndex = -1;
        for (let [msr, notes] of this.Notes) {
            notes.forEach((note, i) => {
                if (note === note) {
                    noteIndex = i;
                }
            });
            if (noteIndex >= 0) {
                this.RemoveDeselected([noteIndex], msr);
            }
        }
    }
    RemoveDeselected(indexes, key) {
        indexes.sort();
        for (let i = indexes.length - 1; i >= 0; i--) {
            this.Notes.get(key).splice(i, 1);
        }
        if (this.Notes.get(key).length === 0) {
            this.Notes.delete(key);
        }
    }
    SelectNote(msr, x, y, cam, shiftKey) {
        let noteHit = false;
        msr.Divisions.forEach((div) => {
            const divNotes = msr.Notes.filter((note) => note.Beat === div.Beat);
            divNotes.forEach((n) => {
                const nx = div.Bounds.x + 9;
                const ny = div.Bounds.y + (n.Line * 5) - 5;
                const noteBounds = new Bounds(nx, ny, n.Bounds.width, n.Bounds.height);
                if (noteBounds.IsHovered(x, y, cam)) {
                    n.Selected = true;
                    if (this.Notes.has(msr)) {
                        let nArray = this.Notes.get(msr);
                        if (!nArray.find(na => na === n)) {
                            nArray.push(n);
                            this.Notes.set(msr, nArray);
                        }
                    }
                    else {
                        let nArray = [];
                        nArray.push(n);
                        this.Notes.set(msr, nArray);
                    }
                    noteHit = true;
                }
                else {
                    if (n.Selected && !shiftKey) {
                        this.DeselectNote(n);
                        n.Selected = false;
                    }
                }
            });
            const nArray = this.Notes.get(msr);
            nArray.forEach(n => {
                if (n.Tied) {
                    nArray.push(...SelectTiedNotes(n, msr));
                }
            });
            this.Notes.set(msr, nArray);
        });
        if (!noteHit && !shiftKey) {
            this.DeselectAll();
        }
    }
}
function SelectTiedNotes(n, msr) {
    let isNoteTied = true;
    let nArray = [];
    while (isNoteTied) {
        const nextBeat = n.Beat + n.Duration * msr.TimeSignature.bottom;
        const tiedNote = msr.Notes.find(note => note.Beat === nextBeat &&
            note.Line === n.Line);
        if (tiedNote) {
            tiedNote.Selected = true;
            nArray.push(tiedNote);
            isNoteTied = tiedNote.Tied;
        }
        else {
            isNoteTied = false;
        }
    }
    return nArray;
}
export { Selector };
