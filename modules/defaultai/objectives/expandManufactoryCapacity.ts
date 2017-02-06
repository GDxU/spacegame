import EconomyAI from "../mapai/EconomyAI";
import GrandStrategyAI from "../mapai/GrandStrategyAI";
import MapEvaluator from "../mapai/MapEvaluator";
import Objective from "../mapai/Objective";
import ObjectivesAI from "../mapai/ObjectivesAI";

import ObjectiveTemplate from "./common/ObjectiveTemplate";

import app from "../../../src/App";
import Player from "../../../src/Player";
import Star from "../../../src/Star";

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
    var starWithCost:
    {
      star: Star;
      cost: number;
    }[] = [];

    var player: Player = economyAI.player;
    var stars = player.controlledLocations;

    if (player.money < 1200)
    {
      return;
    }

    for (let i = 0; i < stars.length; i++)
    {
      var star = stars[i];
      var fullyExpanded = star.manufactory && star.manufactory.capacity >= star.manufactory.maxCapacity;
      if (fullyExpanded)
      {
        continue;
      }

      var expansionCost: number;
      if (!star.manufactory)
      {
        expansionCost = app.moduleData.ruleSet.manufactory.buildCost;
      }
      else
      {
        expansionCost = star.manufactory.getCapacityUpgradeCost();
      }

      starWithCost.push(
      {
        star: star,
        cost: expansionCost
      });
    }

    if (starWithCost.length === 0)
    {
      return;
    }

    starWithCost.sort(function(a, b)
    {
      return a.cost - b.cost;
    });

    var star = starWithCost[0].star;
    var cost = starWithCost[0].cost;
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
