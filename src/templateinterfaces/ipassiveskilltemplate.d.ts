declare module Rance
{
  module Templates
  {
    interface IPassiveSkillTemplate
    {
      type: string;
      displayName: string;
      description: string;
      isHidden?: boolean;
      
      atBattleStart?: IAbilityTemplateEffect[];
      beforeAbilityUse?: IAbilityTemplateEffect[];
      afterAbilityUse?: IAbilityTemplateEffect[];
      atTurnStart?: ITurnStartEffect[];
      inBattlePrep?: IBattlePrepEffect[];
    }
  }
}