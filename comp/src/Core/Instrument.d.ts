import { Staff } from "./Staff";
declare enum StaffType {
    Single = 0,
    Grand = 1,
    Rhythm = 2
}
interface Instrument {
    Position: {
        x: number;
        y: number;
    };
    Staff: StaffType;
    Staves: Staff[];
}
export { Instrument, StaffType };
//# sourceMappingURL=Instrument.d.ts.map