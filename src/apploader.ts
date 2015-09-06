/// <reference path="../lib/pixi.d.ts" />

module Rance
{
  interface ISpriteSheetFrame
  {
    x: number;
    y: number;
    w: number;
    h: number;
  }
  interface ISpriteSheetData
  {
    frames:
    {
      [id: string]:
      {
        frame: ISpriteSheetFrame;
      }
    };
    meta: any;
  };

  function processSpriteSheet<T>(sheetData: ISpriteSheetData, sheetImg: HTMLImageElement,
    processFrameFN: (sheetImg: HTMLImageElement, frame: ISpriteSheetFrame) => T)
  {
    var frames: {[id: string]: T;} = {};

    for (var spriteName in sheetData.frames)
    {
      frames[spriteName] = processFrameFN(sheetImg, sheetData.frames[spriteName].frame);
    }

    return frames;
  }
  
  export class AppLoader
  {
    loaded =
    {
      DOM: false,
      emblems: false,
      units: false,
      buildings: false,
      //battleEffects: false,
      other: false
    };
    startTime: number;
    onLoaded: any;
    imageCache:
    {
      [type: string]:
      {
        [id: string]: HTMLImageElement;
      }
    } = {};

    constructor(onLoaded: any)
    {
      this.onLoaded = onLoaded;
      PIXI.utils._saidHello = true;
      this.startTime = new Date().getTime();

      this.loadDOM();
      this.loadEmblems();
      this.loadBuildings();
      this.loadUnits();
      this.loadOther();
    }
    
    private spritesheetToDataURLs(sheetData: ISpriteSheetData, sheetImg: HTMLImageElement)
    {
      var spriteToDataURLFN = function(sheetImg: HTMLImageElement, frame: ISpriteSheetFrame)
      {
        var canvas = <HTMLCanvasElement> document.createElement("canvas");
        canvas.width = frame.w;
        canvas.height = frame.h;
        var context = canvas.getContext("2d");

        context.drawImage(sheetImg, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

        var image = new Image();
        image.src = canvas.toDataURL();

        return image;
      }

      return processSpriteSheet<HTMLImageElement>(sheetData, sheetImg, spriteToDataURLFN);
    }
    loadDOM()
    {
      var self = this;
      if (document.readyState === "interactive" || document.readyState === "complete")
      {
        self.loaded.DOM = true;
        self.checkLoaded();
      }
      else
      {
        document.addEventListener('DOMContentLoaded', function()
        {
          self.loaded.DOM = true;
          self.checkLoaded();
        });
      }
    }
    loadImagesFN(identifier: string)
    {
      if (this.loaded[identifier] === undefined) this.loaded[identifier] = false;

      var self = this;
      var loader = new PIXI.loaders.Loader();
      loader.add(identifier, "img\/" + identifier + ".json");
      var onLoadCompleteFN = function(loader: PIXI.loaders.Loader)
      {
        var json = loader.resources[identifier].data;
        var image = loader.resources[identifier + "_image"].data;
        var spriteImages = self.spritesheetToDataURLs(json, image);
        self.imageCache[identifier] = spriteImages;
        self.loaded[identifier] = true;
        self.checkLoaded();
      };

      loader.load(onLoadCompleteFN);
    }
    loadEmblems()
    {
      this.loadImagesFN("emblems");
    }
    loadUnits()
    {
      this.loadImagesFN("units");
    }
    loadBuildings()
    {
      this.loadImagesFN("buildings");
    }
    loadOther()
    {
      var self = this;
      var loader = new PIXI.loaders.Loader();
      loader.add("img\/fowTexture.png");

      var onLoadCompleteFN = function(loader: PIXI.loaders.Loader)
      {
        self.loaded.other = true;
        self.checkLoaded();
      };

      loader.load(onLoadCompleteFN);
    }
    checkLoaded()
    {
      for (var prop in this.loaded)
      {
        if (!this.loaded[prop])
        {
          return;
        }
      }
      var elapsed = new Date().getTime() - this.startTime;
      console.log("Loaded in " + elapsed + " ms");
      this.onLoaded.call();
    }
  }
}