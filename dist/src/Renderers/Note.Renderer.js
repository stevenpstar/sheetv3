var StemDirection;
(function (StemDirection) {
    StemDirection[StemDirection["Up"] = 0] = "Up";
    StemDirection[StemDirection["Down"] = 1] = "Down";
})(StemDirection || (StemDirection = {}));
;
var BeamDirection;
(function (BeamDirection) {
    BeamDirection[BeamDirection["Up"] = 0] = "Up";
    BeamDirection[BeamDirection["Down"] = 1] = "Down";
    BeamDirection[BeamDirection["Flat"] = 2] = "Flat";
})(BeamDirection || (BeamDirection = {}));
const noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735';
const minimHead = 'm3.4871-7.6c-2.8881 1.8199-4.4271 5.1146-3.4804 7.593 1.0097 2.6437 4.4796 3.3897 7.7452 1.6654 3.2656-1.7244 5.0963-5.2694 4.0866-7.9131-1.0097-2.6437-4.4796-3.3897-7.7452-1.6654-.204.1077-.4136.1988-.6062.3201zm.9439 2.2422c.2051-.1244.4129-.218.6304-.3328 2.7838-1.47 5.4723-1.5391 6.0012-.1543.5289 1.3847-1.3011 3.7016-4.0849 5.1715-2.7838 1.47-5.4723 1.5391-6.0012.1543-.4876-1.2766 1.0334-3.3716 3.4545-4.8387z';
const quaverRest = 'c-.2863.1212-.4577.5392-.326.8318.0397.0418.4556.5392.8736 1.0868.9551 1.0764 1.1182 1.3313 1.3292 1.8288.8339 1.7054.3762 3.877-1.0847 5.2501-.1233.163-.6625.6186-1.1683.9948-1.4525 1.2498-2.1214 1.9604-2.368 2.5874-.0899.1651-.0899.3281-.0899.581-.0397.5789 0 .6291 1.7159 2.6209 2.3262 2.7922 3.9919 4.7506 4.1215 4.8739l.1233.1212-.163-.0815c-2.2948-.9551-4.8739-1.4128-5.7475-.9948-.2947.1212-.4661.2926-.5873.5789-.3365.7106-.2466 1.7556.2529 3.2897.4556 1.3794 1.371 3.2082 2.2844 4.5813.3762.5873 1.0868 1.5006 1.1683 1.5424.1233.1233.2947.0815.4159 0 .1233-.163.1233-.2947-.1212-.5789-.8736-1.2498-1.2895-3.8372-.7921-5.2104.2027-.6186.4577-.9551.9133-1.1662 1.208-.5392 3.879.1296 4.9972 1.2477.0815.0836.2529.255.3344.2947.2947.1233.7106-.0397.8339-.3344.1714-.2947.0815-.4974-.2947-.9551-.7022-.8339-2.8257-3.3315-3.1183-3.7077-.7524-.8736-1.0868-1.7054-1.1683-2.7504-.0397-1.3313.4974-2.7421 1.5027-3.6659.1212-.163.6604-.6207 1.16-.9948 1.5424-1.2916 2.1715-2.0001 2.416-2.671.1714-.5392.0899-1.0366-.2863-1.4943-.1296-.1212-1.5842-1.9186-3.2897-3.9585-2.3345-2.7442-3.1684-3.7474-3.2897-3.7892-.1714-.0397-.3762-.0397-.5476.0418z';
const quaverFlag = 'c11.7122 2.9669 6.3069 13.252 5.2534 16.885 9.622-13.142-5.1221-18.5026-5.2534-26.47z';
const quaverFlagInverted = 'c10.7362-2.7197 5.7813-12.1477 4.8156-15.4779 8.8202 12.0469-4.6953 16.9607-4.8156 24.2642z';
// TODO: This is because we are using temporary SVG files for rendering, will need to
// create custom SVGs so our note heads are consistent (but we can do that much later in dev)
const mHeadXOffset = 3.4871;
const mHeadYOffset = -7.6;
// TODO: Re-work this function a bit, so many parameters and the note itself
// isn't even being passed in?
function RenderNote(note, renderProps, Bounds, selected, colour = "black") {
    const { x, y, width, height } = Bounds;
    const { canvas, context, camera } = renderProps;
    const posString = 'm' + x.toString() + ' ' + (y - 1).toString();
    let noteString = '';
    let flagString = '';
    switch (note.Duration) {
        case 0.125:
            noteString = posString + noteHead;
            //      context.fill(new Path2D(flagString));
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
    let x = div.Bounds.x + cam.x + 18;
    let y = div.Bounds.y + cam.y + (12 * 5);
    let path = `m${x} ${y}`;
    ctx.fillStyle = "black";
    switch (div.Duration) {
        case 0.25:
            path = path + quaverRest;
            ctx.fill(new Path2D(path));
            break;
        case 0.5:
            y = div.Bounds.y + cam.y + (15 * 5) - 6;
            ctx.fillRect(x, y, 14, 6);
            break;
        case 1:
            y = div.Bounds.y + cam.y + (13 * 5);
            x = div.Bounds.x + cam.x + (div.Bounds.width / 2) - 7;
            ctx.fillRect(x, y, 14, 6);
            break;
        default:
            path = path + quaverRest;
            ctx.fill(new Path2D(path));
    }
}
function RenderStemRevise(renderProps, notes, divisions) {
    // Check that divisions and note arrays match
    let match = true;
    divisions.forEach((div, i) => {
        if (div.Beat !== notes[i][0].Beat) {
            match = false;
        }
    });
    if (!match) {
        console.error("Divisions and note array do not match");
        return;
    }
    const { canvas, context, camera } = renderProps;
    let highestLine = Number.MAX_SAFE_INTEGER;
    let lowestLine = Number.MIN_SAFE_INTEGER;
    let stemDirection = StemDirection.Up;
    let stemToMidLine = false;
    let beamDirection = BeamDirection.Flat;
    let stemEndY = 0; // end y position of stem
    let beamStartX = 0;
    let beamEndX = 0;
    const middleLine = 15; // TODO: Magiccccc (number should be removed)
    const midStemThreshHold = 7;
    const lineHeight = 5;
    // Highest line has a lower number (lines start at 0 from the top 
    // of the measure and go down
    notes.forEach((na) => {
        na.forEach((n) => {
            if (n.Line < highestLine) {
                highestLine = n.Line;
            }
            if (n.Line > lowestLine) {
                lowestLine = n.Line;
            }
        });
    });
    // TODO: Beam Direction
    if (middleLine - highestLine < lowestLine - middleLine) {
        stemDirection = StemDirection.Up;
        stemEndY = divisions[0].Bounds.y + (highestLine * lineHeight) - 35 + camera.y;
        if (highestLine >= middleLine + midStemThreshHold) {
            stemToMidLine = true;
            stemEndY = divisions[0].Bounds.y + (middleLine * lineHeight) + camera.y;
        }
    }
    else {
        stemDirection = StemDirection.Down;
        stemEndY = divisions[0].Bounds.y + (lowestLine * lineHeight) + 35 + camera.y;
        if (lowestLine <= middleLine - midStemThreshHold) {
            stemToMidLine = true;
            stemEndY = divisions[0].Bounds.y + (middleLine * lineHeight) + camera.y;
        }
    }
    // Render stems
    divisions.forEach((div, i) => {
        const xBuffer = stemDirection === StemDirection.Up ? 10 : 0;
        const stemX = Math.floor(div.Bounds.x + xBuffer + camera.x + 18);
        if (i === 0) {
            beamStartX = stemX;
        }
        else if (i === divisions.length - 1) {
            beamEndX = stemX;
            if (stemDirection === StemDirection.Down) {
                // beam end x position needs to account for the stem thickness
                beamEndX += 2;
            }
        }
        const sortedNotes = notes[i].sort((a, b) => {
            return a.Line - b.Line;
        });
        const highLine = sortedNotes[0].Line;
        const lowLine = sortedNotes[sortedNotes.length - 1].Line;
        const startPos = (stemDirection === StemDirection.Up) ?
            div.Bounds.y + (lowLine * lineHeight) + camera.y :
            div.Bounds.y + (highLine * lineHeight) + camera.y;
        const diff = stemEndY - startPos;
        context.fillStyle = "black";
        context.fillRect(stemX, (startPos), 2, diff);
        if (divisions.length === 1 && divisions[0].Duration < 0.25) {
            const flagLoop = GetFlagCount(div.Duration);
            if (stemDirection === StemDirection.Up) {
                for (let i = 0; i < flagLoop; i++) {
                    let flagString = `m${stemX} ${stemEndY + (i * 8)}`; // + quaverFlag; // rough testing for flag
                    context.fill(new Path2D(flagString + quaverFlag));
                }
            }
            else {
                for (let i = 0; i < flagLoop; i++) {
                    let flagString = `m${stemX} ${stemEndY - (i * 8)}`; // + quaverFlag; // rough testing for flag
                    context.fill(new Path2D(flagString + quaverFlagInverted));
                }
            }
        }
    });
    // Render straight beam only for now
    if (beamDirection === BeamDirection.Flat && divisions.length > 1) {
        context.fillStyle = "black";
        const yBuffer = (stemDirection === StemDirection.Up) ?
            0 : -5;
        context.fillRect(beamStartX, stemEndY + yBuffer, beamEndX - beamStartX, 5);
    }
}
function GetFlagCount(value) {
    let count = 1;
    switch (value) {
        case 0.03125:
            count = 3;
            break;
        case 0.0625:
            count = 2;
            break;
        default:
    }
    return count;
}
function RenderStem(ctx, notes, div, cam) {
    const bdNotes = notes.filter((note) => note.Beat === div.Beat);
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
    const flagPosX = (Math.floor(div.Bounds.x + 18 + xBuffer) + cam.x);
    const flagPosY = (startPos - 5) + cam.y + -diff;
    ctx.fillStyle = "black";
    // TODO: investigate changing note-head size so that it doesn't end on half
    // pixel
    ctx.fillRect(Math.floor(div.Bounds.x + 18 + xBuffer) + cam.x, (startPos - 5) + cam.y, 2, -diff);
    // render flags
    if (div.Duration < 0.25) {
        const flagString = `m${flagPosX} ${flagPosY}`; // + quaverFlag; // rough testing for flag
        if (dirUp) {
            ctx.fill(new Path2D(flagString + quaverFlag));
        }
        else {
            ctx.fill(new Path2D(flagString + quaverFlagInverted));
        }
    }
    //  const stem = `M${beatD.Bounds.x + 18 + 10} ${yPos - 5} h ${2} v -${diff} h -${2} Z`;
    //  ctx.fill(new Path2D(stem));
}
function renderLedgerLines(notes, division, renderProps) {
    const { canvas, context, camera } = renderProps;
    const ledgerX = (division.Bounds.x + 18) - 6 + camera.x;
    //const ledgerString = `m ${x - 6} ${y - 5} h 22 v 2 h-20 v-2 Z`;
    const ledgerString = `h 22 v 2 h-20 v-2 Z`;
    const bdNotes = notes.filter((note) => note.Beat === division.Beat);
    bdNotes.sort((a, b) => {
        return a.Line - b.Line;
    });
    const highestLine = bdNotes[0];
    const lowestLine = bdNotes[bdNotes.length - 1];
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
export { RenderNote, RenderStem, RenderRest, renderLedgerLines, RenderStemRevise };
