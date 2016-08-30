import MapEvaluator from "../mapai/MapEvaluator";
import Objective from "../mapai/Objective";

import ObjectiveTemplate from "./common/ObjectiveTemplate";

import Unit from "../../../src/Unit";

import moveTo from "./common/moveroutines/moveTo";
import movePriority from "./common/movePriority";
import
{
  scoutingUnitDesireFN,
  scoutingUnitFitFN,
  perimeterObjectiveCreation
} from "../aiUtils";

const scoutingPerimeter: ObjectiveTemplate =
{
  key: "scoutingPerimeter",
  movePriority: movePriority.scoutingPerimeter,
  preferredUnitComposition:
  {
    scouting: 1
  },
  moveRoutineFN: moveTo,
  unitDesireFN: scoutingUnitDesireFN,
  unitFitFN: scoutingUnitFitFN,
  creatorFunction: null,
  unitsToFillObjectiveFN: function(mapEvaluator: MapEvaluator, objective: Objective)
  {
    return {min: 1, ideal: 1};
  }
}

scoutingPerimeter.creatorFunction = perimeterObjectiveCreation.bind(null, scoutingPerimeter, true, 0.3);

export default scoutingPerimeter;
