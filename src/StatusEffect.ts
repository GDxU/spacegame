import StatusEffectTemplate from "./templateinterfaces/StatusEffectTemplate";
import {StatusEffectSaveData} from "./savedata/StatusEffectSaveData";

import idGenerators from "./idGenerators";
import Unit from "./Unit";

export default class StatusEffect
{
  public id: number;
  public template: StatusEffectTemplate;
  // incremented after status effect actions are called
  public turnsHasBeenActiveFor: number = 0;
  public turnsToStayActiveFor: number;

  public sourceUnit: Unit;

  constructor(props:
  {
    template: StatusEffectTemplate;
    id?: number;
    turnsToStayActiveFor: number;
    sourceUnit: Unit;
  })
  {
    this.id = isFinite(props.id) ? props.id : idGenerators.statusEffect++;
    this.template = props.template;
    this.turnsToStayActiveFor = props.turnsToStayActiveFor;
    this.sourceUnit = props.sourceUnit;
  }

  public clone(): StatusEffect
  {
    const effect = new StatusEffect(
    {
      template: this.template,
      turnsToStayActiveFor: this.turnsToStayActiveFor,
      id: this.id,
      sourceUnit: this.sourceUnit,
    });

    effect.turnsHasBeenActiveFor = this.turnsHasBeenActiveFor;

    return effect;
  }

  public processTurnEnd(): void
  {
    this.turnsHasBeenActiveFor++;
  }
  public serialize(): StatusEffectSaveData
  {
    return(
    {
      id: this.id,
      templateType: this.template.type,
      turnsToStayActiveFor: this.turnsToStayActiveFor,
      turnsHasBeenActiveFor: this.turnsHasBeenActiveFor,
      sourceUnitID: this.sourceUnit.id
    });
  }
}
