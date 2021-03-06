import UnitTemplate from "../../../src/templateinterfaces/UnitTemplate";

import * as unitArchetypes from "../unitArchetypes";
import defaultUnitDrawingFunction from "../defaultUnitDrawingFunction";

import
{
  rangedAttack,
  standBy,
} from "../../common/abilitytemplates/abilities";
import {distributionGroups} from "../../common/distributionGroups";
import itemSlot from "../../common/itemSlot";

import
{
  initialGuard,
} from "../../common/passiveskilltemplates/passiveSkills";


const commandShip: UnitTemplate =
{
  type: "commandShip",
  displayName: "Command Ship",
  description: "todo",
  archetype: unitArchetypes.utility,
  sprite:
  {
    imageSrc: "shieldBoat.png",
    anchor: {x: 0.5, y: 0.5},
    attackOriginPoint: {x: 0.75, y: 0.5},
  },
  isSquadron: false,
  buildCost: 300,
  kind: "unit",
  icon: "modules/defaultunits/img/icons/sh.png",
  maxHealthLevel: 0.7,
  maxMovePoints: 1,
  maxOffensiveBattlesPerTurn: 1,
  visionRange: 1,
  detectionRange: -1,
  attributeLevels:
  {
    attack: 0.5,
    defence: 0.6,
    intelligence: 0.7,
    speed: 0.6,
  },
  possibleAbilities:
  [
    {
      flatProbability: 1,
      probabilityItems:
      [
        rangedAttack,
        standBy,
      ],
    },
  ],
  possiblePassiveSkills:
  [
    {
      flatProbability: 1,
      probabilityItems:
      [
        initialGuard,
      ],
    },
  ],
  itemSlots:
  {
    [itemSlot.low]: 1,
    [itemSlot.mid]: 1,
    [itemSlot.high]: 1,
  },
  unitDrawingFN: defaultUnitDrawingFunction,
  distributionData:
  {
    weight: 1,
    distributionGroups:
    [
      distributionGroups.rare,
      distributionGroups.unique,
    ],
  },
};

export default commandShip;
