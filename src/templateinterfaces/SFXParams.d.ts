/// <reference path="../../lib/pixi.d.ts" />

import Unit from "../Unit.ts";

declare interface SFXParams
{
  user: Unit;
  target?: Unit;
  width: number;
  height: number;
  duration?: number; // in milliseconds
  facingRight: boolean;
  renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  triggerStart: (container: PIXI.DisplayObject) => void;
  triggerEffect?: () => void;
  triggerEnd?: () => void;
}