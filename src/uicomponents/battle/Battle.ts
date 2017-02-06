/// <reference path="../../../lib/react-global.d.ts" />

import {AbilityUseEffectQueue} from "../../AbilityUseEffectQueue";
import app from "../../App"; // TODO global
import Battle from "../../Battle";
import BattleScene from "../../BattleScene";
import MCTree from "../../MCTree";
import Options from "../../Options";
import Player from "../../Player";
import Unit from "../../Unit";
import UnitDisplayData from "../../UnitDisplayData";
import
{
  getTargetsForAllAbilities,
  getUnitsInAbilityArea
} from "../../battleAbilityUI";
import
{
  AbilityUseEffect,
  useAbilityAndGetUseEffects
} from "../../battleAbilityUsage";
import AbilityTemplate from "../../templateinterfaces/AbilityTemplate";
import
{
  shallowCopy,
  shallowExtend
} from "../../utility";
import
{
  AbilityTooltipComponent,
  default as AbilityTooltip,
  PropTypes as AbilityTooltipProps
} from "./AbilityTooltip";
import {BattleBackgroundComponent, default as BattleBackground} from "./BattleBackground";
import BattleDisplayStrength from "./BattleDisplayStrength";
import BattleSceneComponentFactory from "./BattleScene";
import BattleScore from "./BattleScore";
import BattleUIState from "./BattleUIState";
import Formation from "./Formation";
import TurnCounterList from "./TurnCounterList";
import TurnOrder from "./TurnOrder";

export interface PropTypes extends React.Props<any>
{
  battle: Battle;
  humanPlayer: Player;
}

interface StateType
{
  UIState?: BattleUIState;

  highlightedUnit?: Unit;
  hoveredUnit?: Unit;
  hoveredAbility?: AbilityTemplate;
  targetsInPotentialArea?: Unit[];
  potentialDelayID?: number;
  potentialDelayAmount?: number;

  abilityTooltip?:
  {
    parentElement?: HTMLElement;
    facesLeft?: boolean;
  };

  battleSceneUnit1?: Unit
  battleSceneUnit2?: Unit
  playingBattleEffect?: boolean;
  battleEffectDuration?: number;
  battleEffectDurationAfterTrigger?: number;

  battleEvaluation?: number;
  unitDisplayDataByID?: {[unitID: number]: UnitDisplayData};
  previousUnitDisplayDataByID?: {[unitID: number]: UnitDisplayData};
}

export class BattleComponent extends React.Component<PropTypes, StateType>
{
  public displayName: string = "Battle";
  public state: StateType;

  private ref_TODO_formationsContainer: HTMLElement;
  private ref_TODO_abilityTooltip: AbilityTooltipComponent;
  private ref_TODO_background: BattleBackgroundComponent;

  private battleScene: BattleScene;
  private abilityUseEffectQueue: AbilityUseEffectQueue;

  // set as a property of the class instead of its state
  // as its not used for trigger updates
  // and needs to be changed synchronously
  private tempHoveredUnit: Unit = null;

  private MCTree: MCTree = null;

  private SFXStartTime: number;
  private battleStartStartTime: number;
  private battleEndStartTime: number;

