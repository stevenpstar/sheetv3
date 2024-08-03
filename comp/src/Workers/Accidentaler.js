const ACC_OFFSET = 12;
// TODO: Pass in measure/key signature to determine if
// the notes need to display accidentals
// This will solve for accidental === 0
function ReturnAccidentalOffset(notes) {
    let offset = [];
    const nA = notes.filter(n => n.Accidental !== 0);
    nA.sort((a, b) => {
        return a.Line - b.Line;
    });
    switch (nA.length) {
        case 0:
            return [];
        case 1:
            return [ACC_OFFSET];
        case 2:
            return [ACC_OFFSET, ACC_OFFSET * 2];
        default:
            let lineDiff = Math.abs(nA[0].Line - nA[nA.length - 1].Line);
            if (lineDiff > 4) {
                // TODO: Fix mirror offset bug
                // At this point, mirroring is bugged. Setting everything to cascade
                //        offset = MirrorOffset(nA);
                offset = CascadingOffset(nA);
            }
            else {
                offset = CascadingOffset(nA);
            }
    }
    return offset;
}
function MirrorOffset(notes) {
    let offset = [];
    notes.forEach((_, i) => {
        if (i === 0 || i === notes.length - 1) {
            offset.push(ACC_OFFSET);
        }
        else {
            offset.push(ACC_OFFSET * i);
        }
    });
    return offset;
}
function CascadingOffset(notes) {
    let offset = [];
    notes.forEach((_, i) => {
        if (i === 0) {
            offset.push(ACC_OFFSET);
        }
        else {
            offset.push((notes.length + 1 - i) * ACC_OFFSET);
        }
    });
    return offset;
}
export { ReturnAccidentalOffset };
