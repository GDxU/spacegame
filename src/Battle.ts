

import app from "./App"; // TODO global
import DefenceBuildingTemplate from "./templateinterfaces/DefenceBuildingTemplate";

import BattleData from "./BattleData";
import Unit from "./Unit";
import eventManager from "./eventManager";
import BattleTurnOrder from "./BattleTurnOrder";
import Player from "./Player";
import
{
  default as UnitBattleSide,
  UnitBattleSides
} from "./UnitBattleSide";
import
{
  clamp,
  randInt,
  reverseSide
} from "./utility";

export default class Battle
{
  public unitsById:
  {
    [id: number]: Unit;
  } = {};
  public unitsBySide:
  {
    side1: Unit[];
    side2: Unit[];
  } =
  {
    side1: [],
    side2: []
  };
  public side1: Unit[][];
  public side1Player: Player;
  public side2: Unit[][];
  public side2Player: Player;

  public battleData: BattleData;

  public turnOrder: BattleTurnOrder;
  public activeUnit: Unit;

  private currentTurn: number;
  public maxTurns: number;
  public turnsLeft: number;

  private startHealth:
  {
    side1: number;
    side2: number;
  };

  private evaluation: //-1: side1 win, 0: even, 1: side2 win
  {
    [turnNumber: number]: number;
  } = {};

  public isSimulated: boolean = false; // true when battle is between two ai players
  private isVirtual: boolean = false; // true when a clone made by battle ai
  public ended: boolean = false;

  public capturedUnits: Unit[];
  public deadUnits: Unit[];

  public afterFinishCallbacks: {(): void}[] = [];

  constructor(props:
  {
    battleData: BattleData;
    side1: Unit[][];
    side2: Unit[][];
    side1Player: Player;
    side2Player: Player;
  })
  {
    this.side1 = props.side1;
    this.side1Player = props.side1Player
    this.side2 = props.side2;
    this.side2Player = props.side2Player;
    this.battleData = props.battleData;
    
    this.turnOrder = new BattleTurnOrder();
  }
  // Separate because cloned battles (for ai simulation) don't need to call this.
  public init()
  {
    var self = this;

    UnitBattleSides.forEach(function(sideId: UnitBattleSide)
    {
      var side = self[sideId];
      for (let i = 0; i < side.length; i++)
      {
        for (let j = 0; j < side[i].length; j++)
        {
          if (side[i][j])
          {
            self.unitsById[side[i][j].id] = side[i][j];
            self.unitsBySide[sideId].push(side[i][j]);

            var pos = Battle.getAbsolutePositionFromSidePosition([i, j], sideId)

            self.initUnit(side[i][j], sideId, pos);
          }
        }
      }
    });

    this.currentTurn = 0;
    this.maxTurns = 24;
    this.turnsLeft = this.maxTurns;
    this.updateTurnOrder();

    this.startHealth =
    {
      side1: this.getTotalHealthForSide("side1").current,
      side2: this.getTotalHealthForSide("side2").current
    }

    if (this.shouldBattleEnd())
    {
      this.endBattle();
    }
    else
    {
      this.shiftRowsIfNeeded();
    }

    this.triggerBattleStartAbilities();
  }
  public forEachUnit(operator: (unit: Unit) => any): void
  {
    for (let id in this.unitsById)
    {
       operator.call(this, this.unitsById[id]);
    }
  }
  public endTurn()
  {
    this.currentTurn++;
    this.turnsLeft--;
    this.updateTurnOrder();

    var shouldEnd = this.shouldBattleEnd();
    if (shouldEnd)
    {
      this.endBattle();
    }
    else
    {
      this.shiftRowsIfNeeded();
    }
  }
  public getActivePlayer()
  {
    if (!this.activeUnit) return null;

    var side = this.activeUnit.battleStats.side;

    return this.getPlayerForSide(side);
  }
  
