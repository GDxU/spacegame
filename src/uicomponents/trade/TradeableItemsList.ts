/// <reference path="../../../lib/react-0.13.3.d.ts" />
import ListColumn from "../unitlist/ListColumn"; // TODO refactor | autogenerated
import ListItem from "../unitlist/ListItem"; // TODO refactor | autogenerated
import * as React from "react";

import TradeMoney from "./TradeMoney";
import List from "../unitlist/List";
import {TradeableItems, TradeableItem} from "../../Trade";


interface PropTypes extends React.Props<any>
{
  tradeableItems: TradeableItems; // TODO refactor | rename -> staged items

  availableItems?: TradeableItems;
  noListHeader?: boolean;
  onDragStart?: (tradeableItemKey: string) => void;
  onDragEnd?: () => void;
  onItemClick?: (tradeableItemKey: string) => void;
  adjustItemAmount?: (newAmount: number) => void;
}

interface StateType
{
}

export class TradeableItemsListComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "TradeableItemsList";

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.makeRowForTradeableItem = this.makeRowForTradeableItem.bind(this);    
  }
  
  makeRowForTradeableItem(item: TradeableItem): ListItem
  {
    switch (item.key)
    {
      case "money":
      {
        return(
        {
          key: "money",
          data:
          {
            keyTODO: "money",
            rowConstructor: TradeMoney,
            title: "Money",
            moneyAmount: item.amount,
            sortOrder: 0,
            onDragStart: this.props.onDragStart,
            onDragEnd: this.props.onDragEnd,
            onClick: this.props.onItemClick,
            adjustItemAmount: this.props.adjustItemAmount,
            maxMoneyAvailable: (this.props.availableItems && this.props.availableItems["money"]) ?
              this.props.availableItems["money"].amount : undefined
          }
        });
      }
      default:
      {
        return(
        {
          key: item.key,
          data:
          {
            rowConstructor: TradeMoney,
            title: item.key,
            moneyAmount: item.amount,
            sortOrder: 1
          }
        });
      }
    }
  }
  
  render()
  {
    var tradeableItems = this.props.tradeableItems;
    var rows: ListItem[] = [];

    for (var key in tradeableItems)
    {
      rows.push(this.makeRowForTradeableItem(tradeableItems[key]));
    }

    var columns: ListColumn[] =
    [
      {
        label: "Item",
        key: "item",
        defaultOrder: "asc",
        propToSortBy: "sortOrder"
      }
    ];

    return(
      React.DOM.div(
      {
        className: "tradeable-items-list fixed-table-parent"
      },
        List(
        {
          listItems: rows,
          initialColumns: columns,
          initialSortOrder: [columns[0]], // item
          noHeader: this.props.noListHeader
        })
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(TradeableItemsListComponent);
export default Factory;
