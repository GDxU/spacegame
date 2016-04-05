precision mediump float;

uniform vec4 baseColor;
uniform vec4 lineColor;
uniform float gapSize;
uniform vec2 offset;
uniform float zoom;

void main( void )
{
  vec2 position = gl_FragCoord.xy + offset;
  position.x += position.y;
  float scaled = floor(position.x * 0.1 / zoom);
  float res = mod(scaled, gapSize);
  if(res > 0.0)
  {
    gl_FragColor = mix(gl_FragColor, baseColor, 0.5);
  }
  else
  {
    gl_FragColor = mix(gl_FragColor, lineColor, 0.5);
  }
}