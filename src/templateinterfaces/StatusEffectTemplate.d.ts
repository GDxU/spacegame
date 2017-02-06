import {UnitAttributeAdjustments} from "../UnitAttributes";
import {AbilityEffectTemplate} from "./AbilityEffectTemplate";
import UnitPassiveEffect from "./UnitPassiveEffect";

declare interface StatusEffectTemplate extends UnitPassiveEffect
{
  type: string;
  displayName: string;
  description?: string;
  isHidden?: boolean;

  attributes?: UnitAttributeAdjustments;
  beforeAbilityUse?: AbilityEffectTemplate[];
  afterAbilityUse?: AbilityEffectTemplate[];
}

export default StatusEffectTemplate;
