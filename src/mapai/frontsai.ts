/// <reference path="../../modules/default/templates/personalities.ts" />

/// <reference path="../player.ts"/>
/// <reference path="../galaxymap.ts"/>
/// <reference path="objectivesai.ts"/>
/// <reference path="front.ts"/>
/// <reference path="mapevaluator.ts"/>
/// <reference path="objectivesai.ts"/>

module Rance
{
  export module MapAI
  {
    interface IFrontUnitScore
    {
      unit: Unit;
      front: Front;
      score: number;
    }
    export class FrontsAI
    {
      player: Player;
      map: GalaxyMap;
      mapEvaluator: MapEvaluator;
      objectivesAI: ObjectivesAI;
      personality: IPersonality;

      fronts: Front[] = [];
      frontsRequestingUnits: Front[] = [];
      frontsToMove: Front[] = [];

      constructor(mapEvaluator: MapEvaluator, objectivesAI: ObjectivesAI,
        personality: IPersonality)
      {
        this.mapEvaluator = mapEvaluator;
        this.map = mapEvaluator.map;
        this.player = mapEvaluator.player;
        this.objectivesAI = objectivesAI;
        this.personality = personality;
      }

      getTotalUnitCountByArchetype(): IArchetypeValues
      {
        var totalUnitCountByArchetype: IArchetypeValues = {};

        var units = this.player.getAllUnits();
        for (var i = 0; i < units.length; i++)
        {
          var unitArchetype = units[i].template.archetype;

          if (!totalUnitCountByArchetype[unitArchetype.type])
          {
            totalUnitCountByArchetype[unitArchetype.type] = 0;
          }

          totalUnitCountByArchetype[unitArchetype.type]++;
        }

        return totalUnitCountByArchetype;
      }

      getUnitCompositionDeviationFromIdeal(idealWeights: IArchetypeValues,
        unitsByArchetype: IArchetypeValues)
      {
        var relativeWeights = getRelativeWeightsFromObject(unitsByArchetype);

        var deviationFromIdeal: IArchetypeValues = {};

        for (var archetype in idealWeights)
        {
          var ideal = idealWeights[archetype];
          var actual = relativeWeights[archetype] || 0;

          deviationFromIdeal[archetype] = ideal - actual;
        }

        return deviationFromIdeal;
      }

      getGlobalUnitArcheypeScores()
      {
        var ideal = this.personality.unitCompositionPreference;
        var actual = this.getTotalUnitCountByArchetype();
        return this.getUnitCompositionDeviationFromIdeal(ideal, actual);
      }
      getFrontUnitArchetypeScores(front: Front): IArchetypeValues
      {
        switch (front.objective.type)
        {
          case "discovery":
          {
            
          }
          default:
          {
            return this.getDefaultFrontUnitArchetypeScores(front);
          }
        }
      }
      getDefaultFrontUnitArchetypeScores(front: Front): IArchetypeValues
      {
        var relativeFrontSize =
          front.units.length / Object.keys(this.player.units).length;
        var globalPreferenceWeight = relativeFrontSize;

        var globalScores = this.getGlobalUnitArcheypeScores();

        var scores: IArchetypeValues = {};

        var frontArchetypes = front.getUnitCountByArchetype();
        var frontScores = this.getUnitCompositionDeviationFromIdeal(
          this.personality.unitCompositionPreference, frontArchetypes);

        for (var archetype in globalScores)
        {
          scores[archetype] = globalScores[archetype] * globalPreferenceWeight;
          scores[archetype] += frontScores[archetype];
          scores[archetype] /= 2;
        }

        return scores;
      }
      private getUnitScoresForFront(units: Unit[], front: Front)
      {
        var scores: IFrontUnitScore[] = [];

        for (var i = 0; i < units.length; i++)
        {
          scores.push(
          {
            unit: units[i],
            score: front.scoreUnitFit(units[i]),
            front: front
          });
        }

        return scores;
      }