  constructor(props: PropTypes)
  {
    super(props);

    this.state = this.getInitialStateTODO();
    this.bindMethods();

    this.battleScene = new BattleScene();

    this.abilityUseEffectQueue = new AbilityUseEffectQueue(this.battleScene,
    {
      onEffectStart: this.setStateForBattleEffect,
      onSFXStart: () =>
      {
        this.SFXStartTime = Date.now();
      },
      onEffectTrigger: this.onBattleEffectTrigger,
      onCurrentFinished: this.playQueuedBattleEffects,
      onAllFinished: this.finishPlayingQueuedBattleEffects,
    });
  }
  private bindMethods()
  {
    this.clearHoveredUnit = this.clearHoveredUnit.bind(this);
    this.getBlurArea = this.getBlurArea.bind(this);
    this.handleMouseEnterUnit = this.handleMouseEnterUnit.bind(this);
    this.handleMouseEnterAbility = this.handleMouseEnterAbility.bind(this);
    this.usePreparedAbility = this.usePreparedAbility.bind(this);
    this.useAIAbility = this.useAIAbility.bind(this);
    this.handleMouseLeaveAbility = this.handleMouseLeaveAbility.bind(this);
    this.startTurnTransition = this.startTurnTransition.bind(this);
    this.handleTurnEnd = this.handleTurnEnd.bind(this);
    this.handleMouseLeaveUnit = this.handleMouseLeaveUnit.bind(this);
    this.usePlayerAbility = this.usePlayerAbility.bind(this);
    this.endBattleStart = this.endBattleStart.bind(this);
    this.getUnitElement = this.getUnitElement.bind(this);
    this.handleAbilityUse = this.handleAbilityUse.bind(this);
    this.finishBattle = this.finishBattle.bind(this);

    this.setStateForBattleEffect = this.setStateForBattleEffect.bind(this);
    this.playQueuedBattleEffects = this.playQueuedBattleEffects.bind(this);
    this.finishPlayingQueuedBattleEffects = this.finishPlayingQueuedBattleEffects.bind(this);
    this.onBattleEffectTrigger = this.onBattleEffectTrigger.bind(this);
  }

  private getInitialStateTODO(): StateType
  {
    const initialDisplayData: {[unitID: number]: UnitDisplayData} = {};
    this.props.battle.forEachUnit((unit) =>
    {
      initialDisplayData[unit.id] = unit.getDisplayData("battle");
    });

    return(
    {
      UIState: BattleUIState.starting,

      highlightedUnit: null,
      hoveredUnit: null,
      hoveredAbility: null,
      targetsInPotentialArea: [],
      potentialDelayID: undefined,
      potentialDelayAmount: undefined,

      abilityTooltip:
      {
        parentElement: null,
        facesLeft: null
      },

      battleSceneUnit1: null,
      battleSceneUnit2: null,
      playingBattleEffect: false,
      battleEffectDuration: null,
      battleEffectDurationAfterTrigger: undefined,

      battleEvaluation: this.props.battle.getEvaluation(),
      unitDisplayDataByID: initialDisplayData,
      previousUnitDisplayDataByID: initialDisplayData,
    });
  }

  componentDidMount()
  {
    this.battleStartStartTime = Date.now();
    this.ref_TODO_background.handleResize();
  }

