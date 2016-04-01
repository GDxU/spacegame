/// <reference path="game.ts"/>
/// <reference path="player.ts"/>
/// <reference path="galaxymap.ts"/>
/// <reference path="star.ts" />
/// <reference path="fillerpoint.ts" />

/// <reference path="savedata/iattitudemodifiersavedata.d.ts" />
/// <reference path="savedata/iitemsavedata.d.ts" />
/// <reference path="savedata/ibuildingsavedata.d.ts" />
/// <reference path="savedata/imanufactorysavedata.d.ts" />
/// <reference path="savedata/idiplomacystatussavedata.d.ts" />
/// <reference path="savedata/inotificationlogsavedata.d.ts" />
/// <reference path="savedata/iemblemsavedata.d.ts" />
/// <reference path="savedata/inotificationsavedata.d.ts" />
/// <reference path="savedata/iflagsavedata.d.ts" />
/// <reference path="savedata/iplayersavedata.d.ts" />
/// <reference path="savedata/ifleetsavedata.d.ts" />
/// <reference path="savedata/iplayertechnologysavedata.d.ts" />
/// <reference path="savedata/igalaxymapsavedata.d.ts" />
/// <reference path="savedata/istarsavedata.d.ts" />
/// <reference path="savedata/igamesavedata.d.ts" />
/// <reference path="savedata/iunitsavedata.d.ts" />

export class GameLoader
{
  map: GalaxyMap;
  humanPlayer: Player;
  players: Player[] = [];
  independents: Player[] = [];
  playersById:
  {
    [id: number]: Player;
  } = {};
  starsById:
  {
    [id: number]: Star;
  } = {};
  unitsById:
  {
    [id: number]: Unit;
  } = {};
  buildingsByControllerId:
  {
    [id: number]: Building;
  } = {};

  constructor()
  {

  }

