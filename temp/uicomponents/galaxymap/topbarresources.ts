/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="resource.ts" />

export interface PropTypes
{
  // TODO refactor | add prop types
}

export default class TopBarResources extends React.Component<PropTypes, {}>
{
  displayName: string = "TopBarResources";
  updateListener: reactTypeTODO_any = undefined;

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
    var player: Player = this.props.player;
    var resources: ReactComponentPlaceHolder[] = [];
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
      resources.push(UIComponents.Resource(resourceData));
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