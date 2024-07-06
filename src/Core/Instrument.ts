interface HeightProps {
  aTop: number;
  aMid: number;
  aBot: number;
  aTopSave: number;
  aBotSave: number;
  aTopDef: number;
  aBotDef: number;
  bTop: number;
  bMid: number;
  bBot: number;
  bTopSave: number;
  bBotSave: number;
  bTopDef: number;
  bBotDef: number;
  bOffset: number;
}
enum StaffType {
  Single = 0,
  Grand,
  Rhythm
}
interface Instrument {
  Position: { x: number, y: number };
  Staff: StaffType;
//  HeightProps: HeightProps;
}

export { Instrument, StaffType };
