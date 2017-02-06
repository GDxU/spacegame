/// <reference path="../../../lib/react-global.d.ts" />

import Player from "../../Player";
import BuildingTemplate from "../../templateinterfaces/BuildingTemplate";
import ListItemProps from "../list/ListItemProps";

import UpdateWhenMoneyChanges from "../mixins/UpdateWhenMoneyChanges";
import applyMixins from "../mixins/applyMixins";

export interface PropTypes extends ListItemProps, React.Props<any>
{
  typeName: string;
  buildCost: number;

  template: BuildingTemplate;
  player: Player;
}

interface StateType
{
  canAfford?: boolean;
}

export class BuildableBuildingComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "BuildableBuilding";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);

    this.state = this.getInitialStateTODO();

    this.bindMethods();
    applyMixins(this, new UpdateWhenMoneyChanges(this, this.overrideHandleMoneyChange));
  }
  private bindMethods()
  {
    this.overrideHandleMoneyChange = this.overrideHandleMoneyChange.bind(this);
    this.makeCell = this.makeCell.bind(this);
  }

  private getInitialStateTODO(): StateType
  {
    return(
    {
      canAfford: this.props.player.money >= this.props.buildCost
    });
  }

  overrideHandleMoneyChange()
  {
    this.setState(
    {
      canAfford: this.props.player.money >= this.props.buildCost
    });
  }

  makeCell(type: string)
  {
    var cellProps: React.HTMLProps<HTMLTableCellElement> = {};
    cellProps.key = type;
    cellProps.className = "buildable-building-list-item-cell " + type;

    var cellContent: React.ReactNode;

    switch (type)
    {
      case "buildCost":
      {
        cellContent = this.props.buildCost;
        if (!this.state.canAfford)
        {
          cellProps.className += " negative";
        }
        break;
      }
      case "typeName":
      {
        cellContent = this.props.typeName;
        break;
      }
    }

    return(
      React.DOM.td(cellProps, cellContent)
    );
  }

  render()
  {
    var template = this.props.template;
    var cells: React.ReactHTMLElement<any>[] = [];
    var columns = this.props.activeColumns;

    for (let i = 0; i < columns.length; i++)
    {
      cells.push(
        this.makeCell(columns[i].key)
      );
    }

    var props: React.HTMLAttributes =
    {
      className: "buildable-item buildable-building",
      onClick: this.props.handleClick,
      title: template.description
    }
    if (!this.state.canAfford)
    {
      props.onClick = null;
      props.disabled = true;
      props.className += " disabled";
    }

    return(
      React.DOM.tr(props,
      cells
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(BuildableBuildingComponent);
export default Factory;
