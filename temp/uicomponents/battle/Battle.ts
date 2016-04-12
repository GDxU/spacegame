/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

import Renderer from "../../../src/Renderer.ts";
import Player from "../../../src/Player.ts";
import Battle from "../../../src/Battle.ts";
import Unit from "../../../src/Unit.ts";
import TurnOrder from "./TurnOrder.ts";
import TurnCounter from "./TurnCounter.ts";
import BattleBackground from "./BattleBackground.ts";
import Options from "../../../src/options.ts";
import MCTree from "../../../src/MCTree.ts";
import AbilityTemplate from "../../../src/templateinterfaces/AbilityTemplate.d.ts";
import {AbilityUseData} from "../../../src/battleAbilityProcessing.ts";
import {getTargetsForAllAbilities} from "../../../src/battleAbilityTargeting.ts";
import BattleScore from "./BattleScore.ts";
import BattleScene from "./BattleScene.ts";
import Formation from "./Formation.ts";
import BattleDisplayStrength from "./BattleDisplayStrength.ts";
import {default as AbilityTooltip, AbilityTooltipComponent} from "./AbilityTooltip.ts";


// TODO refactor
// should have separate non-react class for battle logic
interface PropTypes extends React.Props<any>
{
  renderer: Renderer;
  battle: Battle;
  humanPlayer: Player;
}

interface StateType
{
  hoveredUnit?: Unit;
  highlightedUnit?: Unit;
  abilityTooltip?:
  {
    parentElement?: HTMLElement;
    facesLeft?: boolean;
  };
  battleIsStarting?: boolean;
  userUnit?: Unit;
  targetUnit?: Unit;
  afterAbilityFinishedCallback?: () => void;
  potentialDelay?:
  {
    id: number;
    delay: number;
  };
  battleSceneUnit2StartingStrength?: number;
  battleSceneUnit1StartingStrength?: number;
  battleSceneUnit1?: Unit
  triggerEffectCallback?: (forceUpdate?: boolean) => void;
  playingBattleEffect?: boolean;
  battleEffectDuration?: number;
  battleSceneUnit2?: Unit
  targetsInPotentialArea?: Unit[];
  battleEffectSFX?: any; // TODO refactor | define state type 456
  hoveredAbility?: AbilityTemplate;
}

