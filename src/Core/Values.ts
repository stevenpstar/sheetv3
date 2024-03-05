enum NoteValues {
  n32 = 0.03125,
  n16 = 0.0625,
  n8 = 0.125,
  n4 = 0.25,
  n2 = 0.5,
  n1 = 1
}

const ValueMap = new Map<number, number>([
  [1, NoteValues.n1],
  [0.5, NoteValues.n2],
  [0.25, NoteValues.n4],
  [0.125, NoteValues.n8],
  [0.0625, NoteValues.n16],
  [0.03125, NoteValues.n32],
]);

function GetLargestValues(duration: number): number[] {
  let remainingDiff = duration;
  let values: number[] = [];
  const divByStdVal = duration % NoteValues.n32 === 0;
  if (!divByStdVal) {
    console.error("Not divisible by standard value, not implemented");
  }
  // check if the duration matches a standard value perfectly
  if (ValueMap.has(duration)) {
    values.push(duration);
    remainingDiff -= duration;
    if (remainingDiff !== 0) { console.error("HUH?"); }
  }
  while (remainingDiff > 0) {
    for (let [key, val] of ValueMap) {
      if (ValueMap.get(key) <= remainingDiff) {
        values.push(ValueMap.get(key));
        remainingDiff -= ValueMap.get(key);
      }
    }
    // Emergency exit
    if (remainingDiff < NoteValues.n32) {
      remainingDiff = 0;
    }
  }

  return values;
}

export { NoteValues, GetLargestValues }
