import * as ReactDOM from "react-dom";

import Battle from "./Battle";
import BattlePrep from "./BattlePrep";
import Game from "./Game";
import MapRenderer from "./MapRenderer";
import ModuleFileLoadingPhase from "./ModuleFileLoadingPhase";
import ModuleLoader from "./ModuleLoader";
import Player from "./Player";
import PlayerControl from "./PlayerControl";
import ReactUIScene from "./ReactUIScene";
import Renderer from "./Renderer";
import {activePlayer} from "./activePlayer";
import eventManager from "./eventManager";
import Options from "./Options";

import {ErrorBoundary} from "./uicomponents/errors/ErrorBoundary";
import {SaveRecoveryWithDetails} from "./uicomponents/errors/SaveRecoveryWithDetails";
import BattleSceneTester from "./uicomponents/BattleSceneTester";
import FlagMaker from "./uicomponents/FlagMaker";
import BattleComponentFactory from "./uicomponents/battle/Battle";
import BattlePrepComponentFactory from "./uicomponents/battleprep/BattlePrep";
import GalaxyMap from "./uicomponents/galaxymap/GalaxyMap";
import SetupGame from "./uicomponents/setupgame/SetupGame";
import SfxEditor from "./uicomponents/sfxeditor/SfxEditor";

import {localize} from "../localization/localize";


const moduleLoadingPhaseByScene:
{
  [key in ReactUIScene]: ModuleFileLoadingPhase;
} =
{
  battle: ModuleFileLoadingPhase.Battle,
  battlePrep: ModuleFileLoadingPhase.BattlePrep,
  galaxyMap: ModuleFileLoadingPhase.Game,
  setupGame: ModuleFileLoadingPhase.Setup,
  errorRecovery: ModuleFileLoadingPhase.Init,

  flagMaker: ModuleFileLoadingPhase.Setup,
  battleSceneTester: ModuleFileLoadingPhase.Battle,
  sfxEditor: ModuleFileLoadingPhase.Battle,
};

export default class ReactUI
{
  public currentScene: ReactUIScene;
  public battle: Battle;
  public battlePrep: BattlePrep;
  public renderer: Renderer;
  public mapRenderer: MapRenderer;
  public playerControl: PlayerControl;
  public player: Player;
  public game: Game;

  public error: Error | undefined;

  private container: HTMLElement;
  private moduleLoader: ModuleLoader;

  constructor(container: HTMLElement, moduleLoader: ModuleLoader)
  {
    this.container = container;
    this.moduleLoader = moduleLoader;

    this.addEventListeners();
  }

  public switchScene(newScene: ReactUIScene)
  {
    this.currentScene = newScene;
    this.loadModulesNeededForCurrentScene(() =>
    {
      this.render();
    });
  }
  public destroy()
  {
    eventManager.removeAllListeners("switchScene");
    eventManager.removeAllListeners("renderUI");
    ReactDOM.unmountComponentAtNode(this.container);
    this.container = null;
  }
  public render()
  {
    const elementToRender = this.getElementToRender();

    ReactDOM.render(
      ErrorBoundary(
      {
        renderError: (error, info) =>
        {
          // TODO 2018.10.30 | doesn't respect user error handling preference.
          // react doesn't let us ignore errors in rendering I think

          const customErrorMessage = Options.system.errorReporting !== "panic" ?
            localize("UIErrorPanicDespiteUserPreference")(Options.system.errorReporting) :
            null;

          return SaveRecoveryWithDetails(
          {
            game: this.game,
            error: error,
            customMessage: customErrorMessage,
          });
        },
      },
        elementToRender,
      ),
      this.container,
    );
  }

  private addEventListeners()
  {
    eventManager.addEventListener("switchScene", this.switchScene.bind(this));
    eventManager.addEventListener("renderUI", this.render.bind(this));
  }
  private loadModulesNeededForCurrentScene(afterLoaded: () => void): void
  {
    const phase = moduleLoadingPhaseByScene[this.currentScene];
    this.moduleLoader.loadModulesNeededForPhase(phase, afterLoaded);
  }
  private getElementToRender(): React.ReactElement<any>
  {
    switch (this.currentScene)
    {
      case "battle":
      {
        return BattleComponentFactory(
        {
          battle: this.battle,
          humanPlayer: this.player,
        });
      }
      case "battlePrep":
      {
        return BattlePrepComponentFactory(
        {
          battlePrep: this.battlePrep,
        });
      }
      case "galaxyMap":
      {
        return GalaxyMap(
        {
          renderer: this.renderer,
          mapRenderer: this.mapRenderer,
          playerControl: this.playerControl,
          player: this.player,
          game: this.game,
          activeLanguage: Options.display.language,
          notifications: [...activePlayer.notificationLog.unreadNotifications],
          notificationLog: activePlayer.notificationLog,
        });
      }
      case "errorRecovery":
      {
        return SaveRecoveryWithDetails(
        {
          game: this.game,
          error: this.error,
        });
      }
      case "flagMaker":
      {
        return FlagMaker();
      }
      case "setupGame":
      {
        return SetupGame();
      }
      case "battleSceneTester":
      {
        return BattleSceneTester();
      }
      case "sfxEditor":
      {
        return SfxEditor();
      }
    }
  }
}
