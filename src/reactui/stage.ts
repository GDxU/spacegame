/// <reference path="../../lib/react.d.ts" />

/// <reference path="battle/battle.ts"/>
/// <reference path="unitlist/unitlist.ts"/>
/// <reference path="battleprep/battleprep.ts"/>
/// <reference path="mapgen/mapgen.ts"/>
/// <reference path="galaxymap/galaxymap.ts"/>

/// <reference path="flagmaker.ts"/>

module Rance
{
  export module UIComponents
  {
    export var Stage = React.createClass(
    {
      displayName: "Stage",
      changeScene: function()
      {
        var newScene = this.refs.sceneSelector.getDOMNode().value;

        this.props.changeSceneFunction(newScene);
      },

      render: function()
      {
        var elementsToRender = [];

        switch (this.props.sceneToRender)
        {
          case "battle":
          {
            elementsToRender.push(
              UIComponents.Battle(
              {
                battle: this.props.battle,
                key: "battle"
              })
            );
            break;
          }
          case "mapGen":
          {
            elementsToRender.push(
              UIComponents.MapGen(
              {
                renderer: this.props.renderer,
                mapGen: this.props.mapGen,
                key: "mapGen"
              })
            );
            break;
          }
          case "battlePrep":
          {
            elementsToRender.push(
              UIComponents.BattlePrep(
              {
                battlePrep: this.props.battlePrep,
                key: "battlePrep"
              })
            );
            break;
          }
          case "galaxyMap":
          {
            elementsToRender.push(
              UIComponents.GalaxyMap(
              {
                renderer: this.props.renderer,
                galaxyMap: this.props.galaxyMap,
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
              UIComponents.FlagMaker()
            );
            break;
          }
        }
        return(
          React.DOM.div({className: "react-stage"},
            elementsToRender,
            React.DOM.select(
              {
                className: "reactui-selector",
                ref: "sceneSelector",
                value: this.props.sceneToRender,
                onChange: this.changeScene
              },
              React.DOM.option({value: "mapGen"}, "map generation"),
              React.DOM.option({value: "galaxyMap"}, "map"),
              React.DOM.option({value: "battlePrep"}, "battle setup"),
              React.DOM.option({value: "battle"}, "battle"),
              React.DOM.option({value: "flagMaker"}, "make flags")
            )
          )
        );
      }
    });
  }
}