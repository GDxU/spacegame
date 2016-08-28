/// <reference path="../../../../lib/react-global.d.ts" />

import SFXFragment from "../../../../modules/common/battlesfxfunctions/sfxfragments/SFXFragment";
import
{
  SFXFragmentPropType
} from "../../../../modules/common/battlesfxfunctions/sfxfragments/SFXFragmentPropTypes";

import Point from "../../../Point";
import Color from "../../../Color";

import SFXFragmentPropNumber from "./Number";
import SFXFragmentPropPoint from "./Point";
import SFXFragmentPropColor from "./Color";

interface PropTypes extends React.Props<any>
{
  propName: string;
  propType: SFXFragmentPropType;
  fragment: SFXFragment<any, any>;
  onPropValueChange: () => void;
}

interface StateType
{
  isCollapsed?: boolean;
}

export class SFXFragmentPropNumberComponent extends React.Component<PropTypes, StateType>
{
  displayName = "SFXFragmentPropNumber";
  state: StateType;
  
  constructor(props: PropTypes)
  {
    super(props);

    this.state =
    {
      isCollapsed: false
    }

    this.toggleCollapsed = this.toggleCollapsed.bind(this);
  }

  private toggleCollapsed(): void
  {
    this.setState(
    {
      isCollapsed: !this.state.isCollapsed
    });
  }
  
  render()
  {
    let propValuesElement: React.ReactElement<any>;


    switch (this.props.propType)
    {
      case "number":
      {
        const propValue: number = this.props.fragment.props[this.props.propName];

        propValuesElement = SFXFragmentPropNumber(
        {
          value: propValue,
          propName: this.props.propName,
          fragment: this.props.fragment,
          onValueChange: this.props.onPropValueChange
        });
        break;
      }
      case "point":
      {
        const propValue: Point = this.props.fragment.props[this.props.propName];

        propValuesElement = SFXFragmentPropPoint(
        {
          x: propValue.x,
          y: propValue.y,

          propName: this.props.propName,
          fragment: this.props.fragment,
          onValueChange: this.props.onPropValueChange
        });
        break;
      }
      case "color":
      {
        const propValue: Color = this.props.fragment.props[this.props.propName];

        propValuesElement = SFXFragmentPropColor(
        {
          color: propValue,

          propName: this.props.propName,
          fragment: this.props.fragment,
          onValueChange: this.props.onPropValueChange
        });
        break;
      }
    }
    
    return(
      React.DOM.div(
      {
        className: `sfx-fragment-prop sfx-fragment-prop-${this.props.propType}`
      },
        React.DOM.div(
        {
          className: "sfx-fragment-prop-name-container" + (this.state.isCollapsed ? " collapsed" : " collapsible"),
          onClick: this.toggleCollapsed
        },
          React.DOM.div(
          {
            className: "sfx-fragment-prop-name"
          },
            this.props.propName
          )
        ),
        this.state.isCollapsed ? null : React.DOM.div(
        {
          className: "sfx-fragment-prop-value"
        },
          propValuesElement
        )
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(SFXFragmentPropNumberComponent);
export default Factory;