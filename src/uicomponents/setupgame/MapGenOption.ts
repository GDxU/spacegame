import * as React from "react";

import MapGenOption from "../../templateinterfaces/MapGenOption";
import
{
  clamp,
} from "../../utility";

export interface PropTypes extends React.Props<any>
{
  value: number;
  id: string;
  option: MapGenOption;
  onChange: (optionName: string, newValue: number) => void;
}

interface StateType
{
}

export class MapGenOptionComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "MapGenOption";

  handleChange(e: React.FormEvent)
  {
    const target = <HTMLInputElement> e.target;
    const option = this.props.option;
    const newValue = clamp(parseFloat(target.value), option.range.min, option.range.max);
    this.props.onChange(this.props.id, newValue);
  }

  shouldComponentUpdate(newProps: PropTypes)
  {
    return newProps.value !== this.props.value;
  }

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);

    this.bindMethods();
  }
  private bindMethods()
  {
    this.handleChange = this.handleChange.bind(this);
  }

  render()
  {
    const option = this.props.option;
    const range = option.range;
    const id = "mapGenOption_" + this.props.id;

    ["min", "max", "step"].forEach(prop =>
    {
      if (!range[prop])
      {
        throw new Error("No property " + prop +" specified on map gen option " + this.props.id);
      }
    });

    // console.log(this.props.id, this.props.value);

    return(
      React.DOM.div(
      {
        className: "map-gen-option",
      },
        React.DOM.label(
        {
          className: "map-gen-option-label",
          title: option.displayName,
          htmlFor: id,
        },
          option.displayName,
        ),
        React.DOM.input(
        {
          className: "map-gen-option-slider",
          id: id,
          type: "range",
          min: range.min,
          max: range.max,
          step: range.step,
          value: "" + this.props.value,
          onChange: this.handleChange,
        }),
        React.DOM.input(
        {
          className: "map-gen-option-value",
          title: option.displayName,
          type: "number",
          min: range.min,
          max: range.max,
          step: range.step,
          value: "" + this.props.value,
          onChange: this.handleChange,
        }),
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(MapGenOptionComponent);
export default Factory;
