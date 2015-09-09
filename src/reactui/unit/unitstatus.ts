module Rance
{
  export module UIComponents
  {
    export var UnitStatus = React.createClass(
    {
      displayName: "UnitStatus",
      render: function()
      {
        var statusElement: ReactDOMPlaceHolder = null;

        if (this.props.guardAmount > 0)
        {
          var guard = this.props.guardAmount;
          var guardText = "" + guard + "% chance to protect ";
          guardText += (this.props.guardCoverage === "all" ? "all units." : " units in same row.");
          guardText += "\n" + "This unit takes " + (guard / 2) + "% reduced damage from physical attacks."
          statusElement = React.DOM.div(
          {
            className: "status-container guard-meter-container"
          },
            React.DOM.div(
            {
              className: "guard-meter-value",
              style:
              {
                width: "" + clamp(guard, 0, 100) + "%"
              }
            }),
            React.DOM.div(
            {
              className: "status-inner-wrapper"
            },
              React.DOM.div(
              {
                className: "guard-text-container status-inner",
                title: guardText
              },
                React.DOM.div(
                {
                  className: "guard-text status-text"
                }, "Guard"),
                React.DOM.div(
                {
                  className: "guard-text-value status text"
                }, "" + guard + "%")
              )
            )
          );
        }

        return(
          React.DOM.div({className: "unit-status"},
            statusElement
          )
        );
      }
    });
  }
}
