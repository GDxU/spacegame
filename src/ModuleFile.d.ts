import ModuleData from "./ModuleData";
import ModuleFileLoadingPhase from "./ModuleFileLoadingPhase";

import {Language} from "./localization/Language";


export interface ModuleMetaData
{
  key: string;
  version: string;
  author?: string;
  description?: string;
}

export interface ModuleFileSaveData<S = any>
{
  metaData: ModuleMetaData;
  moduleSaveData: S;
}

declare interface ModuleFile<S = any>
{
  metaData: ModuleMetaData;
  needsToBeLoadedBefore: ModuleFileLoadingPhase;
  supportedLanguages: Language[] | "all";
  loadAssets?: (callback: () => void) => void;
  constructModule?: (moduleData: ModuleData) => void;
  serialize?: () => S;
  deserialize?: (saveData: S) => void;
}

export default ModuleFile;
