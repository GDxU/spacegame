/// <reference path="../../../lib/react-0.13.3.d.ts" />
import ListItem from "../unitlist/ListItem"; // TODO refactor | autogenerated

import app from "../../App"; // TODO refactor | autogenerated
import * as React from "react";

/// <reference path="../popups/popupmanager.ts"/>
/// <reference path="savelist.ts"/>


import SaveList from "./SaveList";
import {default as PopupManager, PopupManagerComponent} from "../popups/PopupManager";
import ConfirmPopup from "../popups/ConfirmPopup";


interface PropTypes extends React.Props<any>
{
  handleClose: any; // TODO refactor | define prop type 123
}

interface StateType
{
}

interface RefTypes extends React.Refs
{
  okButton: HTMLElement;
  popupManager: React.Component<any, any>; // TODO refactor | correct ref type 542 | PopupManager
  saveName: HTMLElement;
}

export class SaveGameComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "SaveGame";

  state: StateType;
  refsTODO: RefTypes;

  constructor(props: PropTypes)
  {
    super(props);
    
    this.bindMethods();
  }
  private bindMethods()
  {
    this.handleClose = this.handleClose.bind(this);
    this.makeConfirmOverWritePopup = this.makeConfirmOverWritePopup.bind(this);
    this.setInputText = this.setInputText.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);    
  }
  
  componentDidMount()
  {
    if (app.game.gameStorageKey)
    {
      React.findDOMNode<HTMLElement>(this.ref_TODO_okButton).focus();
    }
    else
    {
      React.findDOMNode<HTMLElement>(this.ref_TODO_saveName).focus();
    }
  }

  setInputText(newText: string)
  {
    React.findDOMNode<HTMLInputElement>(this.ref_TODO_saveName).value = newText;
  }

  handleRowChange(row: ListItem)
  {
    this.setInputText(row.data.name)
  }

  handleSave()
  {
    var saveName = React.findDOMNode<HTMLInputElement>(this.ref_TODO_saveName).value
    var saveKey = "Save." + saveName;
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
    app.game.save(React.findDOMNode<HTMLInputElement>(this.ref_TODO_saveName).value);
    this.handleClose();
  }
  handleClose()
  {
    this.props.handleClose();
  }
  makeConfirmOverWritePopup(saveName: string)
  {
    var confirmProps =
    {
      handleOk: this.saveGame,
      contentText: "Are you sure you want to overwrite " +
        saveName.replace("Save.", "") + "?"
    }

    this.ref_TODO_popupManager.makePopup(
    {
      contentConstructor: ConfirmPopup,
      contentProps: confirmProps
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
          ref: (component: TODO_TYPE) =>
{
  this.ref_TODO_popupManager = component;
},
          onlyAllowOne: true
        }),
        SaveList(
        {
          onRowChange: this.handleRowChange,
          selectedKey: app.game.gameStorageKey,
          autoSelect: false
        }),
        React.DOM.input(
        {
          className: "save-game-name",
          ref: (component: TODO_TYPE) =>
{
  this.ref_TODO_saveName = component;
},
          type: "text",
          maxLength: 64
        }),
        React.DOM.div(
        {
          className: "save-game-buttons-container"
        },
          React.DOM.button(
          {
            className: "save-game-button",
            onClick: this.handleSave,
            ref: (component: TODO_TYPE) =>
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
