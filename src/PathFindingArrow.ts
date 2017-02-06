/// <reference path="../lib/pixi.d.ts" />

import app from "./App"; // TODO global

import Color from "./Color";
import {Fleet} from "./Fleet";
import Point from "./Point";
import Star from "./Star";
import eventManager from "./eventManager";

interface PathFindingArrowCurveStyle
{
  color: Color;
}
export default class PathfindingArrow
{
  parentContainer: PIXI.Container;
  container: PIXI.Container;
  active: boolean;
  currentTarget: Star;

  clearTargetTimeout: any;

  selectedFleets: Fleet[] = [];

  labelCache:
  {
    [style: string]:
    {
      [distance: number]: PIXI.Text;
    };
  } = {};
  listeners:
  {
    [name: string]: any;
  } = {};

  private curveStyles =
  {
    reachable: <PathFindingArrowCurveStyle>
    {
      color: Color.fromHex(0xFFFFF0),
    },
    unreachable: <PathFindingArrowCurveStyle>
    {
      color: Color.fromHex(0xFF0000),
    },
  };

  constructor(parentContainer: PIXI.Container)
  {
    this.parentContainer = parentContainer;
    this.container = new PIXI.Container();
    this.parentContainer.addChild(this.container);

    this.addEventListeners();
  }
  destroy()
  {
    this.active = false;

    this.removeEventListeners();

    this.parentContainer = null;
    this.container = null;
    this.currentTarget = null;

    window.clearTimeout(this.clearTargetTimeout);
    this.selectedFleets = null;
    this.labelCache = null;
  }
  removeEventListener(name: string)
  {
    eventManager.removeEventListener(name, this.listeners[name]);
  }
  removeEventListeners()
  {
    for (let name in this.listeners)
    {
      this.removeEventListener(name);
    }
  }
  addEventListener(name: string, handler: Function)
  {
    this.listeners[name] = handler;

    eventManager.addEventListener(name, handler);
  }
  addEventListeners()
  {
    var self = this;

    this.addEventListener("startPotentialMove", function(star: Star)
    {
      self.startMove();
      if (star)
      {
        self.setTarget(star);
      }
    });

    this.addEventListener("setPotentialMoveTarget", function(star: Star)
    {
      self.setTarget(star);
    });
    this.addEventListener("clearPotentialMoveTarget", function()
    {
      self.clearTarget();
    });

    this.addEventListener("endPotentialMove", function()
    {
      self.endMove();
    });
  }

  startMove()
  {
    var fleets = app.playerControl.selectedFleets;

    if (this.active || !fleets || fleets.length < 1)
    {
      return;
    }

    this.active = true;
    this.currentTarget = null;
    this.selectedFleets = fleets
    this.clearArrows();
  }

  setTarget(star: Star)
  {
    if (!this.active)
    {
      return;
    }

    if (this.clearTargetTimeout)
    {
      window.clearTimeout(this.clearTargetTimeout);
    }

    this.currentTarget = star;
    window.setTimeout(this.drawAllCurrentCurves.bind(this), 10);
    //this.drawAllCurrentCurves();
  }

  clearTarget()
  {
    if (!this.active)
    {
      return;
    }

    var self = this;

    if (this.clearTargetTimeout)
    {
      window.clearTimeout(this.clearTargetTimeout);
    }

    this.clearTargetTimeout = window.setTimeout(function()
    {
      self.currentTarget = null;
      self.clearArrows();
      self.clearTargetTimeout = null;
    }, 10)
  }

  endMove()
  {
    this.active = false;
    this.currentTarget = null;
    this.selectedFleets = [];
    this.clearArrows();
  }

  clearArrows()
  {
    this.container.removeChildren();
  }

