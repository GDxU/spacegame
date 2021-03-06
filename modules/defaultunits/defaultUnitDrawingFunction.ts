/// <reference path="../../lib/pixi.d.ts" />

import UnitDrawingFunction from "../../src/templateinterfaces/UnitDrawingFunction";


import app from "../../src/App"; // TODO global
import UnitDrawingFunctionData from "../../src/UnitDrawingFunctionData";
import
{
  clamp,
  transformMat3,
} from "../../src/utility";


const defaultUnitDrawingFunction: UnitDrawingFunction = (unit, sfxParams) =>
{
  const spriteTemplate = unit.template.sprite;
  const texture = PIXI.Texture.fromFrame(spriteTemplate.imageSrc);

  const container = new PIXI.Container();

  const props =
  {
    zDistance: 8,
    xDistance: 5,
    maxUnitsPerColumn: 7,
    curvature: -0.5,
    rotationAngle: 70,
    scalingFactor: 0.04,
  };

  let maxUnitsPerColumn = props.maxUnitsPerColumn;
  const maxColumns = 3;
  const isConvex = props.curvature >= 0;
  const curvature = Math.abs(props.curvature);

  const image = app.images[spriteTemplate.imageSrc];

  let zDistance: number = props.zDistance;
  const xDistance: number = props.xDistance;
  let unitsToDraw: number;
  if (!unit.template.isSquadron)
  {
    unitsToDraw = 1;
  }
  else
  {
    const lastHealthDrawnAt = unit.lastHealthDrawnAt || unit.battleStats.lastHealthBeforeReceivingDamage;
    unit.lastHealthDrawnAt = unit.currentHealth;
    unitsToDraw = Math.round(lastHealthDrawnAt * 0.04);
    const desiredHeightRatio = 25 / image.height;
    const heightRatio = Math.min(desiredHeightRatio, 1.25);
    maxUnitsPerColumn = Math.round(maxUnitsPerColumn * heightRatio);
    unitsToDraw = Math.round(unitsToDraw * heightRatio);
    zDistance *= (1 / heightRatio);

    unitsToDraw = clamp(unitsToDraw, 1, maxUnitsPerColumn * maxColumns);
  }

  const rotationAngle = Math.PI / 180 * props.rotationAngle;
  const sA = Math.sin(rotationAngle);
  const cA = Math.cos(rotationAngle);

  const rotationMatrix =
  [
    1, 0, 0,
    0, cA, -sA,
    0, sA, cA,
  ];

  const minXOffset = isConvex ? 0 : Math.sin(Math.PI / (maxUnitsPerColumn + 1));

  const yPadding = Math.min(sfxParams.height * 0.1, 30);
  const desiredHeight = sfxParams.height - yPadding;

  const averageHeight = image.height * (maxUnitsPerColumn / 2 * props.scalingFactor);
  const spaceToFill = desiredHeight - (averageHeight * maxUnitsPerColumn);
  zDistance = spaceToFill / maxUnitsPerColumn * 1.35;

  const boundingBox:
  {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  } =
  {
    x1: undefined,
    x2: undefined,
    y1: undefined,
    y2: undefined,
  };
  const allUnitBoundingBoxes: PIXI.Rectangle[] = [];
  let primaryAttackOriginPoint: Point;
  const sequentialAttackOriginPoints: Point[] = [];

  const lastColumn = Math.floor(unitsToDraw / maxUnitsPerColumn);
  const maxUnitsInLastColumn = unitsToDraw % maxUnitsPerColumn;
  const firstIndexForLastColumn = maxUnitsPerColumn * lastColumn;

  const unitsInFirstColumn = lastColumn > 0 ? maxUnitsPerColumn : unitsToDraw;
  const centermostUnitInFirstColumn = Math.ceil(unitsInFirstColumn / 2) - 1;

  for (let i = 0; i < unitsToDraw; i++)
  {
    const column = Math.floor(i / maxUnitsPerColumn);
    const columnFromRight = lastColumn - column;

    let zPos: number;
    if (column === lastColumn)
    {
      if (maxUnitsInLastColumn === 1)
      {
        zPos = (maxUnitsPerColumn - 1) / 2;
      }
      else
      {
        const positionInLastColumn = i - firstIndexForLastColumn;
        zPos = positionInLastColumn * ((maxUnitsPerColumn - 1) / (maxUnitsInLastColumn - 1));
      }
    }
    else
    {
      zPos = i % maxUnitsPerColumn;
    }

    let xOffset = Math.sin(Math.PI / (maxUnitsPerColumn + 1) * (zPos + 1));
    if (isConvex)
    {
      xOffset = 1 - xOffset;
    }
    xOffset -= minXOffset;

    const scale = 1 - zPos * props.scalingFactor;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;


    let x = xOffset * scaledWidth * curvature + columnFromRight * (scaledWidth + xDistance * scale);
    let y = (scaledHeight + zDistance * scale) * (maxUnitsPerColumn - zPos);

    const translated = transformMat3({x: x, y: y}, rotationMatrix);

    x = Math.round(translated.x);
    y = Math.round(translated.y);


    const attackOriginPoint =
    {
      x: x + scaledWidth * spriteTemplate.attackOriginPoint.x,
      y: y + scaledHeight * spriteTemplate.attackOriginPoint.y,
    };

    sequentialAttackOriginPoints.push(attackOriginPoint);

    if (column === 0 && i === centermostUnitInFirstColumn)
    {
      primaryAttackOriginPoint = attackOriginPoint;
    }

    const sprite = new PIXI.Sprite(texture);
    sprite.scale.x = sprite.scale.y = scale;

    sprite.x = x;
    sprite.y = y;

    container.addChild(sprite);

    const unitBounds = new PIXI.Rectangle(
      x,
      y,
      scaledWidth,
      scaledHeight,
    );

    allUnitBoundingBoxes.push(unitBounds);

    boundingBox.x1 = isFinite(boundingBox.x1) ? Math.min(boundingBox.x1, x) : x;
    boundingBox.y1 = isFinite(boundingBox.y1) ? Math.min(boundingBox.y1, y) : y;
    boundingBox.x2 = isFinite(boundingBox.x2) ? Math.max(boundingBox.x2, x + scaledWidth) : x + scaledWidth;
    boundingBox.y2 = isFinite(boundingBox.y2) ? Math.max(boundingBox.y2, y + scaledHeight) : y + scaledHeight;
  }

  unit.drawingFunctionData = new UnitDrawingFunctionData(
  {
    boundingBox: new PIXI.Rectangle(
      boundingBox.x1,
      boundingBox.y1,
      boundingBox.x2 - boundingBox.x1,
      boundingBox.y2 - boundingBox.y1,
    ),
    individualUnitBoundingBoxes: allUnitBoundingBoxes,
    singleAttackOriginPoint: primaryAttackOriginPoint,
    sequentialAttackOriginPoints: sequentialAttackOriginPoints,
  });

  sfxParams.triggerStart(container);
};

export default defaultUnitDrawingFunction;
