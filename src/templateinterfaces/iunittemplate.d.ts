declare module Rance
{
  module Templates
  {
    interface IUnitTemplate
    {
      type: string;
      displayName: string;
      sprite: ISpriteTemplate;
      isSquadron: boolean;
      buildCost: number;
      icon: string;
      maxHealth: number;
      maxMovePoints: number;
      
      // archetype is used by the ai to balance unit composition
      archetype: UnitTemplateArchetype;
      // family is used to group ships for local specialties and AI favorites
      // f.ex. sector specializes in producing units with beam weapons
      families : IUnitFamily[];
      
      // how many stars away unit can see
      // -1: no vision, 0: current star only, 1: current & 1 away etc.
      visionRange: number;
      // like vision but for stealthy ships
      detectionRange: number;
      isStealthy?: boolean;
      
      attributeLevels:
      {
        attack: number;
        defence: number;
        intelligence: number;
        speed: number;
      };
      abilities: IAbilityTemplate[];
      passiveSkills?: IPassiveSkillTemplate[];
    }
  }
}
