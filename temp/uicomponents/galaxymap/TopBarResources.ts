/// <reference path="../../../lib/react-0.13.3.d.ts" />

import app from "../../../src/App.ts"; // TODO refactor | autogenerated
import * as React from "react";

/// <reference path="resource.ts" />


import Player from "../../../src/Player.ts";
import resources from "../../../modules/defaultmapmodes/maplayertemplates/resources.ts";
import Resource from "./Resource.ts";
import eventManager from "../../../src/eventManager.ts";


interface PropTypes extends React.Props<any>
{
  player: Player;
}

interface StateType
{
}

export class TopBarResourcesComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "TopBarResources";
  updateListener: reactTypeTODO_any = undefined;

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  
  componentDidMount()
  {
    this.updateListener = eventManager.addEventListener(
      "builtBuildingWithEffect_resourceIncome", this.forceUpdate.bind(this));
  }

  componentWillUnmount()
  {
    eventManager.removeEventListener("builtBuildingWithEffect_resourceIncome", this.updateListener);
  }

  render()
  {
    var player = this.props.player;
    var resources: React.ReactElement<any>[] = [];
    var resourceIncome = player.getResourceIncome();
    var resourceTypes: string[] = Object.keys(player.resources);

    for (var _resourceType in resourceIncome)
    {
      if (resourceTypes.indexOf(_resourceType) === -1)
      {
        resourceTypes.push(_resourceType);
      }
    }

    for (var i = 0; i < resourceTypes.length; i++)
    {
      var resourceType = resourceTypes[i];
      var amount = player.resources[resourceType] || 0;
      var income = resourceIncome[resourceType].amount || 0;
      if (amount === 0 && income === 0) continue;

      var resourceData =
      {
        resource: app.moduleData.Templates.Resources[resourceType],
        amount: amount,
        income: income,
        key: resourceType
      }
      resources.push(Resource(resourceData));
    }

    return(
      React.DOM.div(
      {
        className: "top-bar-resources"
      },
        resources
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(TopBarResourcesComponent);
export default Factory;