  makeLabel(style: string, distance: number)
  {
    var textStyle: PIXI.ITextStyleStyle;

    switch (style)
    {
      case "reachable":
      {
        textStyle =
        {
          fill: 0xFFFFF0,
        }
        break;
      }
      case "unreachable":
      {
        textStyle =
        {
          fill: 0xFF0000,
        }
        break;
      }
    }

    if (!this.labelCache[style])
    {
      this.labelCache[style] = {};
    }

    this.labelCache[style][distance] = new PIXI.Text("" + distance, textStyle);
  }

  getLabel(style: string, distance: number)
  {
    if (!this.labelCache[style] || !this.labelCache[style][distance])
    {
      this.makeLabel(style, distance);
    }

    return this.labelCache[style][distance];
  }

  getAllCurrentPaths()
  {
    var paths:
    {
      fleet: Fleet;
      path: any;
    }[] = [];

    for (let i = 0; i < this.selectedFleets.length; i++)
    {
      var fleet = this.selectedFleets[i];

      if (fleet.location.id === this.currentTarget.id) continue;

      var path = fleet.getPathTo(this.currentTarget);

      paths.push(
      {
        fleet: fleet,
        path: path,
      });
    }

    return paths;
  }

  getAllCurrentCurves()
  {
    var paths = this.getAllCurrentPaths();

    var curves:
    {
      style: string;
      curveData: number[][];
    }[] = [];

    var totalPathsPerStar:
    {
      [starId: number]: number;
    } = {};
    var alreadyVisitedPathsPerStar:
    {
      [starId: number]: number;
    } = {};

    // get total paths passing through star
    // used for seperating overlapping paths to pass through
    // orbits around the star
    for (let i = 0; i < paths.length; i++)
    {
      for (let j = 0; j < paths[i].path.length; j++)
      {
        var star = paths[i].path[j].star;

        if (!totalPathsPerStar[star.id])
        {
          totalPathsPerStar[star.id] = 0;
          alreadyVisitedPathsPerStar[star.id] = 0;
        }

        totalPathsPerStar[star.id]++;
      }
    }

    for (let i = 0; i < paths.length; i++)
    {
      var fleet = paths[i].fleet;
      var path = paths[i].path;
      var distance = path.length - 1;

      var currentMovePoints = fleet.getMinCurrentMovePoints();
      var canReach = currentMovePoints >= distance;

      var style = canReach ? "reachable" : "unreachable";

      var curvePoints: Point[] = [];

      for (let j = path.length - 1; j >= 0; j--)
      {
        var star = path[j].star;

        var sourceStar = j < path.length - 1 ? path[j + 1].star : null;

        if (totalPathsPerStar[star.id] > 1 && star !== this.currentTarget)
        {
          var visits = ++alreadyVisitedPathsPerStar[star.id];
          curvePoints.unshift(this.getTargetOffset(star, sourceStar, visits,
            totalPathsPerStar[star.id], 12));
        }
        else
        {
          curvePoints.unshift(star);
        }
      }

      var curveData = this.getCurveData(curvePoints);

      curves.push(
      {
        style: style,
        curveData: curveData,
      });
    }

    return curves;
  }

  drawAllCurrentCurves()
  {
    this.clearArrows();

    var curves = this.getAllCurrentCurves();

    for (let i = 0; i < curves.length; i++)
    {
      var curve = this.drawCurve(curves[i].curveData, this.curveStyles[curves[i].style]);

      this.container.addChild(curve);
    }
  }

  getCurveData(points: Point[]): number[][]
  {
    var i6 = 1.0 / 6.0;
    var path: number[][] = [];
    var abababa = [points[0]].concat(points);
    abababa.push(points[points.length - 1]);


    for (let i = 3, n = abababa.length; i < n; i++)
    {

      var p0 = abababa[i - 3];
      var p1 = abababa[i - 2];
      var p2 = abababa[i - 1];
      var p3 = abababa[i];

      path.push(
      [
        p2.x * i6 + p1.x - p0.x * i6,
        p2.y * i6 + p1.y - p0.y * i6,
        p3.x * -i6 + p2.x + p1.x * i6,
        p3.y * -i6 + p2.y + p1.y * i6,
        p2.x,
        p2.y,
      ]);
    }

    path[0][0] = points[0].x;
    path[0][1] = points[0].y;

    return path;
  }

