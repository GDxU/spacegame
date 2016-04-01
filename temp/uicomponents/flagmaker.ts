/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="playerflag.ts" />

export interface PropTypes
{
  // TODO refactor | add prop types
}

export default class FlagMaker extends React.Component<PropTypes, {}>
{
  setStateTimeout: reactTypeTODO_any = undefined;
  sizeValue: number = 46;
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
  
  getInitialState()
  {
    return(
    {
      sizeValue: 46,
      size: 46
    });
  }

  handleSizeChange(e: Event)
  {
    if (this.setStateTimeout)
    {
      window.clearTimeout(this.setStateTimeout);
    }
    var target = <HTMLInputElement> e.target;
    var value = parseInt(target.value);
    if (isFinite(value))
    {
      this.sizeValue = value;
      this.setStateTimeout = window.setTimeout(this.setState.bind(this, {size: value}), 500);
    }
  }
  makeFlags()
  {
    this.forceUpdate();
  }
  render()
  {
    var flagElements: ReactComponentPlaceHolder[] = [];
    for (var i = 0; i < 100; i++)
    {
      var colorScheme = generateColorScheme();

      var flag = new Flag(
      {
        width: this.state.size,
        mainColor: colorScheme.main,
        secondaryColor: colorScheme.secondary
      });

      flag.generateRandom();

      flagElements.push(UIComponents.PlayerFlag(
      {
        key: i,
        props:
        {
          tag: "flagMaker",
          width: this.state.size,
          height: this.state.size,
          style:
          {
            width: this.state.size,
            height: this.state.size
          }
        },
        flag: flag
      }));
    }
    return(
      React.DOM.div(null,
        React.DOM.div(
        {
          className: "flags",
          ref: "flags" 
        },
          flagElements
        ),
        React.DOM.button(
        {
          onClick: this.makeFlags
        }, "make flags"),
        React.DOM.input(
        {
          onChange: this.handleSizeChange,
          defaultValue: this.sizeValue,
          type: "number"
        })
      )
    );
  }
}