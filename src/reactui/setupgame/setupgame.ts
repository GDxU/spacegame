/// <reference path="setupgameplayers.ts" />
/// <reference path="mapsetup.ts" />

module Rance
{
  export module UIComponents
  {
    export var SetupGame = React.createClass(
    {
      displayName: "SetupGame",

      getInitialState: function()
      {
        return(
        {
          minPlayers: 1,
          maxPlayers: 5
        });
      },

      setPlayerLimits: function(props:
      {
        min: number;
        max: number;
      })
      {
        this.setState(
        {
          minPlayers: props.min,
          maxPlayers: props.max
        });
      },


      startGame: function()
      {
        var gameData: any = {};

        var players = this.refs.players.makeAllPlayers();

        var pirates = new Player(true);
        pirates.setupPirates();

        gameData.playerData =
        {
          players: players,
          independents: pirates
        }

        app.makeGameFromSetup(gameData);
      },

      randomizeAllPlayers: function()
      {
        this.refs.players.randomizeAllPlayers();
      },

      render: function()
      {
        return(
          React.DOM.div(
          {
            className: "setup-game"
          },
            React.DOM.div(
            {
              className: "setup-game-options"
            },
              UIComponents.SetupGamePlayers(
              {
                ref: "players",
                minPlayers: this.state.minPlayers,
                maxPlayers: this.state.maxPlayers
              }),
              UIComponents.MapSetup(
              {
                setPlayerLimits: this.setPlayerLimits
              })
            ),
            React.DOM.button(
            {
              onClick: this.randomizeAllPlayers
            }, "Randomize"),
            React.DOM.button(
            {
              onClick: this.startGame
            }, "Start game")
          )
        );
      }
    })
  }
}