export class BattleComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "Battle";

  // set as a property of the class instead of its state
  // as its not used for trigger updates
  // and needs to be changed synchronously
  tempHoveredUnit: Unit = null;
  idGenerator: number = 0;
  MCTree: MCTree = null;
  battleStartStartTime: number = undefined;
  battleEndStartTime: number = undefined;

  state: StateType;
  
  ref_TODO_formationsContainer: React.HTMLComponent;
  ref_TODO_abilityTooltip: AbilityTooltipComponent;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = this.getInitialState();
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.clearHoveredUnit = this.clearHoveredUnit.bind(this);
    this.getBlurArea = this.getBlurArea.bind(this);
    this.handleMouseEnterUnit = this.handleMouseEnterUnit.bind(this);
    this.clearBattleEffect = this.clearBattleEffect.bind(this);
    this.handleMouseEnterAbility = this.handleMouseEnterAbility.bind(this);
    this.usePreparedAbility = this.usePreparedAbility.bind(this);
    this.useAIAbility = this.useAIAbility.bind(this);
    this.handleMouseLeaveAbility = this.handleMouseLeaveAbility.bind(this);
    this.handleTurnEnd = this.handleTurnEnd.bind(this);
    this.handleMouseLeaveUnit = this.handleMouseLeaveUnit.bind(this);
    this.setBattleSceneUnits = this.setBattleSceneUnits.bind(this);
    this.usePlayerAbility = this.usePlayerAbility.bind(this);
    this.endBattleStart = this.endBattleStart.bind(this);
    this.getUnitElement = this.getUnitElement.bind(this);
    this.handleAbilityUse = this.handleAbilityUse.bind(this);
    this.playBattleEffect = this.playBattleEffect.bind(this);
    this.finishBattle = this.finishBattle.bind(this);    
  }
  
  private getInitialState(): StateType
  {
    return(
    {
      abilityTooltip:
      {
        parentElement: null,
        facesLeft: null
      },
      targetsInPotentialArea: [],
      potentialDelay: null,

      hoveredAbility: null,
      
      targetUnit: null,
      userUnit: null,
      hoveredUnit: null,
      highlightedUnit: null,

      battleSceneUnit1StartingStrength: null,
      battleSceneUnit2StartingStrength: null,
      battleSceneUnit1: null,
      battleSceneUnit2: null,
      playingBattleEffect: false,
      battleEffectDuration: null,
      battleEffectSFX: null,
      afterAbilityFinishedCallback: null,
      triggerEffectCallback: null,
      battleIsStarting: true
    });
  }

  componentDidMount()
  {
    this.battleStartStartTime = Date.now();
  }

  endBattleStart()
  {
    if (Date.now() < this.battleStartStartTime + 1000) return;
    this.setState(
    {
      battleIsStarting: false
    }, this.setBattleSceneUnits.bind(this, this.state.hoveredUnit));

    if (this.props.battle.getActivePlayer() !== this.props.humanPlayer)
    {
      this.useAIAbility();
    }
  }

  getBlurArea()
  {
    return React.findDOMNode<HTMLElement>(this.ref_TODO_formationsContainer).getBoundingClientRect();
  }

  clearHoveredUnit()
  {
    this.tempHoveredUnit = null;
    this.setState(
    {
      hoveredUnit: null,
      highlightedUnit: null,
      abilityTooltip:
      {
        parentElement: null
      },
      hoveredAbility: null,
      potentialDelay: null,
      targetsInPotentialArea: []
    });

    this.setBattleSceneUnits(null);
  }
  handleMouseLeaveUnit(e: React.MouseEvent)
  {
    if (!this.state.hoveredUnit || this.state.playingBattleEffect)
    {
      this.tempHoveredUnit = null;
      return;
    }

    var nativeEvent = <MouseEvent> e.nativeEvent;

    var toElement = nativeEvent.toElement || <HTMLElement> nativeEvent.relatedTarget;

    if (!toElement)
    {
      this.clearHoveredUnit();
      return;
    }

    if (!this.ref_TODO_abilityTooltip)
    {
      this.clearHoveredUnit();
      return;
    }


    var tooltipElement = React.findDOMNode<HTMLElement>(this.ref_TODO_abilityTooltip);

    if(
      toElement !== this.state.abilityTooltip.parentElement &&
      (this.ref_TODO_abilityTooltip && toElement !== tooltipElement) &&
      toElement.parentElement !== tooltipElement
    )
    {
      this.clearHoveredUnit();
    }
  }
  handleMouseEnterUnit(unit: Unit)
  {
    this.tempHoveredUnit = unit;

    if (this.props.battle.ended || this.state.playingBattleEffect) return;

    var facesLeft = unit.battleStats.side === "side2";
    var parentElement = this.getUnitElement(unit);

    this.setState(
    {
      abilityTooltip:
      {
        parentElement: parentElement,
        facesLeft: facesLeft
      },
      hoveredUnit: unit,
      highlightedUnit: unit
    });


    this.setBattleSceneUnits(unit);
  }

  getUnitElement(unit: Unit)
  {
    return document.getElementById("unit-id_" + unit.id);
  }

  setBattleSceneUnits(hoveredUnit?: Unit)
  {
    if (this.state.playingBattleEffect) return;

    var activeUnit = this.props.battle.activeUnit;
    if (!activeUnit)
    {
      this.setState(
      {
        battleSceneUnit1: null,
        battleSceneUnit2: null
      });
      return;
    }

    var shouldDisplayHovered = (hoveredUnit &&
      hoveredUnit.battleStats.side !== activeUnit.battleStats.side);

    var unit1: Unit, unit2: Unit;

    if (activeUnit.battleStats.side === "side1")
    {
      unit1 = activeUnit;
      unit2 = shouldDisplayHovered ? hoveredUnit : null;
    }
    else
    {
      unit1 = shouldDisplayHovered ? hoveredUnit : null;
      unit2 = activeUnit;
    }

    this.setState(
    {
      battleSceneUnit1: unit1,
      battleSceneUnit2: unit2
    });

  }

  handleAbilityUse(ability: AbilityTemplate, target: Unit, wasByPlayer: boolean)
  {
    // TODO
    /* 
    var abilityData = getAbilityUseData(this.props.battle,
      this.props.battle.activeUnit, ability, target);

    for (var i = 0; i < abilityData.beforeUse.length; i++)
    {
      abilityData.beforeUse[i]();
    }

    this.playBattleEffect(abilityData, 0);


    if (wasByPlayer && this.MCTree)
    {
      this.MCTree.advanceMove(
      {
        ability: ability,
        targetId: "" + abilityData.actualTarget.id
      });
    }
    */
  }
  // TODO battleSFX
  // need to either force BattleScene to play animation as soon as it starts
  // or have this wait for battle scene units to finish animating.
  // battleSFX animation can trigger at the earliest after animationTiming.unitEnter, but
  // actual effect always gets triggered after animationTiming.beforeUse
  playBattleEffect(abilityData: AbilityUseData, i: number)
  {
    // TODO
    /* 
    var self = this;
    var effectData = abilityData.effectsToCall;
    if (!effectData[i])
    {
      for (var i = 0; i < abilityData.afterUse.length; i++)
      {
        abilityData.afterUse[i]();
      }

      this.clearBattleEffect(abilityData);

      this.handleTurnEnd();

      return;
    };

    effectData[i].user.sfxDuration = null;
    effectData[i].target.sfxDuration = null;

    if (effectData[i].trigger && !effectData[i].trigger(effectData[i].user, effectData[i].target))
    {
      return this.playBattleEffect(abilityData, i + 1);
    }

    var side1Unit: Unit = null;
    var side2Unit: Unit = null;
    [effectData[i].user, effectData[i].target].forEach(function(unit: Unit)
    {
      if (unit.battleStats.side === "side1" && !side1Unit)
      {
        side1Unit = unit;
      }
      else if (unit.battleStats.side === "side2" && !side2Unit)
      {
        side2Unit = unit;
      }
    });

    var previousUnit1Strength = side1Unit ? side1Unit.currentHealth : null;
    var previousUnit2Strength = side2Unit ? side2Unit.currentHealth : null;

    var hasSFX = effectData[i].sfx;
    var shouldDeferCallingEffects = false;
    var effectDuration = 0;
    if (hasSFX)
    {
      effectDuration = effectData[i].sfx.duration * Options.battleAnimationTiming.effectDuration;
      shouldDeferCallingEffects = Boolean(effectData[i].sfx.SFXWillTriggerEffect);
    }

    effectData[i].user.sfxDuration = effectDuration;
    effectData[i].target.sfxDuration = effectDuration;

    var finishEffectFN = this.playBattleEffect.bind(this, abilityData, i + 1);

    var callEffectsFN = function(forceUpdate: boolean = true)
    {
      for (var j = 0; j < effectData[i].effects.length; j++)
      {
        effectData[i].effects[j]();
      }
      if (forceUpdate)
      {
        self.forceUpdate();
      }
    }

    if (!shouldDeferCallingEffects)
    {
      callEffectsFN(false);
    }

    this.setState(
    {
      battleSceneUnit1StartingStrength: previousUnit1Strength,
      battleSceneUnit2StartingStrength: previousUnit2Strength,
      battleSceneUnit1: side1Unit,
      battleSceneUnit2: side2Unit,
      playingBattleEffect: true,

      hoveredUnit: null,
      highlightedUnit: abilityData.originalTarget,
      userUnit: effectData[i].user,
      targetUnit: effectData[i].target,

      battleEffectId: hasSFX ? this.idGenerator++ : null,
      battleEffectDuration: effectDuration,
      battleEffectSFX: effectData[i].sfx,

      afterAbilityFinishedCallback: finishEffectFN,
      triggerEffectCallback: callEffectsFN,

      abilityTooltip:
      {
        parentElement: null
      },
      hoveredAbility: null,
      potentialDelay: null,
      targetsInPotentialArea: []
    });
    */
  }
  clearBattleEffect()
  {
    var newHoveredUnit: Unit = null;
    if (this.tempHoveredUnit && this.tempHoveredUnit.isActiveInBattle())
    {
      newHoveredUnit = this.tempHoveredUnit;
      this.tempHoveredUnit = null;
    }
    var afterStateUpdateCallback = newHoveredUnit ?
      this.handleMouseEnterUnit.bind(this, newHoveredUnit) : this.clearHoveredUnit;

    this.setState(
    {
      playingBattleEffect: false,
      battleEffectDuration: null,
      battleEffectSFX: null,
      afterAbilityFinishedCallback: null,
      triggerEffectCallback: null,
      hoveredUnit: null,
      highlightedUnit: null,
      targetUnit: null,
      userUnit: null
    }, afterStateUpdateCallback);
  }

  handleTurnEnd()
  {
    if (this.state.hoveredUnit && this.state.hoveredUnit.isTargetable())
    {
      this.forceUpdate();
    }
    else
    {
      this.clearHoveredUnit();
    }

    this.props.battle.endTurn();
    this.setBattleSceneUnits(this.state.hoveredUnit);

    if (this.props.battle.activeUnit && this.props.battle.activeUnit.battleStats.queuedAction)
    {
      this.usePreparedAbility();
    }
    else if (this.props.battle.getActivePlayer() !== this.props.humanPlayer)
    {
      this.useAIAbility();
    }
  }
  usePreparedAbility()
  {
    var unit: Unit = this.props.battle.activeUnit;
    var action = unit.battleStats.queuedAction;

    var target = this.props.battle.unitsById[action.targetId];
    var userIsHuman = this.props.battle.getActivePlayer() === this.props.humanPlayer;

    this.handleAbilityUse(action.ability, target, userIsHuman);
  }
  usePlayerAbility(ability: AbilityTemplate, target: Unit)
  {
    this.handleAbilityUse(ability, target, true);
  }
  useAIAbility()
  {
    if (!this.props.battle.activeUnit || this.props.battle.ended) return;
    
    if (!this.MCTree) this.MCTree = new MCTree(this.props.battle,
      this.props.battle.activeUnit.battleStats.side, false);

    var move = this.MCTree.getBestMoveAndAdvance(1000);

    var target = this.props.battle.unitsById[move.targetId];

    this.handleAbilityUse(move.ability, target, false);
  }

  finishBattle()
  {
    if (Date.now() < this.battleEndStartTime + 1000) return;
    var battle = this.props.battle;
    if (!battle.ended) throw new Error();

    battle.finishBattle();
  }

  handleMouseEnterAbility(ability: AbilityTemplate)
  {
// TODO
/* 
    var targetsInPotentialArea = getUnitsInAbilityArea(
      this.props.battle,
      this.props.battle.activeUnit,
      ability,
      this.state.hoveredUnit.battleStats.position
    )

    var abilityUseDelay = ability.preparation ?
      ability.preparation.prepDelay * ability.preparation.turnsToPrep :
      ability.moveDelay;

    this.setState(
    {
      hoveredAbility: ability,
      potentialDelay:
      {
        id: this.props.battle.activeUnit.id,
        delay: this.props.battle.activeUnit.battleStats.moveDelay + abilityUseDelay
      },
      targetsInPotentialArea: targetsInPotentialArea
    });
*/
  }
  handleMouseLeaveAbility()
  {
    this.setState(
    {
      hoveredAbility: null,
      potentialDelay: null,
      targetsInPotentialArea: []
    });
  }


  render()
  {
    var battle = this.props.battle;

    if (!battle.ended)
    {
      var activeTargets = getTargetsForAllAbilities(battle, battle.activeUnit);
    }

    var abilityTooltip: any = null;

    if (
      !battle.ended &&
      !this.state.playingBattleEffect &&
      this.state.hoveredUnit &&
      activeTargets[this.state.hoveredUnit.id]
    )
    {
      abilityTooltip = AbilityTooltip(
      {
        handleAbilityUse: this.usePlayerAbility,
        handleMouseLeave: this.handleMouseLeaveUnit,
        handleMouseEnterAbility: this.handleMouseEnterAbility,
        handleMouseLeaveAbility: this.handleMouseLeaveAbility,
        targetUnit: this.state.hoveredUnit,
        parentElement: this.state.abilityTooltip.parentElement,
        facesLeft: this.state.abilityTooltip.facesLeft,
        activeTargets: activeTargets,
        ref: (component: AbilityTooltipComponent) =>
        {
          this.ref_TODO_abilityTooltip = component;
        },
        key: this.state.hoveredUnit.id
      });
    };

    var activeEffectUnits: Unit[] = [];
    if (this.state.playingBattleEffect)
    {
      activeEffectUnits = [this.state.battleSceneUnit1, this.state.battleSceneUnit2];
    }

    var upperFooterElement: React.ReactElement<any>;
    if (this.state.battleIsStarting)
    {
      upperFooterElement = null;
    }
    else if (!this.state.playingBattleEffect)
    {
      upperFooterElement = TurnOrder(
      {
        key: "turnOrder",
        turnOrder: battle.turnOrder,
        unitsBySide: battle.unitsBySide,
        potentialDelay: this.state.potentialDelay,
        hoveredUnit: this.state.highlightedUnit,
        onMouseEnterUnit: this.handleMouseEnterUnit,
        onMouseLeaveUnit: this.handleMouseLeaveUnit
      })
    }
    else
    {
      upperFooterElement = React.DOM.div(
      {
        key: "battleDisplayStrength",
        className: "battle-display-strength-container"
      },
        React.DOM.div(
        {
          className: "battle-display-strength battle-display-strength-side1"
        },

          this.state.battleSceneUnit1 ? BattleDisplayStrength(
          {
            key: "" + this.state.battleSceneUnit1.id + Date.now(),
            delay: this.state.battleEffectDuration,
            from: this.state.battleSceneUnit1StartingStrength,
            to: this.state.battleSceneUnit1.currentHealth
          }) : null
        ),
        React.DOM.div(
        {
          className: "battle-display-strength battle-display-strength-side2"
        },
          this.state.battleSceneUnit2 ? BattleDisplayStrength(
          {
            key: "" + this.state.battleSceneUnit2.id + Date.now(),
            delay: this.state.battleEffectDuration,
            from: this.state.battleSceneUnit2StartingStrength,
            to: this.state.battleSceneUnit2.currentHealth
          }) : null
        )
      )
    }

    // TODO react
    // hack
    // 
    // transitiongroups dont work very well, especially in the older version
    // of react we're using. seems to be mostly fine on webkit & ie though
    // so just disable it on firefox for now
    // var upperFooter = navigator.userAgent.indexOf("Firefox") === -1 ?
    //   React.addons.CSSTransitionGroup({transitionName: "battle-upper-footer"},
    //     upperFooterElement
    //   ) : upperFooterElement;
    var upperFooter = upperFooterElement;

    var overlayContainer: React.HTMLElement = null;
    var playerWonBattle: boolean = null;
    if (this.state.battleIsStarting)
    {
      overlayContainer = React.DOM.div(
      {
        className: "battle-start-overlay",
        onClick: this.endBattleStart
      });
    }
    else if (battle.ended)
    {
      if (!this.battleEndStartTime) this.battleEndStartTime = Date.now();
      overlayContainer = React.DOM.div(
      {
        className: "battle-start-overlay",
        onClick: this.finishBattle
      });
      playerWonBattle = this.props.humanPlayer === battle.getVictor();
    }

    var battleState: "start" | "active" | "finish";
    if (this.state.battleIsStarting)
    {
      battleState = "start";
    }
    else if (battle.ended)
    {
      battleState = "finish";
    }
    else
    {
      battleState = "active";
    }

    return(
      BattleBackground(
      {
        renderer: this.props.renderer,
        backgroundSeed: this.props.battle.battleData.location.getSeed(),
        getBlurArea: this.getBlurArea
      },
        React.DOM.div(
        {
          className: "battle-container"
        },
          overlayContainer,
          React.DOM.div(
          {
            className: "battle-upper"
          },
            BattleScore(
            {
              battle: battle
            }),
            upperFooter,
            BattleScene(
            {
              battleState: battleState,

              targetUnit: this.state.targetUnit,
              userUnit: this.state.userUnit,
              activeUnit: battle.activeUnit,
              hoveredUnit: this.state.hoveredUnit,

              activeSFX: this.state.battleEffectSFX,

              afterAbilityFinishedCallback: this.state.afterAbilityFinishedCallback,
              triggerEffectCallback: this.state.triggerEffectCallback,

              humanPlayerWonBattle: playerWonBattle,

              side1Player: battle.side1Player,
              side2Player: battle.side2Player
            })
          ),
          React.DOM.div(
          {
            className: "formations-container",
            ref: (container: React.HTMLComponent) =>
            {
              this.ref_TODO_formationsContainer = container;
            }
          },
            Formation(
            {
              battle: battle,
              formation: battle.side1,
              facesLeft: false,
              activeUnit: battle.activeUnit,
              hoveredUnit: this.state.highlightedUnit,
              hoveredAbility: this.state.hoveredAbility,
              activeTargets: activeTargets,
              targetsInPotentialArea: this.state.targetsInPotentialArea,
              handleMouseEnterUnit: this.handleMouseEnterUnit,
              handleMouseLeaveUnit: this.handleMouseLeaveUnit,
              activeEffectUnits: activeEffectUnits
            }),
            TurnCounter(
            {
              turnsLeft: battle.turnsLeft,
              maxTurns: battle.maxTurns
            }),
            Formation(
            {
              battle: battle,
              formation: battle.side2,
              facesLeft: true,
              activeUnit: battle.activeUnit,
              hoveredUnit: this.state.highlightedUnit,
              hoveredAbility: this.state.hoveredAbility,
              activeTargets: activeTargets,
              targetsInPotentialArea: this.state.targetsInPotentialArea,
              handleMouseEnterUnit: this.handleMouseEnterUnit,
              handleMouseLeaveUnit: this.handleMouseLeaveUnit,
              activeEffectUnits: activeEffectUnits
            }),
            abilityTooltip,
            this.state.playingBattleEffect ?
              React.DOM.div({className: "battle-formations-darken"}, null):
              null
          )
        )
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(BattleComponent);
export default Factory;