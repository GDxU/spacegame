import Star from "../Star.ts";
import Player from "../Player.ts";
import Unit from "../Unit.ts";

import Front from "../mapai/Front.ts";
import GrandStrategyAI from "../mapai/GrandStrategyAI.ts";
import MapEvaluator from "../mapai/MapEvaluator.ts";
import Objective from "../mapai/Objective.ts";
import ObjectivesAI from "../mapai/ObjectivesAI.ts";
import EconomyAI from "../mapai/EconomyAI.ts";
import DiplomacyAI from "../mapai/DiplomacyAI.ts";

declare interface RoutineAdjustment
{
  target: Star | Player;
  multiplier: number;
}
declare interface RoutineAdjustmentByTargetId
{
  [targetId: number]: RoutineAdjustment;
}
declare interface ObjectiveTemplate
{
  key: string;
  creatorFunction: (grandStrategyAI: GrandStrategyAI,
    mapEvaluator: MapEvaluator, objectivesAI: ObjectivesAI) => Objective[];

  movePriority?: number;
  preferredUnitComposition?: ArchetypeValues;
  // moveRoutine
  moveRoutineFN?: (front: Front, afterMoveCallback: () => void) => void;
  // both this and unitFitFN should usually return 0.0..1.0
  // values higher than 1 should only be used to prioritize units already part of the front
  // how much front with this objective wants units
  unitDesireFN?: (front: Front) => number;
  // how well individual unit fits into front
  unitFitFN?: (unit: Unit, front: Front) => number;
  // unitsToFillObjective
  unitsToFillObjectiveFN?: (mapEvaluator: MapEvaluator,
    objective: Objective) => {min: number; ideal: number};

  economyRoutineFN?: (objective: Objective, economyAI: EconomyAI,
    adjustments: RoutineAdjustmentByTargetId) => void;
  diplomacyRoutineFN?: (objective: Objective, diplomacyAI: DiplomacyAI,
    adjustments: RoutineAdjustmentByTargetId, afterDoneCallback: () => void) => void;

  // applies to all current objectives
  // f.ex. don't go through star, try to trade with particular player
  moveRoutineAdjustments?: RoutineAdjustment[];
  economyRoutineAdjustments?: RoutineAdjustment[];
  diplomacyRoutineAdjustments?: RoutineAdjustment[];
}

export default ObjectiveTemplate;