/// <reference path="../../../lib/react-0.13.3.d.ts" />
import ListItem from "./ListItem.d.ts"; // TODO refactor | autogenerated
import * as React from "react";

/// <reference path="itemlist.ts" />
/// <reference path="unitlist.ts" />
/// <reference path="menuunitinfo.ts" />


import MenuUnitInfo from "./MenuUnitInfo.ts";
import UnitList from "./UnitList.ts";
import ItemList from "./ItemList.ts";
import Item from "../../../src/Item.ts";


interface PropTypes extends React.Props<any>
{
  player: Player;
}

interface StateType
{
  currentDragItem?: any; // TODO refactor | define state type 456
  selectedUnit?: any; // TODO refactor | define state type 456
}

export class ItemEquipComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "ItemEquip";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = this.getInitialState();
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleSelectRow = this.handleSelectRow.bind(this);    
  }
  
  private getInitialState(): StateType
  {
    return(
    {
      selectedUnit: null,
      currentDragItem: null
    });
  }
  handleSelectRow(row: ListItem)
  {
    if (!row.data.unit) return;

    this.setState(
    {
      selectedUnit: row.data.unit
    });
  }
  handleDragStart(item: Item)
  {
    this.setState(
    {
      currentDragItem: item
    });
  }
  handleDragEnd(dropSuccesful: boolean = false)
  {
    if (!dropSuccesful && this.state.currentDragItem && this.state.selectedUnit)
    {
      var item = this.state.currentDragItem;
      if (this.state.selectedUnit.items[item.template.slot] === item)
      {
        this.state.selectedUnit.removeItem(item);
      }
    }

    this.setState(
    {
      currentDragItem: null
    });
  }
  handleDrop()
  {
    var item = this.state.currentDragItem;
    var unit = this.state.selectedUnit;
    if (unit && item)
    {
      if (unit.items[item.template.slot])
      {
        unit.removeItemAtSlot(item.template.slot);
      }
      unit.addItem(item);
    }

    this.handleDragEnd(true);
  }

  render()
  {
    var player = this.props.player;

    return(
      React.DOM.div({className: "item-equip"},
        React.DOM.div({className: "item-equip-left"},

          MenuUnitInfo(
          {
            unit: this.state.selectedUnit,
            onMouseUp: this.handleDrop,

            isDraggable: true,
            onDragStart: this.handleDragStart,
            onDragEnd: this.handleDragEnd,
            currentDragItem: this.state.currentDragItem
          }),
          ItemList(
          {
            items: player.items,
            // only used to trigger updates
            selectedUnit: this.state.selectedUnit,
            isDraggable: true,
            onDragStart: this.handleDragStart,
            onDragEnd: this.handleDragEnd,
            onRowChange: this.handleSelectRow
          })
        ),

        UnitList(
        {
          units: player.units,
          selectedUnit: this.state.selectedUnit,
          isDraggable: false,
          onRowChange: this.handleSelectRow,
          autoSelect: true
        })
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(ItemEquipComponent);
export default Factory;