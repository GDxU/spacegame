import GameLoader from "../../../src/GameLoader";
import Player from "../../../src/Player";
import {NotificationFilterState} from "../../../src/notifications/NotificationFilterState";
import {NotificationWitnessCriterion} from "../../../src/notifications/NotificationWitnessCriterion";
import {activeNotificationStore} from "../../../src/notifications/activeNotificationStore";
import NotificationTemplate from "../../../src/templateinterfaces/NotificationTemplate";
import {localize} from "../localization/localize";

import UIComponent from "./uicomponents/WarDeclarationNotification";


export interface PropTypes
{
  aggressor: Player;
  defender: Player;
}

export interface SerializedPropTypes
{
  aggressorId: number;
  defenderId: number;
}

export const warDeclarationNotification: NotificationTemplate<PropTypes, SerializedPropTypes> =
{
  key: "warDeclarationNotification",
  displayName: "War declaration",
  category: "diplomacy",
  defaultFilterState: [NotificationFilterState.ShowIfInvolved],
  witnessCriteria:
  [
    [NotificationWitnessCriterion.IsInvolved],
    [NotificationWitnessCriterion.MetAllInvolvedPlayers],
  ],
  iconSrc: "modules/common/resourcetemplates/img/test2.png",
  contentConstructor: UIComponent,
  messageConstructor: (props: PropTypes) =>
  {
    return localize("warDeclarationMessage")(
    {
      aggressorName: props.aggressor.name,
      defenderName: props.defender.name,
    });
  },
  getTitle: (props: PropTypes) => localize("warDeclarationTitle")(),
  serializeProps: (props: PropTypes) =>
  {
    return(
    {
      aggressorId: props.aggressor.id,
      defenderId: props.defender.id,
    });
  },
  deserializeProps: (props: SerializedPropTypes, gameLoader: GameLoader) =>
  {
    return(
    {
      aggressor: gameLoader.playersById[props.aggressorId],
      defender: gameLoader.playersById[props.defenderId],
    });
  },
};

export const warDeclarationNotificationCreationScripts =
{
  diplomacy:
  {
    onWarDeclaration:
    [
      {
        key: "makeWarDeclarationNotification",
        priority: 0,
        script: (aggressor: Player, defender: Player) =>
        {
          activeNotificationStore.makeNotification<PropTypes, SerializedPropTypes>(
          {
            template: warDeclarationNotification,
            props:
            {
              aggressor: aggressor,
              defender: defender,
            },
            involvedPlayers: [aggressor, defender],
            location: null,
          });
        },
      },
    ],
  },
};
