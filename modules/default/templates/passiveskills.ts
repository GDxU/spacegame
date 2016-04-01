/// <reference path="../../../src/templateinterfaces/ipassiveskilltemplate.d.ts"/>
/// <reference path="../../../src/templateinterfaces/ibattleprepeffect.d.ts"/>
/// <reference path="abilities.ts" />

namespace Rance
{
  export namespace Modules
  {
    export namespace DefaultModule
    {
      export namespace Templates
      {
        export namespace PassiveSkills
        {
          export var autoHeal: PassiveSkillTemplate =
          {
            type: "autoHeal",
            displayName: "Auto heal",
            description: "Heal 50 health after every turn",

            afterAbilityUse:
            [
              {
                action: EffectActions.healSelf,
                data:
                {
                  flat: 50
                },
                sfx:
                {
                  duration: 1200
                  // battleOverlay: function(props: Templates.SFXParams)
                  // {
                  //   // cg40400.bmp - cg40429.bmp converted to webm
                  //   return BattleSFXFunctions.makeVideo("img\/battleEffects\/heal.webm", props);
                  // }
                },
                trigger: function(user: Unit, target: Unit)
                {
                  return user.currentHealth < user.maxHealth;
                }
              }
            ]
          }
          export var poisoned: PassiveSkillTemplate =
          {
            type: "poisoned",
            displayName: "Poisoned",
            description: "-10% max health per turn",
            afterAbilityUse:
            [
              {
                action: EffectActions.healSelf,
                data:
                {
                  maxHealthPercentage: -0.1
                },
                sfx:
                {
                  duration: 1200,
                  userOverlay: function(props: Templates.SFXParams)
                  {
                    var canvas = <HTMLCanvasElement> document.createElement("canvas");
                    canvas.width = props.width;
                    canvas.height = props.height;
                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = "rgba(30, 150, 30, 0.5)"
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    return canvas;
                  }
                }
              }
            ]

          }
          export var overdrive: PassiveSkillTemplate =
          {
            type: "overdrive",
            displayName: "Overdrive",
            description: "Gives buffs at battle start but become poisoned",

            atBattleStart:
            [
              {
                action: EffectActions.buffTest
              }
            ]
          }
          export var initialGuard: PassiveSkillTemplate =
          {
            type: "initialGuard",
            displayName: "Initial Guard",
            description: "Adds initial guard",
            isHidden: true,

            atBattleStart:
            [
              {
                action: EffectActions.guardRow,
                data: {perInt: 0, flat: 50}
              }
            ],
            inBattlePrep:
            [
              function(user: Unit, battlePrep: BattlePrep)
              {
                EffectActions.guardRow.executeAction(user, user, null, {perInt: 0, flat: 50});
              }
            ]
          }
          export var warpJammer: PassiveSkillTemplate =
          {
            type: "warpJammer",
            displayName: "Warp Jammer",
            description: "Forces an extra unit to defend in neutral territory",

            inBattlePrep:
            [
              function(user: Unit, battlePrep: BattlePrep)
              {
                if (user.fleet.player === battlePrep.attacker)
                {
                  battlePrep.minDefendersInNeutralTerritory += 1;
                }
              }
            ],
            canUpgradeInto: ["medic"]
          }
          export var medic: PassiveSkillTemplate =
          {
            type: "medic",
            displayName: "Medic",
            description: "Heals all units in same star to full at turn start",

            atTurnStart:
            [
              function(user: Unit)
              {
                var star = user.fleet.location;
                var allFriendlyUnits = star.getAllUnitsOfPlayer(user.fleet.player);
                for (var i = 0; i < allFriendlyUnits.length; i++)
                {
                  allFriendlyUnits[i].addStrength(allFriendlyUnits[i].maxHealth)
                }
              }
            ]
          }
        }
      }
    }
  }
}