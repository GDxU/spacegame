import UnitTemplate from "../../../src/templateinterfaces/UnitTemplate";

import * as unitArchetypes from "../../defaultunits/unitArchetypes";
import defaultUnitDrawingFunction from "../../defaultunits/defaultUnitDrawingFunction";

import * as CommonAbility from "../../common/abilitytemplates/abilities";
import {distributionGroups} from "../../common/distributionGroups";

import * as DroneAbility from "../abilities";


export const droneSwarm: UnitTemplate =
{
  type: "droneSwarm",
  displayName: "Drone Swarm",
  description: "Swarm o drones",

  archetype: unitArchetypes.combat,
  sprite:
  {
    imageSrc: "img/placeholder.png",
    anchor: {x: 0.5, y: 0.5},
    attackOriginPoint: {x: 0.75, y: 0.5},
  },
  icon: "img/placeholder.png",
  unitDrawingFN: defaultUnitDrawingFunction,

  isSquadron: true,
  buildCost: 150,
  kind: "unit",

  maxHealthLevel: 0.6,
  maxMovePoints: 1,
  maxOffensiveBattlesPerTurn: 1,
  visionRange: 1,
  detectionRange: -1,
  attributeLevels:
  {
    attack: 0.6,
    defence: 0.4,
    intelligence: 0.4,
    speed: 0.6,
  },
  possibleAbilities:
  [
    {
      flatProbability: 1,
      probabilityItems:
      [
        DroneAbility.assimilate,
        CommonAbility.standBy,
      ],
    },
    {
      flatProbability: 0.25,
      probabilityItems: [DroneAbility.merge],
    },
  ],
  possibleLearnableAbilities:
  [
    {
      flatProbability: 1,
      probabilityItems: [DroneAbility.merge],
    },
  ],
  itemSlots: {},
  distributionData:
  {
    weight: 1,
    distributionGroups: [distributionGroups.common],
  },
};
