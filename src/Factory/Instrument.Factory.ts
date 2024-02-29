import { Instrument } from "../Core/Instrument";
import { Measure, MeasureProps } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";

const CreateDefaultPiano = (id: number): Instrument => {
  const defaultPiano: Instrument = {
    id: id,
    Position: {x: 0, y: 0}
  }

  return defaultPiano;
}

const CreateDefaultMeasure = (): Measure => {
  const props: MeasureProps = {
    ID: 0,
    Bounds: new Bounds(0, 0, 150, 150),
    TimeSignature: { top: 4, bottom: 4 },
    Notes: [],
    Divisions: [],
    RenderClef: true
  }
  return new Measure(props);
}

const CreateMeasure = (id: number, 
                    bounds: Bounds,
                    timeSignature: { top: number, bottom: number }): Measure =>
  {
    const props: MeasureProps = {
      ID: id,
      Bounds: bounds,
      TimeSignature: timeSignature,
      Notes: [],
      Divisions: [],
      RenderClef: false
    }
    return new Measure(props);
  }


export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure };
