/// <reference path="manufacturablethingslist.ts" />
/// <reference path="manufactoryupgradebutton.ts" />

/// <reference path="../../manufactory.ts" />

module Rance
{
  export module UIComponents
  {
    export var BuildQueue = React.createClass(
    {
      displayName: "BuildQueue",

      propTypes:
      {
        manufactory: React.PropTypes.instanceOf(Manufactory).isRequired,
        triggerUpdate: React.PropTypes.func.isRequired,
        money: React.PropTypes.number.isRequired
      },

      removeItem: function(template: IManufacturableThing, parentIndex: number)
      {
        var manufactory: Manufactory = this.props.manufactory;
        manufactory.removeThingAtIndex(parentIndex);
        this.props.triggerUpdate();
      },

      upgradeCapacity: function()
      {
        var manufactory: Manufactory = this.props.manufactory;
        manufactory.upgradeCapacity(1);
        this.props.triggerUpdate();
      },

      render: function()
      {
        var manufactory: Manufactory = this.props.manufactory;

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
            UIComponents.ManufactoryUpgradeButton(
            {
              money: this.props.money,
              upgradeCost: manufactory.getCapacityUpgradeCost(),
              onClick: this.upgradeCapacity,
              actionString: "Upgrade capacity",
              currentLevel: manufactory.capacity,
              maxLevel: manufactory.maxCapacity,
              levelDecimalPoints: 0
            }),
            UIComponents.ManufacturableThingsList(
            {
              manufacturableThings: convertedBuildQueue,
              onClick: this.removeItem,
              showCost: false
            })
          )
        );
      }
    })
  }
}
