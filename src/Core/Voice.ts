import { DivGroup, Division } from "./Division.js";
import { Note } from "./Note.js";

class Voice {
  // ID should probably correlate with the index, but may not always
  ID: number;
  Notes: Note[];
  Divisions: Division[];
  DivisionGroups: DivGroup[];
  constructor(id: number) {
    this.ID = id;
    this.Notes = [];
    this.Divisions = [];
    this.DivisionGroups = [];
  }
}

export { Voice };