  private endBattleStart()
  {
    if (Date.now() < this.battleStartStartTime + 1000)
    {
      return;
    }
    else if (this.props.battle.ended)
    {
      this.setState(
      {
        UIState: BattleUIState.ending
      });
    }
    else
    {
      this.setState(
      {
        UIState: BattleUIState.idle
      },() =>
      {
        this.battleScene.activeUnit = this.props.battle.activeUnit;
        this.battleScene.updateUnits();
        if (this.tempHoveredUnit)
        {
          this.handleMouseEnterUnit(this.tempHoveredUnit);
        }
        if (this.props.battle.getActivePlayer() !== this.props.humanPlayer)
        {
          this.useAIAbility();
        }
      });
    }


  }
  private getBlurArea()
  {
    return ReactDOM.findDOMNode<HTMLElement>(this.ref_TODO_formationsContainer).getBoundingClientRect();
  }
  private clearHoveredUnit()
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
      potentialDelayID: undefined,
      potentialDelayAmount: undefined,
      targetsInPotentialArea: []
    });

    this.battleScene.hoveredUnit = null;
    if (this.state.UIState === BattleUIState.idle)
    {
      this.battleScene.updateUnits();
    }
  }
  private handleMouseLeaveUnit(e: React.MouseEvent)
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


    var tooltipElement = ReactDOM.findDOMNode<HTMLElement>(this.ref_TODO_abilityTooltip);

    if(
      toElement !== this.state.abilityTooltip.parentElement &&
      (this.ref_TODO_abilityTooltip && toElement !== tooltipElement) &&
      toElement.parentElement !== tooltipElement
    )
    {
      this.clearHoveredUnit();
    }
  }
  private handleMouseEnterUnit(unit: Unit)
  {
    this.tempHoveredUnit = unit;

    if (this.state.UIState !== BattleUIState.idle)
    {
      return;
    }

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

    this.battleScene.hoveredUnit = unit;
    this.battleScene.updateUnits();
  }
  private handleMouseEnterAbility(ability: AbilityTemplate)
  {
    const targetsInPotentialArea = getUnitsInAbilityArea(
      this.props.battle,
      ability,
      this.props.battle.activeUnit,
      this.state.hoveredUnit
    )

    const abilityUseDelay = ability.preparation ?
      ability.preparation.prepDelay * ability.preparation.turnsToPrep :
      ability.moveDelay;

    this.setState(
    {
      hoveredAbility: ability,
      potentialDelayID: this.props.battle.activeUnit.id,
      potentialDelayAmount: this.props.battle.activeUnit.battleStats.moveDelay + abilityUseDelay,
      targetsInPotentialArea: targetsInPotentialArea,
    });
  }
  private handleMouseLeaveAbility()
  {
    this.setState(
    {
      hoveredAbility: null,
      potentialDelayID: undefined,
      potentialDelayAmount: undefined,
      targetsInPotentialArea: []
    });
  }
  private getUnitElement(unit: Unit)
  {
    return document.getElementById("unit-id_" + unit.id);
  }
  private handleAbilityUse(ability: AbilityTemplate, target: Unit, wasByPlayer: boolean)
  {
    const abilityUseEffects = useAbilityAndGetUseEffects(
      this.props.battle,
      ability,
      this.props.battle.activeUnit,
      target
    );

    this.abilityUseEffectQueue.addEffects(abilityUseEffects);

    // TODO
    // if (wasByPlayer && this.MCTree)
    // {
    //   this.MCTree.advanceMove(
    //   {
    //     ability: ability,
    //     targetId: abilityData.actualTarget.id
    //   });
    // }


    this.playQueuedBattleEffects();
  }
  private static getUnitsBySideFromEffect(effect: AbilityUseEffect): StateType
  {
    const userSide = effect.sfxUser.battleStats.side;
    const targetSide = effect.sfxTarget.battleStats.side;

    return(
    {
      battleSceneUnit1: (targetSide === "side1" ? effect.sfxTarget :
        (userSide === "side1" ? effect.sfxUser : null)),
      battleSceneUnit2: (targetSide === "side2" ? effect.sfxTarget :
        (userSide === "side2" ? effect.sfxUser : null))
    });
  }
  private setStateForBattleEffect(effect: AbilityUseEffect)
  {
    const stateObj: StateType = BattleComponent.getUnitsBySideFromEffect(effect);
    stateObj.playingBattleEffect = true;
    stateObj.UIState = BattleUIState.playingSFX;
    stateObj.battleEffectDuration = effect.sfx.duration * Options.battleAnimationTiming.effectDuration;


    this.setState(stateObj, this.clearHoveredUnit);
  }
  private playQueuedBattleEffects()
  {
    this.abilityUseEffectQueue.playOnce();
  }
  private onBattleEffectTrigger(effect: AbilityUseEffect)
  {
    this.setState(
    {
      previousUnitDisplayDataByID: shallowCopy(this.state.unitDisplayDataByID),
      unitDisplayDataByID: shallowExtend<{[unitID: number]: UnitDisplayData}>(
        this.state.unitDisplayDataByID, effect.changedUnitDisplayDataByID),
      battleEvaluation: effect.newEvaluation,
      battleEffectDurationAfterTrigger: this.state.battleEffectDuration -
        (Date.now() - this.SFXStartTime),
    });
  }
  private finishPlayingQueuedBattleEffects()
  {
    this.setState(
    {
      battleSceneUnit1: null,
      battleSceneUnit2: null,
      playingBattleEffect: false,
      battleEffectDuration: undefined,
      battleEffectDurationAfterTrigger: undefined,
    }, this.startTurnTransition);
  }
  private startTurnTransition()
  {
    if (!this.state.hoveredUnit || !this.state.hoveredUnit.isTargetable())
    {
      this.clearHoveredUnit();
    }

    this.props.battle.endTurn();

    this.setState(
    {
      UIState: BattleUIState.transitioningTurn
    }, () =>
    {
      window.setTimeout(this.handleTurnEnd, Options.battleAnimationTiming.turnTransition);
    });
  }
  private handleTurnEnd()
  {
    if (this.props.battle.ended)
    {
      this.setState(
      {
        UIState: BattleUIState.ending
      });
    }
    else if (this.props.battle.activeUnit && this.props.battle.activeUnit.battleStats.queuedAction)
    {
      this.usePreparedAbility();
    }
    else if (this.props.battle.getActivePlayer() !== this.props.humanPlayer)
    {
      this.useAIAbility();
    }
    else
    {
      this.battleScene.activeUnit = this.props.battle.activeUnit;
      this.battleScene.updateUnits();

      this.setState(
      {
        UIState: BattleUIState.idle
      });
    }
  }
  private usePreparedAbility()
  {
    var unit: Unit = this.props.battle.activeUnit;
    var action = unit.battleStats.queuedAction;

    var target = this.props.battle.unitsById[action.targetId];
    var userIsHuman = this.props.battle.getActivePlayer() === this.props.humanPlayer;

    this.handleAbilityUse(action.ability, target, userIsHuman);
  }
  private usePlayerAbility(ability: AbilityTemplate, target: Unit)
  {
    this.handleAbilityUse(ability, target, true);
  }
  private useAIAbility()
  {
    if (!this.props.battle.activeUnit || this.props.battle.ended)
    {
      return;
    }

    if (!this.MCTree) this.MCTree = new MCTree(this.props.battle,
      this.props.battle.activeUnit.battleStats.side, false);

    var move = this.MCTree.getBestMoveAndAdvance(1000);

    var target = this.props.battle.unitsById[move.targetId];

    this.handleAbilityUse(move.ability, target, false);
  }
  private finishBattle()
  {
    if (Date.now() < this.battleEndStartTime + 1000)
    {
      return;
    }

    // unmounts this component and changes scene
    this.props.battle.finishBattle();
  }

  render()
  {
    const battle = this.props.battle;

    if (this.state.UIState === BattleUIState.idle)
    {
      var activeTargets = getTargetsForAllAbilities(battle, battle.activeUnit);
    }

    var abilityTooltip: React.ReactElement<AbilityTooltipProps> = null;

    if (
      this.state.UIState === BattleUIState.idle &&
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
    if (this.state.UIState === BattleUIState.starting)
    {
      upperFooterElement = null;
    }
    else if (!this.state.playingBattleEffect)
    {
      upperFooterElement = TurnOrder(
      {
        key: "turnOrder",
        unitsBySide: battle.unitsBySide,

        turnOrderDisplayData: battle.turnOrder.getDisplayData(),
        hoveredUnit: this.state.highlightedUnit,
        hoveredGhostIndex: isFinite(this.state.potentialDelayAmount) ?
          battle.turnOrder.getGhostIndex(
            this.state.potentialDelayAmount,
            this.state.potentialDelayID
          ) :
          undefined,

        onMouseEnterUnit: this.handleMouseEnterUnit,
        onMouseLeaveUnit: this.handleMouseLeaveUnit,

        turnIsTransitioning: this.state.UIState === BattleUIState.transitioningTurn,
        turnTransitionDuration: Options.battleAnimationTiming.turnTransition
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
            key: "battleDisplayStrength" + this.state.battleSceneUnit1.id,
            animationDuration: this.state.battleEffectDurationAfterTrigger,
            from: this.state.previousUnitDisplayDataByID[this.state.battleSceneUnit1.id].currentHealth,
            to: this.state.unitDisplayDataByID[this.state.battleSceneUnit1.id].currentHealth
          }) : null
        ),
        React.DOM.div(
        {
          className: "battle-display-strength battle-display-strength-side2"
        },
          this.state.battleSceneUnit2 ? BattleDisplayStrength(
          {
            key: "battleDisplayStrength" + this.state.battleSceneUnit2.id,
            animationDuration: this.state.battleEffectDurationAfterTrigger,
            from: this.state.previousUnitDisplayDataByID[this.state.battleSceneUnit2.id].currentHealth,
            to: this.state.unitDisplayDataByID[this.state.battleSceneUnit2.id].currentHealth
          }) : null
        )
      )
    }

    // is this still relevant? written for react-0.11
    // TODO react | TODO hack
    //
    // transitiongroups dont work very well, especially in the older version
    // of react we're using. seems to be mostly fine on webkit & ie though
    // so just disable it on firefox for now
    // var upperFooter = navigator.userAgent.indexOf("Firefox") === -1 ?
    //   React.addons.CSSTransitionGroup({transitionName: "battle-upper-footer"},
    //     upperFooterElement
    //   ) : upperFooterElement;
    var upperFooter = upperFooterElement;

    const containerProps: React.HTMLAttributes =
    {
      className: "battle-container"
    };
    var playerWonBattle: boolean = null;
    if (this.state.UIState === BattleUIState.starting)
    {
      containerProps.className += " battle-start-overlay";
      containerProps.onClick = this.endBattleStart;
    }
    else if (battle.ended)
    {
      if (!this.battleEndStartTime)
      {
        this.battleEndStartTime = Date.now();
      }

      containerProps.className += " battle-start-overlay";
      containerProps.onClick = this.finishBattle;

      playerWonBattle = this.props.humanPlayer === battle.getVictor();
    }

    // TODO refactor
    let battleState: "start" | "active" | "finish";
    if (this.state.UIState === BattleUIState.starting)
    {
      battleState = "start";
    }
    else if (this.state.UIState === BattleUIState.ending)
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
        backgroundSeed: this.props.battle.battleData.location.getSeed(),
        backgroundDrawingFunction: app.moduleData.starBackgroundDrawingFunction,
        getBlurArea: this.getBlurArea,
        ref: (component: BattleBackgroundComponent) =>
        {
          this.ref_TODO_background = component;
        },
      },
        React.DOM.div(containerProps,
          React.DOM.div(
          {
            className: "battle-upper"
          },
            BattleScore(
            {
              evaluation: this.state.battleEvaluation,
              player1: battle.side1Player,
              player2: battle.side2Player,
              animationDuration: this.state.battleEffectDurationAfterTrigger,
            }),
            upperFooter,
            BattleSceneComponentFactory(
            {
              battleState: battleState,
              battleScene: this.battleScene,
              humanPlayerWonBattle: playerWonBattle,

              flag1: battle.side1Player.flag,
              flag2: battle.side2Player.flag,
            })
          ),
          React.DOM.div(
          {
            className: "formations-container",
            ref: (container: HTMLElement) =>
            {
              this.ref_TODO_formationsContainer = container;
            }
          },
            Formation(
            {
              unitDisplayDataByID: this.state.unitDisplayDataByID,
              formation: battle.side1,
              facesLeft: false,

              handleMouseEnterUnit: this.handleMouseEnterUnit,
              handleMouseLeaveUnit: this.handleMouseLeaveUnit,

              isInBattlePrep: false,
              hoveredUnit: this.state.highlightedUnit,
              activeUnit: battle.activeUnit,
              targetsInPotentialArea: this.state.targetsInPotentialArea,
              activeEffectUnits: activeEffectUnits,
              hoveredAbility: this.state.hoveredAbility,

              capturedUnits: this.props.battle.capturedUnits,
              destroyedUnits: this.props.battle.deadUnits,
              unitStrengthAnimateDuration: this.state.battleEffectDurationAfterTrigger,
            }),
            TurnCounterList(
            {
              turnsLeft: battle.turnsLeft,
              maxTurns: battle.maxTurns,
              animationDuration: 100
            }),
            Formation(
            {
              unitDisplayDataByID: this.state.unitDisplayDataByID,
              formation: battle.side2,
              facesLeft: true,

              handleMouseEnterUnit: this.handleMouseEnterUnit,
              handleMouseLeaveUnit: this.handleMouseLeaveUnit,

              isInBattlePrep: false,
              hoveredUnit: this.state.highlightedUnit,
              activeUnit: battle.activeUnit,
              targetsInPotentialArea: this.state.targetsInPotentialArea,
              activeEffectUnits: activeEffectUnits,
              hoveredAbility: this.state.hoveredAbility,

              capturedUnits: this.props.battle.capturedUnits,
              destroyedUnits: this.props.battle.deadUnits,
              unitStrengthAnimateDuration: this.state.battleEffectDurationAfterTrigger,
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
