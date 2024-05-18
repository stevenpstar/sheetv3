//const Key: Map<string, string[]> = new Map<string, string[]>([
//  ["amin", ""],
//  ["
//])
//

// Returns beats that should separate note groupings etc.
function ReturnBreakPoints(timeSig: { top: number, bottom: number }): number[] {
  const bPoints: number[] = [];
  const timeSigString = timeSig.top.toString() + "/" + timeSig.bottom.toString();
  switch (timeSigString) {
    case "4/4":
    default:
      bPoints.push(3);
  }
  return bPoints;
}
