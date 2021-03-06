import * as React from "react";
import * as ReactDOMElements from "react-dom-factories";

import Unit from "../../Unit";

import {localize} from "../../../localization/localize";


export interface PropTypes extends React.Props<any>
{
  unit: Unit;
  handleClick: (attribute: string) => void;
}

interface StateType
{
}

export class UpgradeAttributesComponent extends React.Component<PropTypes, StateType>
{
  public displayName = "UpgradeAttributes";
  upgradeAttribute(attribute: string, e: MouseEvent)
  {
    if (e.button) { return; }
    this.props.handleClick(attribute);
  }
  public state: StateType;

  constructor(props: PropTypes)
  {
    super(props);

    this.bindMethods();
  }
  private bindMethods()
  {
    this.upgradeAttribute = this.upgradeAttribute.bind(this);
  }

  render()
  {
    const unit = this.props.unit;
    const rows: React.ReactHTMLElement<any>[] = [];

    const attributes = unit.baseAttributes.getAttributesTypesSortedForDisplay();

    attributes.forEach(attribute =>
    {
      const maxAttribute = attribute === "maxActionPoints" ? 6 : 9;
      if (unit.baseAttributes[attribute] < maxAttribute)
      {
        rows.push(ReactDOMElements.li(
        {
          className: "upgrade-attributes-attribute",
          onClick: this.upgradeAttribute.bind(this, attribute),
          key: attribute,
        },
          localize("upgradeAttribute")(
          {
            attribute: localize(attribute)(),
            currentLevel: unit.baseAttributes[attribute],
            nextLevel: unit.baseAttributes[attribute] + 1,
          }),
        ));
      }
    });

    return(
      ReactDOMElements.div(
      {
        className: "upgrade-attributes",
      },
        ReactDOMElements.div(
        {
          className: "upgrade-attributes-header",
        },
          localize("upgradeStats")(),
        ),
        ReactDOMElements.ol(
        {
          className: "upgrade-attributes-list",
        },
          rows,
        ),
      )
    );
  }
}

const factory: React.Factory<PropTypes> = React.createFactory(UpgradeAttributesComponent);
export default factory;
