import MapGenOption from "./MapGenOption";

declare interface MapDefaultOptions
{
  height: MapGenOption; // pixels
  width: MapGenOption; // pixels
  starCount: MapGenOption;
}
declare interface MapSpecificOptions
{
  [optionName: string]: MapGenOption;
}
declare interface MapGenOptions
{
  defaultOptions: MapDefaultOptions;
  basicOptions?: MapSpecificOptions;
  advancedOptions?: MapSpecificOptions;
}

export default MapGenOptions;
