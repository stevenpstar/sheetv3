import { Articulation } from "../Core/Articulation.js";
import { Beam } from "../Core/Beam.js";
import { DivGroup, IsRestOnBeat } from "../Core/Division.js";

import { StaffType } from "../Core/Instrument.js";
import { KeySignatures } from "../Core/KeySignatures.js";
import { Clef, Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { RenderMeasureLines, RenderStaffLines, Staff } from "../Core/Staff.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { ReturnAccidentalOffset } from "../Workers/Accidentaler.js";
import { ConfigSettings, Theme } from "../entry.js";
import { RenderAccidental } from "./Accidentals.Renderer.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { RenderMeasureRev } from "./Measure.RendererRev.js";
import {
  DetermineStemDirection,
  RenderDots,
  RenderNote,
  RenderRest,
  RenderTies,
  RenderTuplets,
  StemDirection,
  renderLedgerLines,
} from "./Note.Renderer.js";

const noteXBuffer = 9;

function RenderMeasure(
  measure: Measure,
  renderProps: RenderProperties,
  mousePos: { x: number; y: number },
  lastMeasure: boolean,
  noteInput: boolean,
  index: number,
  restInput: boolean,
  noteValue: number,
  config: ConfigSettings,
) {
  //    if (hovId === measure.ID)
  RenderHovered(
    measure,
    renderProps,
    mousePos,
    noteInput,
    restInput,
    noteValue,
    config.Theme,
  );
  //    if (debug)
  // RenderDebug(measure, renderProps, index, mousePos);
  //RenderMeasureBase(measure, renderProps, mousePos, lastMeasure, config.Theme);
  RenderMeasureRev(measure, renderProps, config.Theme);
  measure.Staves.forEach((s: Staff) => {
    RenderNotes(measure, renderProps, s.Num, config.Theme);
    // TODO: Temporary for testing dynamics rendering
    measure.Voices[measure.ActiveVoice].Divisions.filter(
      (div: Division) => div.Staff === s.Num && div.Beat === 1,
    ).forEach((div: Division) => {
      //      const tempDyn: Dynamic = new Dynamic("ppppp", div.Staff, div.Beat);
      //RenderDynamic(renderProps, measure, tempDyn, config.Theme);
      measure.Articulations.filter(
        (a: Articulation) => a.Beat == div.Beat && a.Staff == div.Staff,
      ).forEach((a: Articulation) => {
        a.Render(
          renderProps,
          measure.Voices[measure.ActiveVoice].Notes.filter(
            (n: Note) => n.Beat == div.Beat && n.Staff == div.Staff,
          ),
          measure.Staves,
          div,
          config.Theme,
        );
      });

      renderProps.context.fillStyle = `rgba(0, 0, 0, ${1.0})`;
      renderProps.context.font = `${12}px Bravura`;
      renderProps.context.fillText(
        measure.Num.toString(),
        measure.Bounds.x + 8 + renderProps.camera.x - 8,
        measure.Bounds.y + 10 + renderProps.camera.y,
      );
    });
  });
}

// TODO: move this function elsewhere
function MiddleLineBounds(measure: Measure): Bounds {
  // Temporary
  // This is really bad TODO: Remove this method
  if (measure.Staves.length === 0) {
    return new Bounds(0, 0, 0, 0);
  }
  let b = new Bounds(
    measure.Bounds.x,
    0,
    measure.GetBoundsWithOffset().width,
    5,
  );
  let actualLine = 15; // middle line number
  const diff = actualLine - measure.Staves[0].BotLine;
  b.y = measure.Bounds.y + measure.GetMeasureHeight() + (diff * 5 - 2.5);
  return b;
}

function RenderHovered(
  measure: Measure,
  renderProps: RenderProperties,
  mousePos: { x: number; y: number },
  noteInput: boolean,
  restInput: boolean,
  noteValue: number,
  theme: Theme,
) {
  const { context, camera } = renderProps;

  if (noteInput) {
    // context.fillStyle = "rgb(0, 0, 255, 0.1)";
    // const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
    // context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
  }
  // now we are going to test "Sections" as they were in v2
  const divisions = measure.Voices[measure.ActiveVoice].Divisions;
  divisions.forEach((s) => {
    if (s.Bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
      let line = measure.GetLineHovered(mousePos.y, s.Staff);
      if (measure.Instrument.Staff === StaffType.Rhythm) {
        line.num = 15;
        line.bounds = MiddleLineBounds(measure);
      }
      line.bounds.y = measure.GetNotePositionOnLine(line.num, s.Staff);
      // context.fillStyle="rgb(0, 0, 255, 0.1)";
      // context.fillRect(s.Bounds.x + camera.x,
      //                  s.Bounds.y + camera.y,
      //                  s.Bounds.width,
      //                  s.Bounds.height);

      if (noteInput) {
        // temp note
        const tempNoteProps = {
          Beat: s.Beat,
          Duration: noteValue,
          Line: line.num,
          Rest: restInput,
          Tied: false,
          Staff: s.Staff,
          Tuple: false,
          TupleIndex: 0,
          TupleCount: 1,
          Clef: "treble",
          Grace: false,
        };
        const tempNote = new Note(tempNoteProps);
        if (!restInput) {
          RenderNote(
            tempNote,
            renderProps,
            new Bounds(s.Bounds.x + noteXBuffer, line.bounds.y, 0, 0),
            true,
            false,
            StemDirection.Up,
            theme,
          );
          // RenderStemRevise(
          //   renderProps,
          //   [[tempNote]],
          //   [s],
          //   s.Staff,
          //   measure,
          //   BeamDirection.Flat,
          //   theme);

          renderLedgerLines(
            [tempNote],
            s,
            renderProps,
            s.Staff,
            measure,
            theme,
          );
        } else {
          RenderRest(
            renderProps.context,
            s,
            renderProps.camera,
            tempNote,
            measure,
            theme,
          );
        }
      }
    }
  });
}

// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(
  msr: Measure,
  renderProps: RenderProperties,
  mousePos: { x: number; y: number },
  lastMeasure: boolean,
  theme: Theme,
): void {
  const { context, camera } = renderProps;

  // prob move elsewhere I don't know
  if (msr.Selected) {
    context.fillStyle = theme.SelectColour;
    context.fillRect(
      msr.Bounds.x + camera.x,
      msr.Bounds.y + camera.y,
      msr.Bounds.width + msr.XOffset,
      msr.Bounds.height,
    );
  }
  context.fillStyle = theme.NoteElements;
  RenderMeasureLines(renderProps, msr, lastMeasure, theme);
  msr.Staves.forEach((s: Staff) => {
    RenderStaffLines(renderProps, msr, s);
  });

  if (msr.RenderClef) {
    RenderMeasureClef(renderProps, msr, theme);
  }
  if (msr.RenderKey) {
    let key = msr.KeySignature; //"CMaj/Amin";
    if (key === undefined) {
      key = "CMaj/Amin";
      msr.RenderKey = false;
      console.error("Measure Key Signature is undefined");
    }
    if (key !== "CMaj/Amin") {
      const xOff = msr.RenderClef ? 34 : 4;
      msr.Staves.forEach((s: Staff) => {
        RenderKeySignature(
          renderProps,
          msr,
          key,
          msr.Clefs[0].Type,
          xOff,
          theme,
          s.Num,
        );
      });
    } else {
      msr.RenderKey = false;
      // This is a temporary fix for dev
    }
  }
  if (msr.RenderTimeSig) {
    let xOff = msr.RenderClef ? 36 : 4;
    if (msr.RenderKey && msr.KeySignature !== "CMaj/Amin") {
      xOff += KeySignatures.get(msr.KeySignature).length * 10;
    }
    RenderTimeSig(renderProps, msr, theme);
  }
}