  private drawCurve(points: number[][], style: PathFindingArrowCurveStyle)
  {
    var gfx = new PIXI.Graphics();

    gfx.lineStyle(12, style.color.getHex(), 0.7);
    gfx.moveTo(points[0][0], points[0][1]);

    for (let i = 0; i < points.length; i++)
    {
      gfx.bezierCurveTo.apply(gfx, points[i]);
    }

    var curveShape = <PIXI.Polygon> gfx.currentPath.shape;
    // TODO 04.11.2016 | still relevant?
    curveShape.closed = false; // PIXI 3.0.7 bug

    this.drawArrowHead(gfx, style.color.getHex());

    return gfx;
  }
  drawArrowHead(gfx: PIXI.Graphics, color: number)
  {
    var curveShape = <PIXI.Polygon> gfx.currentPath.shape;
    var points = curveShape.points;

    var x1 = points[points.length - 12];
    var y1 = points[points.length - 11];
    var x2 = points[points.length - 2];
    var y2 = points[points.length - 1];

    var lineAngle = Math.atan2(y2 - y1, x2 - x1);
    var headLength = 30;
    var buttAngle = 27 * (Math.PI / 180);

    var hypotenuseLength = Math.abs(headLength / Math.cos(buttAngle));

    var angle1 = lineAngle + Math.PI + buttAngle;
    var topX = x2 + Math.cos(angle1) * hypotenuseLength;
    var topY = y2 + Math.sin(angle1) * hypotenuseLength;

    var angle2 = lineAngle + Math.PI - buttAngle;
    var botX = x2 + Math.cos(angle2) * hypotenuseLength;
    var botY = y2 + Math.sin(angle2) * hypotenuseLength;

    gfx.lineStyle(null);

    gfx.moveTo(x2, y2);
    gfx.beginFill(color, 0.7);
    gfx.lineTo(topX, topY);
    gfx.lineTo(botX, botY);
    gfx.lineTo(x2, y2);
    gfx.endFill();

    var buttMidX = x2 + Math.cos(lineAngle + Math.PI) * headLength;
    var buttMidY = y2 + Math.sin(lineAngle + Math.PI) * headLength;

    for (let i = points.length - 1; i >= 0; i -= 2)
    {
      var y = points[i];
      var x = points[i-1];
      var distance = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));

      if (distance >= headLength + 10)
      {
        points.push(buttMidX);
        points.push(buttMidY);
        break;
      }
      else
      {
        points.pop();
        points.pop();
      }
    }
  }

  getTargetOffset(target: Point, sourcePoint: Point, i: number,
    totalPaths: number, offsetPerOrbit: number)
  {
    var maxPerOrbit = 6;

    var currentOrbit = Math.ceil(i / maxPerOrbit);
    var isOuterOrbit = currentOrbit > Math.floor(totalPaths / maxPerOrbit);
    var pathsInCurrentOrbit = isOuterOrbit ? totalPaths % maxPerOrbit : maxPerOrbit;

    var positionInOrbit = (i - 1) % pathsInCurrentOrbit;

    var distance = currentOrbit * offsetPerOrbit;

    var angle = (Math.PI * 2 / pathsInCurrentOrbit) * positionInOrbit;

    if (sourcePoint)
    {
      var dx = sourcePoint.x - target.x;
      var dy = sourcePoint.y - target.y;
      var approachAngle = Math.atan2(dy, dx);

      angle += approachAngle;
    }

    var x = Math.sin(angle) * distance;
    var y = Math.cos(angle) * distance;


    return(
    {
      x: target.x + x,
      y: target.y - y,
    });
  }
}
