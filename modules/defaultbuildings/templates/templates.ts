import BuildingTemplate from "../../../src/templateinterfaces/BuildingTemplate";

import {makeDefensiveBuildingEffect} from "./makeDefensiveBuildingEffect";


export const sectorCommand: BuildingTemplate =
{
  type: "sectorCommand",
  category: "defence",
  family: "sectorCommand",
  displayName: "Sector Command",
  description: "Defence building with slight defender advantage. (All defence buildings must " +
    "be captured to gain control of area)",

  iconSrc: "sectorCommand.png",
  buildCost: 200,

  maxPerType: 1,

  maxUpgradeLevel: 1,

  upgradeInto:
  [
    {
      templateType: "sectorCommand1",
      level: 1,
    },
    {
      templateType: "sectorCommand2",
      level: 1,
    },
  ],
  battleEffects: [makeDefensiveBuildingEffect(0.2)],
};
export const sectorCommand1: BuildingTemplate =
{
  type: "sectorCommand1",
  category: "defence",
  family: "sectorCommand",
  displayName: "Sector Command1",
  description: "just testing upgrade paths",

  iconSrc: "sectorCommand.png",
  buildCost: 100,

  maxPerType: 1,

  maxUpgradeLevel: 1,
  upgradeOnly: true,
  battleEffects: [makeDefensiveBuildingEffect(0.3)],
};
export const sectorCommand2: BuildingTemplate =
{
  type: "sectorCommand2",
  category: "defence",
  family: "sectorCommand",
  displayName: "Sector Command2",
  description: "just testing upgrade paths",

  iconSrc: "sectorCommand.png",
  buildCost: 200,

  maxPerType: 1,

  maxUpgradeLevel: 1,
  upgradeOnly: true,
  battleEffects: [makeDefensiveBuildingEffect(0.3)],
};
export const starBase: BuildingTemplate =
{
  type: "starBase",
  category: "defence",
  displayName: "Starbase",
  description: "Defence building with no defender advantage. (All defence buildings must " +
    "be captured to gain control of area)",

  iconSrc: "starBase.png",
  buildCost: 200,

  maxPerType: 3,

  maxUpgradeLevel: 1,
  battleEffects: [makeDefensiveBuildingEffect(0.1)],
  upgradeInto:
  [
    {
      templateType: "sectorCommand",
      level: 1,
    },
  ],
};
export const commercialPort: BuildingTemplate =
{
  type: "commercialPort",
  category: "economy",
  displayName: "Commercial Spaceport",
  description: "Increase star income by 20",

  iconSrc: "commercialPort.png",
  buildCost: 200,

  maxPerType: 1,
  effect:
  {
    income:
    {
      flat: 20,
    },
  },

  maxUpgradeLevel: 4,
};
export const deepSpaceRadar: BuildingTemplate =
{
  type: "deepSpaceRadar",
  category: "vision",
  displayName: "Deep Space Radar",
  description: "Increase star vision and detection radius",

  iconSrc: "commercialPort.png",
  buildCost: 200,

  maxPerType: 1,
  effect:
  {
    vision: 1,
    detection: 0.999,
  },

  maxUpgradeLevel: 2,
};
export const resourceMine: BuildingTemplate =
{
  type: "resourceMine",
  category: "mine",
  displayName: "Mine",
  description: "Gathers resources from current star",

  iconSrc: "commercialPort.png",
  buildCost: 500,

  maxPerType: 1,
  effect:
  {
    resourceIncome:
    {
      flat: 1,
    },
  },

  maxUpgradeLevel: 3,
};
export const reserachLab: BuildingTemplate =
{
  type: "reserachLab",
  category: "research",
  displayName: "Research Lab",
  description: "Increase research speed",

  iconSrc: "commercialPort.png",
  buildCost: 300,

  maxPerType: 1,
  effect:
  {
    research:
    {
      flat: 10,
    },
  },

  maxUpgradeLevel: 3,
};