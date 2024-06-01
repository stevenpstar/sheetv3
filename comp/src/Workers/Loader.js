import { Note } from "../Core/Note.js";
import { CreateMeasure } from "../Factory/Instrument.Factory.js";
const LoadSheet = (sheet, page, cam, instr, savedJson) => {
    let runningId = { count: 0 };
    const loaded = JSON.parse(savedJson);
    // loading onto a single instrument to begin with
    loaded.Measures.forEach((m, i) => {
        //   const msr = CreateDefaultMeasure(runningId, instr, page, cam);
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
            };
            const newNote = new Note(noteProps);
            notes.push(newNote);
        });
        const msr = CreateMeasure(instr, m.Bounds, m.TimeSignature, "CMaj/Amin", "treble", cam, runningId, page, m.ShowClef);
        msr.Notes = notes;
        sheet.Measures.push(msr);
        msr.CreateDivisions(cam);
    });
};
const SaveSheet = (sheet) => {
    let saved = {
        Measures: []
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
                Staff: n.Staff
            });
        });
        saved.Measures.push({
            Clef: "treble",
            TimeSignature: m.TimeSignature,
            Notes: notes,
            Bounds: m.Bounds,
            ShowClef: m.RenderClef,
            ShowTime: m.RenderTimeSig
        });
    });
    console.log(JSON.stringify(saved));
    return JSON.stringify(saved);
};
export { LoadSheet, SaveSheet };
