/// <reference path="../../../lib/react-global.d.ts" />

import app from "../../App"; // TODO global

import Building from "../../Building";
import {colorImageInPlayerColor} from "../../utility";
import PlayerFlag from "../PlayerFlag";


export interface PropTypes extends React.Props<any>
{
  building: Building;
}

interface StateType
{
}

export class DefenceBuildingComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "DefenceBuilding";
  shouldComponentUpdate(newProps: PropTypes)
  {
    return newProps.building !== this.props.building;
  }
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  render()
  {
    var building = this.props.building;
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
            title: building.controller.name.fullName
          },
          key: "flag",
          flag: building.controller.flag
        })
      )
    );
  }

}

const Factory: React.Factory<PropTypes> = React.createFactory(DefenceBuildingComponent);
export default Factory;
