/// <reference path="../../../lib/react-0.13.3.d.ts" />
import ListColumn from "../../../temp/uicomponents/unitlist/ListColumn.d.ts"; // TODO refactor | autogenerated
import ListItem from "../../../temp/uicomponents/unitlist/ListItem.d.ts"; // TODO refactor | autogenerated
import * as React from "react";

/// <reference path="diplomacyactions.ts" />
/// <reference path="diplomaticstatusplayer.ts" />


import List from "../unitlist/List.ts";
import DiplomacyActions from "./DiplomacyActions.ts";
import Opinion from "./Opinion.ts";
import DiplomaticStatusPlayer from "./DiplomaticStatusPlayer.ts";
import PopupManager from "../popups/PopupManager.ts";


export interface PropTypes extends React.Props<any>
{
  metPlayers: any; // TODO refactor | define prop type 123
  totalPlayerCount: any; // TODO refactor | define prop type 123
  statusByPlayer: any; // TODO refactor | define prop type 123
  player: any; // TODO refactor | define prop type 123
}

interface StateType
{
}

interface RefTypes extends React.Refs
{
  popupManager: React.Component<any, any>; // TODO refactor | correct ref type 542 | PopupManager
}

class DiplomacyOverview_COMPONENT_TODO extends React.Component<PropTypes, StateType>
{
  displayName: string = "DiplomacyOverview";

  makeDiplomacyActionsPopup(rowItem: ListItem)
  {
    var player = rowItem.data.player;
    if (!player) return;

    this.refs.popupManager.makePopup(
    {
      contentConstructor: DiplomacyActions,
      contentProps:
      {
        player: this.props.player,
        targetPlayer: player,
        onUpdate: this.forceUpdate.bind(this)
      },
      popupProps:
      {
        preventAutoResize: true,
        containerDragOnly: true
      }
    });
  }

  state: StateType;
  refs: RefTypes;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  render()
  {
    var unmetPlayerCount = this.props.totalPlayerCount -
      Object.keys(this.props.metPlayers).length - 1;

    var rows: ListItem[] = [];

    for (var playerId in this.props.statusByPlayer)
    {
      var player = this.props.metPlayers[playerId];
      var status = this.props.player.diplomacyStatus.statusByPlayer[playerId];

      rows.push(
      {
        key: player.id,
        data:
        {
          player: player,
          name: player.name,
          baseOpinion: player.diplomacyStatus.getBaseOpinion(),
          status: DiplomaticState[status],
          statusEnum: status,
          opinion: player.diplomacyStatus.getOpinionOf(this.props.player),
          attitudeModifiers:
            player.diplomacyStatus.attitudeModifiersByPlayer[this.props.player.id],
          rowConstructor: DiplomaticStatusPlayer
        }
      });
    }

    for (var i = 0; i < unmetPlayerCount; i++)
    {
      rows.push(
      {
        key: "unmet" + i,
        data:
        {
          name: "?????",
          status: "unmet",
          statusEnum: 99999 + i,
          opinion: null,

          rowConstructor: DiplomaticStatusPlayer
        }
      });
    }

    var columns: ListColumn[] =
    [
      {
        label: "",
        key: "flag",
        defaultOrder: "asc",
        propToSortBy: "name"
      },
      {
        label: "Name",
        key: "name",
        defaultOrder: "asc"
      },
      {
        label: "Status",
        key: "status",
        defaultOrder: "asc",
        propToSortBy: "statusEnum"
      },
      {
        label: "Opinion",
        key: "opinion",
        defaultOrder: "desc"
      }
    ];

    return(
      React.DOM.div({className: "diplomacy-overview"},
        PopupManager(
        {
          ref: "popupManager",
          onlyAllowOne: true
        }),
        React.DOM.div({className: "diplomacy-status-list fixed-table-parent"},
          List(
          {
            listItems: rows,
            initialColumns: columns,
            initialSortOrder: [columns[0]],
            onRowChange: this.makeDiplomacyActionsPopup
          })
        )
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(DiplomacyOverview_COMPONENT_TODO);
export default Factory;
