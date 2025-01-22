import { StaffType } from "../Core/Instrument.js";
import { Note } from "../Core/Note.js";
import { CreateMeasure } from "../Factory/Instrument.Factory.js";
const LoadSheet = (sheet, page, cam, instr, savedJson, callback) => {
    let runningId = { count: 0 };
    // TODO: this could error
    const loaded = JSON.parse(savedJson);
    // loading onto a single instrument to begin with
    loaded.Measures.forEach((m, i) => {
        //   const msr = CreateDefaultMeasure(runningId, instr, page, cam);
        // TODO: Temporary
        if (instr.Staff === StaffType.Rhythm) {
            m.ShowClef = false;
        }
        const notes = [];
        m.Notes.forEach((n, i) => {
            const noteProps = {
                Beat: n.Beat,
                Duration: n.Duration,
                Line: n.Line,
                Rest: n.Rest,
                Tied: n.Tied,
                Staff: n.Staff,
                Tuple: false,
                Clef: n.Clef,
                Editable: true,
                Grace: n.Grace,
            };
            const newNote = new Note(noteProps);
            notes.push(newNote);
        });
        const msr = CreateMeasure(instr, m.Bounds, m.TimeSignature, m.KeySignature, m.Clefs, m.Staves, cam, runningId, page, m.ShowClef, callback);
        msr.Notes = notes;
        sheet.Measures.push(msr);
        msr.CreateDivisions(cam);
    });
};
const SaveSheet = (sheet) => {
    let saved = {
        Measures: [],
    };
    sheet.Measures.forEach((m, i) => {
        let notes = [];
        m.Notes.forEach((n, i) => {
            if (n.Rest) {
                return;
            }
            notes.push({
                ID: n.ID,
                Beat: n.Beat,
                Duration: n.Duration,
                Line: n.Line,
                Rest: n.Rest,
                Tied: n.Tied,
                Staff: n.Staff,
                Clef: n.Clef,
                Editable: true,
                Grace: n.Grace,
            });
        });
        saved.Measures.push({
            Clefs: m.Clefs,
            Staves: m.Staves,
            TimeSignature: m.TimeSignature,
            KeySignature: m.KeySignature,
            Notes: notes,
            Bounds: m.Bounds,
            ShowClef: m.RenderClef,
            ShowTime: m.RenderTimeSig,
        });
    });
    //  console.log(JSON.stringify(saved));
    return JSON.stringify(saved);
};
export { LoadSheet, SaveSheet };
