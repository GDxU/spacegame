import GrandStrategyAI from "../../../src/mapai/GrandStrategyAI.ts";
import EconomyAI from "../../../src/mapai/EconomyAI.ts";
import MapEvaluator from "../../../src/mapai/MapEvaluator.ts";
import Objective from "../../../src/mapai/Objective.ts";
import ObjectivesAI from "../../../src/mapai/ObjectivesAI.ts";

import ObjectiveTemplate from "../../../src/templateinterfaces/ObjectiveTemplate.d.ts";

import app from "../../../src/App.ts";
import Player from "../../../src/Player.ts";
import Star from "../../../src/Star.ts";

const expandManufactoryCapacity: ObjectiveTemplate =
{
  key: "expandManufactoryCapacity",
  creatorFunction: function(grandStrategyAI: GrandStrategyAI,
    mapEvaluator: MapEvaluator, objectivesAI: ObjectivesAI)
  {
    // TODO economy ai
    // base priority = manufacturing demand / manufacturing capacity

    var template = expandManufactoryCapacity
    return [new Objective(template, 0.5, null)];
  },
  economyRoutineFN: function(objective: Objective, economyAI: EconomyAI)
  {
    // TODO economy ai
    var costByStar:
    {
      star: Star;
      cost: number;
    }[] = [];

    var player: Player = economyAI.player;
    var stars = player.controlledLocations;

    if (player.money < 1200) return;

    for (var i = 0; i < stars.length; i++)
    {
      var star = stars[i];
      var fullyExpanded = star.manufactory && star.manufactory.capacity >= star.manufactory.maxCapacity;
      if (fullyExpanded) continue;
      
      var expansionCost: number;
      if (!star.manufactory) expansionCost = app.moduleData.ruleSet.manufactory.buildCost;
      else
      {
        expansionCost = star.manufactory.getCapacityUpgradeCost();
      }

      costByStar.push(
      {
        star: star,
        cost: expansionCost
      });
    }

    if (costByStar.length === 0) return;

    costByStar.sort(function(a, b)
    {
      return a.cost - b.cost;
    });

    var star = costByStar[0].star;
    var cost = costByStar[0].cost;
    if (player.money < cost * 1.1)
    {
      return;
    }
    if (star.manufactory)
    {
      star.manufactory.upgradeCapacity(1);
    }
    else
    {
      star.buildManufactory();
      player.money -= app.moduleData.ruleSet.manufactory.buildCost;
    }
  }
}

export default expandManufactoryCapacity;