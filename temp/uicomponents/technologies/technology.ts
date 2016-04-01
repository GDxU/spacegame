/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="../../playertechnology.ts" />

import {Factory as TechnologyPrioritySlider} from "./technologyPrioritySlider.ts";

export interface PropTypes
{
  playerTechnology: PlayerTechnology;
  technology: reactTypeTODO_object; // TechnologyTemplate

  researchPoints: number;
}

export default class Technology extends React.Component<PropTypes, {}>
{
  displayName: string = "Technology";


  state:
  {
    
  }

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = 
    {
    
    };
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  togglePriorityLock()
  {
    var pt: PlayerTechnology = this.props.playerTechnology;
    var technology: TechnologyTemplate = this.props.technology;

    pt.technologies[technology.key].priorityIsLocked = !pt.technologies[technology.key].priorityIsLocked;
    this.forceUpdate();
  }
  render()
  {
    var technology: TechnologyTemplate = this.props.technology;
    var isAtMaxLevel: boolean = false;
    var playerTechnology: PlayerTechnology = this.props.playerTechnology;
    var techData = playerTechnology.technologies[technology.key];

    var forCurrentLevel = playerTechnology.getResearchNeededForTechnologyLevel(techData.level);
    var forNextLevel = playerTechnology.getResearchNeededForTechnologyLevel(techData.level + 1);

    var progressForLevel = techData.totalResearch - forCurrentLevel;
    var neededToProgressLevel = forNextLevel - forCurrentLevel;
    var relativeProgress: number;

    if (techData.level === technology.maxLevel)
    {
      relativeProgress = 1;
      progressForLevel =
        techData.totalResearch - playerTechnology.getResearchNeededForTechnologyLevel(techData.level - 1);
      neededToProgressLevel = progressForLevel;
      isAtMaxLevel = true;
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
            className: "technology-progress-bar" +
              (isAtMaxLevel ? " technology-progress-bar-max-level" : ""),
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
          TechnologyPrioritySlider(
          {
            playerTechnology: this.props.playerTechnology,
            technology: this.props.technology,
            researchPoints: this.props.researchPoints
          })
        ),
        React.DOM.button(
        {
          className: "technology-toggle-priority-lock" + (techData.priorityIsLocked ? " locked" : " unlocked"),
          onClick: this.togglePriorityLock,
          disabled: isAtMaxLevel
        },
          null
        )
      )
    );
  }
}