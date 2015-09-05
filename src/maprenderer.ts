/// <reference path="../lib/pixi.d.ts" />


/// <reference path="eventmanager.ts"/>
/// <reference path="utility.ts"/>
/// <reference path="color.ts"/>

/// <reference path="borderpolygon.ts"/>

/// <reference path="galaxymap.ts" />
/// <reference path="star.ts" />
/// <reference path="fleet.ts" />
/// <reference path="player.ts" />

module Rance
{
  export interface IMapRendererLayer
  {
    drawingFunction: (map: GalaxyMap) => PIXI.Container;
    container: PIXI.Container;
    interactive: boolean;
    isDirty: boolean;
  }
  export interface IMapRendererLayerMapMode
  {
    name: string;
    displayName: string;
    layers:
    {
      layer: IMapRendererLayer;
    }[];
  }
  export class MapRenderer
  {
    container: PIXI.Container;
    parent: PIXI.Container;
    galaxyMap: GalaxyMap;
    player: Player;

    occupationShaders:
    {
      [ownerId: string]:
      {
        [occupierId: string]: PIXI.AbstractFilter;
      };
    } = {};

    layers:
    {
      [name: string]: IMapRendererLayer;
    } = {};
    mapModes:
    {
      [name: string]: IMapRendererLayerMapMode;
    } = {};

    fowTilingSprite: PIXI.extras.TilingSprite;
    fowSpriteCache:
    {
      [starId: number]: PIXI.Sprite;
    } = {};

    fleetTextTextureCache:
    {
      [fleetSize: number]: PIXI.Texture;
    } = {};

    currentMapMode: IMapRendererLayerMapMode;
    isDirty: boolean = true;
    preventRender: boolean = false;

    listeners:
    {
      [name: string]: Function;
    } = {};

