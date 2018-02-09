import {DiplomaticObjective} from "./common/DiplomaticObjective";
import {Objective} from "./common/Objective";

import {GrandStrategyAI} from "../mapai/GrandStrategyAI";
import MapEvaluator from "../mapai/MapEvaluator";

import Player from "../../../src/Player";
import PlayerDiplomacy from "../../../src/PlayerDiplomacy";


// @ts-ignore 2417
export class DeclareWar extends DiplomaticObjective
{
  public static readonly type = "DeclareWar";
  public readonly type = "DeclareWar";

  public readonly target: Player;

  protected constructor(score: number, target: Player, playerDiplomacy: PlayerDiplomacy)
  {
    super(score, playerDiplomacy);
    this.target = target;
  }

  protected static createObjectives(mapEvaluator: MapEvaluator, allOngoingObjectives: Objective[]): DeclareWar[]
  {
    const metNeighborPlayers = mapEvaluator.player.getNeighboringPlayers().filter(player =>
    {
      return mapEvaluator.player.diplomacy.hasMetPlayer(player);
    });

    const declarableNeighbors = metNeighborPlayers.filter(player =>
    {
      return mapEvaluator.player.diplomacy.canDeclareWarOn(player);
    });

    return declarableNeighbors.map(player =>
    {
      const score = mapEvaluator.getDesireToGoToWarWith(player) *
        mapEvaluator.getAbilityToGoToWarWith(player);

      return new DeclareWar(score, player, mapEvaluator.player.diplomacy);
    });
  }
  protected static evaluatePriority(mapEvaluator: MapEvaluator, grandStrategyAI: GrandStrategyAI): number
  {
    return grandStrategyAI.desireForWar;
  }
  protected static updateOngoingObjectivesList(
    allOngoingObjectives: Objective[],
    createdObjectives: DeclareWar[],
  ): Objective[]
  {
    return this.updateTargetedObjectives(allOngoingObjectives, createdObjectives);
  }

  public execute(afterDoneCallback: () => void): void
  {
    this.playerDiplomacy.declareWarOn(this.target);
    afterDoneCallback();
  }
}
