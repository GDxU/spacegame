module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export module UIComponents
      {
        export var BattleFinishNotification = React.createClass(
        {
          displayName: "BattleFinishNotification",
          render: function()
          {
            var notification: Notification = this.props.notification;
            var p = notification.props;
            var attacker: Player = p.attacker;
            var defender: Player = p.defender;
            var victor: Player = p.victor;
            var location: Player = p.location;

            var message = notification.makeMessage();

            var attackSuccessString = victor === attacker ? " succesfully " : " unsuccesfully ";
            var controllerString = victor === attacker ? " now controls location " :
              " maintains control of location ";

            return(
              React.DOM.div(
              {
                className: "battle-finish-notification draggable-container"
              },
                message + ".",
                React.DOM.br(null),
                React.DOM.br(null),
                "" + attacker.name + attackSuccessString + "attacked " + defender.name + " in " +
                  location.name + ". " + victor.name + controllerString + location.name + "."
              )
            );
          }
        })
      }
    }
  }
}