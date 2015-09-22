/// <reference path="../../../src/templateinterfaces/imaprenderermapmodetemplate.d.ts" />
/// <reference path="maprendererlayers.ts" />

module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export module MapRendererMapModes
      {
        export var defaultMapMode: IMapRendererMapModeTemplate =
        {
          key: "defaultMapMode",
          displayName: "Default",
          layers:
          [
            MapRendererLayers.starOwners,
            MapRendererLayers.ownerBorders,
            MapRendererLayers.nonFillerVoronoiLines,
            MapRendererLayers.starLinks,
            MapRendererLayers.nonFillerStars,
            MapRendererLayers.fogOfWar,
            MapRendererLayers.fleets
          ]
        }
        export var noStatic: IMapRendererMapModeTemplate =
        {
          key: "noStatic",
          displayName: "No Static Layers",
          layers:
          [
            MapRendererLayers.starOwners,
            MapRendererLayers.ownerBorders,
            MapRendererLayers.nonFillerStars,
            MapRendererLayers.fogOfWar,
            MapRendererLayers.fleets
          ]
        }
        export var income: IMapRendererMapModeTemplate =
        {
          key: "income",
          displayName: "Income",
          layers:
          [
            MapRendererLayers.starIncome,
            MapRendererLayers.nonFillerVoronoiLines,
            MapRendererLayers.starLinks,
            MapRendererLayers.nonFillerStars,
            MapRendererLayers.fleets
          ]
        }
        export var influence: IMapRendererMapModeTemplate =
        {
          key: "influence",
          displayName: "Player Influence",
          layers:
          [
            MapRendererLayers.playerInfluence,
            MapRendererLayers.nonFillerVoronoiLines,
            MapRendererLayers.starLinks,
            MapRendererLayers.nonFillerStars,
            MapRendererLayers.fleets
          ]
        }
        export var resources: IMapRendererMapModeTemplate =
        {
          key: "resources",
          displayName: "Resources",
          layers:
          [
            MapRendererLayers.debugSectors,
            MapRendererLayers.nonFillerVoronoiLines,
            MapRendererLayers.starLinks,
            MapRendererLayers.nonFillerStars,
            MapRendererLayers.fogOfWar,
            MapRendererLayers.fleets,
            MapRendererLayers.resources
          ]
        }
      }
    }
  }
}