/// <reference path="fleetcolumn.ts"/>

module Rance
{
  export module UIComponents
  {
    export var Fleet = React.createClass(
    {
      render: function()
      {
        var fleet = this.props.fleet;

        var columns = [];

        for (var i = 0; i < fleet.length; i++)
        {
          columns.push(UIComponents.FleetColumn(
          {
            key: i,
            column: fleet[i],
            facesLeft: this.props.facesLeft,
            activeUnit: this.props.activeUnit,
            hoveredUnit: this.props.hoveredUnit,
            handleMouseEnterUnit: this.props.handleMouseEnterUnit,
            handleMouseLeaveUnit: this.props.handleMouseLeaveUnit,
            targetsInPotentialArea: this.props.targetsInPotentialArea
          }));
        }

        return(
          React.DOM.div({className: "battle-fleet"},
            columns
          )
        );
      }
    });
  }
}