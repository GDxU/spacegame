/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="mapmodeselector.ts" />
/// <reference path="maprendererlayerslist.ts" />

/// <reference path="../../maprenderer.ts" />

export interface PropTypes
{
  mapRenderer: MapRenderer;
}

export default class MapModeSettings extends React.Component<PropTypes, {}>
{
  displayName: string = "MapModeSettings";


  state:
  {
    
  }

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = 
    {
    
    };
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  handleReset()
  {
    var mapRenderer: MapRenderer = this.props.mapRenderer;
    mapRenderer.currentMapMode.resetLayers();
    mapRenderer.resetMapModeLayersPosition();
    mapRenderer.setAllLayersAsDirty();
    this.refs.layersList.forceUpdate();
  }

  render()
  {
    return(
      React.DOM.div(
      {
        className: "map-mode-settings"
      },
        UIComponents.MapModeSelector(
        {
          mapRenderer: this.props.mapRenderer,
          onUpdate: this.forceUpdate.bind(this),
          ref: "selector"
        }),
        React.DOM.button(
        {
          className: "reset-map-mode-button",
          onClick: this.handleReset
        },
          "Reset"
        ),
        UIComponents.MapRendererLayersList(
        {
          mapRenderer: this.props.mapRenderer,
          currentMapMode: this.props.mapRenderer.currentMapMode,
          ref: "layersList"
        })
      )
    );
  }
}