  private initUnit(unit: Unit, side: UnitBattleSide, position: number[])
  {
    unit.resetBattleStats();
    unit.setBattlePosition(this, side, position);
    this.turnOrder.addUnit(unit);
    unit.timesActedThisTurn++;
  }
  private triggerBattleStartAbilities()
  {
    this.forEachUnit(function(unit: Unit)
    {
      var passiveSkillsByPhase = unit.getPassiveSkillsByPhase();
      if (passiveSkillsByPhase["atBattleStart"])
      {
        var skills = passiveSkillsByPhase["atBattleStart"];
        for (let i = 0; i < skills.length; i++)
        {
          for (let j = 0; j < skills[i].atBattleStart.length; j++)
          {
            var effect = skills[i].atBattleStart[j];
            effect.action.executeAction(unit, unit, this, effect.data);
          }
        }
      }
    });
  }
  private getPlayerForSide(side: UnitBattleSide)
  {
    if (side === "side1") return this.side1Player;
    else if (side === "side2") return this.side2Player;
    else throw new Error("invalid side");
  }
  private getSideForPlayer(player: Player): UnitBattleSide
  {
    if (this.side1Player === player) return "side1";
    else if (this.side2Player === player) return "side2";
    else throw new Error("invalid player");
  }
  private getRowByPosition(position: number)
  {
    var rowsPerSide = app.moduleData.ruleSet.battle.rowsPerFormation;
    var side: UnitBattleSide = position < rowsPerSide ? "side1" : "side2";
    var relativePosition = position % rowsPerSide;

    return this[side][relativePosition];
  }
  // Battle End
  public finishBattle(forcedVictor?: Player)
  {
    var victor = forcedVictor || this.getVictor();

    for (let i = 0; i < this.deadUnits.length; i++)
    {
      this.deadUnits[i].removeFromPlayer();
    }

    var experiencePerSide = this.getGainedExperiencePerSide();
    
    this.forEachUnit(function(unit: Unit)
    {
      unit.addExperience(experiencePerSide[unit.battleStats.side]);
      unit.resetBattleStats();

      if (unit.currentHealth < Math.round(unit.maxHealth * 0.1))
      {
        unit.currentHealth = Math.round(unit.maxHealth * 0.1);
      }



      this.side1Player.identifyUnit(unit);
      this.side2Player.identifyUnit(unit);
    });

    if (victor)
    {
      for (let i = 0; i < this.capturedUnits.length; i++)
      {
        this.capturedUnits[i].transferToPlayer(victor);
        this.capturedUnits[i].experienceForCurrentLevel = 0;
      }
    }
    
    if (this.battleData.building)
    {
      if (victor)
      {
        this.battleData.building.setController(victor);
      }
    }

    if (this.isSimulated)
    {
      eventManager.dispatchEvent("renderLayer", "fleets", this.battleData.location);
    }
    else
    {
      eventManager.dispatchEvent("setCameraToCenterOn", this.battleData.location);
      eventManager.dispatchEvent("switchScene", "galaxyMap");
    }

    if (app.humanPlayer.starIsVisible(this.battleData.location))
    {
      eventManager.dispatchEvent("makeBattleFinishNotification",
      {
        location: this.battleData.location,
        attacker: this.battleData.attacker.player,
        defender: this.battleData.defender.player,
        victor: victor
      });
    }
    for (let i = 0; i < this.afterFinishCallbacks.length; i++)
    {
      this.afterFinishCallbacks[i]();
    }
  }
  public getVictor()
  {
    var evaluation = this.getEvaluation();

    if (evaluation > 0) return this.side1Player;
    else if (evaluation < 0) return this.side2Player;
    else return null;
  }
  private getCapturedUnits(victor: Player, maxCapturedUnits: number)
  {
    if (!victor || victor.isIndependent) return [];

    var winningSide = this.getSideForPlayer(victor);
    var losingSide = reverseSide(winningSide);

    var losingUnits = this.unitsBySide[losingSide].slice(0);
    losingUnits.sort(function(a: Unit, b: Unit)
    {
      var captureChanceSort = b.battleStats.captureChance - a.battleStats.captureChance;
      if (captureChanceSort)
      {
        return captureChanceSort;
      }
      else
      {
        return randInt(0, 1) * 2 - 1; // -1 or 1
      }
    });

    var capturedUnits: Unit[] = [];

    for (let i = 0; i < losingUnits.length; i++)
    {
      if (capturedUnits.length >= maxCapturedUnits) break;

      var unit = losingUnits[i];
      if (unit.currentHealth <= 0 &&
        Math.random() <= unit.battleStats.captureChance)
      {
        capturedUnits.push(unit);
      }
    }

    return capturedUnits;
  }
  private getUnitDeathChance(unit: Unit, victor: Player)
  {
    var player: Player = unit.fleet.player;

    var deathChance: number;

    if (player.isIndependent)
    {
      deathChance = app.moduleData.ruleSet.battle.independentUnitDeathChance;
    }
    else if (player.isAI)
    {
      deathChance = app.moduleData.ruleSet.battle.aiUnitDeathChance;
    }
    else
    {
      deathChance = app.moduleData.ruleSet.battle.humanUnitDeathChance;
    }

    var playerDidLose = (victor && player !== victor);
    if (playerDidLose)
    {
      deathChance += app.moduleData.ruleSet.battle.loserUnitExtraDeathChance;
    }

    return deathChance;
  }
  private getDeadUnits(capturedUnits: Unit[], victor: Player)
  {
    var deadUnits: Unit[] = [];


    this.forEachUnit(function(unit)
    {
      if (unit.currentHealth <= 0)
      {
        var wasCaptured = capturedUnits.indexOf(unit) >= 0;
        if (!wasCaptured)
        {
          var deathChance = this.getUnitDeathChance(unit, victor);
          if (Math.random() < deathChance)
          {
            deadUnits.push(unit);
          }
        }
      }
    });

    return deadUnits;
  }
  private getGainedExperiencePerSide()
  {
    var totalValuePerSide =
    {
      side1: 0,
      side2: 0
    };

    for (let side in this.unitsBySide)
    {
      var totalValue = 0;
      var units = this.unitsBySide[side];
      for (let i = 0; i < units.length; i++)
      {
        totalValuePerSide[side] += units[i].level + 1;
      }
    }

    return(
    {
      side1: totalValuePerSide.side2 / totalValuePerSide.side1 * 10,
      side2: totalValuePerSide.side1 / totalValuePerSide.side2 * 10
    });
  }
  private shouldBattleEnd()
  {
    if (!this.activeUnit) return true;

    if (this.turnsLeft <= 0) return true;

    if (this.getTotalHealthForSide("side1").current <= 0 ||
      this.getTotalHealthForSide("side2").current <= 0)
    {
      return true;
    }

    return false;
  }
  private endBattle()
  {
    this.ended = true;

    if (this.isVirtual) return;

    this.activeUnit = null;
    var victor = this.getVictor();

    // TODO content | Abilities that increase max captured units
    var maxCapturedUnits = app.moduleData.ruleSet.battle.baseMaxCapturedUnits;
    this.capturedUnits = this.getCapturedUnits(victor, maxCapturedUnits);
    this.deadUnits = this.getDeadUnits(this.capturedUnits, victor);


    eventManager.dispatchEvent("battleEnd", null);
  }
  // End Battle End
  // Evaluation
  public getEvaluation(): number
  {
    var evaluation = 0;

    UnitBattleSides.forEach(side =>
    {
      // positive * sign === good, negative * sign === bad
      var sign = side === "side1" ? 1 : -1; // positive = side1 advantage
      var currentHealth = this.getTotalHealthForSide(side).current;
      if (currentHealth <= 0)
      {
        return -999 * sign;
      }
      // how much health remains from strating health 0.0-1.0
      var currentHealthFactor = currentHealth / this.startHealth[side];

      for (let i = 0; i < this.unitsBySide[side].length; i++)
      {
        if (this.unitsBySide[side][i].currentHealth <= 0)
        {
          evaluation -= 0.2 * sign;
        }
      }

      var defenderMultiplier = 1;
      if (this.battleData.building)
      {
        var template = <DefenceBuildingTemplate> this.battleData.building.template;
        var isDefender = this.battleData.defender.player === this.getPlayerForSide(side);
        if (isDefender)
        {
          defenderMultiplier += template.defenderAdvantage;
        }
      }

      evaluation += currentHealthFactor * defenderMultiplier * sign;
    });

    evaluation = clamp(evaluation, -1, 1);

    this.evaluation[this.currentTurn] = evaluation;

    return this.evaluation[this.currentTurn];
  }
  private getTotalHealthForRow(position: number)
  {
    var row = this.getRowByPosition(position);
    var total = 0;

    for (let i = 0; i < row.length; i++)
    {
      if (row[i])
      {
        total += row[i].currentHealth;
      }
    }

    return total;
  }
  private getTotalHealthForSide(side: UnitBattleSide)
  {
    var health =
    {
      current: 0,
      max: 0
    };

    var units = this.unitsBySide[side];

    for (let i = 0; i < units.length; i++)
    {
      var unit = units[i];
      health.current += unit.currentHealth;
      health.max += unit.maxHealth;
    }

    return health;
  }
  // End Evaluation
  private static getAbsolutePositionFromSidePosition(relativePosition: number[], side: UnitBattleSide)
  {
    if (side === "side1")
    {
      return relativePosition;
    }
    else
    {
      var rowsPerSide = app.moduleData.ruleSet.battle.rowsPerFormation;
      return [relativePosition[0] + rowsPerSide, relativePosition[1]];
    }
  }
  private updateBattlePositions(side: UnitBattleSide)
  {
    var units = this[side];
    for (let i = 0; i < units.length; i++)
    {
      var row = this[side][i];
      for (let j = 0; j < row.length; j++)
      {
        var pos = Battle.getAbsolutePositionFromSidePosition([i, j], side);
        var unit = row[j];

        if (unit)
        {
          unit.setBattlePosition(this, side, pos);
        }
      }
    }
  }
  private shiftRowsForSide(side: UnitBattleSide)
  {
    var formation = this[side];
    if (side === "side1")
    {
      formation.reverse();
    }

    var nextHealthyRowIndex: number;

    // start at 1 because frontmost row shouldn't be healthy if this is called
    for (let i = 1; i < formation.length; i++)
    {
      var absoluteRow = side === "side1" ? i : i + app.moduleData.ruleSet.battle.rowsPerFormation;
      if (this.getTotalHealthForRow(absoluteRow) > 0)
      {
        nextHealthyRowIndex = i;
        break;
      }
    }

    if (!isFinite(nextHealthyRowIndex))
    {
      throw new Error("Tried to shift battle rows when all rows are defeated");
    }

    var rowsToShift = formation.splice(0, nextHealthyRowIndex);
    formation = formation.concat(rowsToShift);

    if (side === "side1")
    {
      formation.reverse();
    }

    this[side] = formation;

    this.updateBattlePositions(side);
  }
  private shiftRowsIfNeeded()
  {
    var rowsPerSide = app.moduleData.ruleSet.battle.rowsPerFormation;
    var side1FrontRowHealth = this.getTotalHealthForRow(rowsPerSide - 1);
    if (side1FrontRowHealth <= 0)
    {
      this.shiftRowsForSide("side1");
    }
    var side2FrontRowHealth = this.getTotalHealthForRow(rowsPerSide);
    if (side2FrontRowHealth <= 0)
    {
      this.shiftRowsForSide("side2");
    }
  }

