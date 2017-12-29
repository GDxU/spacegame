import * as React from "react";


import PlayerTechnology from "../../PlayerTechnology";
import eventManager from "../../eventManager";
import Technology from "./Technology";

import {localize} from "../../../localization/localize";


export interface PropTypes extends React.Props<any>
{
  playerTechnology: PlayerTechnology;
}

interface StateType
{
}

export class TechnologiesListComponent extends React.Component<PropTypes, StateType>
{
  public displayName = "TechnologiesList";
  updateListener: Function;


  public state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  componentDidMount()
  {
    this.updateListener = eventManager.addEventListener(
      "builtBuildingWithEffect_research", this.forceUpdate.bind(this));
  }

  componentWillUnmount()
  {
    eventManager.removeEventListener("builtBuildingWithEffect_research", this.updateListener);
  }
  render()
  {
    const playerTechnology = this.props.playerTechnology;

    const researchSpeed = playerTechnology.getResearchSpeed();
    const rows: React.ReactElement<any>[] = [];

    for (let key in playerTechnology.technologies)
    {
      rows.push(Technology(
      {
        playerTechnology: playerTechnology,
        technology: playerTechnology.technologies[key].technology,
        researchPoints: researchSpeed,
        key: key,
      }));
    }

    return(
      React.DOM.div(
      {
        className: "technologies-list-container",
      },
        React.DOM.div(
        {
          className: "technologies-list",
        },
          rows,
        ),
        React.DOM.div(
        {
          className: "technologies-list-research-speed",
        },
          `${localize("researchSpeed")()}: ${researchSpeed} ${localize("perTurn")()}`,
        ),
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(TechnologiesListComponent);
export default Factory;
