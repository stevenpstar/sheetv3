import { Instrument } from "../Core/Instrument";
import { Measure, MeasureProps } from "../Core/Measure.js";
import { Bounds } from "../Types/Bounds.js";

const CreateDefaultPiano = (): Instrument => {
  const defaultPiano: Instrument = {
    Position: {x: 0, y: 0}
  }

  return defaultPiano;
}

function CreateInstrument(y: number): Instrument {
  const instr: Instrument = {
    Position: { x: 0, y: y }
  }

  return instr;
}

const CreateDefaultMeasure = (instr: Instrument): Measure => {
  const props: MeasureProps = {
    Instrument: instr,
    Bounds: new Bounds(0, instr.Position.y, 150, 150),
    TimeSignature: { top: 4, bottom: 4 },
    Notes: [],
    Divisions: [],
    RenderClef: true,
    RenderTimeSig: true,
  }
  return new Measure(props);
}

const CreateMeasure = (instr: Instrument, 
                    bounds: Bounds,
                    timeSignature: { top: number, bottom: number },
                    renderClef: boolean = false): Measure =>
  {
    const props: MeasureProps = {
      Instrument: instr,
      Bounds: bounds,
      TimeSignature: timeSignature,
      Notes: [],
      Divisions: [],
      RenderClef: false,
      RenderTimeSig: false
    }
    return new Measure(props);
  }


export { CreateDefaultPiano, CreateDefaultMeasure, CreateMeasure, CreateInstrument };
