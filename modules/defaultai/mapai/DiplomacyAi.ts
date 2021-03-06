import Game from "../../../src/Game";
import Player from "../../../src/Player";
import PlayerDiplomacy from "../../../src/PlayerDiplomacy";

import MapEvaluator from "./MapEvaluator";


export default class DiplomacyAi
{
  private game: Game;

  private player: Player;
  private playerDiplomacy: PlayerDiplomacy;

  private mapEvaluator: MapEvaluator;

  constructor(
    mapEvaluator: MapEvaluator,
    game: Game,
  )
  {
    this.game = game;

    this.player = mapEvaluator.player;
    this.playerDiplomacy = this.player.diplomacy;

    this.mapEvaluator = mapEvaluator;
  }

  public setAttitudes()
  {
    const diplomacyEvaluations =
      this.mapEvaluator.getDiplomacyEvaluations(this.game.turnNumber);

    diplomacyEvaluations.forEach((player, evaluation) =>
    {
      this.playerDiplomacy.processAttitudeModifiersForPlayer(player, evaluation);
    });
  }
}
