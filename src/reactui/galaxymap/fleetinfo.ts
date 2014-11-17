module Rance
{
  export module UIComponents
  {
    export var FleetInfo = React.createClass({

      render: function()
      {
        var fleet = this.props.fleet;
        if (!fleet) return null;
        var totalStrength = fleet.getTotalStrength();

        return(
          React.DOM.div(
          {
            className: "fleet-info"
          },
            React.DOM.div(
            {
              className: "fleet-info-header"
            },
              React.DOM.div(
              {
                className: "fleet-info-name"
              }, fleet.name),
              React.DOM.div(
              {
                className: "fleet-info-strength"
              }, totalStrength.current + " / " + totalStrength.max),
              React.DOM.div(
              {
                className: "fleet-info-contols"
              }, null)
            ),
            React.DOM.div(
            {
              className: "fleet-info-location"
            }, "" + fleet.location.x.toFixed() + " " + fleet.location.y.toFixed())
            
          )
        );
      }
    });
  }
}
