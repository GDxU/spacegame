/// <reference path="../../../src/templateinterfaces/iobjectivetemplate.d.ts" />

/// <reference path="aiutils.ts" />

module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export module Objectives
      {
        export var heal: Rance.Templates.IObjectiveTemplate =
        {
          key: "heal",
          movePriority: -1,
          preferredUnitComposition:
          {

          },
          moveRoutineFN: function(front: MapAI.Front, afterMoveCallback: Function)
          {
            AIUtils.moveToRoutine(front, afterMoveCallback, function(fleet: Fleet)
            {
              return fleet.player.getNearestOwnedStarTo(fleet.location);
            });
          },
          unitDesireFN: function(front: MapAI.Front){return 1;},
          unitFitFN: function(unit: Unit, front: MapAI.Front)
          {
            var healthPercentage = unit.currentHealth / unit.maxHealth;
            return 1 - healthPercentage;
          },
          creatorFunction: function(grandStrategyAI: MapAI.GrandStrategyAI,
            mapEvaluator: MapAI.MapEvaluator)
          {
            var template = Rance.Modules.DefaultModule.Objectives.heal;
            return [new MapAI.Objective(template, 1, null)];
          },
          unitsToFillObjectiveFN: function(objective: MapAI.Objective)
          {
            return {min: 0, ideal: 0};
          }
        }
      }
    }
  }
}