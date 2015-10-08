/// <reference path="technology.ts" />

module Rance
{
  export module UIComponents
  {
    export var TechnologiesList = React.createClass(
    {
      displayName: "TechnologiesList",
      render: function()
      {
        var player: Player = this.props.player;
        var researchSpeed: number = player.getResearchSpeed();
        var rows: ReactComponentPlaceHolder[] = [];

        for (var key in player.technologies)
        {
          rows.push(UIComponents.Technology(
          {
            player: player,
            technology: player.technologies[key].technology,
            researchPoints: researchSpeed,
            key: key
          }));
        }

        return(
          React.DOM.div(
          {
            className: "technologies-list-container"
          },
            React.DOM.div(
            {
              className: "technologies-list"
            },
              rows
            ),
            React.DOM.div(
            {
              className: "technologies-list-research-speed"
            },
              "Research speed: " + researchSpeed + " per turn"
            )
          )
        );
      }
    })
  }
}