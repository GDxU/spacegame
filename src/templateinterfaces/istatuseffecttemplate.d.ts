declare module Rance
{
  module Templates
  {
    interface IStatusEffectTemplate
    {
      type: string;
      displayName: string;
      
      attributes?: IStatusEffectAttributes;
      passiveSkills?: IPassiveSkillTemplate[];
    }
  }
}