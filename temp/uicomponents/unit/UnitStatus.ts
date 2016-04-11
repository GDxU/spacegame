/// <reference path="../../../lib/react-0.13.3.d.ts" />


import Guard from "../../../src/shaders/Guard.ts";
import Unit from "./Unit.ts";
import GuardCoverage from "../../../src/GuardCoverage.ts";

import * as React from "react";

export interface PropTypes extends React.Props<any>
{
  guardAmount?: number;
  guardCoverage?: number; // GuardCoverage enum

  isPreparing?: boolean;
}

interface StateType
{
  // TODO refactor | add state type
}

class UnitStatus_COMPONENT_TODO extends React.Component<PropTypes, StateType>
{
  displayName: string = "UnitStatus";


  state: StateType;

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
    var statusElement: React.HTMLElement = null;

    if (this.props.guardAmount > 0)
    {
      var guard = this.props.guardAmount;
      var damageReduction = Math.min(50, guard / 2);
      var guardText = "" + guard + "% chance to protect ";
      guardText += (this.props.guardCoverage === GuardCoverage.all ? "all units." : " units in same row.");
      guardText += "\n" + "This unit takes " + damageReduction + "% reduced damage from physical attacks."
      statusElement = React.DOM.div(
      {
        className: "status-container guard-meter-container"
      },
        React.DOM.div(
        {
          className: "guard-meter-value",
          style:
          {
            width: "" + clamp(guard, 0, 100) + "%"
          }
        }),
        React.DOM.div(
        {
          className: "status-inner-wrapper"
        },
          React.DOM.div(
          {
            className: "guard-text-container status-inner",
            title: guardText
          },
            React.DOM.div(
            {
              className: "guard-text status-text"
            }, "Guard"),
            React.DOM.div(
            {
              className: "guard-text-value status-text"
            }, "" + guard + "%")
          )
        )
      );
    }
    else if (this.props.isPreparing)
    {
      statusElement = React.DOM.div(
      {
        className: "status-container preparation-container"
      },
        React.DOM.div(
        {
          className: "status-inner-wrapper"
        },
          React.DOM.div(
          {
            className: "preparation-text-container status-inner",
            title: "Unit is preparing to use ability"
          },
            "Preparing"
          )
        )
      );
    }

    return(
      React.DOM.div({className: "unit-status"},
        statusElement
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(UnitStatus_COMPONENT_TODO);
export default Factory;
