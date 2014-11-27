module Rance
{
  export module UIComponents
  {
    export var UnitStatus = React.createClass(
    {
      render: function()
      {
        var statusElement = null;

        if (this.props.guard)
        {
          var guard = this.props.guard;
          statusElement = React.DOM.div(
          {
            className: "guard-wrapper"
          },
            React.DOM.progress(
            {
              className: "guard-meter",
              max: 100,
              value: guard
            }),
            React.DOM.div(
            {
              className: "guard-text-container"
            },
              React.DOM.div(
              {
                className: "guard-text"
              }, "Guard"),
              React.DOM.div(
              {
                className: "guard-amount"
              }, "" + guard + "%")
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
