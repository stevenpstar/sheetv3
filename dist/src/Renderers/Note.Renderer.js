const noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735';
const minimHead = 'm3.4871-7.6c-2.8881 1.8199-4.4271 5.1146-3.4804 7.593 1.0097 2.6437 4.4796 3.3897 7.7452 1.6654 3.2656-1.7244 5.0963-5.2694 4.0866-7.9131-1.0097-2.6437-4.4796-3.3897-7.7452-1.6654-.204.1077-.4136.1988-.6062.3201zm.9439 2.2422c.2051-.1244.4129-.218.6304-.3328 2.7838-1.47 5.4723-1.5391 6.0012-.1543.5289 1.3847-1.3011 3.7016-4.0849 5.1715-2.7838 1.47-5.4723 1.5391-6.0012.1543-.4876-1.2766 1.0334-3.3716 3.4545-4.8387z';
const quaverRest = 'c-.2863.1212-.4577.5392-.326.8318.0397.0418.4556.5392.8736 1.0868.9551 1.0764 1.1182 1.3313 1.3292 1.8288.8339 1.7054.3762 3.877-1.0847 5.2501-.1233.163-.6625.6186-1.1683.9948-1.4525 1.2498-2.1214 1.9604-2.368 2.5874-.0899.1651-.0899.3281-.0899.581-.0397.5789 0 .6291 1.7159 2.6209 2.3262 2.7922 3.9919 4.7506 4.1215 4.8739l.1233.1212-.163-.0815c-2.2948-.9551-4.8739-1.4128-5.7475-.9948-.2947.1212-.4661.2926-.5873.5789-.3365.7106-.2466 1.7556.2529 3.2897.4556 1.3794 1.371 3.2082 2.2844 4.5813.3762.5873 1.0868 1.5006 1.1683 1.5424.1233.1233.2947.0815.4159 0 .1233-.163.1233-.2947-.1212-.5789-.8736-1.2498-1.2895-3.8372-.7921-5.2104.2027-.6186.4577-.9551.9133-1.1662 1.208-.5392 3.879.1296 4.9972 1.2477.0815.0836.2529.255.3344.2947.2947.1233.7106-.0397.8339-.3344.1714-.2947.0815-.4974-.2947-.9551-.7022-.8339-2.8257-3.3315-3.1183-3.7077-.7524-.8736-1.0868-1.7054-1.1683-2.7504-.0397-1.3313.4974-2.7421 1.5027-3.6659.1212-.163.6604-.6207 1.16-.9948 1.5424-1.2916 2.1715-2.0001 2.416-2.671.1714-.5392.0899-1.0366-.2863-1.4943-.1296-.1212-1.5842-1.9186-3.2897-3.9585-2.3345-2.7442-3.1684-3.7474-3.2897-3.7892-.1714-.0397-.3762-.0397-.5476.0418z';
const quaverFlag = 'c11.7122 2.9669 6.3069 13.252 5.2534 16.885 9.622-13.142-5.1221-18.5026-5.2534-26.47z';
// TODO: This is because we are using temporary SVG files for rendering, will need to
// create custom SVGs so our note heads are consistent (but we can do that much later in dev)
const mHeadXOffset = 3.4871;
const mHeadYOffset = -7.6;
// TODO: Re-work this function a bit, so many parameters and the note itself
// isn't even being passed in?
function RenderNote(note, renderProps, bounds, selected, colour = "black") {
    const { x, y, width, height } = bounds;
    const { canvas, context, camera } = renderProps;
    // Ledger lines need to be rendered elsewhere
    // const onLedger = ((note.Line < 10 || note.Line > 20) && note.Line % 2 !== 0);
    const posString = 'm' + x.toString() + ' ' + (y - 1).toString();
    // render line here
    //  const ledgerString = `m ${x - 6} ${y - 5} h 22 v 2 h-20 v-2 Z`;
    //  const ledgerNoPos = 'h 22 v 2 h-20 v-2 Z';
    //  context.fillStyle = selected ? "blue" : colour;
    //  if (onLedger) {
    //    context.fill(new Path2D(ledgerString));
    //  }
    let noteString = '';
    let flagString = '';
    switch (note.Duration) {
        case 0.125:
            noteString = posString + noteHead;
            flagString = `m${x + 11} ${y - 30}` + quaverFlag; // rough testing for flag
            context.fill(new Path2D(flagString));
            break;
        case 0.25:
            noteString = posString + noteHead;
            break;
        case 0.5:
            noteString = posString + minimHead; //( + offsets)
            break;
        default:
            noteString = posString + noteHead;
    }
    if (selected) {
        context.fillStyle = "blue";
    }
    context.fill(new Path2D(noteString));
}
function RenderRest(ctx, div, cam) {
    let x = div.bounds.x + cam.x + 18;
    let y = div.bounds.y + cam.y + (12 * 5);
    let path = `m${x} ${y}`;
    ctx.fillStyle = "black";
    switch (div.value) {
        case 0.25:
            path = path + quaverRest;
            ctx.fill(new Path2D(path));
            break;
        case 0.5:
            y = div.bounds.y + cam.y + (15 * 5) - 6;
            ctx.fillRect(x, y, 14, 6);
            break;
        case 1:
            y = div.bounds.y + cam.y + (13 * 5);
            x = div.bounds.x + cam.x + (div.bounds.width / 2) - 7;
            ctx.fillRect(x, y, 14, 6);
            break;
        default:
            path = path + quaverRest;
            ctx.fill(new Path2D(path));
    }
}
function RenderStem(ctx, notes, beatD, cam) {
    const bdNotes = notes.filter((note) => note.Beat === beatD.startNumber);
    bdNotes.sort((a, b) => {
        return a.Line - b.Line;
    });
    const middleLine = 15; // TODO: This will depend on measure height
    let dirUp = true; // default to true
    if (bdNotes.length === 1) {
        if (bdNotes[0].Line < middleLine) {
            dirUp = false;
        }
    }
    else {
        dirUp = (bdNotes[bdNotes.length - 1].Line - middleLine > middleLine - bdNotes[0].Line) ? true : false;
    }
    const yPos = (bdNotes[bdNotes.length - 1].Line * (10 / 2) + (10 / 2));
    const yPos2 = (bdNotes[0].Line * (10 / 2) + (10 / 2));
    let diff = (yPos - yPos2) + 35;
    let xBuffer = 10;
    let startPos = yPos;
    if (bdNotes[0].Line >= middleLine + 7) {
        diff = yPos - (16 * 5);
    }
    if (!dirUp) {
        diff = -diff;
        xBuffer = 0;
        startPos = yPos2;
        if (bdNotes[bdNotes.length - 1].Line <= middleLine - 7) {
            diff = yPos2 - (16 * 5);
        }
    }
    ctx.fillStyle = "black";
    // TODO: investigate changing note-head size so that it doesn't end on half
    // pixel
    ctx.fillRect(Math.floor(beatD.bounds.x + 18 + xBuffer) + cam.x, (startPos - 5) + cam.y, 2, -diff);
    //  const stem = `M${beatD.bounds.x + 18 + 10} ${yPos - 5} h ${2} v -${diff} h -${2} Z`;
    //  ctx.fill(new Path2D(stem));
}
function renderLedgerLines(notes, division, renderProps) {
    const { canvas, context, camera } = renderProps;
    const ledgerX = (division.bounds.x + 18) - 6 + camera.x;
    //const ledgerString = `m ${x - 6} ${y - 5} h 22 v 2 h-20 v-2 Z`;
    const ledgerString = `h 22 v 2 h-20 v-2 Z`;
    const bdNotes = notes.filter((note) => note.Beat === division.startNumber);
    bdNotes.sort((a, b) => {
        return a.Line - b.Line;
    });
    const highestLine = bdNotes[0];
    const lowestLine = bdNotes[bdNotes.length - 1];
    //10 and 22
    for (let l = 9; l >= highestLine.Line; l -= 2) {
        const ledgerY = (l * 5) + camera.y;
        const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
        context.fill(new Path2D(path));
    }
    for (let h = 21; h <= lowestLine.Line; h += 2) {
        const ledgerY = (h * 5) + camera.y;
        const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
        context.fill(new Path2D(path));
    }
}
export { RenderNote, RenderStem, RenderRest, renderLedgerLines };
