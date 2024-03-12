const KeySignatures: Map<string, string[]> = new Map<string, string[]>([
  ["CMaj/Amin", []],

  ["GMaj/Emin", ["F#"]],
  ["DMaj/Bmin", ["F#", "C#"]],
  ["AMaj/F#min", ["F#", "C#", "G#"]],
  ["EMaj/C#min", ["F#", "C#", "G#", "D#"]],
  ["BMaj/G#min", ["F#", "C#", "G#", "D#", "A#"]],
  ["F#Maj/D#min", ["F#", "C#", "G#", "D#", "A#", "E#"]],
  ["C#Maj/A#min", ["F#", "C#", "G#", "D#", "A#", "E#", "B#"]],

  ["FMaj/Dmin", ["Bb"]],
  ["BbMaj/Gmin", ["Bb", "Eb"]],
  ["EbMaj/Cmin", ["Bb", "Eb", "Ab"]],
  ["AbMaj/Fmin", ["Bb", "Eb", "Ab", "Db"]],
  ["DbMaj/Bbmin", ["Bb", "Eb", "Ab", "Db", "Gb"]],
  ["GbMaj/Ebmin", ["Bb", "Eb", "Ab", "Db", "Gb", "Cb"]],
  ["CbMaj/Abmin", ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"]],
]);

interface KeySignature {
  Name: string;
  Accidentals: string[]
}

export { KeySignature, KeySignatures }