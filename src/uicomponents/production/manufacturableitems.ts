module Rance
{
  export module UIComponents
  {
    export var ManufacturableItems = React.createClass(
    {
      displayName: "ManufacturableItems",

      propTypes:
      {
        selectedStar: React.PropTypes.instanceOf(Star),
        consolidateLocations: React.PropTypes.bool.isRequired,
        manufacturableThings: React.PropTypes.array.isRequired,
        triggerUpdate: React.PropTypes.func.isRequired,
        canBuild: React.PropTypes.bool.isRequired,
        money: React.PropTypes.number.isRequired
      },

      shouldComponentUpdate: function(newProps: any)
      {
        if (this.props.selectedStar !== newProps.selectedStar)
        {
          return true;
        }
        if (this.props.manufacturableThings.length !== newProps.manufacturableThings.length)
        {
          return true;
        }
        else
        {

        }
        if (this.props.canBuild !== newProps.canBuild)
        {
          return true;
        }
        if (this.props.money !== newProps.money)
        {
          return true;
        }

        return false;
      },

      addItemToBuildQueue: function(template: Templates.IItemTemplate)
      {
        var manufactory: Manufactory = this.props.selectedStar.manufactory;
        manufactory.addThingToQueue(template, "item");
        this.props.triggerUpdate();
      },

      render: function()
      {
        return(
          React.DOM.div(
          {
            className: "manufacturable-items"
          },
            (!this.props.selectedStar || !this.props.selectedStar.manufactory) ? null : React.DOM.div(
            {
              className: "manufactory-upgrade-buttons-container"
            },
              React.DOM.button(
              {
                className: "manufactory-upgrade-button manufactory-items-upgrade-button"
              },
                "Upgrade items"
              )
            ),
            UIComponents.ManufacturableThingsList(
            {
              manufacturableThings: this.props.manufacturableThings,
              onClick: (this.props.canBuild ? this.addItemToBuildQueue : null),
              showCost: true,
              money: this.props.money
            })
          )
        );
      }
    })
  }
}
