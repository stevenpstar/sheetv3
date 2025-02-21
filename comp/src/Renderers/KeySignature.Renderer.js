import { KeySignatures } from "../Core/KeySignatures.js";
import { RenderSymbol, StdAccidentals } from "./MusicFont.Renderer.js";
function RenderKeySignature(renderProps, msr, keyString, clefString, xOff, theme, staff) {
    renderProps.context.fillStyle = "black";
    const staffClefs = msr.Clefs.filter((c) => c.Staff === staff);
    if (!staffClefs) {
        console.error("(RenderKeySignature): Something went very wrong here");
        return;
    }
    //staff clefs should probably be sorted by beat here
    const clefTypeString = staffClefs[0].Type;
    const keyProps = GetKeyProps(clefTypeString, keyString);
    keyProps.Lines.forEach((l, i) => {
        if (keyProps.Accidental === "#") {
            RenderSymbol(renderProps, StdAccidentals.Sharp, msr.Bounds.x + xOff + i * 10, msr.GetNotePositionOnLine(l, staff) + 2.5, theme, false);
        }
        else {
            RenderSymbol(renderProps, StdAccidentals.Flat, msr.Bounds.x + xOff + i * 10, msr.GetNotePositionOnLine(l, staff) + 2.5, theme, false);
        }
    });
}
function GetKeyProps(clefString, keyString) {
    const props = { Accidental: "", Lines: [] };
    const notes = KeySignatures.get(keyString);
    let acc = "";
    if (clefString === "" || !clefString || !keyString || keyString === "") {
        console.error("ClefString or KeyString missing");
        return props;
    }
    if (!notes) {
        console.error("Notes undefined/null");
        return props;
    }
    if (notes.length > 0) {
        if (notes[0].includes("#")) {
            acc = "#";
        }
        else {
            acc = "b";
        }
    }
    props.Accidental = acc;
    switch (clefString) {
        case "bass":
            props.Lines = fromTreble(notes, acc);
            props.Lines = [...props.Lines.map((l) => (l += 2))];
            break;
        case "treble":
            props.Lines = fromTreble(notes, acc);
            break;
        default:
    }
    return props;
}
function fromTreble(notes, accidental) {
    let lines = [];
    const sharpLines = [11, 14, 10, 13, 16, 12, 15];
    const flatLines = [15, 12, 16, 13, 17, 14, 18];
    if (accidental === "#") {
        lines = sharpLines.slice(0, notes.length);
    }
    else {
        lines = flatLines.slice(0, notes.length);
    }
    return lines;
}
export { RenderKeySignature };
