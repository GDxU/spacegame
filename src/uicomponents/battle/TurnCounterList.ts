/// <reference path="../../../lib/react-global.d.ts" />

import {default as TurnCounter, PropTypes as TurnCounterProps} from "./TurnCounter";

export interface PropTypes extends React.Props<any>
{
  turnsLeft: number;
  maxTurns: number;
  animationDuration: number;
}

interface StateType
{
}

export class TurnCounterListComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "TurnCounterList";
  shouldComponentUpdate = React.addons.PureRenderMixin.shouldComponentUpdate.bind(this);
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }
  
  render()
  {
    const turnElements: React.ReactElement<TurnCounterProps>[] = [];

    const usedTurns = this.props.maxTurns - this.props.turnsLeft;

    for (let i = 0; i < this.props.maxTurns; i++)
    {
      const isEmpty = i < usedTurns;
      turnElements.push(
        TurnCounter(
        {
          key: i,
          isEmpty: i < usedTurns,
          animationDuration: this.props.animationDuration
        })
      );
    }

    return(
      React.DOM.div(
      {
        className: "turns-container",
        title: "Turns left: " + this.props.turnsLeft
      },
        turnElements
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(TurnCounterListComponent);
export default Factory;