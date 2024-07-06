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
}
export { Instrument, StaffType };
//# sourceMappingURL=Instrument.d.ts.map