enum StaffType {
  Single = 0,
  Grand
}
interface Instrument {
  Position: { x: number, y: number };
  Staff: StaffType
}

export { Instrument, StaffType };
