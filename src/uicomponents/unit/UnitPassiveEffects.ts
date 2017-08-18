import * as React from "react";

import UnitEffectTemplate from "../../templateinterfaces/UnitEffectTemplate";


export interface PropTypes extends React.Props<any>
{
  passiveEffects?: UnitEffectTemplate[];
}

interface StateType
{
}

export class UnitPassiveEffectsComponent extends React.PureComponent<PropTypes, StateType>
{
  displayName: string = "UnitPassiveEffects";
  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
  }

  render()
  {
    return(
      (this.props.passiveEffects && this.props.passiveEffects.length > 0) ?
        React.DOM.img(
        {
          className: "unit-passive-effects-icon",
          src: "img/icons/availableAction.png",
          title: this.props.passiveEffects.reduce((t, e) =>
          {
            return t + e.displayName + ": " + e.description + "\n";
          }, ""),
        }) :
        null
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(UnitPassiveEffectsComponent);
export default Factory;
