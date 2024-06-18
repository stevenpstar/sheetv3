declare function ReturnLineFromMidi(clef: string, midi: number, staff?: number): number;
declare function ReturnMidiNumber(clef: string, line: number, staff?: number): number;
type MappedMidi = {
    NoteString: string;
    Frequency: number;
    Line: number;
};
declare function GeneratePitchMap(): Map<number, MappedMidi>;
export { GeneratePitchMap, ReturnMidiNumber, ReturnLineFromMidi, MappedMidi };
//# sourceMappingURL=Pitcher.d.ts.map