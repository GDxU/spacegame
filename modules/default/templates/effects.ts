/// <reference path="../../../src/templateinterfaces/ieffecttemplate.d.ts"/>
/// <reference path="../../../src/targeting.ts" />
/// <reference path="../../../src/unit.ts" />
/// <reference path="../../../src/damagetype.ts" />

// "effect" should be used for referring to ability functionality. visual effects referred to as battleSFX TODO
// example: Abilities.dealDamagePoison would have Effects.dealDamage & Effects.poison

module Rance
{
  export module Modules
  {
    export module DefaultModule
    {
      export module Templates
      {
        export module Effects
        {
          export var singleTargetDamage: Rance.Templates.IEffectTemplate =
          {
            name: "singleTargetDamage",
            targetFleets: "enemy",
            targetingFunction: targetSingle,
            targetRange: "all",
            effect: function(user: Unit, target: Unit, data: {baseDamage: number; damageType: number;})
            {
              var baseDamage = data.baseDamage;
              var damageType = data.damageType;

              var damageIncrease = user.getAttackDamageIncrease(damageType);
              var damage = baseDamage * damageIncrease;

              target.receiveDamage(damage, damageType);
            }
          }
          export var closeAttack: Rance.Templates.IEffectTemplate =
          {
            name: "closeAttack",
            targetFleets: "enemy",
            targetingFunction: targetColumnNeighbors,
            targetRange: "close",
            effect: function(user: Unit, target: Unit)
            {
              var baseDamage = 0.66;
              var damageType = DamageType.physical;

              var damageIncrease = user.getAttackDamageIncrease(damageType);
              var damage = baseDamage * damageIncrease;

              target.receiveDamage(damage, damageType);
            }
          }
          export var wholeRowAttack: Rance.Templates.IEffectTemplate =
          {
            name: "wholeRowAttack",
            targetFleets: "all",
            targetingFunction: targetRow,
            targetRange: "all",
            effect: function(user: Unit, target: Unit)
            {
              var baseDamage = 0.75;
              var damageType = DamageType.magical;

              var damageIncrease = user.getAttackDamageIncrease(damageType);
              var damage = baseDamage * damageIncrease;

              target.receiveDamage(damage, damageType);
            }
          }

          export var bombAttack: Rance.Templates.IEffectTemplate =
          {
            name: "bombAttack",
            targetFleets: "enemy",
            targetingFunction: targetNeighbors,
            targetRange: "all",
            effect: function(user: Unit, target: Unit)
            {
              var baseDamage = 0.5;
              var damageType = DamageType.physical;

              var damageIncrease = user.getAttackDamageIncrease(damageType);
              var damage = baseDamage * damageIncrease;

              target.receiveDamage(damage, damageType);
            }
          }
          export var guardColumn: Rance.Templates.IEffectTemplate =
          {
            name: "guardColumn",
            targetFleets: "all",
            targetingFunction: targetSingle,
            targetRange: "self",
            effect: function(user: Unit, target: Unit, data?: any)
            {
              var data = data || {};
              var guardPerInt = data.perInt || 0;
              var flat = data.flat || 0;

              var guardAmount = guardPerInt * user.attributes.intelligence + flat;
              user.addGuard(guardAmount, "column");
            }
          }
          export var receiveCounterAttack: Rance.Templates.IEffectTemplate =
          {
            name: "receiveCounterAttack",
            targetFleets: "all",
            targetingFunction: targetSingle,
            targetRange: "self",
            effect: function(user: Unit, target: Unit, data: {baseDamage: number; damageType: number;})
            {
              var counterStrength = target.getCounterAttackStrength();
              if (counterStrength)
              {
                Templates.Effects.singleTargetDamage.effect(target, user,
                {
                  baseDamage: data.baseDamage * counterStrength,
                  damageType: DamageType.physical
                });
              }
            }
          }
          export var increaseCaptureChance: Rance.Templates.IEffectTemplate =
          {
            name: "increaseCaptureChance",
            targetFleets: "enemy",
            targetingFunction: targetSingle,
            targetRange: "all",
            effect: function(user: Unit, target: Unit, data: {flat?: number; multiplier?: number;})
            {
              if (!data) return;
              if (data.flat)
              {
                target.battleStats.captureChance += data.flat;
              }
              if (isFinite(data.multiplier))
              {
                target.battleStats.captureChance *= data.multiplier;
              }

            }
          }
          export var buffTest: Rance.Templates.IEffectTemplate =
          {
            name: "buffTest",
            targetFleets: "all",
            targetingFunction: targetSingle,
            targetRange: "all",
            effect: function(user: Unit, target: Unit)
            {
              user.addStatusEffect(new StatusEffect(StatusEffects.test, 1));
            }
          }

          export var healTarget: Rance.Templates.IEffectTemplate =
          {
            name: "healTarget",
            targetFleets: "ally",
            targetingFunction: targetSingle,
            targetRange: "all",
            effect: function(user: Unit, target: Unit, data:
              {flat?: number; maxHealthPercentage?: number; perUserUnit?: number})
            {
              var healAmount = 0;
              if (data.flat)
              {
                healAmount += data.flat;
              }
              if (data.maxHealthPercentage)
              {
                healAmount += target.maxHealth * data.maxHealthPercentage;
              }
              if (data.perUserUnit)
              {
                healAmount += data.perUserUnit * user.getAttackDamageIncrease(DamageType.magical);
              }

              target.removeStrength(-healAmount);
            }
          }

          export var healSelf: Rance.Templates.IEffectTemplate =
          {
            name: "healSelf",
            targetFleets: "ally",
            targetingFunction: targetSingle,
            targetRange: "self",
            effect: function(user: Unit, target: Unit, data: {flat?: number; maxHealthPercentage?: number; perUserUnit?: number})
            {
              Templates.Effects.healTarget.effect(user, user, data);
            }
          }

          export var standBy: Rance.Templates.IEffectTemplate =
          {
            name: "standBy",
            targetFleets: "all",
            targetingFunction: targetSingle,
            targetRange: "self",
            effect: function(){}
          }
        }
      }
    }
  }
}