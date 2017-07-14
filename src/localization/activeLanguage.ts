import {activeModuleData} from "../activeModuleData";

import {Language} from "./Language";
import {getLanguagesByCode} from "./languageSupport";


let activeLanguageCode: string;

export function getActiveLanguage(): Language
{
  const languagesByCode = getLanguagesByCode(...activeModuleData.moduleFiles);

  if (!languagesByCode[activeLanguageCode])
  {
    throw new Error(`Language '${activeLanguageCode}' is not supported by any module files. ` +
      `Supported languages: ${Object.keys(languagesByCode).join(", ")}`);
  }
  else
  {
    return languagesByCode[activeLanguageCode];
  }
}
export function setActiveLanguageCode(languageCode: string): void
{
  if (languageCode === activeLanguageCode)
  {
    return;
  }

  activeLanguageCode = languageCode;
}
