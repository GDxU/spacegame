import {Objective} from "./Objective";
import {ObjectiveFamily} from "./ObjectiveFamily";

import {Front} from "../../mapai/Front";
import MapEvaluator from "../../mapai/MapEvaluator";
import {UnitEvaluator} from "../../mapai/UnitEvaluator";

import Star from "../../../../src/Star";
import Unit from "../../../../src/Unit";

let frontIDGenerator = 0;

export abstract class FrontObjective extends Objective
{
  public static readonly family = ObjectiveFamily.Front;
  public readonly family = ObjectiveFamily.Front;

  public front: Front;

  public abstract readonly movePriority: number;

  protected mapEvaluator: MapEvaluator;
  protected unitEvaluator: UnitEvaluator;

  protected constructor(score: number, mapEvaluator: MapEvaluator, unitEvaluator: UnitEvaluator)
  {
    super(score);

    this.front = new Front(frontIDGenerator++);
    this.mapEvaluator = mapEvaluator;
    this.unitEvaluator = unitEvaluator;
  }

  public evaluateCurrentCombatStrength(): number
  {
    return this.unitEvaluator.evaluateCombatStrength(...this.front.units);
  }
  public getRallyPoint(): Star
  {
    // TODO 10.04.2017 | temporary
    // maybe use influence map to get average location
    // overridden in derived classes for targeted objectives

    return this.mapEvaluator.player.controlledLocations[0];
  }

  /**
   * how well unit fits for this objective relative to other units
   */
  public abstract evaluateUnitFit(unit: Unit): number;

  public abstract getMinimumRequiredCombatStrength(): number;
  public abstract getIdealRequiredCombatStrength(): number;
}
