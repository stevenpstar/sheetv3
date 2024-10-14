declare function ReturnLineFromMidi(clef: string, midi: number, staff?: number): number;
declare function ReturnMidiNumber(clef: string, line: number, acc?: number, staff?: number): number;
type MappedMidi = {
    NoteString: string;
    Frequency: number;
    Line: number;
    Accidental: number;
};
declare function GeneratePitchMap(): Map<number, MappedMidi>;
declare function FromPitchMap(midiNote: number, map: Map<number, MappedMidi>, clef: string): MappedMidi;
export { GeneratePitchMap, ReturnMidiNumber, ReturnLineFromMidi, MappedMidi, FromPitchMap, };
//# sourceMappingURL=Pitcher.d.ts.map