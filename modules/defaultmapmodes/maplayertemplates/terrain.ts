/// <reference path="../../../lib/pixi.d.ts" />
/// <reference path="../../../lib/offset.d.ts" />

import * as Terrains from "../../common/terraintemplates/terrains";

import triangulate from "../../defaultmapgen/common/triangulate";

import GalaxyMap from "../../../src/GalaxyMap";
import Player from "../../../src/Player";
import
{
  getRandomArrayItemWithWeights,
  randInt,
} from "../../../src/utility";

import MapRendererLayerTemplate from "../../../src/templateinterfaces/MapRendererLayerTemplate";


// TODO 2017.08.18 | doesn't belong here
function generatePointsInPolygon(polygon: Point[], density: number, margin: number): Point[]
{
  const points: Point[] = [];

  const offset = new Offset();
  offset.arcSegments(0);

  const offsetPolygon = offset.data(polygon).padding(margin);

  const triangles = triangulate(offsetPolygon);

  const trianglesWeightedByArea = triangles.map(triangle =>
  {
    return(
    {
      triangle: triangle,
      weight: triangle.getArea(),
    });
  });

  const totalArea = trianglesWeightedByArea.reduce((total, current) =>
  {
    return total + current.weight;
  }, 0);

  const amountOfPointsToGenerate = totalArea * density;

  for (let i = 0; i < amountOfPointsToGenerate; i++)
  {
    const triangle = getRandomArrayItemWithWeights(trianglesWeightedByArea).triangle;

    points.push(triangle.getRandomPoint());
  }

  return points;
}

export const terrain: MapRendererLayerTemplate =
{
  key: "terrain",
  displayName: "Terrain",
  interactive: false,
  isUsedForCameraBounds: false,
  drawingFunction: (map: GalaxyMap, perspectivePlayer: Player) =>
  {
    const doc = new PIXI.Container();

    const points = perspectivePlayer ? perspectivePlayer.getRevealedStars() : map.stars;

    for (let i = 0; i < points.length; i++)
    {
      const star = points[i];
      if (!star.resource)
      {
        continue;
      }

      switch (star.terrain)
      {
        case Terrains.asteroidsTerrain:
        {
          const count = 0.0004;
          const asteroidPositions = generatePointsInPolygon(star.voronoiCell.vertices, count, 10);

          const gfx = new PIXI.Graphics();
          gfx.beginFill(0x54392F, 1.0);

          asteroidPositions.forEach(asteroidPosition =>
          {
            gfx.drawCircle(
              asteroidPosition.x,
              asteroidPosition.y,
              randInt(4, 7),
            );
          });

          gfx.endFill();
          doc.addChild(gfx);

          break;
        }
        default:
        {
          break;
        }
      }
    }

    return doc;
  },
};
