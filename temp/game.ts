/// <reference path="player.ts"/>
/// <reference path="galaxymap.ts"/>
/// <reference path="eventmanager.ts"/>
/// <reference path="notificationlog.ts" />
/// <reference path="manufactory.ts" />

/// <reference path="savedata/igamesavedata.d.ts" />

export class Game
{
  turnNumber: number;
  independents: Player[] = [];
  playerOrder: Player[];
  galaxyMap: GalaxyMap;
  humanPlayer: Player;
  activePlayer: Player;

  notificationLog: NotificationLog;

  gameStorageKey: string;

  constructor(map: GalaxyMap,
    players: Player[], humanPlayer: Player)
  {
    this.galaxyMap = map;
    if (map.independents)
    {
      this.independents = map.independents;
      map.independents = null;
      delete map.independents;
    }
    
    this.playerOrder = players;
    this.humanPlayer = humanPlayer;
    this.turnNumber = 1;
  }
  destroy()
  {
    this.notificationLog.destroy();
    this.notificationLog = null;
    for (var i = 0; i < this.playerOrder.length; i++)
    {
      this.playerOrder[i].destroy();
    }
    for (var i = 0; i < this.independents.length; i++)
    {
      this.independents[i].destroy();
    }
  }

  endTurn()
  {
    this.setNextPlayer();

    while (this.activePlayer.controlledLocations.length === 0)
    {
      this.killPlayer(this.activePlayer);
      this.activePlayer = this.playerOrder[0];
    }

    this.processPlayerStartTurn(this.activePlayer);
    this.notificationLog.setTurn(this.turnNumber, !this.activePlayer.isAI);

    if (this.activePlayer.isAI)
    {
      this.activePlayer.AIController.processTurn(this.endTurn.bind(this));
    }
    else
    {
      this.turnNumber++;
      
      for (var i = 0; i < this.independents.length; i++)
      {
        this.processPlayerStartTurn(this.independents[i]);
      }

    }

    eventManager.dispatchEvent("endTurn", null);
    eventManager.dispatchEvent("updateSelection", null);
  }
  processPlayerStartTurn(player: Player)
  {
    var unitStartTurnFN = function(unit: Unit)
    {
      unit.resetMovePoints();
      unit.heal();

      var passiveSkillsByPhase = unit.getPassiveSkillsByPhase();
      if (passiveSkillsByPhase.atTurnStart)
      {
        for (var i = 0; i < passiveSkillsByPhase.atTurnStart.length; i++)
        {
          var skill = passiveSkillsByPhase.atTurnStart[i];
          for (var j = 0; j < skill.atTurnStart.length; j++)
          {
            skill.atTurnStart[j](unit);
          }
        }
      }

      unit.timesActedThisTurn = 0;
    }

    player.forEachUnit(unitStartTurnFN);

    if (!player.isIndependent)
    {
      player.money += player.getIncome();

      var allResourceIncomeData = player.getResourceIncome();
      for (var resourceType in allResourceIncomeData)
      {
        var resourceData = allResourceIncomeData[resourceType];
        player.addResource(resourceData.resource, resourceData.amount);
      }

      player.playerTechnology.allocateResearchPoints(player.getResearchSpeed());
      player.getAllManufactories().forEach(function(manufactory: Manufactory)
      {
        manufactory.buildAllThings();
      });
    }
  }
  setNextPlayer()
  {
    this.playerOrder.push(this.playerOrder.shift());

    this.activePlayer = this.playerOrder[0];
  }
  killPlayer(playerToKill: Player)
  {
    var playerOrderIndex: number;
    for (var i = 0; i < this.playerOrder.length; i++)
    {
      var player = this.playerOrder[i];
      if (player === playerToKill)
      {
        playerOrderIndex = i;
        continue;
      }
      player.diplomacyStatus.removePlayer(playerToKill);
    }

    playerToKill.die();
    playerToKill.destroy();

    this.playerOrder.splice(playerOrderIndex, 1);
  }
  serialize(): IGameSaveData
  {
    var playersSaveData: IPlayerSaveData[] = this.playerOrder.map(function(player: Player)
    {
      return player.serialize()
    });

    var independentsSaveData: IPlayerSaveData[] = this.independents.map(function(player: Player)
    {
      return player.serialize()
    });

    var data: IGameSaveData =
    {
      turnNumber: this.turnNumber,
      galaxyMap: this.galaxyMap.serialize(),
      players: playersSaveData.concat(independentsSaveData),
      humanPlayerId: this.humanPlayer.id,
      notificationLog: this.notificationLog.serialize()
    };

    return data;
  }
  save(name: string)
  {
    var saveString = "Save." + name;
    this.gameStorageKey = saveString;

    var date = new Date();
    var gameData = this.serialize();
    var stringified = JSON.stringify(
    {
      name: name,
      date: date,
      gameData: gameData,
      idGenerators: extendObject(idGenerators),
      cameraLocation: app.renderer.camera.getCenterPosition()
    });

    localStorage.setItem(saveString, stringified);
  }
}