import { Beam } from "../Core/Beam.js";
import { DivGroup } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Stem } from "../Core/Stem.js";
import { Bounds } from "../Types/Bounds.js";

function CreateBeams(divGroup: DivGroup, stems: Stem[], measure: Measure): Beam[] {
  let beams: Beam[] = [];
  stems.sort((a: Stem, b: Stem) => a.Bounds.x - b.Bounds.x);
  
  // TODO: We will need to revisit this to fully implement beams, doing first
  // pass now.
  // beam 1
  const beamOne = new Beam(
    new Bounds(stems[0].Bounds.x, stems[0].Bounds.y + stems[0].Bounds.height, 5, 5),
    { x: stems[0].Bounds.x, y: stems[0].Bounds.y + stems[0].Bounds.height },
    { x: stems[stems.length-1].Bounds.x, y: stems[stems.length-1].Bounds.y + stems[stems.length-1].Bounds.height }
  )
  beams.push(beamOne);

  return beams;
}

export { CreateBeams }