function RenderMeasureClef(
  renderProps: RenderProperties,
  msr: Measure,
  theme: Theme,
): void {
  // TODO: Rewrite clef rendering code

  msr.Clefs.forEach((clef: Clef) => {
    if (clef.Beat === 1) {
      clef.render(renderProps, theme);
    } else {
      const div = msr.Voices[msr.ActiveVoice].Divisions.find(
        (d) => d.Beat === clef.Beat,
      );
      if (clef.Type === "treble") {
        // const clefPath = RenderTrebleClef(
        //     div.Bounds.x + camera.x,
        //     msr.Bounds.y + camera.y + (5 * msrMidLine + (line_space * 2)));
        //   context.fill(new Path2D(clefPath));
      } else if (clef.Type === "bass") {
      }
    }
  });
}

function RenderTimeSig(
  renderProps: RenderProperties,
  msr: Measure,
  theme: Theme,
): void {
  msr.TimeSignature.render(renderProps, msr, theme);
}

function RenderNotes(
  msr: Measure,
  renderProps: RenderProperties,
  staff: number,
  theme: Theme,
) {
  const { context, camera } = renderProps;
  const mDivs = msr.Voices[msr.ActiveVoice].Divisions.filter(
    (d) => d.Staff === staff,
  );
  mDivs.forEach((div: Division) => {
    const divNotes = msr.Voices[msr.ActiveVoice].Notes.filter(
      (note: Note) => note.Beat === div.Beat && note.Staff === div.Staff,
    );
    divNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    if (IsRestOnBeat(div.Beat, divNotes, div.Staff)) {
      RenderRest(context, div, camera, divNotes[0], msr, theme);
      return;
    }
    renderLedgerLines(
      msr.Voices[msr.ActiveVoice].Notes,
      div,
      renderProps,
      staff,
      msr,
      theme,
    );
  });

  msr.Voices[msr.ActiveVoice].DivisionGroups.forEach((group: DivGroup) => {
    if (group.Divisions.length > 0) {
      const stemDir = DetermineStemDirection(group.Notes, group.Divisions);

      if (!group.StemDir) {
        // Just in case this has failed to be set
        group.StemDir = stemDir;
      }
      let tuplet = group.Notes[0][0].Tuple;
      group.Stems.forEach((s) => {
        s.Render(context, camera, theme);
        //        s.RenderBounds(context, camera);
      });
      group.Beams.forEach((b) => {
        b.Render(
          context,
          camera,
          Beam.BeamCount(group.Divisions[0].Duration, tuplet),
          group.StemDir,
          theme,
        );
      });

      group.Divisions.forEach((div) => {
        let hasFlipped = false;

        const dN = msr.Voices[msr.ActiveVoice].Notes.filter(
          (note: Note) =>
            note.Beat === div.Beat && note.Staff === staff && !note.Grace,
        );
        dN.sort((a: Note, b: Note) => {
          return a.Line - b.Line;
        });

        dN.forEach((n: Note, i: number) => {
          const isFlipped = IsFlippedNote(dN, i, stemDir);
          if (isFlipped) {
            hasFlipped = true;
          }
          let flipNoteOffset = isFlipped
            ? stemDir === StemDirection.Up
              ? 11
              : -11
            : 0;

          if (n.Rest) {
            RenderRest(context, div, camera, n, msr, theme);
          } else {
            RenderNote(
              n,
              renderProps,
              n.Bounds,
              n.Selected,
              isFlipped,
              stemDir,
              theme,
            );

            const accNotes = dN.filter((n) => n.Accidental !== 0);
            accNotes.sort((a: Note, b: Note) => {
              return a.Line - b.Line;
            });
            const offsets = ReturnAccidentalOffset(accNotes);
            accNotes.forEach((n: Note, i: number) => {
              RenderAccidental(renderProps, n, n.Accidental, offsets[i], theme);
            });
          }
        });
        // render dots
        dN.forEach((n: Note) => {
          let flipNoteOffset = hasFlipped
            ? stemDir === StemDirection.Up
              ? 11
              : 0
            : 0;
          RenderDots(
            renderProps,
            n,
            div.Bounds.x + noteXBuffer + flipNoteOffset,
          );
        });
      });
    }
  });
  RenderGraceNotes(renderProps, msr, theme);
  RenderTies(
    renderProps,
    msr.Voices[msr.ActiveVoice].Divisions,
    msr.Voices[msr.ActiveVoice].Notes,
    StaffType.Single,
    msr,
  );
  RenderTuplets(
    renderProps,
    msr.Voices[msr.ActiveVoice].Divisions,
    msr.Voices[msr.ActiveVoice].Notes,
    StaffType.Single,
    msr,
    theme,
  );

  if (msr.Instrument.Staff === StaffType.Grand) {
    RenderTies(
      renderProps,
      msr.Voices[msr.ActiveVoice].Divisions,
      msr.Voices[msr.ActiveVoice].Notes,
      StaffType.Grand,
      msr,
    );
    RenderTuplets(
      renderProps,
      msr.Voices[msr.ActiveVoice].Divisions,
      msr.Voices[msr.ActiveVoice].Notes,
      StaffType.Grand,
      msr,
      theme,
    );
  }
}

