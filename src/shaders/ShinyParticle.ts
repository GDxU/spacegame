// Autogenerated from "./ShinyParticle.glsl"

/// <reference path="../../lib/pixi.d.ts"/>

interface Uniforms
{
  highlightIntensity: {type: "1f"; value: number;};
  spikeColor: {type: "4fv"; value: number[];};
  spikeIntensity: {type: "1f"; value: number;};
}

interface PartialUniformValues
{
  highlightIntensity?: number;
  spikeColor?: number[];
  spikeIntensity?: number;
}

export default class ShinyParticle extends PIXI.AbstractFilter
{
  public uniforms: Uniforms // needs to be public for PIXI, but shouldnt be accessed

  constructor(initialUniformValues?: PartialUniformValues)
  {
    const uniforms = ShinyParticle.makeUniformsObject(initialUniformValues);
    super(null, sourceLines.join("\n"), uniforms);
  }
  private static makeUniformsObject(initialValues: PartialUniformValues = {}): Uniforms
  {
    return(
    {
      highlightIntensity: {type: "1f", value: initialValues.highlightIntensity},
      spikeColor: {type: "4fv", value: initialValues.spikeColor},
      spikeIntensity: {type: "1f", value: initialValues.spikeIntensity},
    });
  }
  public setUniformValues(values: PartialUniformValues)
  {
    for (let key in values)
    {
      this.uniforms[key].value = values[key];
    }
  }
}

const sourceLines =
[
  "precision mediump float;",
  "",
  "#define DOMAIN 0 // 0 == pixi, 1 == shdr.bkcore.com",
  "",
  "#if DOMAIN == 0",
  "  varying vec2 vTextureCoord;",
  "  uniform sampler2D uSampler;",
  "",
  "  uniform float spikeIntensity;",
  "  uniform float highlightIntensity;",
  "  uniform vec4 spikeColor;",
  "#elif DOMAIN == 1",
  "  uniform vec2 resolution;",
  "",
  "  const float spikeIntensity = 1.0;",
  "  const float highlightIntensity = 0.1;",
  "  const vec4 spikeColor = vec4(0.3686274509803922, 0.792156862745098, 0.6941176470588235, 1.0);",
  "#endif",
  "",
  "",
  "const vec4 highlightColor = vec4(1.0, 1.0, 1.0, 1.0);",
  "const vec2 center = vec2(0.5, 0.5);",
  "const float angle = -0.1 * 3.141592;",
  "",
  "float spike(vec2 q)",
  "{",
  "  vec2 rotated;",
  "  rotated.x = cos(angle) * q.x - sin(angle) * q.y;",
  "  rotated.y = sin(angle) * q.x + cos(angle) * q.y;",
  "",
  "  float xStrength = max(0.5 - abs(rotated.x), 0.0);",
  "  float yStrength = max(0.5 - abs(rotated.y), 0.0);",
  "",
  "  return xStrength + yStrength;",
  "}",
  "",
  "void main()",
  "{",
  "  #if DOMAIN == 0",
  "    vec2 uv = vTextureCoord;",
  "    vec4 color = texture2D(uSampler, uv);",
  "  #elif DOMAIN == 1",
  "    vec2 uv = gl_FragCoord.xy / resolution;",
  "    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);",
  "  #endif",
  "",
  "  vec2 q = uv - 0.5;",
  "  // q *= 2.5;",
  "",
  "  float dist = length(q);",
  "",
  "  float spikeStrength = spike(q);",
  "  spikeStrength -= dist;",
  "  spikeStrength = pow(spikeStrength, 1.5);",
  "  spikeStrength *= spikeIntensity;",
  "",
  "  color += spikeColor * spikeStrength;",
  "",
  "",
  "  // center highlight",
  "  float highlightStrength = 1.0 - dist;",
  "  highlightStrength = pow(highlightStrength, 8.0);",
  "  highlightStrength *= highlightIntensity;",
  "",
  "  color += highlightColor * highlightStrength;",
  "",
  "",
  "  gl_FragColor = color;",
  "}",
]
