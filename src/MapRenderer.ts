/// <reference path="../lib/pixi.d.ts" />

import app from "./App"; // TODO global

import MapRendererMapModeTemplate from "./templateinterfaces/MapRendererMapModeTemplate";

import GalaxyMap from "./GalaxyMap";
import MapRendererLayer from "./MapRendererLayer";
import MapRendererMapMode from "./MapRendererMapMode";
import Options from "./Options";
import Player from "./Player";
import Star from "./Star";
import eventManager from "./eventManager";


export default class MapRenderer
{
  container: PIXI.Container;
  parent: PIXI.Container;
  galaxyMap: GalaxyMap;
  player: Player;

  layers:
  {
    [name: string]: MapRendererLayer;
  } = {};
  mapModes:
  {
    [name: string]: MapRendererMapMode;
  } = {};

  currentMapMode: MapRendererMapMode;
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

    for (let name in this.listeners)
    {
      eventManager.removeEventListener(name, this.listeners[name]);
    }

    this.container.removeChildren();
    this.parent.removeChild(this.container);

    this.player = null;
    this.container = null;
    this.parent = null;

    for (let layerName in this.layers)
    {
      this.layers[layerName].destroy();
    }
  }
  init()
  {
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
      eventManager.addEventListener("renderLayer", function(layerName: string, star?: Star)
    {
      var passesStarVisibilityCheck: boolean = true;
      if (star)
      {
        switch (layerName)
        {
          case "fleets":
          {
            passesStarVisibilityCheck = self.player.starIsVisible(star);
            break;
          }
          default:
          {
            passesStarVisibilityCheck = self.player.starIsRevealed(star);
            break;
          }
        }
      }

      if (passesStarVisibilityCheck || Options.debug.enabled)
      {
        self.setLayerAsDirty(layerName);
      }
    });
  }
  setPlayer(player: Player)
  {
    this.player = player;
    this.setAllLayersAsDirty();
  }
  initLayers()
  {
    for (let layerKey in app.moduleData.Templates.MapRendererLayers)
    {
      var template = app.moduleData.Templates.MapRendererLayers[layerKey];
      var layer = new MapRendererLayer(template);
      this.layers[layerKey] = layer;
    }
  }
  initMapModes()
  {
    var buildMapMode = (mapModeKey: string, template: MapRendererMapModeTemplate) =>
    {
      var alreadyAdded :
      {
        [layerKey: string]: boolean;
      } = {};
      var mapMode = new MapRendererMapMode(template);
      for (let i = 0; i < template.layers.length; i++)
      {
        var layer = template.layers[i];

        mapMode.addLayer(this.layers[layer.key], true);
        alreadyAdded[layer.key] = true;
      }
      for (let layerKey in this.layers)
      {
        if (!alreadyAdded[layerKey])
        {
          mapMode.addLayer(this.layers[layerKey], false);
          alreadyAdded[layerKey] = true;
        }
      }
      this.mapModes[mapModeKey] = mapMode;
    };

    for (let mapModeKey in app.moduleData.Templates.MapRendererMapModes)
    {
      var template = app.moduleData.Templates.MapRendererMapModes[mapModeKey];
      buildMapMode(mapModeKey, template);
    }

    // var customMapModeTemplate: MapRendererMapModeTemplate =
    // {
    //   key: "custom",
    //   displayName: "Custom",
    //   layers: this.mapModes[Object.keys(this.mapModes)[0]].template.layers
    // };
    // buildMapMode(customMapModeTemplate);
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
  setLayerAsDirty(layerName: string)
  {
    var layer = this.layers[layerName];
    layer.isDirty = true;

    this.isDirty = true;

    // TODO performance
    this.render();
  }
  setAllLayersAsDirty()
  {
    for (let i = 0; i < this.currentMapMode.layers.length; i++)
    {
      this.currentMapMode.layers[i].isDirty = true;
    }

    this.isDirty = true;

    // TODO performance
    this.render();
  }
  updateMapModeLayers(updatedLayers: MapRendererLayer[])
  {
    for (let i = 0; i < updatedLayers.length; i++)
    {
      var layer = updatedLayers[i];
      var childIndex = this.container.children.indexOf(layer.container);
      var mapModeLayerIndex = this.currentMapMode.getLayerIndexInContainer(layer);
      if (childIndex === -1)
      {
        this.container.addChildAt(layer.container, mapModeLayerIndex);
      }
      else
      {
        this.container.removeChildAt(mapModeLayerIndex + 1);
      }
      this.setLayerAsDirty(layer.template.key);
    }
  }
  resetMapModeLayersPosition()
  {
    this.resetContainer();

    var layerData = this.currentMapMode.getActiveLayers();
    for (let i = 0; i < layerData.length; i++)
    {
      var layer = layerData[i];
      this.container.addChild(layer.container);
    }
  }
  setMapModeByKey(key: string)
  {
    this.setMapMode(this.mapModes[key]);
  }
  setMapMode(newMapMode: MapRendererMapMode)
  {
    if (!this.mapModes[newMapMode.template.key])
    {
      throw new Error("Invalid mapmode " + newMapMode.template.key);
    }

    if (this.currentMapMode && this.currentMapMode === newMapMode)
    {
      return;
    }

    this.currentMapMode = newMapMode;

    this.resetContainer();

    var layerData = this.currentMapMode.getActiveLayers();
    for (let i = 0; i < layerData.length; i++)
    {
      var layer = layerData[i];
      this.container.addChild(layer.container);
    }

    this.setAllLayersAsDirty();
  }
  render()
  {
    if (this.preventRender || !this.isDirty) return;

    var layerData = this.currentMapMode.getActiveLayers();
    for (let i = 0; i < layerData.length; i++)
    {
      var layer = layerData[i];
      layer.draw(this.galaxyMap, this);
    }

    this.isDirty = false;
  }
}