function RenderGraceNotes(
  renderProps: RenderProperties,
  msr: Measure,
  theme: Theme,
): void {
  msr.Voices[msr.ActiveVoice].Notes.filter((n: Note) => n.Grace).forEach(
    (n: Note) => {
      RenderNote(
        n,
        renderProps,
        n.Bounds,
        n.Selected,
        false,
        StemDirection.Up,
        theme,
      );
    },
  );
}

function IsFlippedNote(
  notes: Note[],
  index: number,
  dir: StemDirection,
): boolean {
  let flipped = false;
  let countAbove = 0;
  let countBelow = 0;
  const nLine = notes[index].Line;
  if (notes.length <= 1) {
    return false;
  }

  for (let b = index + 1; b <= notes.length - 1; b++) {
    // ignore grace notes?
    if (notes[b].Grace) {
      continue;
    }
    const line = notes[b].Line;
    if (line - nLine === b - index || line - nLine === index - index) {
      countBelow++;
    } else {
      break;
    }
  }

  for (let a = index - 1; a >= 0; a--) {
    if (notes[a].Grace) {
      continue;
    }

    const line = notes[a].Line;
    if (nLine - line === index - a || nLine - line === index - index) {
      countAbove++;
    } else {
      break;
    }
  }

  const totalCount = countAbove + countBelow + 1;
  const notePos = countAbove + 1;
  if (totalCount % 2 === 0) {
    flipped = dir === StemDirection.Up ? notePos % 2 !== 0 : notePos % 2 === 0;
  } else {
    flipped = notePos % 2 === 0;
  }

  return flipped;
}

interface NoteGroup {
  startBeat: number;
  endBeat: number;
}

function GetNoteGroups(msr: Measure): NoteGroup[] {
  let startBeat = -1;
  let endBeat = -1;
  const noteGroups = [];

  return noteGroups;
}

export { RenderMeasure, IsFlippedNote };
