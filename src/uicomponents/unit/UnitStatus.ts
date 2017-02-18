/// <reference path="../../../lib/react-global.d.ts" />

import GuardCoverage from "../../GuardCoverage";
import
{
  clamp,
} from "../../utility";


export interface PropTypes extends React.Props<any>
{
  guardAmount?: number;
  guardCoverage?: GuardCoverage;
  isPreparing?: boolean;
}

interface StateType
{
}

export class UnitStatusComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "UnitStatus";


  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  render()
  {
    let statusElement: React.ReactHTMLElement<any> = null;

    if (this.props.guardAmount > 0)
    {
      const guard = this.props.guardAmount;
      const damageReduction = Math.min(50, guard / 2);
      let guardText = "" + guard + "% chance to protect ";
      guardText += (this.props.guardCoverage === GuardCoverage.all ? "all units." : " units in same row.");
      guardText += "\n" + "This unit takes " + damageReduction + "% reduced damage from physical attacks.";
      statusElement = React.DOM.div(
      {
        className: "status-container guard-meter-container",
      },
        React.DOM.div(
        {
          className: "guard-meter-value",
          style:
          {
            width: "" + clamp(guard, 0, 100) + "%",
          },
        }),
        React.DOM.div(
        {
          className: "status-inner-wrapper",
        },
          React.DOM.div(
          {
            className: "guard-text-container status-inner",
            title: guardText,
          },
            React.DOM.div(
            {
              className: "guard-text status-text",
            }, "Guard"),
            React.DOM.div(
            {
              className: "guard-text-value status-text",
            }, "" + guard + "%"),
          ),
        ),
      );
    }
    else if (this.props.isPreparing)
    {
      statusElement = React.DOM.div(
      {
        className: "status-container preparation-container",
      },
        React.DOM.div(
        {
          className: "status-inner-wrapper",
        },
          React.DOM.div(
          {
            className: "preparation-text-container status-inner",
            title: "Unit is preparing to use ability",
          },
            "Preparing",
          ),
        ),
      );
    }

    return(
      React.DOM.div({className: "unit-status"},
        statusElement,
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(UnitStatusComponent);
export default Factory;
