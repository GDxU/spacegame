/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

export interface PropTypes
{
  // TODO refactor | add prop types
}

export default class UnitIcon extends React.Component<PropTypes, {}>
{
  displayName: string = "UnitIcon";
  mixins: reactTypeTODO_any = [React.addons.PureRenderMixin];
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
    var unit = this.props.unit;

    var containerProps: any =
    {
      className: "unit-icon-container"
    };

    var fillerProps: any =
    {
      className: "unit-icon-filler"
    };

    if (this.props.isActiveUnit)
    {
      fillerProps.className += " active-border";
      containerProps.className += " active-border";
    }

    if (this.props.isAnnihilated)
    {
      containerProps.className += " icon-annihilated-overlay";
    }

    if (this.props.facesLeft)
    {
      fillerProps.className += " unit-border-right";
      containerProps.className += " unit-border-no-right";
    }
    else
    {
      fillerProps.className += " unit-border-left";
      containerProps.className += " unit-border-no-left";
    }

    var iconImage = this.props.icon ?
      React.DOM.img(
      {
        className: "unit-icon",
        src: this.props.icon
      }) :
      null;

    return(
      React.DOM.div({className: "unit-icon-wrapper"},
        React.DOM.div(fillerProps),
        React.DOM.div(containerProps,
          iconImage
        ),
        React.DOM.div(fillerProps)
      )
    );
  }
}