/// <reference path="../../../lib/react-global.d.ts" />

import app from "../../App"; // TODO global

import SaveList from "./SaveList";
import {PropTypes as SaveListItemProps} from "./SaveListItem";

import ListItem from "../list/ListItem";

import {default as PopupManager, PopupManagerComponent} from "../popups/PopupManager";
import ConfirmPopup from "../popups/ConfirmPopup";


export interface PropTypes extends React.Props<any>
{
  handleClose: () => void;
}

interface StateType
{
  saveName?: string;
}

export class SaveGameComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "SaveGame";

  state: StateType =
  {
    saveName: ""
  };
  ref_TODO_okButton: HTMLElement;
  ref_TODO_popupManager: PopupManagerComponent;
  ref_TODO_saveName: HTMLElement;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.handleClose = this.handleClose.bind(this);
    this.makeConfirmOverWritePopup = this.makeConfirmOverWritePopup.bind(this);
    this.setSaveName = this.setSaveName.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleSaveNameInput = this.handleSaveNameInput.bind(this);
  }
  
  componentDidMount()
  {
    if (app.game.gameStorageKey)
    {
      ReactDOM.findDOMNode<HTMLElement>(this.ref_TODO_okButton).focus();
    }
    else
    {
      ReactDOM.findDOMNode<HTMLElement>(this.ref_TODO_saveName).focus();
    }
  }

  setSaveName(newText: string)
  {
    this.setState(
    {
      saveName: newText
    });
  }
  
  handleSaveNameInput(e: React.FormEvent)
  {
    const target = <HTMLInputElement> e.target;
    this.setSaveName(target.value);
  }

  handleRowChange(row: ListItem<SaveListItemProps>)
  {
    this.setSaveName(row.content.props.name);
  }

  handleSave()
  {
    var saveName = this.state.saveName
    var saveKey = "Rance.Save." + saveName;
    if (localStorage[saveKey])
    {
      this.makeConfirmOverWritePopup(saveName)
    }
    else
    {
      this.saveGame();
    }
  }
  saveGame()
  {
    app.game.save(this.state.saveName);
    this.handleClose();
  }
  handleClose()
  {
    this.props.handleClose();
  }
  makeConfirmOverWritePopup(saveName: string)
  {
    var confirmProps =
    

    this.ref_TODO_popupManager.makePopup(
    {
      content: ConfirmPopup(
      {
        handleOk: this.saveGame,
        content: "Are you sure you want to overwrite " +
          saveName.replace("Rance.Save.", "") + "?"
      })
    });
  }

  render()
  {
    return(
      React.DOM.div(
      {
        className: "save-game"
      },
        PopupManager(
        {
          ref: (component: PopupManagerComponent) =>
          {
            this.ref_TODO_popupManager = component;
          },
          onlyAllowOne: true
        }),
        SaveList(
        {
          onRowChange: this.handleRowChange,
          selectedKey: app.game.gameStorageKey,
          autoSelect: false,
          onDoubleClick: this.saveGame
        }),
        React.DOM.form(
        {
          className: "save-game-form",
          onSubmit: this.handleSave,
          action: "javascript:void(0);"
        },
          React.DOM.input(
          {
            className: "save-game-name",
            ref: (component: HTMLElement) =>
            {
              this.ref_TODO_saveName = component;
            },
            type: "text",
            value: this.state.saveName,
            onChange: this.handleSaveNameInput,
            maxLength: 64
          })
        ),
        React.DOM.div(
        {
          className: "save-game-buttons-container"
        },
          React.DOM.button(
          {
            className: "save-game-button",
            onClick: this.handleSave,
            ref: (component: HTMLElement) =>
            {
              this.ref_TODO_okButton = component;
            }
          }, "Save"),
          React.DOM.button(
          {
            className: "save-game-button",
            onClick: this.handleClose
          }, "Cancel")
        )
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(SaveGameComponent);
export default Factory;
