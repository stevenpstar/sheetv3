import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
class Selector {
  Measures: Measure[];
 // Notes: { msr: Measure, note: Note }[];
  Notes: Map<Measure, Note[]>;
  constructor() {
    this.Measures = [];
    this.Notes = new Map<Measure, Note[]>();
  }

  DeselectAll(): void {
    // TODO: Measure selection
    for ( let [measure, notes] of this.Notes) {
      notes.forEach(note => {
        note.Selected = false;
      });
      this.Notes.delete(measure);
    };

  }

  DeselectNote(note: Note): void {
    let noteIndex = -1;
    for ( let [msr, notes] of this.Notes) {
      notes.forEach((note: Note, i: number) => {
        if (note === note) {
          noteIndex = i;
        }
      });
      if (noteIndex >= 0) {
        this.RemoveDeselected([noteIndex], msr);
      }
    }

  }

  RemoveDeselected(indexes: number[], key: Measure): void {
    indexes.sort();
    for (let i=indexes.length-1; i >= 0; i--) {
      this.Notes.get(key).splice(i, 1);
    }
    if (this.Notes.get(key).length === 0) {
      this.Notes.delete(key);
    }
  }

  SelectNote(
    msr: Measure,
    x: number, y: number,
    cam: Camera,
    shiftKey: boolean): void {
      let noteHit = false;
      msr.Divisions.forEach((div: Division) => {
        const divNotes = msr.Notes.filter((note: Note) => note.Beat === div.Beat);
        divNotes.forEach((n: Note) => {
          const nx = div.Bounds.x + 9;
          const ny = div.Bounds.y + (n.Line * 5) - 5;
          const noteBounds = new Bounds(nx,
                                        ny,
                                        n.Bounds.width,
                                        n.Bounds.height);
          if (noteBounds.IsHovered(x, y, cam)) {
            n.Selected = true;
            if (this.Notes.has(msr)) {
              let nArray = this.Notes.get(msr);
              if (!nArray.find(na => na === n)) {
                nArray.push(n);
                if (n.Tied) {
                  nArray.push(...SelectTiedNotes(n, msr));
                }
                this.Notes.set(msr, nArray);
              }
            } else {
              let nArray = [];
              nArray.push(n);
              if (n.Tied) {
                nArray.push(...SelectTiedNotes(n, msr));
              }
              this.Notes.set(msr, nArray);
            }
            noteHit = true;
          } else {
            if (n.Selected && !shiftKey) {
              let deselect = true;
              if (n.Tied) {
                const tiedNotes = msr.Notes.filter(note => {
                  return note !== n &&
                    note.Beat >= n.TiedStart &&
                    note.Beat <= n.TiedEnd &&
                    note.Line === n.Line &&
                    note.Selected === true;
                });
                deselect = tiedNotes.length === 0;
              }
              if (deselect) {
                this.DeselectNote(n);
                n.Selected = false;
              }
            }
          }
        });
      });
      if (!noteHit && !shiftKey) { this.DeselectAll(); }
    }
}

function SelectTiedNotes(n: Note, msr: Measure): Note[] {
  let nArray: Note[] = [];
  let tStart = n.TiedStart;
  let tEnd = n.TiedEnd;
  const tiedNotes = msr.Notes.filter(note => {
    return note !== n &&
      note.Beat >= tStart &&
      note.Beat <= tEnd &&
      note.Line === n.Line;
  })
  tiedNotes.forEach(tn => {
    tn.Selected = true;
    nArray.push(tn);
  })
  return nArray;
}

export { Selector };
