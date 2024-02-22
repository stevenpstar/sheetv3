var noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735';
function RenderNote(c, ctx, x, y, selected, colour) {
    if (colour === void 0) { colour = "black"; }
    var posString = 'm' + x.toString() + ' ' + (y - 1).toString();
    ctx.fillStyle = selected ? "blue" : colour;
    ctx.fill(new Path2D(posString + noteHead));
}
function RenderStem(ctx, notes, beatD) {
    var bdNotes = notes.filter(function (note) { return note.Beat === beatD.startNumber; });
    bdNotes.sort(function (a, b) {
        return a.Line - b.Line;
    });
    //  const yPos = (n.Line * (line_space / 2) + (line_space / 2));
    //  Stem Up (default/only for now)
    var yPos = (bdNotes[bdNotes.length - 1].Line * (10 / 2) + (10 / 2));
    var yPos2 = (bdNotes[0].Line * (10 / 2) + (10 / 2));
    var diff = (yPos - yPos2) + 40;
    ctx.fillStyle = "black";
    // TODO: investigate changing note-head size so that it doesn't end on half
    // pixel
    ctx.fillRect(Math.floor(beatD.bounds.x + 18 + 10), yPos - 5, 2, -diff);
    //  const stem = `M${beatD.bounds.x + 18 + 10} ${yPos - 5} h ${2} v -${diff} h -${2} Z`;
    //  ctx.fill(new Path2D(stem));
}
export { RenderNote, RenderStem };
