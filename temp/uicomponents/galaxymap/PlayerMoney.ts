/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="../../player.ts" />


import Player from "../../../src/Player.ts";
import eventManager from "../../../src/eventManager.ts";


interface PropTypes extends React.Props<any>
{
  player?: Player;
}

interface StateType
{
}

export class PlayerMoneyComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "PlayerMoney";
  lastAmountRendered: reactTypeTODO_any = undefined;


  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.handlePlayerMoneyUpdated = this.handlePlayerMoneyUpdated.bind(this);    
  }
  
  componentDidMount()
  {
    eventManager.addEventListener("playerMoneyUpdated", this.handlePlayerMoneyUpdated);
  }

  componentWillUnmount()
  {
    eventManager.removeEventListener("playerMoneyUpdated", this.handlePlayerMoneyUpdated);
  }

  handlePlayerMoneyUpdated()
  {
    if (this.props.player.money !== this.lastAmountRendered)
    {
      this.forceUpdate();
    }
  }

  render()
  {
    this.lastAmountRendered = this.props.player.money;

    return(
      React.DOM.div(
      {
        className: "player-money"
      },
        "Money: " + this.props.player.money
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(PlayerMoneyComponent);
export default Factory;