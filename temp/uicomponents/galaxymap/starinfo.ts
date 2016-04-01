/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="defencebuildinglist.ts"/>

export interface PropTypes
{
  // TODO refactor | add prop types
}

export default class StarInfo extends React.Component<PropTypes, {}>
{
  displayName: string = "StarInfo";
  shouldComponentUpdate(newProps: any)
  {
    return this.props.selectedStar !== newProps.selectedStar;
  }
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
  
  render()
  {
    var star: Star = this.props.selectedStar;
    if (!star) return null;

    var dumpDebugInfoButton: ReactDOMPlaceHolder = null;

    if (Options.debugMode)
    {
      dumpDebugInfoButton = React.DOM.button(
      {
        className: "star-info-dump-debug-button",
        onClick: function(e)
        {
          console.log(star);
          console.log(star.mapGenData)
        }
      },
        "Debug"
      )
    }
    
    return(
      React.DOM.div(
      {
        className: "star-info"
      },
        React.DOM.div(
        {
          className: "star-info-name"
        },
          star.name
        ),
        React.DOM.div(
        {
          className: "star-info-owner"
        },
          star.owner ? star.owner.name : null
        ),
        dumpDebugInfoButton,
        React.DOM.div(
        {
          className: "star-info-location"
        },
          "x: " + star.x.toFixed() +
          " y: " + star.y.toFixed()
        ),
        React.DOM.div(
        {
          className: "star-info-income"
        },
          "Income: " + star.getIncome()
        ),
        UIComponents.DefenceBuildingList(
        {
          buildings: star.buildings["defence"]
        })
        
      )
    );
  }
}