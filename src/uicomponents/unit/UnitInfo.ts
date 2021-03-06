import * as React from "react";
import * as ReactDOMElements from "react-dom-factories";
import * as ReactMotion from "react-motion";

import {localize} from "../../../localization/localize";
import GuardCoverage from "../../GuardCoverage";

import UnitActions from "./UnitActions";
import UnitStatus from "./UnitStatus";
import UnitStrength from "./UnitStrength";
import { fixedDurationSpring } from "../../utility";


export interface PropTypes extends React.Props<any>
{
  name: string;
  isSquadron: boolean;
  maxHealth: number;
  currentHealth: number;
  maxActionPoints: number;
  currentActionPoints: number;
  hoveredActionPointExpenditure: number;
  wasDestroyed?: boolean;
  wasCaptured?: boolean;
  guardAmount: number;
  guardType: GuardCoverage | null;

  isPreparing: boolean;
  animateDuration?: number;
}

interface StateType
{
}

export class UnitInfoComponent extends React.PureComponent<PropTypes, StateType>
{
  public displayName = "UnitInfo";
  public state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  render()
  {
    let battleEndStatus: React.ReactHTMLElement<any> = null;
    if (this.props.wasDestroyed)
    {
      battleEndStatus = ReactDOMElements.div(
      {
        className: "unit-battle-end-status-container",
      },
        ReactDOMElements.div(
        {
          className: "unit-battle-end-status unit-battle-end-status-dead",
        },
          localize("destroyed_statusText")(),
        ),
      );
    }
    else if (this.props.wasCaptured)
    {
      battleEndStatus = ReactDOMElements.div(
      {
        className: "unit-battle-end-status-container",
      },
        ReactDOMElements.div(
        {
          className: "unit-battle-end-status unit-battle-end-status-captured",
        },
          localize("captured_statusText")(),
        ),
      );
    }

    return(
      ReactDOMElements.div({className: "unit-info"},
        ReactDOMElements.div({className: "unit-info-name"},
          this.props.name,
        ),
        ReactDOMElements.div({className: "unit-info-inner"},
          UnitStatus(
          {
            guardAmount: this.props.guardAmount,
            guardCoverage: this.props.guardType,
            isPreparing: this.props.isPreparing,
          }),
          React.createElement(ReactMotion.Motion,
          {
            style:
            {
              health: fixedDurationSpring(this.props.currentHealth, this.props.animateDuration),
            },
            defaultStyle:
            {
              health: this.props.currentHealth,
            }
          },
            (interpolatedStyle: {health: number}) =>
            {
              return UnitStrength(
              {
                maxHealth: this.props.maxHealth,
                currentHealth: interpolatedStyle.health,
                isSquadron: this.props.isSquadron,
              });
            }
          ),
          UnitActions(
          {
            maxActionPoints: this.props.maxActionPoints,
            currentActionPoints: this.props.currentActionPoints,
            hoveredActionPointExpenditure: this.props.hoveredActionPointExpenditure,
          }),
          battleEndStatus,
        ),

      )
    );
  }
}

const factory: React.Factory<PropTypes> = React.createFactory(UnitInfoComponent);
export default factory;
