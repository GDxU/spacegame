/// <reference path="../../../lib/tween.js.d.ts" />
/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

interface PropTypes extends React.Props<any>
{
  delay: number;
  from: number;
  to: number;
}

interface StateType
{
  displayedStrength?: number;
}

export class BattleDisplayStrengthComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "BattleDisplayStrength";
  state: StateType;
  activeTween: TWEEN.Tween;
  animationFrameHandle: number;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = this.getInitialState();
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.updateDisplayStrength = this.updateDisplayStrength.bind(this);
    this.animateDisplayedStrength = this.animateDisplayedStrength.bind(this);    
  }
  
  private getInitialState(): StateType
  {
    return(
    {
      displayedStrength: this.props.from,
    });
  }

  componentDidMount()
  {
    this.animateDisplayedStrength(this.props.from, this.props.to, this.props.delay);
  }

  componentWillUnmount()
  {
    if (this.activeTween)
    {
      this.activeTween.stop();
    }
  }
  updateDisplayStrength(newAmount: number)
  {
    this.setState(
    {
      displayedStrength: newAmount
    });
  }
  animateDisplayedStrength(from: number, newAmount: number, time: number)
  {
    var self = this;
    var stopped = false;

    if (this.activeTween)
    {
      this.activeTween.stop();
    }
    
    if (from === newAmount) return;

    var animateTween = function()
    {
      if (stopped)
      {
        return;
      }

      TWEEN.update();
      self.animationFrameHandle = window.requestAnimationFrame(animateTween);
    }

    var tween = new TWEEN.Tween(
    {
      health: from
    }).to(
    {
      health: newAmount
    }, time).onUpdate(function()
    {
      self.setState(
      {
        displayedStrength: this.health
      });
    }).easing(TWEEN.Easing.Sinusoidal.Out);

    tween.onStop(function()
    {
      cancelAnimationFrame(self.animationFrameHandle);
      stopped = true;
      TWEEN.remove(tween);
    });

    this.activeTween = tween;

    tween.start();
    animateTween();
  }

  render()
  {
    return(
      React.DOM.div({className: "unit-strength-battle-display"},
        Math.ceil(this.state.displayedStrength)
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(BattleDisplayStrengthComponent);
export default Factory;