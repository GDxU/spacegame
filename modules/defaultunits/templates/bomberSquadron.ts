import UnitTemplate from "../../../src/templateinterfaces/UnitTemplate";

import * as unitArchetypes from "../unitArchetypes";
import defaultUnitDrawingFunction from "../defaultUnitDrawingFunction";

import
{
  bombAttack,
  rangedAttack,
  standBy,
} from "../../common/abilitytemplates/abilities";
import {distributionGroups} from "../../common/distributionGroups";
import itemSlot from "../../common/itemSlot";


const bomberSquadron: UnitTemplate =
{
  type: "bomberSquadron",
  displayName: "Bomber Squadron",
  description: "Can damage multiple targets with special bomb attack",
  archetype: unitArchetypes.combat,
  sprite:
  {
    imageSrc: "bomber.png",
    anchor: {x: 0.5, y: 0.5},
    attackOriginPoint: {x: 0.75, y: 0.5},
  },
  isSquadron: true,
  buildCost: 200,
  kind: "unit",
  icon: "modules/defaultunits/img/icons/fb.png",
  maxHealthLevel: 0.5,
  maxMovePoints: 1,
  maxOffensiveBattlesPerTurn: 1,
  visionRange: 1,
  detectionRange: -1,
  attributeLevels:
  {
    attack: 0.7,
    defence: 0.4,
    intelligence: 0.5,
    speed: 0.8,
  },
  possibleAbilities:
  [
    {
      flatProbability: 1,
      probabilityItems:
      [
        rangedAttack,
        bombAttack,
        standBy,
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
      distributionGroups.common,
      distributionGroups.rare,
    ],
  },
};

export default bomberSquadron;
