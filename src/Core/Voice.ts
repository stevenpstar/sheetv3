import { DivGroup, Division } from "./Division.js";
import { Note } from "./Note.js";

class Voice {
  Notes: Note[];
  Divisions: Division[];
  DivisionGroups: DivGroup[];
  constructor() {
    this.Notes = [];
    this.Divisions = [];
    this.DivisionGroups = [];
  }
}

export { Voice };
