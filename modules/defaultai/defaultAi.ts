import {englishLanguage} from "../englishlanguage/englishLanguage";
import ModuleFile from "../../src/ModuleFile";
import ModuleFileLoadingPhase from "../../src/ModuleFileLoadingPhase";
import AiTemplateConstructor from "../../src/templateinterfaces/AITemplateConstructor";

import defaultAiConstructor from "./mapai/DefaultAiConstructor";


const defaultAi: ModuleFile =
{
  metaData:
  {
    key: "defaultAi",
    version: "0.1.0",
    author: "giraluna",
    description: "",
  },
  needsToBeLoadedBefore: ModuleFileLoadingPhase.Game,
  supportedLanguages: [englishLanguage],
  constructModule: (moduleData) =>
  {
    moduleData.copyTemplates<AiTemplateConstructor<any>>(
    {
      [defaultAiConstructor.type]: defaultAiConstructor,
    }, "AiTemplateConstructors");

    return moduleData;
  },
};

export default defaultAi;
