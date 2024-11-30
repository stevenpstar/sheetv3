import { Beam } from "../Core/Beam.js";
import { DivGroup, Division } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Stem } from "../Core/Stem.js";
import { Bounds } from "../Types/Bounds.js";
import { Vector2 } from "../Types/Vectors.js";

function CreateBeams(
  divGroup: DivGroup,
  stems: Stem[],
  measure: Measure,
): Beam[] {
  let beams: Beam[] = [];
  stems.sort((a: Stem, b: Stem) => a.Bounds.x - b.Bounds.x);

  // Primary Beam (top/main)
  const beamOne = new Beam(
    new Bounds(
      stems[0].Bounds.x,
      stems[0].Bounds.y + stems[0].Bounds.height,
      5,
      5,
    ),
    { x: stems[0].Bounds.x, y: stems[0].Bounds.y + stems[0].Bounds.height },
    {
      x: stems[stems.length - 1].Bounds.x,
      y:
        stems[stems.length - 1].Bounds.y +
        stems[stems.length - 1].Bounds.height,
    },
  );
  beams.push(beamOne);

  //for divGroup.Divisions

  return beams;
}

function CreateBeamsRevise(divGroup: DivGroup, stems: Stem[]): Array<Beam> {
  const beams: Array<Beam> = [];
  let newBeam = true;
  let tempBeam: Beam = null;
  divGroup.Divisions.forEach((div: Division, i: number) => {
    if (i > stems.length) {
      return;
    }
    const startingStem: Stem = i == 0 ? stems[i] : stems[i - 1];
    const stem: Stem = stems[i];
    if (!newBeam) {
      if (
        Beam.BeamCount(div.Duration, false) !== beams[beams.length - 1].Count
      ) {
        newBeam = true;
      }
    }
    if (newBeam) {
      const count = Beam.BeamCount(div.Duration, false);
      tempBeam = new Beam(
        new Bounds(0, 0, 0, 0),
        {
          x: startingStem.Bounds.x,
          y: startingStem.Bounds.y + startingStem.Bounds.height,
        },
        { x: stem.Bounds.x, y: stem.Bounds.y + stem.Bounds.height },
        count,
      );
      beams.push(tempBeam);
      newBeam = false;
    } else {
      tempBeam.EndPoint = {
        x: stem.Bounds.x,
        y: stem.Bounds.y + stem.Bounds.height,
      };
    }
  });

  return beams;
}

export { CreateBeams, CreateBeamsRevise };