  public makeVirtualClone(): Battle
  {
    var battleData = this.battleData;


    function cloneUnits(units: Unit[][]): Unit[][]
    {
      var clones: Unit[][] = [];
      for (let i = 0; i < units.length; i++)
      {
        var row: Unit[] = [];

        for (let j = 0; j < units[i].length; j++)
        {
          var unit = units[i][j];
          if (!unit)
          {
            row.push(unit);
          }
          else
          {
            row.push(unit.makeVirtualClone());
          }
        }
        clones.push(row);
      }

      return clones;
    }

    var side1 = cloneUnits(this.side1);
    var side2 = cloneUnits(this.side2);

    var side1Player = this.side1Player;
    var side2Player = this.side2Player;

    var clone = new Battle(
    {
      battleData: battleData,
      side1: side1,
      side2: side2,
      side1Player: side1Player,
      side2Player: side2Player
    });

    [side1, side2].forEach(function(side: Unit[][])
    {
      for (let i = 0; i < side.length; i++)
      {
        for (let j = 0; j < side[i].length; j++)
        {
          if (!side[i][j]) continue;
          clone.turnOrder.addUnit(side[i][j]);
          clone.unitsById[side[i][j].id] = side[i][j];
          clone.unitsBySide[side[i][j].battleStats.side].push(side[i][j]);
        }
      }
    });

    clone.isVirtual = true;

    clone.currentTurn = this.currentTurn;
    clone.maxTurns = this.maxTurns;
    clone.turnsLeft = this.turnsLeft;
    clone.startHealth = this.startHealth;
    clone.updateTurnOrder();


    if (clone.shouldBattleEnd())
    {
      clone.endBattle();
    }
    else
    {
      clone.shiftRowsIfNeeded();
    }

    return clone;
  }
  private updateTurnOrder(): void
  {
    this.turnOrder.update();
    this.activeUnit = this.turnOrder.getActiveUnit();
  }
}
