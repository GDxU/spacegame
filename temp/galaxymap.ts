/// <reference path="../lib/voronoi.d.ts" />

/// <reference path="mapgencore/mapgenresult.ts" />
/// <reference path="game.ts" />
/// <reference path="fillerpoint.ts" />
/// <reference path="star.ts" />
/// <reference path="mapvoronoiinfo.ts" />
/// <reference path="savedata/igalaxymapsavedata.d.ts" />

export class GalaxyMap
{
  stars: Star[];
  fillerPoints: FillerPoint[];
  width: number;
  height: number;
  seed: string;

  independents: Player[];
  voronoi: MapVoronoiInfo;

  constructor(mapGen: MapGenCore.MapGenResult)
  {
    this.width = mapGen.width;
    this.height = mapGen.height;

    this.seed = mapGen.seed;

    this.stars = mapGen.stars;
    this.fillerPoints = mapGen.fillerPoints;

    this.independents = mapGen.independents;
    this.voronoi = mapGen.voronoiInfo;
  }
  getIncomeBounds()
  {
    var min: number, max: number;

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
  serialize(): IGalaxyMapSaveData
  {
    var data: IGalaxyMapSaveData =
    {
      stars: this.stars.map(function(star)
      {
        return star.serialize();
      }),

      fillerPoints: this.fillerPoints.map(function(fillerPoint)
      {
        return fillerPoint.serialize();
      }),

      width: this.width,
      height: this.height,
      seed: this.seed
    };


    return data;
  }
}