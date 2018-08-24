import {BuildingTemplate} from "../../../src/templateinterfaces/BuildingTemplate";


export const commercialPort: BuildingTemplate =
{
  type: "commercialPort",
  displayName: "Commercial Spaceport",
  description: "Increase star income by 20",

  buildCost: 200,
  maxBuiltAtLocation: 1,

  getEffect: () =>
  {
    return(
    {
      income: {flat: 20},
    });
  },

};
export const deepSpaceRadar: BuildingTemplate =
{
  type: "deepSpaceRadar",
  displayName: "Deep Space Radar",
  description: "Increase star vision and detection radius by 1",

  buildCost: 200,

  maxBuiltAtLocation: 1,

  getEffect: () =>
  {
    return(
    {
      vision: {flat: 1},
      detection: {flat: 1},
    });
  },

};
export const resourceMine: BuildingTemplate =
{
  type: "resourceMine",
  displayName: "Mine",
  description: "Gathers 1 resource per turn from current star",

  buildCost: 500,

  maxBuiltAtLocation: 1,
  canBeBuiltInLocation: (star) =>
  {
    return Boolean(star.resource);
  },

  getEffect: () =>
  {
    return(
    {
      resourceIncome:
      {
        flat: 1,
      },
    });
  },
};
export const reserachLab: BuildingTemplate =
{
  type: "reserachLab",
  displayName: "Research Lab",
  description: "Increase research speed by 10",

  buildCost: 300,

  maxBuiltAtLocation: 1,

  getEffect: () =>
  {
    return(
    {
      researchPoints: {flat: 10},
    });
  },
};
export const thePyramids: BuildingTemplate =
{
  type: "thePyramids",
  displayName: "The Pyramids",
  description: "",

  onBuild: (star, player) =>
  {
    player.money += 1000;
  },

  buildCost: 0,

  maxBuiltAtLocation: 1,
  maxBuiltGlobally: 1,
};
