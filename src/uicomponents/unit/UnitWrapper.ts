import * as React from "react";

export interface PropTypes extends React.Props<any>
{
}

interface StateType
{
}

export class UnitWrapperComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "UnitWrapper";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  // shouldComponentUpdate(newProps: PropTypes)
  // {
  //   if (!this.props.unit && !newProps.unit) return false;

  //   if (newProps.unit && newProps.unit.uiDisplayIsDirty) return true;

  //   const targetedProps =
  //   {
  //     activeUnit: true,
  //     hoveredUnit: true,
  //     targetsInPotentialArea: true,
  //     activeEffectUnits: true
  //   };


  //   for (let prop in newProps)
  //   {
  //     if (!targetedProps[prop] && prop !== "position")
  //     {
  //       if (newProps[prop] !== this.props[prop])
  //       {
  //         return true;
  //       }
  //     }
  //   }
  //   for (let prop in targetedProps)
  //   {
  //     const unit = newProps.unit;
  //     const oldValue = this.props[prop];
  //     const newValue = newProps[prop];

  //     if (!newValue && !oldValue) continue;

  //     if (prop === "targetsInPotentialArea" || prop === "activeEffectUnits")
  //     {
  //       if (!oldValue)
  //       {
  //         if (newValue.indexOf(unit) >= 0) return true;
  //         else
  //         {
  //           continue;
  //         }
  //       }
  //       if ((oldValue.indexOf(unit) >= 0) !==
  //         (newValue.indexOf(unit) >= 0))
  //       {
  //         return true;
  //       }
  //     }
  //     else if (newValue !== oldValue &&
  //       (oldValue === unit || newValue === unit))
  //     {
  //       return true;
  //     }
  //   }

  //   if (newProps.battle && newProps.battle.ended)
  //   {
  //     return true;
  //   }

  //   return false;
  // }

  render()
  {
    // const wrapperProps: React.HTMLAttributes =
    // {
    //   className: "unit-wrapper drop-target"
    // };

    // if (this.props.onMouseUp)
    // {
    //   wrapperProps.onMouseUp = wrapperProps.onTouchEnd = this.handleMouseUp
    // };
    return(
      React.DOM.div(
      {
        className: "unit-wrapper",
      },
        this.props.children,
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(UnitWrapperComponent);
export default Factory;
