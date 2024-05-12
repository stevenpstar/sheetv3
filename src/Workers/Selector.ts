import { Camera } from "../Core/Camera.js";
import { Clef, Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
class Selector {
  Measures: Measure[];
  Clefs: Clef[];
 // Notes: { msr: Measure, note: Note }[];
  Notes: Map<Measure, Note[]>;
  // Selectable { msr: Measure, sel: Selectable[]>
  Elements: Map<Measure, ISelectable[]>;
  constructor() {
    this.Measures = [];
    this.Clefs = [];
    this.Notes = new Map<Measure, Note[]>();
    this.Elements = new Map<Measure, ISelectable[]>();
  }

  DeselectAll(): void {
    // TODO: Measure selection
    for ( let [measure, notes] of this.Notes) {
      notes.forEach(note => {
        note.Selected = false;
      });
      this.Notes.delete(measure);
    };

    // This should replace the above eventually
    for ( let [measure, elem] of this.Elements) {
      elem.forEach(e => {
        e.Selected = false;
      });
      this.Elements.delete(measure);
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

  SelectById(
    measures: Measure[],
    id: number): ISelectable {
      let selectable: ISelectable;
      this.DeselectAll();
      measures.forEach(m => {
        // check here for measure selection when implemented
        // maybe also div/beam/stem/clef/sig/artic etc.
        m.Notes.forEach(n => {
          if (n.ID === id) {
            n.Selected = true;
            selectable = n;
            let nArray = [];
            nArray.push(n);
            if (n.Tied) {
              nArray.push(...SelectTiedNotes(n, m));
            }
            this.Notes.set(m, nArray);
          }
        })
      });
      return selectable;
    }

  SelectMeasure(msr: Measure): void {
      if (this.Measures.find(m => m.ID === msr.ID)) {
      const index = this.Measures.indexOf(msr);
      msr.Selected = false;
      this.Measures.splice(index, 1);
    } else {
      this.Measures.push(msr);
      msr.Selected = true;
    }
  }

  SelectClef(clef: Clef): void {
    if (this.Clefs.find(c => c.ID === clef.ID)) {
      const index = this.Clefs.indexOf(clef);
      clef.Selected = false;
      this.Clefs.splice(index, 1);
    } else {
      this.Clefs.push(clef);
      clef.Selected = true;
    }
  }

  SelectNote(
    msr: Measure,
    x: number, y: number,
    cam: Camera,
    shiftKey: boolean): boolean {
      let noteHit = false;
      msr.Divisions.forEach((div: Division) => {
        const divNotes = msr.Notes.filter((note: Note) => note.Beat === div.Beat);
        divNotes.forEach((n: Note) => {
          const noteBounds = n.Bounds;
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
                    note.Staff === n.Staff &&
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
      if (!noteHit && !shiftKey) { this.DeselectAll();
        return false}
      return true;
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
      note.Staff === n.Staff &&
      note.Line === n.Line;
  })
  tiedNotes.forEach(tn => {
    tn.Selected = true;
    nArray.push(tn);
  })
  return nArray;
}

export { Selector };
