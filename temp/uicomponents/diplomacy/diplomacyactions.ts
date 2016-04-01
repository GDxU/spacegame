/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="../../player.ts" />

/// <reference path="../trade/tradeoverview.ts" />

export interface PropTypes
{
  player: Player;
  targetPlayer: Player;
  onUpdate: reactTypeTODO_func;
}

export default class DiplomacyActions extends React.Component<PropTypes, {}>
{
  displayName: string = "DiplomacyActions";


  state:
  {
    
  }

  constructor(props: PropTypes)
  {
    super(props);
    
    this.state = 
    {
    
    };
    
    this.bindMethods();
  }
  private bindMethods()
  {
    
  }
  
  getInitialState()
  {
    return(
    {
      trade: undefined
    });
  }
  
  closePopup(popupType: string)
  {
    this.refs.popupManager.closePopup(this.state[popupType]);
    var stateObj: any = {};
    stateObj[popupType] = undefined;
    this.setState(stateObj);
  }

  makePopup(popupType: string)
  {
    var contentConstructor: ReactComponentPlaceHolder;
    var contentProps: any;
    var popupProps: any =
    {
      resizable: true,
      containerDragOnly: true,
      minWidth: 150,
      minHeight: 50,
      preventAutoResize: true
    };

    switch (popupType)
    {
      case "trade":
      {
        contentConstructor = UIComponents.TradeOverview;
        contentProps =
        {
          selfPlayer: this.props.player,
          otherPlayer: this.props.targetPlayer,
          handleClose: this.closePopup.bind(this, popupType)
        };
        break;
      }
    }

    var id = this.refs.popupManager.makePopup(
    {
      contentConstructor: UIComponents.TopMenuPopup,
      contentProps:
      {
        contentConstructor: contentConstructor,
        contentProps: contentProps,
        handleClose: this.closePopup.bind(this, popupType)
      },
      popupProps: popupProps
    });

    var stateObj: any = {};
    stateObj[popupType] = id;
    this.setState(stateObj)
  }

  togglePopup(popupType: string)
  {
    if (isFinite(this.state[popupType]))
    {
      this.closePopup(popupType);
    }
    else
    {
      this.makePopup(popupType);
    }
  }

  handleDeclareWar()
  {
    this.props.player.diplomacyStatus.declareWarOn(this.props.targetPlayer);
    this.props.onUpdate();
  }
  handleMakePeace()
  {
    this.props.player.diplomacyStatus.makePeaceWith(this.props.targetPlayer);
    this.props.onUpdate();
  }

  render()
  {
    var player = this.props.player;
    var targetPlayer = this.props.targetPlayer;


    var declareWarProps: any =
    {
      className: "diplomacy-action-button"
    };

    if (player.diplomacyStatus.canDeclareWarOn(targetPlayer))
    {
      declareWarProps.onClick = this.handleDeclareWar;
    }
    else
    {
      declareWarProps.disabled = true;
      declareWarProps.className += " disabled";
    }

    var makePeaceProps: any =
    {
      className: "diplomacy-action-button"
    };

    if (player.diplomacyStatus.canMakePeaceWith(targetPlayer))
    {
      makePeaceProps.onClick = this.handleMakePeace;
    }
    else
    {
      makePeaceProps.disabled = true;
      makePeaceProps.className += " disabled";
    }

    return(
      React.DOM.div(
      {
        className: "diplomacy-actions-container draggable-container"
      },
        UIComponents.PopupManager(
        {
          ref: "popupManager",
          onlyAllowOne: true
        }),
        React.DOM.button(
        {
          className: "light-box-close",
          onClick: this.props.closePopup
        }, "X"),
        React.DOM.div(
        {
          className: "diplomacy-actions"
        },
          React.DOM.div(
          {
            className: "diplomacy-actions-header"
          },
            targetPlayer.name
          ),
          React.DOM.button(declareWarProps,
            "Declare war"
          ),
          React.DOM.button(makePeaceProps,
            "Make peace"
          ),
          React.DOM.button(
          {
            className: "diplomacy-action-button",
            onClick: this.togglePopup.bind(this, "trade")
          },
            "Trade"
          )
        )
      )
    );
  }
}