enum NoteValues {
  n32 = 0.03125,
  n32d = n32 + (n32 / 2),
  n32dd = n32d + (n32 / 4),
  n32ddd = n32dd + (n32 / 8),
  n16 = 0.0625,
  n16d = n16 + (n16 / 2),
  n16dd = n16d + (n16 / 4),
  n16ddd = n16dd + (n16 / 8),
  n8 = 0.125,
  n8d = n8 + (n8 / 2),
  n8dd = n8d + (n8 / 4),
  n8ddd = n8dd + (n8 / 8),
  n4 = 0.25,
  n4d = n4 + (n4 / 2),
  n4dd = n4d + (n4 / 4),
  n4ddd = n4dd + (n4 / 8),
  n2 = 0.5,
  n2d = n2 + (n2 / 2),
  n2dd = n2d + (n2 / 4),
  n2ddd = n2dd + (n2 / 8),
  n1 = 1,
  n1d = n1 + (n1 / 2),
  n1dd = n1d + (n1 / 4),
  n1ddd = n1dd + (n1 / 8 )
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
