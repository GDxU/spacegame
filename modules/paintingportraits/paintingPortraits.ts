import ModuleData from "../../src/ModuleData";
import ModuleFile from "../../src/ModuleFile";
import ModuleFileLoadingPhase from "../../src/ModuleFileLoadingPhase";

import {paintingPortraitTemplates} from "./paintingPortraitTemplates";

const paintingPortraits: ModuleFile =
{
  key: "paintingPortraits",
  metaData:
  {
    name: "Painting portraits",
    version: "0.1.0",
    author: "various artists",
    description: "old ppl",
  },
  needsToBeLoadedBefore: ModuleFileLoadingPhase.mapGen,
  constructModule: function(moduleData: ModuleData)
  {
    moduleData.copyTemplates(paintingPortraitTemplates, "Portraits");

    return moduleData;
  },
}

export default paintingPortraits;
