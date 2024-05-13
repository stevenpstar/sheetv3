// Music XML Import/Export
// This may be changed or separated from this project(?) in time
// This is a stub, no implementation

import { LoadStructure } from "./Loader.js";

// This should return a success/error etc.
function ExportToMusicXML(structure: LoadStructure): void {
  let xmlString = '';


  console.log(xmlString);
}

function ImportMusicXML(mxml: string): LoadStructure {
  const imported: LoadStructure = {
    Measures: []
  };

  return imported;
}

