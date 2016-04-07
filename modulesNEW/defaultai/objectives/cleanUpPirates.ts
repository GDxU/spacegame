import GrandStrategyAI from "../../../src/mapai/GrandStrategyAI.ts";
import MapEvaluator from "../../../src/mapai/MapEvaluator.ts";
import Objective from "../../../src/mapai/Objective.ts";
import ObjectivesAI from "../../../src/mapai/ObjectivesAI.ts";

import ObjectiveTemplate from "../../../src/templateinterfaces/ObjectiveTemplate.d.ts";

import Star from "../../../src/Star.ts";
import Unit from "../../../src/Unit.ts";

import
{
  musterAndAttackRoutine,
  independentTargetFilter,
  defaultUnitDesireFN,
  defaultUnitFitFN,
  makeObjectivesFromScores,
  getUnitsToBeatImmediateTarget
} from "../aiUtils.ts";

const cleanUpPirates: ObjectiveTemplate =
{
  key: "cleanUpPirates",
  movePriority: 3,
  preferredUnitComposition:
  {
    combat: 0.65,
    defence: 0.25,
    utility: 0.1
  },
  moveRoutineFN: musterAndAttackRoutine.bind(null, independentTargetFilter),
  unitDesireFN: defaultUnitDesireFN,
  unitFitFN: defaultUnitFitFN,
  creatorFunction: function(grandStrategyAI: GrandStrategyAI,
    mapEvaluator: MapEvaluator, objectivesAI: ObjectivesAI)
  {
    var basePriority = grandStrategyAI.desireForExpansion;

    var ownedStarsWithPirates = mapEvaluator.player.controlledLocations.filter(function(star: Star)
    {
      return star.getIndependentUnits().length > 0 && !star.getSecondaryController();
    });

    var evaluations = mapEvaluator.evaluateIndependentTargets(ownedStarsWithPirates);
    var scores = mapEvaluator.scoreIndependentTargets(evaluations);

    var template = cleanUpPirates;

    return makeObjectivesFromScores(template, scores, basePriority);
  },
  unitsToFillObjectiveFN: getUnitsToBeatImmediateTarget
}

export default cleanUpPirates;