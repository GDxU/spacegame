/// <reference path="../lib/voronoi.d.ts" />

/// <reference path="star.ts" />
/// <reference path="maprenderer.ts" />

module Rance
{
  export class GalaxyMap
  {
    allPoints: Star[];
    stars: Star[];
    mapGen: MapGen;
    width: number;
    height: number;
    game: Game;
    constructor()
    {
    }

    setMapGen(mapGen: MapGen)
    {
      this.mapGen = mapGen;

      this.width = mapGen.maxWidth * 2;
      this.height = mapGen.maxHeight * 2;

      this.allPoints = mapGen.points;
      this.stars = mapGen.getNonFillerPoints();
    }
    getIncomeBounds()
    {
      var min, max;

      for (var i = 0; i < this.stars.length; i++)
      {
        var star = this.stars[i];
        var income = star.getIncome();
        if (!min) min = max = income;
        else
        {
          if (income < min) min = income;
          else if (income > max) max = income;
        }
      }

      return(
      {
        min: min,
        max: max
      });
    }
    serialize()
    {
      var data: any = {};

      data.allPoints = this.allPoints.map(function(star)
      {
        return star.serialize();
      });

      data.maxWidth = this.mapGen.maxWidth;
      data.maxHeight = this.mapGen.maxHeight;

      return data;
    }
  }
}