    constructor(map: GalaxyMap, player: Player)
    {
      this.container = new PIXI.Container();

      this.galaxyMap = map;
      this.player = player;
    }
    destroy()
    {
      this.preventRender = true;
      this.container.renderable = false;

      for (var name in this.listeners)
      {
        eventManager.removeEventListener(name, this.listeners[name]);
      }
      
      this.container.removeChildren();
      this.parent.removeChild(this.container);

      this.player = null;
      this.container = null;
      this.parent = null;
      this.occupationShaders = null;
      
      for (var starId in this.fowSpriteCache)
      {
        var sprite = this.fowSpriteCache[starId];
        sprite.renderable = false;
        sprite.texture.destroy(true);
        this.fowSpriteCache[starId] = null;
      }
      for (var fleetSize in this.fleetTextTextureCache)
      {
        var texture = this.fleetTextTextureCache[fleetSize];
        texture.destroy(true);
      }

    }
    init()
    {
      this.makeFowSprite();

      this.initLayers();
      this.initMapModes();

      this.addEventListeners();
    }
    addEventListeners()
    {
      var self = this;
      this.listeners["renderMap"] =
        eventManager.addEventListener("renderMap", this.setAllLayersAsDirty.bind(this));
      this.listeners["renderLayer"] =
        eventManager.addEventListener("renderLayer", function(layerName: string)
      {
        self.setLayerAsDirty(layerName);
      });

      var boundUpdateOffsets = this.updateShaderOffsets.bind(this);
      var boundUpdateZoom = this.updateShaderZoom.bind(this);

      this.listeners["registerOnMoveCallback"] =
        eventManager.addEventListener("registerOnMoveCallback", function(callbacks: Function[])
        {
          callbacks.push(boundUpdateOffsets);
        });
      this.listeners["registerOnZoomCallback"] =
        eventManager.addEventListener("registerOnZoomCallback", function(callbacks: Function[])
        {
          callbacks.push(boundUpdateZoom);
        });
    }
    setPlayer(player: Player)
    {
      this.player = player;
      this.setAllLayersAsDirty();
    }
    updateShaderOffsets(x: number, y: number)
    {
      for (var owner in this.occupationShaders)
      {
        for (var occupier in this.occupationShaders[owner])
        {
          var shader = this.occupationShaders[owner][occupier];
          shader.uniforms.offset.value = {x: -x, y: y};
        }
      }
    }
    updateShaderZoom(zoom: number)
    {
      for (var owner in this.occupationShaders)
      {
        for (var occupier in this.occupationShaders[owner])
        {
          var shader = this.occupationShaders[owner][occupier];
          shader.uniforms.zoom.value = zoom;
        }
      }
    }
    makeFowSprite()
    {
      if (!this.fowTilingSprite)
      {
        var fowTexture = PIXI.Texture.fromFrame("img\/fowTexture.png");
        var w = this.galaxyMap.width;
        var h = this.galaxyMap.height;

        this.fowTilingSprite = new PIXI.extras.TilingSprite(fowTexture, w, h);
      }
    }
    getFowSpriteForStar(star: Star)
    {
      // silly hack to make sure first texture gets created properly
      if (!this.fowSpriteCache[star.id] ||
        Object.keys(this.fowSpriteCache).length < 4)
      {
        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
        var gfx = new PIXI.Graphics();
        gfx.isMask = true;
        gfx.beginFill(0);
        gfx.drawShape(poly);
        gfx.endFill();

        this.fowTilingSprite.removeChildren();

        this.fowTilingSprite.mask = gfx;
        this.fowTilingSprite.addChild(gfx);

        var rendered = this.fowTilingSprite.generateTexture(app.renderer.renderer);

        var sprite = new PIXI.Sprite(rendered);

        this.fowSpriteCache[star.id] = sprite;
        this.fowTilingSprite.mask = null;
      }

      return this.fowSpriteCache[star.id];
    }
    getOccupationShader(owner: Player, occupier: Player)
    {
      if (!this.occupationShaders[owner.id])
      {
        this.occupationShaders[owner.id] = {};
      }

      if (!this.occupationShaders[owner.id][occupier.id])
      {
        var baseColor = PIXI.utils.hex2rgb(owner.color);
        baseColor.push(1.0);
        var occupierColor = PIXI.utils.hex2rgb(occupier.color);
        occupierColor.push(1.0);

        var uniforms =
        {
          baseColor: {type: "4fv", value: baseColor},
          lineColor: {type: "4fv", value: occupierColor},
          gapSize: {type: "1f", value: 3.0},
          offset: {type: "2f", value: {x: 0.0, y: 0.0}},
          zoom: {type: "1f", value: 1.0}
        };

        var shaderSrc =
        [
          "precision mediump float;",

          "uniform sampler2D uSampler;",

          "varying vec2 vTextureCoord;",
          "varying vec4 vColor;",

          "uniform vec4 baseColor;",
          "uniform vec4 lineColor;",
          "uniform float gapSize;",
          "uniform vec2 offset;",
          "uniform float zoom;",

          "void main( void )",
          "{",
          "  vec2 position = gl_FragCoord.xy + offset;",
          "  position.x += position.y;",
          "  float scaled = floor(position.x * 0.1 / zoom);",
          "  float res = mod(scaled, gapSize);",
          "  if(res > 0.0)",
          "  {",
          "    gl_FragColor = mix(gl_FragColor, baseColor, 0.5);",
          "  }",
          "  else",
          "  {",
          "    gl_FragColor = mix(gl_FragColor, lineColor, 0.5);",
          "  }",
          "}"
        ];

        this.occupationShaders[owner.id][occupier.id] = new PIXI.AbstractFilter(
          null, shaderSrc, uniforms);
      }

      return this.occupationShaders[owner.id][occupier.id]
    }
    getFleetTextTexture(fleet: Fleet)
    {
      var fleetSize = fleet.ships.length;

      if (!this.fleetTextTextureCache[fleetSize])
      {
        var text = new PIXI.Text("" + fleet.ships.length,
        {
          fill: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 3
        });

        // triggers bounds update that gets skipped if we just call generateTexture()
        text.getBounds();

        this.fleetTextTextureCache[fleetSize] = text.generateTexture(app.renderer.renderer);
        window.setTimeout(function()
        {
          text.texture.destroy(true);
        }, 0);
      }

      return this.fleetTextTextureCache[fleetSize];
    }
    initLayers()
    {
      if (this.layers["nonFillerStars"]) return;
      this.layers["nonFillerStars"] =
      {
        isDirty: true,
        interactive: true,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();

          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }

          var mouseDownFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("mouseDown", event, this);
          }
          var mouseUpFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("mouseUp", event);
          }
          var onClickFN = function(star: Star)
          {
            eventManager.dispatchEvent("starClick", star);
          }
          var mouseOverFN = function(star: Star)
          {
            eventManager.dispatchEvent("hoverStar", star);
          }
          var mouseOutFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("clearHover");
          }
          var touchStartFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("touchStart", event);
          }
          var touchEndFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("touchEnd", event);
          }
          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            var starSize = 1;
            if (star.buildings["defence"])
            {
              starSize += star.buildings["defence"].length * 2;
            }
            var gfx = new PIXI.Graphics();
            if (!star.owner.isIndependent)
            {
              gfx.lineStyle(starSize / 2, star.owner.color, 1);
            }
            gfx.beginFill(0xFFFFF0);
            gfx.drawEllipse(star.x, star.y, starSize, starSize);
            gfx.endFill();


            gfx.interactive = true;
            gfx.hitArea = new PIXI.Polygon(star.voronoiCell.vertices);

            var boundMouseDown = mouseDownFN.bind(star);
            var gfxClickFN = function(event: PIXI.interaction.InteractionEvent)
            {
              var originalEvent = <MouseEvent> event.data.originalEvent;
              if (originalEvent.button) return;

              onClickFN(this);
            }.bind(star);

            gfx.on("mousedown", boundMouseDown);
            gfx.on("mouseup", mouseUpFN);
            gfx.on("rightdown", boundMouseDown);
            gfx.on("rightup", mouseUpFN);
            gfx.on("click", gfxClickFN);
            gfx.on("mouseover", mouseOverFN.bind(gfx, star));
            gfx.on("mouseout", mouseOutFN);
            gfx.on("tap", gfxClickFN);

            doc.addChild(gfx);
          }

          doc.interactive = true;

          // cant be set on gfx as touchmove and touchend only register
          // on the object that had touchstart called on it
          doc.on("touchstart", touchStartFN);
          doc.on("touchend", touchEndFN);
          doc.on("touchmove", function(event: PIXI.interaction.InteractionEvent)
          {
            var local = event.data.getLocalPosition(doc);
            var starAtLocal = map.voronoi.getStarAtPoint(local);
            if (starAtLocal)
            {
              eventManager.dispatchEvent("hoverStar", starAtLocal);
            }
          });

          return doc;
        }
      }
      this.layers["starOwners"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();
          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            if (!star.owner || star.owner.colorAlpha === 0) continue;

            var poly = new PIXI.Polygon(star.voronoiCell.vertices);
            var gfx = new PIXI.Graphics();
            var alpha = 0.5;
            if (isFinite(star.owner.colorAlpha)) alpha *= star.owner.colorAlpha;
            gfx.beginFill(star.owner.color, alpha);
            gfx.drawShape(poly);
            gfx.endFill();
            doc.addChild(gfx);

            var occupier = star.getSecondaryController();
            if (occupier)
            {
              gfx.filters = [this.getOccupationShader(star.owner, occupier)];
              //gfx.filters = [testFilter];
              var mask = new PIXI.Graphics();
              mask.beginFill(0);
              mask.drawShape(poly);
              mask.endFill();
              gfx.mask = mask;
              gfx.addChild(mask);
            }
          }
          return doc;
        }
      }
      this.layers["fogOfWar"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();
          if (!this.player) return doc;
          var points: Star[] = this.player.getRevealedButNotVisibleStars();

          if (!points || points.length < 1) return doc;

          doc.alpha = 0.35;
          
          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            var sprite = this.getFowSpriteForStar(star);

            doc.addChild(sprite);
          }

          return doc;
        }
      }
      this.layers["starIncome"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();
          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }
          var incomeBounds = map.getIncomeBounds();

          function getRelativeValue(min: number, max: number, value: number)
          {
            var difference = max - min;
            if (difference < 1) difference = 1;
            // clamps to n different colors
            var threshhold = difference / 10;
            if (threshhold < 1) threshhold = 1;
            var relative = (Math.round(value/threshhold) * threshhold - min) / (difference);
            return relative;
          }

          var colorIndexes:
          {
            [value: number]: number;
          } = {};

          function getRelativeColor(min: number, max: number, value: number)
          {
            if (!colorIndexes[value])
            {
              if (value < 0) value = 0;
              else if (value > 1) value = 1;

              var deviation = Math.abs(0.5 - value) * 2;

              var hue = 110 * value;
              var saturation = 0.5 + 0.2 * deviation;
              var lightness = 0.6 + 0.25 * deviation;

              colorIndexes[value] = hslToHex(hue / 360, saturation, lightness / 2);
            }
            return colorIndexes[value];
          }

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            var income = star.getIncome();
            var relativeIncome = getRelativeValue(incomeBounds.min, incomeBounds.max, income);
            var color = getRelativeColor(incomeBounds.min, incomeBounds.max, relativeIncome);

            var poly = new PIXI.Polygon(star.voronoiCell.vertices);
            var gfx = new PIXI.Graphics();
            gfx.beginFill(color, 0.6);
            gfx.drawShape(poly);
            gfx.endFill();
            doc.addChild(gfx);
          }
          return doc;
        }
      }
      this.layers["playerInfluence"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();
          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }
          var mapEvaluator = new MapEvaluator(map, this.player);
          var influenceByStar = mapEvaluator.buildPlayerInfluenceMap(this.player);

          var minInfluence: number, maxInfluence: number;

          for (var starId in influenceByStar)
          {
            var influence = influenceByStar[starId];
            if (!isFinite(minInfluence) || influence < minInfluence)
            {
              minInfluence = influence;
            }
            if (!isFinite(maxInfluence) || influence > maxInfluence)
            {
              maxInfluence = influence;
            }
          }

          function getRelativeValue(min: number, max: number, value: number)
          {
            var difference = max - min;
            if (difference < 1) difference = 1;
            // clamps to n different colors
            var threshhold = difference / 10;
            if (threshhold < 1) threshhold = 1;
            var relative = (Math.round(value/threshhold) * threshhold - min) / (difference);
            return relative;
          }

          var colorIndexes:
          {
            [value: number]: number;
          } = {};

          function getRelativeColor(min: number, max: number, value: number)
          {
            if (!colorIndexes[value])
            {
              if (value < 0) value = 0;
              else if (value > 1) value = 1;

              var deviation = Math.abs(0.5 - value) * 2;

              var hue = 110 * value;
              var saturation = 0.5 + 0.2 * deviation;
              var lightness = 0.6 + 0.25 * deviation;

              colorIndexes[value] = hslToHex(hue / 360, saturation, lightness / 2);
            }
            return colorIndexes[value];
          }

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            var influence = influenceByStar[star.id];

            if (!influence) continue;

            var relativeInfluence = getRelativeValue(minInfluence, maxInfluence, influence);
            var color = getRelativeColor(minInfluence, maxInfluence, relativeInfluence);

            var poly = new PIXI.Polygon(star.voronoiCell.vertices);
            var gfx = new PIXI.Graphics();
            gfx.beginFill(color, 0.6);
            gfx.drawShape(poly);
            gfx.endFill;
            doc.addChild(gfx);
          }
          return doc;
        }
      }
      this.layers["nonFillerVoronoiLines"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();

          var gfx = new PIXI.Graphics();
          doc.addChild(gfx);
          gfx.lineStyle(1, 0xA0A0A0, 0.5);

          var visible = this.player ? this.player.getRevealedStars() : null;

          var lines = map.voronoi.getNonFillerVoronoiLines(visible);

          for (var i = 0; i < lines.length; i++)
          {
            var line = lines[i];
            gfx.moveTo(line.va.x, line.va.y);
            gfx.lineTo(line.vb.x, line.vb.y);
          }

          return doc;
        }
      }
      this.layers["ownerBorders"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();

          var revealedStars = this.player.getRevealedStars();
          var borderEdges = getRevealedBorderEdges(revealedStars, map.voronoi);

          for (var i = 0; i < borderEdges.length; i++)
          {
            var gfx = new PIXI.Graphics();
            gfx.alpha = 0.7;
            doc.addChild(gfx);
            var polyLineData = borderEdges[i];
            var player = polyLineData.points[0].star.owner;
            gfx.lineStyle(8, player.secondaryColor, 1);

            var polygon = new PIXI.Polygon(polyLineData.points);
            polygon.closed = polyLineData.isClosed;
            gfx.drawShape(polygon);
          }

          return doc;
        }
      }
      this.layers["starLinks"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var doc = new PIXI.Container();

          var gfx = new PIXI.Graphics();
          doc.addChild(gfx);
          gfx.lineStyle(1, 0xCCCCCC, 0.6);

          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }

          var starsFullyConnected:
          {
            [id: number]: boolean;
          } = {};

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            if (starsFullyConnected[star.id]) continue;

            starsFullyConnected[star.id] = true;

            for (var j = 0; j < star.linksTo.length; j++)
            {
              gfx.moveTo(star.x, star.y);
              gfx.lineTo(star.linksTo[j].x, star.linksTo[j].y);
            }
            for (var j = 0; j < star.linksFrom.length; j++)
            {
              gfx.moveTo(star.linksFrom[j].x, star.linksFrom[j].y);
              gfx.lineTo(star.x, star.y);
            }
          }
          return doc;
        }
      }
      this.layers["resources"] =
      {
        isDirty: true,
        interactive: false,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var self = this;

          var doc = new PIXI.Container();

          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getRevealedStars();
          }

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            if (!star.resource) continue;

            var text = new PIXI.Text(star.resource.displayName,
            {
              fill: "#FFFFFF",
              stroke: "#000000",
              strokeThickness: 2
            });

            text.x = star.x;
            text.x -= text.width / 2;
            text.y = star.y + 8;

            doc.addChild(text);
          }

          return doc;
        }
      }
      this.layers["fleets"] =
      {
        isDirty: true,
        interactive: true,
        container: new PIXI.Container(),
        drawingFunction: function(map: GalaxyMap)
        {
          var self = this;

          var doc = new PIXI.Container();

          var points: Star[];
          if (!this.player)
          {
            points = map.stars;
          }
          else
          {
            points = this.player.getVisibleStars();
          }

          var mouseDownFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("mouseDown", event, this.location);
          }
          var mouseUpFN = function(event: PIXI.interaction.InteractionEvent)
          {
            eventManager.dispatchEvent("mouseUp", event);
          }
          var mouseOverFN = function(fleet: Fleet)
          {
            eventManager.dispatchEvent("hoverStar", fleet.location);
          }
          function fleetClickFn(event: PIXI.interaction.InteractionEvent)
          {
            var originalEvent = <MouseEvent> event.data.originalEvent;;
            if (originalEvent.button === 0)
            {
              eventManager.dispatchEvent("selectFleets", [this]);
            }
          }
          function singleFleetDrawFN(fleet: Fleet)
          {
            var fleetContainer = new PIXI.Container();

            var color = fleet.player.color;

            var textTexture = self.getFleetTextTexture(fleet);
            var text = new PIXI.Sprite(textTexture);

            var containerGfx = new PIXI.Graphics();
            containerGfx.lineStyle(1, 0x00000, 1);
            containerGfx.beginFill(color, 0.7);
            containerGfx.drawRect(0, 0, text.width+4, text.height);
            containerGfx.endFill();


            fleetContainer.addChild(containerGfx);
            fleetContainer.addChild(text);
            text.x += 2;
            text.y -= 1;
            
            fleetContainer.interactive = true;
            
            var boundMouseDownFN = mouseDownFN.bind(fleet);
            var boundFleetClickFN = fleetClickFn.bind(fleet);
            fleetContainer.on("click", boundFleetClickFN);
            fleetContainer.on("tap", boundFleetClickFN);
            fleetContainer.on("mousedown", boundMouseDownFN);
            fleetContainer.on("mouseup", mouseUpFN);
            fleetContainer.on("rightdown", boundMouseDownFN);
            fleetContainer.on("rightup", mouseUpFN);
            fleetContainer.on("mouseover", mouseOverFN.bind(fleetContainer, fleet));

            return fleetContainer;
          }

          for (var i = 0; i < points.length; i++)
          {
            var star = points[i];
            var fleets = star.getAllFleets();
            if (!fleets || fleets.length <= 0) continue;

            var fleetsContainer = new PIXI.Container();
            fleetsContainer.x = star.x;
            fleetsContainer.y = star.y - 30;
            doc.addChild(fleetsContainer);

            for (var j = 0; j < fleets.length; j++)
            {
              var drawnFleet = singleFleetDrawFN(fleets[j]);
              drawnFleet.position.x = fleetsContainer.width;
              fleetsContainer.addChild(drawnFleet);
            }

            fleetsContainer.x -= fleetsContainer.width / 2;
            fleetsContainer.y -= 10;
          }

          return doc;
        }
      }

      for (var layerName in this.layers)
      {
        var layer = this.layers[layerName];
        layer.container.interactiveChildren = layer.interactive;
      }
    }
    initMapModes()
    {
      this.mapModes["default"] =
      {
        name: "default",
        displayName: "Default",
        layers:
        [
          {layer: this.layers["starOwners"]},
          {layer: this.layers["ownerBorders"]},
          {layer: this.layers["nonFillerVoronoiLines"]},
          {layer: this.layers["starLinks"]},
          {layer: this.layers["nonFillerStars"]},
          {layer: this.layers["fogOfWar"]},
          {layer: this.layers["fleets"]}
        ]
      }
      this.mapModes["noStatic"] =
      {
        name: "noStatic",
        displayName: "No Static Layers",
        layers:
        [
          {layer: this.layers["starOwners"]},
          {layer: this.layers["ownerBorders"]},
          {layer: this.layers["nonFillerStars"]},
          {layer: this.layers["fogOfWar"]},
          {layer: this.layers["fleets"]}
        ]
      }
      this.mapModes["income"] =
      {
        name: "income",
        displayName: "Income",
        layers:
        [
          {layer: this.layers["starIncome"]},
          {layer: this.layers["nonFillerVoronoiLines"]},
          {layer: this.layers["starLinks"]},
          {layer: this.layers["nonFillerStars"]},
          {layer: this.layers["fleets"]}
        ]
      }
      this.mapModes["influence"] =
      {
        name: "influence",
        displayName: "Player Influence",
        layers:
        [
          {layer: this.layers["playerInfluence"]},
          {layer: this.layers["nonFillerVoronoiLines"]},
          {layer: this.layers["starLinks"]},
          {layer: this.layers["nonFillerStars"]},
          {layer: this.layers["fleets"]}
        ]
      }
      this.mapModes["resources"] =
      {
        name: "resources",
        displayName: "Resources",
        layers:
        [
          {layer: this.layers["starOwners"]},
          {layer: this.layers["ownerBorders"]},
          {layer: this.layers["nonFillerVoronoiLines"]},
          {layer: this.layers["starLinks"]},
          {layer: this.layers["nonFillerStars"]},
          {layer: this.layers["fogOfWar"]},
          {layer: this.layers["resources"]},
          {layer: this.layers["fleets"]}
        ]
      }

    }
    setParent(newParent: PIXI.Container)
    {
      var oldParent = this.parent;
      if (oldParent)
      {
        oldParent.removeChild(this.container);
      }

      this.parent = newParent;
      newParent.addChild(this.container);
    }
    resetContainer()
    {
      this.container.removeChildren();
    }
    hasLayerInMapMode(layer: IMapRendererLayer)
    {
      for (var i = 0; i < this.currentMapMode.layers.length; i++)
      {
        if (this.currentMapMode.layers[i].layer === layer)
        {
          return true;
        }
      }

      return false;
    }
    setLayerAsDirty(layerName: string)
    {
      var layer = this.layers[layerName];
      layer.isDirty = true;

      this.isDirty = true;

      // TODO
      this.render();
    }
    setAllLayersAsDirty()
    {
      for (var i = 0; i < this.currentMapMode.layers.length; i++)
      {
        this.currentMapMode.layers[i].layer.isDirty = true;
      }

      this.isDirty = true;

      // TODO
      this.render();
    }
    drawLayer(layer: IMapRendererLayer)
    {
      if (!layer.isDirty) return;
      layer.container.removeChildren();
      layer.container.addChild(layer.drawingFunction.call(this, this.galaxyMap));
      layer.isDirty = false;
    }
    setMapMode(newMapMode: string)
    {
      if (!this.mapModes[newMapMode])
      {
        throw new Error("Invalid mapmode");
        return;
      }

      if (this.currentMapMode && this.currentMapMode.name === newMapMode)
      {
        return;
      }

      this.currentMapMode = this.mapModes[newMapMode];

      this.resetContainer();
      
      for (var i = 0; i < this.currentMapMode.layers.length; i++)
      {
        var layer = this.currentMapMode.layers[i].layer;
        this.container.addChild(layer.container);
      }

      this.setAllLayersAsDirty();
    }
    render()
    {
      if (this.preventRender || !this.isDirty) return;

      for (var i = 0; i < this.currentMapMode.layers.length; i++)
      {
        var layer = this.currentMapMode.layers[i].layer;

        this.drawLayer(layer);
      }

      this.isDirty = false;
    }
  }
}
