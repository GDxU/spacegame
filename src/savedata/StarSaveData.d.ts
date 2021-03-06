import BuildingSaveData from "./BuildingSaveData";
import ManufactorySaveData from "./ManufactorySaveData";

declare interface StarSaveData
{
  id: number;
  x: number;
  y: number;

  baseIncome: number;
  name: string;
  ownerId: number;
  linksToIds: number[];
  linksFromIds: number[];
  seed: string;

  resourceType?: string;
  manufactory?: ManufactorySaveData;

  buildings: BuildingSaveData[];

  raceType: string;
  terrainType: string;
}

export default StarSaveData;
