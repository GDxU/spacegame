/// <reference path="../../../lib/pixi.d.ts" />

import SFXParams from "../../../src/templateinterfaces/SFXParams";

export default function makeSFXFromVideo(videoSrc: string, onStartFN: (sprite: PIXI.Sprite) => void,
  props: SFXParams)
{
  function clearBaseTextureListeners()
  {
    baseTexture.removeListener("loaded", onVideoLoaded);
    baseTexture.removeListener("error", onVideoError);
  }
  function onVideoLoaded()
  {
    clearBaseTextureListeners();

    baseTexture.autoUpdate = false;
    sprite.y = props.height - baseTexture.source.videoHeight;

    if (onStartFN)
    {
      onStartFN(sprite);
    }

    startTime = Date.now();
    props.triggerStart(sprite);
    animate();
  }
  function onVideoError()
  {
    clearBaseTextureListeners();

    throw new Error("Video " + videoSrc + " failed to load.");
  }

  var baseTexture = PIXI.VideoBaseTexture.fromUrl(videoSrc);
  var texture = new PIXI.Texture(baseTexture);
  var sprite = new PIXI.Sprite(texture);

  if (!props.facingRight)
  {
    sprite.x = props.width;
    sprite.scale.x = -1;
  }

  if (baseTexture.hasLoaded)
  {
    onVideoLoaded();
  }
  else if (baseTexture.isLoading)
  {
    baseTexture.on("loaded", onVideoLoaded);
    baseTexture.on("error", onVideoError);
  }
  else
  {
    onVideoError();
  }

  var startTime: number;

  function animate()
  {
    baseTexture.update();
    if (!baseTexture.source.paused && !baseTexture.source.ended)
    {
      requestAnimationFrame(animate);
    }
    else
    {
      props.triggerEnd();
      sprite.parent.removeChild(sprite);
      sprite.destroy({texture: true, baseTexture: true});
    }
    
  }
}
