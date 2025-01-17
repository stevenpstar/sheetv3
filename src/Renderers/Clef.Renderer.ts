import { Clef, Measure } from "../Core/Measure.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";

function RenderClef(
  renderProps: RenderProperties,
  clef: Clef,
  theme: Theme,
): void {
  // Only rendering for clefs at start of measure at this moment
  // Will require more here when that is fixed
  clef.render(renderProps, theme);
}

export { RenderClef };
