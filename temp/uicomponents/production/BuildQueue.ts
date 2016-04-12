/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="manufacturablethingslist.ts" />
/// <reference path="manufactoryupgradebutton.ts" />

/// <reference path="../../manufactory.ts" />


import ManufactoryUpgradeButton from "./ManufactoryUpgradeButton.ts";
import ManufacturableThingsList from "./ManufacturableThingsList.ts";
import Manufactory from "../../../src/Manufactory.ts";


interface PropTypes extends React.Props<any>
{
  manufactory: Manufactory;
  triggerUpdate: reactTypeTODO_func;
  money: number;
}

interface StateType
{
}

export class BuildQueueComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "BuildQueue";


  removeItem(template: IManufacturableThing, parentIndex: number)
  {
    var manufactory = this.props.manufactory;
    manufactory.removeThingAtIndex(parentIndex);
    this.props.triggerUpdate();
  }

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.removeItem = this.removeItem.bind(this);
    this.upgradeCapacity = this.upgradeCapacity.bind(this);    
  }
  
  upgradeCapacity()
  {
    var manufactory = this.props.manufactory;
    manufactory.upgradeCapacity(1);
    this.props.triggerUpdate();
  }

  render()
  {
    var manufactory = this.props.manufactory;

    var convertedBuildQueue: IManufacturableThing[] = [];

    for (var i = 0; i < manufactory.buildQueue.length; i++)
    {
      convertedBuildQueue.push(manufactory.buildQueue[i].template);
    }

    var canUpgradeCapacity = manufactory.capacity < manufactory.maxCapacity;

    return(
      React.DOM.div(
      {
        className: "build-queue"
      },
        React.DOM.div(
        {
          className: "manufactory-upgrade-buttons-container"
        },
          ManufactoryUpgradeButton(
          {
            money: this.props.money,
            upgradeCost: manufactory.getCapacityUpgradeCost(),
            onClick: this.upgradeCapacity,
            actionString: "Upgrade capacity",
            currentLevel: manufactory.capacity,
            maxLevel: manufactory.maxCapacity,
            levelDecimalPoints: 0,
            title: "Increase amount of things this manufactory can build per turn"
          })
        ),
        ManufacturableThingsList(
        {
          manufacturableThings: convertedBuildQueue,
          onClick: this.removeItem,
          showCost: false
        })
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(BuildQueueComponent);
export default Factory;