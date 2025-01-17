import { Beam } from "../Core/Beam.js";
import { DivGroup } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Stem } from "../Core/Stem.js";
declare function CreateBeams(divGroup: DivGroup, stems: Stem[], measure: Measure): Beam[];
declare function CreateBeamsRevise(divGroup: DivGroup, stems: Stem[], tuplet: boolean): Array<Beam>;
export { CreateBeams, CreateBeamsRevise };
//# sourceMappingURL=Beam.Fact.d.ts.map