      assignUnits()
      {
        var units = this.player.getAllUnits();

        var allUnitScores: IFrontUnitScore[] = [];
        var unitScoresByFront:
        {
          [frontId: number]: any[];
        } = {};

        var recalculateScoresForFront = function(front: Front)
        {
          var frontScores = unitScoresByFront[front.id];

          for (var i = 0; i < frontScores.length; i++)
          {
            var unit = frontScores[i].unit;
            frontScores[i].score = this.scoreUnitFitForFront(unit, front);
          }
        }.bind(this);

        var removeUnit = function(unit: Unit)
        {
          for (var frontId in unitScoresByFront)
          {
            unitScoresByFront[frontId] = unitScoresByFront[frontId].filter(function(score)
            {
              return score.unit !== unit;
            });
          }
        }

        // ascending
        var sortByScoreFN = function(a: IFrontUnitScore, b: IFrontUnitScore)
        {
          return a.score - b.score;
        }

        for (var i = 0; i < this.fronts.length; i++)
        {
          var frontScores = this.getUnitScoresForFront(units, this.fronts[i]);
          unitScoresByFront[this.fronts[i].id] = frontScores;
          allUnitScores = allUnitScores.concat(frontScores);
        }

        var alreadyAdded:
        {
          [unitId: number]: boolean;
        } = {};


        while (allUnitScores.length > 0)
        {
          // sorted in loop as scores get recalculated every iteration
          allUnitScores.sort(sortByScoreFN);

          var bestScore = allUnitScores.pop();
          if (alreadyAdded[bestScore.unit.id])
          {
            continue;
          }

          bestScore.front.addUnit(bestScore.unit);

          removeUnit(bestScore.unit);
          alreadyAdded[bestScore.unit.id] = true;
          recalculateScoresForFront(bestScore.front);
        }
      }

      getFrontWithId(id: number)
      {
        for (var i = 0; i < this.fronts.length; i++)
        {
          if (this.fronts[i].id === id)
          {
            return this.fronts[i];
          }
        }

        return null;
      }

      createFront(objective: Objective)
      {
        var musterLocation = objective.target ?
          this.player.getNearestOwnedStarTo(objective.target) :
          null;
        var unitsDesired = objective.getUnitsDesired();

        var front = new Front(
        {
          id: objective.id,
          priority: objective.priority,
          objective: objective,

          minUnitsDesired: unitsDesired.min,
          idealUnitsDesired: unitsDesired.ideal,

          targetLocation: objective.target,
          musterLocation: musterLocation
        });

        return front;
      }

      removeInactiveFronts()
      {
        // loop backwards because splicing
        for (var i = this.fronts.length - 1; i >= 0; i--)
        {
          var front = this.fronts[i];
          var hasActiveObjective = false;

          for (var j = 0; j < this.objectivesAI.objectives.length; j++)
          {
            var objective = this.objectivesAI.objectives[j];
            if (objective.id === front.id && objective.priority > 0.04)
            {
              hasActiveObjective = true;
              break;
            }
          }

          if (!hasActiveObjective)
          {
            this.fronts.splice(i, 1);
          }
        }
      }

      formFronts()
      {
        /*
        dissolve old fronts without an active objective
        create new fronts for every objective not already assoicated with one
         */
        this.removeInactiveFronts();

        for (var i = 0; i < this.objectivesAI.objectives.length; i++)
        {
          var objective = this.objectivesAI.objectives[i];

          if (objective.priority > 0.04)
          {
            if (!this.getFrontWithId(objective.id))
            {
              var front = this.createFront(objective);
              this.fronts.push(front);
            }
          }
        }
      }

      organizeFleets()
      {
        for (var i = 0; i < this.fronts.length; i++)
        {
          this.fronts[i].organizeFleets();
        }
      }

      setFrontsToMove()
      {
        this.frontsToMove = this.fronts.slice(0);

        var frontMovePriorities =
        {
          discovery: 999,
          expansion: 4,
          cleanPirates: 3,
          heal: -1
        }

        this.frontsToMove.sort(function(a: Front, b: Front)
        {
          return frontMovePriorities[a.objective.type] - frontMovePriorities[b.objective.type];
        });
      }

      moveFleets(afterMovingAllCallback: Function)
      {
        var front = this.frontsToMove.pop();

        if (!front)
        {
          afterMovingAllCallback();
          return;
        }

        front.moveFleets(this.moveFleets.bind(this, afterMovingAllCallback));
      }

      setUnitRequests()
      {
        /*for each front that doesnt fulfill minimum unit requirement
          make request with same priority of front
        */
       
        this.frontsRequestingUnits = [];

        for (var i = 0; i < this.fronts.length; i++)
        {
          var front = this.fronts[i];
          if (front.units.length < front.idealUnitsDesired)
          {
            this.frontsRequestingUnits.push(front);
          }
        }
      }
    }
  }
}
