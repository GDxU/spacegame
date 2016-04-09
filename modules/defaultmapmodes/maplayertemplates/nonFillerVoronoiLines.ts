/// <reference path="../../../lib/pixi.d.ts" />

import Star from "../../../src/Star.ts";
import MapRendererLayerTemplate from "../../../src/templateinterfaces/MapRendererLayerTemplate.d.ts";
import GalaxyMap from "../../../src/GalaxyMap.ts";


const nonFillerVoronoiLines: MapRendererLayerTemplate =
{
  key: "nonFillerVoronoiLines",
  displayName: "Star borders",
  interactive: false,
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

export default nonFillerVoronoiLines;