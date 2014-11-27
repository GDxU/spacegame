/// <reference path="../data/templates/abilitytemplates.ts" />
/// <reference path="battle.ts"/>
/// <reference path="unit.ts"/>
/// <reference path="targeting.ts"/>

module Rance
{
  export function useAbility(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate, target: Unit)
  {
    target = getTargetOrGuard(battle, user, ability, target);

    var isValidTarget = validateTarget(battle, user, ability, target);

    if (!isValidTarget)
    {
      console.warn("Invalid target");
    }

    var targetsInArea = getUnitsInAbilityArea(battle, user, ability, target.battleStats.position);

    for (var i = 0; i < targetsInArea.length; i++)
    {
      var target = targetsInArea[i];

      ability.effect.call(null, user, target);
    }

    user.removeActionPoints(ability.actionsUse);
    user.addMoveDelay(ability.moveDelay);
  }
  export function validateTarget(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate, target: Unit)
  {
    var potentialTargets = getPotentialTargets(battle, user, ability);

    return potentialTargets.indexOf(target) >= 0;
  }
  export function getTargetOrGuard(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate, target: Unit)
  {
    var guarding = getGuardTargets(battle, user, ability);
    guarding = guarding.filter(function(unit)
    {
      return unit !== target;
    });

    guarding = guarding.sort(function(a: Unit, b: Unit)
    {
      return a.battleStats.guard - b.battleStats.guard;
    });

    for (var i = 0; i < guarding.length; i++)
    {
      var guardRoll = Math.random() * 100;

      if (guardRoll <= guarding[i].battleStats.guard)
      {
        return guarding[i];
      }
    }

    return target;
  }
  export function getGuardTargets(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate)
  {
    var enemyTargets = getPotentialTargets(battle, user, ability);

    var guardTargets: Unit[] = [];
    for (var i = 0; i < enemyTargets.length; i++)
    {
      if (enemyTargets[i].battleStats.guard > 0)
      {
        guardTargets.push(enemyTargets[i]);
      }
    }

    return guardTargets;
  }
  export function getPotentialTargets(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate): Unit[]
  {
    if (ability.targetRange === "self")
    {
      return [user];
    }
    var fleetsToTarget = getFleetsToTarget(battle, user, ability);

    if (ability.targetRange === "close")
    {
      var farColumnForSide =
      {
        side1: 0,
        side2: 3
      };

      if (user.battleStats.position[0] ===
        farColumnForSide[user.battleStats.side])
      {
        return [];
      }

      var oppositeSide = reverseSide(user.battleStats.side);

      fleetsToTarget[farColumnForSide[oppositeSide]] = [null];
    }

    var fleetFilterFN = function(target: Unit)
    {
      if (!Boolean(target))
      {
        return false;
      }
      else if (!target.isTargetable())
      {
        return false;
      }

      return true;
    }

    return flatten2dArray(fleetsToTarget).filter(fleetFilterFN);


    throw new Error();
  }
  export function getFleetsToTarget(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate): Unit[][]
  {
    var nullFleet =
    [
      [null, null, null, null],
      [null, null, null, null]
    ];
    var insertNullBefore;
    var toConcat;

    switch (ability.targetFleets)
    {
      case "all":
      {
        return battle.side1.concat(battle.side2);
      }
      case "ally":
      {
        insertNullBefore = user.battleStats.side === "side1" ? false : true;
        toConcat = battle[user.battleStats.side];
        break;
      }
      case "enemy":
      {
        insertNullBefore = user.battleStats.side === "side1" ? true : false;
        toConcat = battle[reverseSide(user.battleStats.side)];
        break;
      }
    }

    if (insertNullBefore)
    {
      return nullFleet.concat(toConcat);
    }
    else
    {
      return toConcat.concat(nullFleet);
    }
  }
  export function getPotentialTargetsByPosition(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate): number[][]
  {
    var targets = getPotentialTargets(battle, user, ability);
    var targetPositions = [];

    for (var i = 0; i < targets.length; i++)
    {
      targetPositions.push(targets[i].battleStats.position);
    }

    return targetPositions;
  }
  export function getUnitsInAbilityArea(battle: Battle, user: Unit,
    ability: Templates.AbilityTemplate, target: number[]): Unit[]
  {
    var targetFleets = getFleetsToTarget(battle, user, ability);

    var inArea = ability.targetingFunction(targetFleets, target);

    return inArea.filter(Boolean);
  }

  export function getTargetsForAllAbilities(battle: Battle, user: Unit)
  {
    if (!user || !battle.activeUnit)
    {
      return false;
    }

    var allTargets:
    {
      [id: number]: Templates.AbilityTemplate[];
    } = {};

    for (var i = 0; i < user.abilities.length; i++)
    {
      var ability = user.abilities[i];

      var targets = getPotentialTargets(battle, user, ability);

      for (var j = 0; j < targets.length; j++)
      {
        var target = targets[j];

        if (!allTargets[target.id])
        {
          allTargets[target.id] = [];
        }

        allTargets[target.id].push(ability);
      }
    }

    return allTargets;
  }
}