  deserializeGame(data: IGameSaveData): Game
  {
    this.map = this.deserializeMap(data.galaxyMap);

    for (var i = 0; i < data.players.length; i++)
    {
      var playerData = data.players[i];
      var id = playerData.id;
      var player = this.playersById[id] = this.deserializePlayer(playerData);
      if (player.isIndependent)
      {
        this.independents.push(player);
      }
      else
      {
        this.players.push(player);
      }
    }
    for (var i = 0; i < data.players.length; i++)
    {
      var playerData = data.players[i];
      this.deserializeDiplomacyStatus(this.playersById[playerData.id], 
        playerData.diplomacyStatus);
      this.deserializeIdentifiedUnits(this.playersById[playerData.id],
        playerData.identifiedUnitIds);
    }

    this.humanPlayer = this.playersById[data.humanPlayerId];

    this.deserializeBuildings(data.galaxyMap);

    var game = new Game(this.map, this.players, this.humanPlayer);
    game.independents = game.independents.concat(this.independents);
    game.turnNumber = data.turnNumber;
    if (data.notificationLog)
    {
      game.notificationLog = this.deserializeNotificationLog(data.notificationLog);
      game.notificationLog.setTurn(game.turnNumber, true);
    }

    return game;
  }
  // legacy savedata 10.3.2016
  deserializeNotificationLog(data: INotificationLogSaveData | INotificationSaveData[]): NotificationLog
  {
    var notificationsData: INotificationSaveData[] = Array.isArray(data) ? data : data.notifications;

    var notificationLog = new NotificationLog(this.humanPlayer);
    for (var i = 0; i < notificationsData.length; i++)
    {
      var template = app.moduleData.Templates.Notifications[notificationsData[i].templateKey];
      var props = template.deserializeProps(notificationsData[i].props, this);
      var notification = new Notification(template, props, notificationsData[i].turn);
      notification.hasBeenRead = notificationsData[i].hasBeenRead;

      notificationLog.addNotification(notification);
    }

    return notificationLog;
  }
  deserializeMap(data: IGalaxyMapSaveData): GalaxyMap
  {
    var stars: Star[] = [];

    for (var i = 0; i < data.stars.length; i++)
    {
      var star = this.deserializeStar(data.stars[i]);
      stars.push(star);
      this.starsById[star.id] = star;
    }

    for (var i = 0; i < data.stars.length; i++)
    {
      var dataStar = data.stars[i];
      var realStar = this.starsById[dataStar.id];

      for (var j = 0; j < dataStar.linksToIds.length; j++)
      {
        var linkId = dataStar.linksToIds[j];
        var linkStar = this.starsById[linkId]
        realStar.addLink(linkStar);
      }
    }

    var fillerPoints: FillerPoint[] = [];

    for (var i = 0; i < data.fillerPoints.length; i++)
    {
      var dataPoint = data.fillerPoints[i];
      fillerPoints.push(new FillerPoint(dataPoint.x, dataPoint.y));
    }

    var mapGenResult = new MapGenCore.MapGenResult(
    {
      stars: stars,
      fillerPoints: fillerPoints,
      width: data.width,
      height: data.height,
      seed: data.seed,
      independents: null
    });
    
    var galaxyMap = mapGenResult.makeMap();

    return galaxyMap;
  }
  deserializeStar(data: IStarSaveData): Star
  {
    var star = new Star(data.x, data.y, data.id);
    star.name = data.name;
    star.baseIncome = data.baseIncome;
    star.seed = data.seed;

    if (data.resourceType)
    {
      star.setResource(app.moduleData.Templates.Resources[data.resourceType]);
    }

    if (data.buildableUnitTypes)
    {
      for (var i = 0; i < data.buildableUnitTypes.length; i++)
      {
        star.buildableUnitTypes.push(app.moduleData.Templates.Units[data.buildableUnitTypes[i]]);
      }
    }

    return star;
  }
  deserializeBuildings(data: IGalaxyMapSaveData): void
  {
    for (var i = 0; i < data.stars.length; i++)
    {
      var starData = data.stars[i];
      var star = this.starsById[starData.id];

      for (var category in starData.buildings)
      {
        for (var j = 0; j < starData.buildings[category].length; j++)
        {
          var buildingData = starData.buildings[category][j];
          var building = this.deserializeBuilding(buildingData);

          star.addBuilding(building);
        }
      }

      if (starData.manufactory)
      {
        star.manufactory = new Manufactory(star, starData.manufactory);
      }
    }
  }
  deserializeBuilding(data: IBuildingSaveData): Building
  {
    var template = app.moduleData.Templates.Buildings[data.templateType];
    var building = new Building(
    {
      template: template,
      location: this.starsById[data.locationId],
      controller: this.playersById[data.controllerId],

      upgradeLevel: data.upgradeLevel,
      totalCost: data.totalCost,
      id: data.id
    });

    return building;
  }
  deserializePlayer(data: IPlayerSaveData): Player
  {
    var personality: IPersonality;

    if (data.personality)
    {
      personality = extendObject(data.personality, makeRandomPersonality(), true);
    }

    var player = new Player(data.isAI, data.id);
    player.name = data.name;
    player.money = data.money;
    player.isIndependent = data.isIndependent;

    if (data.resources)
    {
      player.resources = extendObject(data.resources);
    }

    player.personality = personality;
    
    player.color = data.color;
    player.secondaryColor = data.secondaryColor;
    player.colorAlpha = data.colorAlpha;

    if (data.flag)
    {
      player.flag = this.deserializeFlag(data.flag);
    }
    else
    {
      player.makeRandomFlag();
    }

    // fleets & units
    for (var i = 0; i < data.fleets.length; i++)
    {
      var fleet = data.fleets[i];
      player.addFleet(this.deserializeFleet(player, fleet));
    }

    // stars
    for (var i = 0; i < data.controlledLocationIds.length; i++)
    {
      player.addStar(this.starsById[data.controlledLocationIds[i]]);
    }

    for (var i = 0; i < data.items.length; i++)
    {
      this.deserializeItem(data.items[i], player);
    }

    for (var i = 0; i < data.revealedStarIds.length; i++)
    {
      var id = data.revealedStarIds[i];
      player.revealedStars[id] = this.starsById[id];
    }

    // technology
    player.initTechnologies(data.researchByTechnology);

    return player;
  }
  deserializeDiplomacyStatus(player: Player, data: IDiplomacyStatusSaveData): void
  {
    if (data)
    {
      for (var i = 0; i < data.metPlayerIds.length; i++)
      {
        var id = data.metPlayerIds[i];
        player.diplomacyStatus.metPlayers[id] = this.playersById[id];
      }

      player.diplomacyStatus.statusByPlayer = data.statusByPlayer;

      for (var playerId in data.attitudeModifiersByPlayer)
      {
        var modifiers = data.attitudeModifiersByPlayer[playerId];

        if (!modifiers || modifiers.length === 0)
        {
          player.diplomacyStatus.attitudeModifiersByPlayer[playerId] = [];
          continue;
        }

        for (var i = 0; i < modifiers.length; i++)
        {
          var template = app.moduleData.Templates.AttitudeModifiers[modifiers[i].templateType];
          var modifier = new AttitudeModifier(
          {
            template: template,
            startTurn: modifiers[i].startTurn,
            endTurn: modifiers[i].endTurn,
            strength: modifiers[i].strength
          });

          player.diplomacyStatus.addAttitudeModifier(this.playersById[playerId], modifier);
        }
      }
    }
  }
  deserializeIdentifiedUnits(player: Player, data: number[]): void
  {
    for (var i = 0; i < data.length; i++)
    {
      var unit = this.unitsById[data[i]];
      if (unit)
      {
        player.identifyUnit(unit);
      }
    }
  }
  deserializeEmblem(emblemData: IEmblemSaveData, color: number): Emblem
  {
    var inner = app.moduleData.Templates.SubEmblems[emblemData.innerKey];
    var outer = emblemData.outerKey ?
      app.moduleData.Templates.SubEmblems[emblemData.outerKey] : null;

    return new Emblem(color, emblemData.alpha, inner, outer);
  }
  deserializeFlag(data: IFlagSaveData): Flag
  {
    var flag = new Flag(
    {
      width: 46, // global FLAG_SIZE
      mainColor: data.mainColor,
      secondaryColor: data.secondaryColor,
      tetriaryColor: data.tetriaryColor
    });

    if (data.customImage)
    {
      flag.setCustomImage(data.customImage);
    }
    else if (data.seed)
    {
      flag.generateRandom(data.seed);
    }
    else
    {
      if (data.foregroundEmblem)
      {
        var fgEmblem = this.deserializeEmblem(data.foregroundEmblem, data.secondaryColor);
        flag.setForegroundEmblem(fgEmblem);
      }
      if (data.backgroundEmblem)
      {
        var bgEmblem = this.deserializeEmblem(data.backgroundEmblem, data.tetriaryColor);
        flag.setBackgroundEmblem(bgEmblem);
      }
    }

    return flag;
  }
  deserializeFleet(player: Player, data: IFleetSaveData): Fleet
  {
    var units: Unit[] = [];

    // legacy savedata 10.3.2016
    var castedData = <any> data;
    var unitsToDeserialize: IUnitSaveData[] = castedData.units || castedData.ships;

    for (var i = 0; i < unitsToDeserialize.length; i++)
    {
      var unit = this.deserializeUnit(unitsToDeserialize[i]);
      player.addUnit(unit);
      units.push(unit);
    }

    var fleet = new Fleet(player, units, this.starsById[data.locationId], data.id, false);
    fleet.name = data.name;
    return fleet;
  }
  deserializeUnit(data: IUnitSaveData): Unit
  {
    var template = app.moduleData.Templates.Units[data.templateType];

    var unit = new Unit(template, data.id, data);

    this.unitsById[unit.id] = unit;

    return unit;
  }
  deserializeItem(data: IItemSaveData, player: Player): void
  {
    var template = app.moduleData.tems[data.templateType];

    var item = new Item(template, data.id);

    player.addItem(item);
    if (isFinite(data.unitId))
    {
      this.unitsById[data.unitId].addItem(item);
    }
  }
}
