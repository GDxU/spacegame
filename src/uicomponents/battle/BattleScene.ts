import * as React from "react";
import * as ReactDOMElements from "react-dom-factories";
import * as ReactDOM from "react-dom";

import BattleScene from "../../BattleScene";
import {Flag} from "../../Flag";

import BattleFinish from "./BattleFinish";
import BattleSceneFlag from "./BattleSceneFlag";


export interface PropTypes extends React.Props<any>
{
  battleState: "start" | "active" | "finish";
  battleScene: BattleScene;
  humanPlayerWonBattle: boolean;

  flag1: Flag;
  flag2: Flag;
}

interface StateType
{
}

export class BattleSceneComponent extends React.Component<PropTypes, StateType>
{
  public displayName = "BattleScene";
  public state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  shouldComponentUpdate(newProps: PropTypes)
  {
    const propsThatShouldTriggerUpdate =
    {
      battleState: true,
    };

    for (const key in newProps)
    {
      if (propsThatShouldTriggerUpdate[key] && newProps[key] !== this.props[key])
      {
        return true;
      }
    }

    return false;
  }

  componentWillReceiveProps(newProps: PropTypes)
  {
    if (this.props.battleState === "start" && newProps.battleState === "active")
    {
      this.props.battleScene.bindRendererView((<HTMLElement>ReactDOM.findDOMNode(this)));
      this.props.battleScene.resume();
    }
    else if (this.props.battleState === "active" && newProps.battleState === "finish")
    {
      this.props.battleScene.destroy();
    }
  }

  render()
  {
    let componentToRender: React.ReactElement<any> | null;

    switch (this.props.battleState)
    {
      case "start":
      {
        componentToRender = ReactDOMElements.div(
        {
          className: "battle-scene-flags-container",
        },
          BattleSceneFlag(
          {
            flag: this.props.flag1,
            facingRight: true,
          }),
          BattleSceneFlag(
          {
            flag: this.props.flag2,
            facingRight: false,
          }),
        );
        break;
      }
      case "active":
      {
        componentToRender = null; // has battlescene view
        break;
      }
      case "finish":
      {
        componentToRender = BattleFinish(
        {
          humanPlayerWonBattle: this.props.humanPlayerWonBattle,
        });
        break;
      }
    }

    return(
      ReactDOMElements.div(
      {
        className: "battle-scene",
      },
        componentToRender,
      )
    );
  }
}

const factory: React.Factory<PropTypes> = React.createFactory(BattleSceneComponent);
export default factory;
