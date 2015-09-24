/// <reference path="../../../src/templateinterfaces/inotificationtemplate.d.ts"/>
/// <reference path="uicomponents/battlefinishnotification.ts" />

module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export module Notifications
      {
        export var battleFinishNotification: Rance.Templates.INotificationTemplate =
        {
          key: "battleFinishNotification",
          iconSrc: "img\/resources\/test1.png",
          eventListeners: ["makeBattleFinishNotification"],
          contentConstructor: DefaultModule.UIComponents.BattleFinishNotification,
          messageConstructor: function(props: any)
          {
            var message = "A battle was fought in " + props.location.name + " between " +
              props.attacker.name + " and " + props.defender.name;

            return message;
          },
          serializeProps: function(props: any)
          {
            return(
            {
              attackerId: props.attacker.id,
              defenderId: props.defender.id,
              locationId: props.location.id,
              victorId: props.victor.id
            });
          },
          deserializeProps: function(props: any, gameLoader: GameLoader)
          {
            return(
            {
              attacker: gameLoader.playersById[props.attackerId],
              defender: gameLoader.playersById[props.defenderId],
              location: gameLoader.starsById[props.locationId],
              victor: gameLoader.playersById[props.victorId]
            });
          }
        }
      }
    }
  }
}