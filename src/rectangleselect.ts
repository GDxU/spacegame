/// <reference path="../lib/pixi.d.ts" />

/// <reference path="eventmanager.ts"/>

/// <reference path="point.ts" />

module Rance
{
  export class RectangleSelect
  {
    parentContainer: PIXI.DisplayObjectContainer;
    graphics: PIXI.Graphics;
    selecting: boolean;

    start: Point;
    current: Point;

    toSelectFrom: {position: Point; data: any}[];
    getSelectionTargetsFN: () => {position: Point; data: any}[];

    constructor(parentContainer: PIXI.DisplayObjectContainer)
    {
      this.parentContainer = parentContainer;
      this.graphics = new PIXI.Graphics();
      parentContainer.addChild(this.graphics);

      this.addEventListeners();
    }
    addEventListeners()
    {
      var self = this;

      eventManager.dispatchEvent("setRectangleSelectTargetFN", this);
    }

    startSelection(point: Point)
    {
      this.selecting = true;
      this.start = point;
      this.current = point;

      var ui = <HTMLElement> document.getElementsByClassName("galaxy-map-ui")[0];
      if (ui) ui.classList.add("prevent-pointer-events");

      var popups = <HTMLElement> document.getElementsByClassName("popup-container")[0];
      if (popups) popups.classList.add("prevent-pointer-events");
    }
    moveSelection(point: Point)
    {
      this.current = point;
      this.drawSelectionRectangle();
    }
    endSelection(point: Point)
    {
      this.setSelectionTargets();

      this.selecting = false;
      var ui = <HTMLElement> document.getElementsByClassName("galaxy-map-ui")[0];
      if (ui) ui.classList.remove("prevent-pointer-events");
      var popups = <HTMLElement> document.getElementsByClassName("popup-container")[0];
      if (popups) popups.classList.remove("prevent-pointer-events");

      this.graphics.clear();

      var inSelection = this.getAllInSelection();
      eventManager.dispatchEvent("selectFleets", inSelection);


      this.start = null;
      this.current = null;
    }

    drawSelectionRectangle()
    {
      if (!this.current) return;

      var gfx = this.graphics;
      var bounds = this.getBounds();

      gfx.clear();
      gfx.lineStyle(1, 0xFFFFFF, 1);
      gfx.beginFill(0x000000, 0);
      gfx.drawRect(bounds.x1, bounds.y1, bounds.width, bounds.height);
      gfx.endFill();
    }
    setSelectionTargets()
    {
      if (!this.getSelectionTargetsFN) return;

      this.toSelectFrom = this.getSelectionTargetsFN();
    }
    getBounds()
    {
      var x1 = Math.min(this.start.x, this.current.x);
      var x2 = Math.max(this.start.x, this.current.x);
      var y1 = Math.min(this.start.y, this.current.y);
      var y2 = Math.max(this.start.y, this.current.y);

      return(
      {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,

        width: x2 - x1,
        height: y2 - y1
      });
    }

    getAllInSelection()
    {
      var toReturn = [];

      for (var i = 0; i < this.toSelectFrom.length; i++)
      {
        if (this.selectionContains(this.toSelectFrom[i].position))
        {
          toReturn.push(this.toSelectFrom[i].data);
        }
      }
      return toReturn;
    }

    selectionContains(point: Point)
    {
      var x = point.x;
      var y = point.y;

      var bounds = this.getBounds();

      return(
        (x >= bounds.x1 && x <= bounds.x2) &&
        (y >= bounds.y1 && y <= bounds.y2)
      );
    }
  }
}
