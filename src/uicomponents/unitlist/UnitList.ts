/// <reference path="../../../lib/react-0.13.3.d.ts" />
import ListColumn from "./ListColumn"; // TODO refactor | autogenerated
import ListItem from "./ListItem"; // TODO refactor | autogenerated
import * as React from "react/addons";

/// <reference path="list.ts" />
/// <reference path="unitlistitem.ts" />


import Unit from "../../Unit";
import List from "./List";
import UnitListItem from "./UnitListItem";


interface PropTypes extends React.Props<any>
{
  units: Unit[]
  selectedUnit: Unit;
  onRowChange: (row: ListItem) => void;
  isDraggable: boolean;
  
  autoSelect?: boolean;
  onMouseLeave?: () => void;
  onDragStart?: (unit: Unit) => void;
  reservedUnits?: {[unitId: number]: number[]};
  onDragEnd?: (dropSuccesful?: boolean) => void;
  checkTimesActed?: boolean;
  onMouseEnterUnit?: (unit: Unit) => void;
  hoveredUnit?: Unit;
}

interface StateType
{
}

export class UnitListComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "UnitList";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }
  
  render()
  {
    var rows: ListItem[] = [];

    for (var id in this.props.units)
    {
      var unit = this.props.units[id];

      var data =
      {
        unit: unit,

        id: unit.id,
        name: unit.name,
        typeName: unit.template.displayName,
        strength: "" + unit.currentHealth + " / " + unit.maxHealth,
        currentHealth: unit.currentHealth,
        maxHealth: unit.maxHealth,

        maxActionPoints: unit.attributes.maxActionPoints,
        attack: unit.attributes.attack,
        defence: unit.attributes.defence,
        intelligence: unit.attributes.intelligence,
        speed: unit.attributes.speed,

        rowConstructor: UnitListItem,
        makeClone: true,

        isReserved: (this.props.reservedUnits && this.props.reservedUnits[unit.id]),
        hasNoActionsLeft: (this.props.checkTimesActed && !unit.canActThisTurn()),
        isSelected: (this.props.selectedUnit && this.props.selectedUnit.id === unit.id),
        isHovered: (this.props.hoveredUnit && this.props.hoveredUnit.id === unit.id),

        onMouseEnter: this.props.onMouseEnterUnit,
        onMouseLeave: this.props.onMouseLeave,

        isDraggable: this.props.isDraggable,
        onDragStart: this.props.onDragStart,
        onDragEnd: this.props.onDragEnd
      };

      rows.push(
      {
        key: unit.id,
        data: data
      });
    }

    var columns: ListColumn[] =
    [
      {
        label: "Id",
        key: "id",
        defaultOrder: "asc"
      },
      {
        label: "Type",
        key: "typeName",
        defaultOrder: "asc"
      },
      {
        label: "Strength",
        key: "strength",
        defaultOrder: "desc",
        sortingFunction: function(a: {data: Unit;}, b: {data: Unit;})
        {
          return a.data.currentHealth - b.data.currentHealth;
        }
      },
      {
        label: "Act",
        key: "maxActionPoints",
        defaultOrder: "desc"
      },
      {
        label: "Atk",
        key: "attack",
        defaultOrder: "desc"
      },
      {
        label: "Def",
        key: "defence",
        defaultOrder: "desc"
      },
      {
        label: "Int",
        key: "intelligence",
        defaultOrder: "desc"
      },
      {
        label: "Spd",
        key: "speed",
        defaultOrder: "desc"
      }

    ];

    return(
      React.DOM.div({className: "unit-list fixed-table-parent"},
        List(
        {
          listItems: rows,
          initialColumns: columns,
          onRowChange: this.props.onRowChange,
          autoSelect: this.props.autoSelect,
          keyboardSelect: true
        })
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(UnitListComponent);
export default Factory;
