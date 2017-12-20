import * as React from "react";

import {AttitudeModifier} from "../../AttitudeModifier";

import List from "../list/List";
import ListColumn from "../list/ListColumn";
import ListItem from "../list/ListItem";

import {default as AttitudeModifierInfo, PropTypes as AttitudeModifierInfoProps} from "./AttitudeModifierInfo";

import {AutoPositionerProps, default as AutoPositioner} from "../mixins/AutoPositioner";
import applyMixins from "../mixins/applyMixins";

import {localize} from "../../../localization/localize";

export interface PropTypes extends React.Props<any>
{
  attitudeModifiers: AttitudeModifier[];
  baseOpinion: number;

  autoPositionerProps?: AutoPositionerProps;
}

interface StateType
{
}

export class AttitudeModifierListComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "AttitudeModifierList";

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    if (this.props.autoPositionerProps)
    {
      applyMixins(this, new AutoPositioner(this));
    }
  }

  render()
  {
    const modifiers = this.props.attitudeModifiers;
    const rows: ListItem<AttitudeModifierInfoProps>[] = [];

    // TODO 2017.12.19 | can't we actually make this using attitude modifier templates?
    rows.push(
    {
      key: "baseOpinion",
      content: AttitudeModifierInfo(
      {
        name: localize("aiPersonality")(),
        strength: this.props.baseOpinion,
        endTurn: -1,
        alwaysShowAtTopOfList: true,
      }),
    });

    for (let i = 0; i < modifiers.length; i++)
    {
      const modifier = modifiers[i];
      if (modifier.isOverRidden)
      {
        continue;
      }

      rows.push(
      {
        key: modifier.template.type,
        content: AttitudeModifierInfo(
        {
          name: modifier.template.displayName,
          strength: modifier.getAdjustedStrength(),
          endTurn: modifier.endTurn,
          alwaysShowAtTopOfList: false,
        }),
      });
    }


    const columns: ListColumn<AttitudeModifierInfoProps>[] =
    [
      {
        label: localize("displayName")(),
        key: "name",
        defaultOrder: "asc",
        sortingFunction: (a, b) =>
        {
          let forcedSortOrder = 0;
          if (b.content.props.alwaysShowAtTopOfList)
          {
            forcedSortOrder += 10;
          }
          if (a.content.props.alwaysShowAtTopOfList)
          {
            forcedSortOrder -= 10;
          }

          let alphabeticSortOrder = 0;
          if (b.content.props.name > a.content.props.name)
          {
            alphabeticSortOrder -= 1;
          }
          else if (b.content.props.name < a.content.props.name)
          {
            alphabeticSortOrder += 1;
          }

          return forcedSortOrder + alphabeticSortOrder;
        },
      },
      {
        label: localize("attitudeModifierEffect")(),
        key: "strength",
        defaultOrder: "asc",
      },
      {
        label: localize("endsOn")(),
        key: "endTurn",
        defaultOrder: "desc",
      },
    ];

    return(
      React.DOM.div({className: "attitude-modifier-list auto-position fixed-table-parent"},
        List(
        {
          listItems: rows,
          initialColumns: columns,
          initialSortOrder: [columns[0], columns[1], columns[2]],
        }),
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(AttitudeModifierListComponent);
export default Factory;
