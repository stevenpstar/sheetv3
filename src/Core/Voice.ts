import { Division } from "./Division.js";
import { Note } from "./Note.js";

class Voice {
  Notes: Note[];
  Divisions: Division[];
  constructor() {
    this.Notes = [];
    this.Divisions = [];
  }
}

export { Voice };
