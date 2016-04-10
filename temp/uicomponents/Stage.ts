/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="../../lib/react-global-0.13.3.d.ts" />

/// <reference path="battle/battle.ts"/>
/// <reference path="unitlist/unitlist.ts"/>
/// <reference path="unitlist/itemequip.ts"/>
/// <reference path="battleprep/battleprep.ts"/>
/// <reference path="galaxymap/galaxymap.ts"/>
/// <reference path="setupgame/setupgame.ts"/>

/// <reference path="flagmaker.ts"/>
/// <reference path="battlescenetester.ts" />


import BattlePrep from "./battleprep/BattlePrep.ts";
import BattleSceneTester from "./BattleSceneTester.ts";
import SetupGame from "./setupgame/SetupGame.ts";
import Battle from "./battle/Battle.ts";
import GalaxyMap from "./galaxymap/GalaxyMap.ts";
import FlagMaker from "./FlagMaker.ts";


export interface ReactComponentPlaceHolder
{

}
export interface ReactDOMPlaceHolder
{
  
}
export interface PropTypes
{
  // TODO refactor | add prop types
}

interface StateType
{
  // TODO refactor | add state type
}

class Stage_COMPONENT_TODO extends React.Component<PropTypes, StateType>
{
  displayName: string = "Stage";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  changeScene()
  {
    var newScene = this.refs.sceneSelector.getDOMNode().value;

    this.props.changeSceneFunction(newScene);
  }

  render()
  {
    var elementsToRender: ReactComponentPlaceHolder[] = [];

    switch (this.props.sceneToRender)
    {
      case "battle":
      {
        elementsToRender.push(
          Battle(
          {
            battle: this.props.battle,
            humanPlayer: this.props.player,
            renderer: this.props.renderer,
            key: "battle"
          })
        );
        break;
      }
      case "battlePrep":
      {
        elementsToRender.push(
          BattlePrep(
          {
            battlePrep: this.props.battlePrep,
            renderer: this.props.renderer,
            key: "battlePrep"
          })
        );
        break;
      }
      case "galaxyMap":
      {
        elementsToRender.push(
          GalaxyMap(
          {
            renderer: this.props.renderer,
            mapRenderer: this.props.mapRenderer,
            playerControl: this.props.playerControl,
            player: this.props.player,
            game: this.props.game,
            key: "galaxyMap"
          })
        );
        break;
      }
      case "flagMaker":
      {
        elementsToRender.push(
          FlagMaker(
          {
            key: "flagMaker"
          })
        );
        break;
      }
      case "setupGame":
      {
        elementsToRender.push(
          SetupGame(
          {
            key: "setupGame"
          })
        );
        break;
      }
      case "battleSceneTester":
      {
        elementsToRender.push(
          BattleSceneTester(
          {
            key: "battleSceneTester"
          })
        );
        break;
      }
    }
    return(
      React.DOM.div({className: "react-stage"},
        elementsToRender
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(Stage_COMPONENT_TODO);
export default Factory;
