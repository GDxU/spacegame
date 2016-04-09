/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

export interface PropTypes
{
  // TODO refactor | add prop types
}

interface StateType
{
  // TODO refactor | add state type
}

export default class UnitStatusEffects extends React.Component<PropTypes, StateType>
{
  displayName: string = "UnitStatusEffects";

  state: StateType;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  render()
  {
    var statusEffects: ReactDOMPlaceHolder[] = [];

    var withItems = this.props.unit.getAttributesWithItems();
    var withEffects = this.props.unit.getAttributesWithEffects();

    for (var attribute in withEffects)
    {
      if (attribute === "maxActionPoints") continue;

      var ite = withItems[attribute];
      var eff = withEffects[attribute];

      if (ite === eff) continue;

      var polarityString = eff > ite ? "positive" : "negative";
      var polaritySign = eff > ite ? " +" : " ";

      var imageSrc = "img\/icons\/statusEffect_" + polarityString + "_" + attribute + ".png";

      var titleString = "" + attribute + polaritySign + (eff - ite);

      statusEffects.push(React.DOM.img(
      {
        className: "status-effect-icon" + " status-effect-icon-" + attribute,
        src: imageSrc,
        key: attribute,
        title: titleString
      }))
    }

    var passiveSkills: PassiveSkillTemplate[] = [];
    var passiveSkillsByPhase = this.props.unit.getPassiveSkillsByPhase();
    var phasesToCheck = this.props.isBattlePrep ? ["atBattleStart"] : ["beforeAbilityUse", "afterAbilityUse"];

    phasesToCheck.forEach(function(phase: string)
    {
      if (passiveSkillsByPhase[phase])
      {
        for (var i = 0; i < passiveSkillsByPhase[phase].length; i++)
        {
          var skill = passiveSkillsByPhase[phase][i];
          if (!skill.isHidden)
          {
            passiveSkills.push(skill);
          }
        }
      }
    });

    var passiveSkillsElement: ReactDOMPlaceHolder = null;
    if (passiveSkills.length > 0)
    {
      var passiveSkillsElementTitle: string = "";
      for (var i = 0; i < passiveSkills.length; i++)
      {
        passiveSkillsElementTitle += passiveSkills[i].displayName + ": " +
          passiveSkills[i].description + "\n";
      }

      passiveSkillsElement = React.DOM.img(
      {
        className: "unit-status-effects-passive-skills",
        src: "img\/icons\/availableAction.png",
        title: passiveSkillsElementTitle
      })
    }

    return(
      React.DOM.div(
      {
        className: "unit-status-effects-container"
      },
        passiveSkillsElement,
        React.DOM.div(
        {
          className: "unit-status-effects-attributes"
        },
          statusEffects
        )
      )
    );
  }
}
