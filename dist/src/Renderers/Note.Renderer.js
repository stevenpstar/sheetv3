const noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735';
const minimHead = 'm3.4871-7.6c-2.8881 1.8199-4.4271 5.1146-3.4804 7.593 1.0097 2.6437 4.4796 3.3897 7.7452 1.6654 3.2656-1.7244 5.0963-5.2694 4.0866-7.9131-1.0097-2.6437-4.4796-3.3897-7.7452-1.6654-.204.1077-.4136.1988-.6062.3201zm.9439 2.2422c.2051-.1244.4129-.218.6304-.3328 2.7838-1.47 5.4723-1.5391 6.0012-.1543.5289 1.3847-1.3011 3.7016-4.0849 5.1715-2.7838 1.47-5.4723 1.5391-6.0012.1543-.4876-1.2766 1.0334-3.3716 3.4545-4.8387z';
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
    switch (note.Duration) {
        case 0.25:
            noteString = posString + noteHead;
            break;
        case 0.5:
            noteString = posString + minimHead; //( + offsets)
            break;
        default:
            noteString = posString + noteHead;
    }
    context.fill(new Path2D(noteString));
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
    let diff = (yPos - yPos2) + 40;
    let xBuffer = 10;
    let startPos = yPos;
    if (!dirUp) {
        diff = -diff;
        xBuffer = 0;
        startPos = yPos2;
    }
    ctx.fillStyle = "black";
    // TODO: investigate changing note-head size so that it doesn't end on half
    // pixel
    ctx.fillRect(Math.floor(beatD.bounds.x + 18 + xBuffer) + cam.x, (startPos - 5) + cam.y, 2, -diff);
    //  const stem = `M${beatD.bounds.x + 18 + 10} ${yPos - 5} h ${2} v -${diff} h -${2} Z`;
    //  ctx.fill(new Path2D(stem));
}
export { RenderNote, RenderStem };
