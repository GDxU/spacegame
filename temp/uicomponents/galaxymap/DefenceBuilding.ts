/// <reference path="../../../lib/react-0.13.3.d.ts" />

import app from "../../../src/App.ts"; // TODO refactor | autogenerated
import * as React from "react";

/// <reference path="../playerflag.ts" />


import PlayerFlag from "../PlayerFlag.ts";
import Building from "../../../src/Building.ts";


export interface PropTypes
{
  // TODO refactor | add prop types
}

interface StateType
{
  // TODO refactor | add state type
}

class DefenceBuilding_COMPONENT_TODO extends React.Component<PropTypes, StateType>
{
  displayName: string = "DefenceBuilding";
  shouldComponentUpdate(newProps: any)
  {
    return newProps.building !== this.props.building;
  }
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  render()
  {
    var building: Building = this.props.building;
    var image = app.images[building.template.iconSrc];

    return(
      React.DOM.div(
      {
        className: "defence-building"
      },
        React.DOM.img(
        {
          className: "defence-building-icon",
          src: colorImageInPlayerColor(image, building.controller),
          title: building.template.displayName
        }),
        PlayerFlag(
        {
          props:
          {
            className: "defence-building-controller",
            title: building.controller.name
          },
          key: "flag",
          flag: building.controller.flag
        })
      )
    );
  }

}

const Factory: React.Factory<PropTypes> = React.createFactory(DefenceBuilding_COMPONENT_TODO);
export default Factory;
