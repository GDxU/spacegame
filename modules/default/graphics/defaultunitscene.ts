/// <reference path="../../../lib/pixi.d.ts"/>
/// <reference path="../../../src/templateinterfaces/iunitdrawingfunction.d.ts"/>
/// <reference path="../../../src/templateinterfaces/sfxparams.d.ts"/>

module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export var defaultUnitScene: Rance.Templates.IUnitDrawingFunction = function(
        unit: Unit,
        SFXParams: Rance.Templates.SFXParams
      )
      {
        var spriteTemplate = unit.template.sprite;
        var texture = PIXI.Texture.fromFrame(spriteTemplate.imageSrc);

        var container = new PIXI.Container;

        var props =
        {
          zDistance: 8,
          xDistance: 5,
          maxUnitsPerColumn: 7,
          degree: -0.5,
          rotationAngle: 70,
          scalingFactor: 0.04
        };

        var maxUnitsPerColumn = props.maxUnitsPerColumn;
        var isConvex = true
        var degree = props.degree;
        if (degree < 0)
        {
          isConvex = !isConvex;
          degree = Math.abs(degree);
        }

        var image = app.images[spriteTemplate.imageSrc];

        var zDistance: number = props.zDistance;
        var xDistance: number = props.xDistance;
        var unitsToDraw: number;
        if (!unit.isSquadron)
        {
          unitsToDraw = 1;
        }
        else
        {
          var lastHealthDrawnAt = unit.lastHealthDrawnAt || unit.battleStats.lastHealthBeforeReceivingDamage;
          unit.lastHealthDrawnAt = unit.currentHealth;
          unitsToDraw = Math.round(lastHealthDrawnAt * 0.04) * (1 / unit.template.maxHealth);
          var heightRatio = 25 / image.height;
          heightRatio = Math.min(heightRatio, 1.25);
          maxUnitsPerColumn = Math.round(maxUnitsPerColumn * heightRatio);
          unitsToDraw = Math.round(unitsToDraw * heightRatio);
          zDistance *= (1 / heightRatio);

          unitsToDraw = clamp(unitsToDraw, 1, maxUnitsPerColumn * 3);
        }

        var xMin: number, xMax: number, yMin: number, yMax: number;

        var rotationAngle = Math.PI / 180 * props.rotationAngle;
        var sA = Math.sin(rotationAngle);
        var cA = Math.cos(rotationAngle);

        var rotationMatrix =
        [
          1, 0, 0,
          0, cA, -sA,
          0, sA, cA
        ];

        var minXOffset = isConvex ? 0 : Math.sin(Math.PI / (maxUnitsPerColumn + 1));

        var yPadding = Math.min(SFXParams.height * 0.1, 30);
        var desiredHeight = SFXParams.height - yPadding;

        var averageHeight = image.height * (maxUnitsPerColumn / 2 * props.scalingFactor);
        var spaceToFill = desiredHeight - (averageHeight * maxUnitsPerColumn);
        zDistance = spaceToFill / maxUnitsPerColumn * 1.35;

        for (var i = unitsToDraw - 1; i >= 0; i--)
        {
          var column = Math.floor(i / maxUnitsPerColumn);
          var isLastColumn = column === Math.floor(unitsToDraw / maxUnitsPerColumn);

          var zPos: number;
          if (isLastColumn)
          {
            var maxUnitsInThisColumn = unitsToDraw % maxUnitsPerColumn;
            if (maxUnitsInThisColumn === 1)
            {
              zPos = (maxUnitsPerColumn - 1) / 2;
            }
            else
            {
              var positionInLastColumn = i % maxUnitsInThisColumn;
              zPos = positionInLastColumn * ((maxUnitsPerColumn - 1) / (maxUnitsInThisColumn - 1));
            }
          }
          else
          {
            zPos = i % maxUnitsPerColumn;
          }

          var xOffset = Math.sin(Math.PI / (maxUnitsPerColumn + 1) * (zPos + 1));
          if (isConvex)
          {
            xOffset = 1 - xOffset;
          }

          xOffset -= minXOffset;

          var scale = 1 - zPos * props.scalingFactor;
          var scaledWidth = image.width * scale;
          var scaledHeight = image.height * scale;
          

          var x = xOffset * scaledWidth * degree + column * (scaledWidth + xDistance * scale);
          var y = (scaledHeight + zDistance * scale) * (maxUnitsPerColumn - zPos);

          var translated = transformMat3({x: x, y: y}, rotationMatrix);

          x = Math.round(translated.x);
          y = Math.round(translated.y);

          var sprite = new PIXI.Sprite(texture);


          sprite.scale.x = sprite.scale.y = scale;

          sprite.x = x;
          sprite.y = y;

          container.addChild(sprite);
        }

        SFXParams.triggerStart(container);

        return container;
      }
    }
  }
}
