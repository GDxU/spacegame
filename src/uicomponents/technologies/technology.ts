/// <reference path="technologypriorityslider.ts" />

module Rance
{
  export module UIComponents
  {
    export var Technology = React.createClass(
    {
      displayName: "Technology",
      togglePriorityLock: function()
      {
        this.props.player.technologies[this.props.technology.key].priorityIsLocked =
          !this.props.player.technologies[this.props.technology.key].priorityIsLocked;
        this.forceUpdate();
      },
      render: function()
      {
        var technology: Templates.ITechnologyTemplate = this.props.technology;
        var player: Player = this.props.player;
        var techData = player.technologies[technology.key];

        var forCurrentLevel = player.getResearchNeededForTechnologyLevel(techData.level);
        var forNextLevel = player.getResearchNeededForTechnologyLevel(techData.level + 1);

        var progressForLevel = techData.totalResearch - forCurrentLevel;
        var neededToProgressLevel = forNextLevel - forCurrentLevel;

        var relativeProgress: number;  
        if (techData.level === technology.maxLevel)
        {
          relativeProgress = 1;
        }
        else
        {
          relativeProgress = progressForLevel / neededToProgressLevel;
        }

        return(
          React.DOM.div(
          {
            className: "technology-listing"
          },
            React.DOM.div(
            {
              className: "technology-name"
            },
              technology.displayName
            ),
            React.DOM.div(
            {
              className: "technology-level"
            },
              "Level " + techData.level
            ),
            React.DOM.div(
            {
              className: "technology-progress-bar-container"
            },
              React.DOM.div(
              {
                className: "technology-progress-bar",
                style:
                {
                  width: "" + (relativeProgress * 100) + "%"
                }
              }),
              React.DOM.div(
              {
                className: "technology-progress-bar-value"
              },
                "" + progressForLevel.toFixed(1) + " / " + Math.ceil(neededToProgressLevel)
              ),
              UIComponents.TechnologyPrioritySlider(
              {
                player: this.props.player,
                technology: this.props.technology,
                researchPoints: this.props.researchPoints
              })
            ),
            React.DOM.button(
            {
              className: "technology-toggle-priority-lock" + (techData.priorityIsLocked ? " locked" : " unlocked"),
              onClick: this.togglePriorityLock
            },
              null
            )
          )
        );
      }
    })
  }
}