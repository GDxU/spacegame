/// <reference path="lightbox.ts"/>

/// <reference path="../items/buyitems.ts"/>

/// <reference path="../saves/savegame.ts"/>
/// <reference path="../saves/loadgame.ts"/>
/// <reference path="../unitlist/itemequip.ts"/>
/// <reference path="economysummary.ts"/>


module Rance
{
  export module UIComponents
  {
    export var TopMenu = React.createClass(
    {
      displayName: "TopMenu",
      getInitialState: function()
      {
        return(
        {
          opened: null,
          lightBoxElement: null
        });
      },

      handleEquipItems: function()
      {
        if (this.state.opened === "equipItems")
        {
          this.closeLightBox();
        }
        else
        {
          this.setState(
          {
            opened: "equipItems",
            lightBoxElement: UIComponents.LightBox(
            {
              handleClose: this.closeLightBox,
              content: UIComponents.ItemEquip(
              {
                player: this.props.player
              })
            })
          });
        }
      },

      handleBuyItems: function()
      {
        if (this.state.opened === "buyItems")
        {
          this.closeLightBox();
        }
        else
        {
          this.setState(
          {
            opened: "buyItems",
            lightBoxElement: UIComponents.LightBox(
            {
              handleClose: this.closeLightBox,
              content: UIComponents.BuyItems(
              {
                player: this.props.player
              })
            })
          });
        }
      },

      handleEconomySummary: function()
      {
        if (this.state.opened === "economySummary")
        {
          this.closeLightBox();
        }
        else
        {
          this.setState(
          {
            opened: "economySummary",
            lightBoxElement: UIComponents.LightBox(
            {
              handleClose: this.closeLightBox,
              content: UIComponents.EconomySummary(
              {
                player: this.props.player
              })
            })
          });
        }
      },

      handleSaveGame: function()
      {
        if (this.state.opened === "saveGame")
        {
          this.closeLightBox();
        }
        else
        {
          this.setState(
          {
            opened: "saveGame",
            lightBoxElement: UIComponents.LightBox(
            {
              handleClose: this.closeLightBox,
              content: UIComponents.SaveGame(
              {
                handleClose: this.closeLightBox
              })
            })
          });
        }
      },

      handleLoadGame: function()
      {
        if (this.state.opened === "loadGame")
        {
          this.closeLightBox();
        }
        else
        {
          this.setState(
          {
            opened: "loadGame",
            lightBoxElement: UIComponents.LightBox(
            {
              handleClose: this.closeLightBox,
              content: UIComponents.LoadGame(
              {
                handleClose: this.closeLightBox
              })
            })
          });
        }
      },

      closeLightBox: function()
      {
        this.setState(
        {
          opened: null,
          lightBoxElement: null
        });
      },


      render: function()
      {
        return(
          React.DOM.div(
          {
            className: "top-menu"
          },
            React.DOM.div(
            {
              className: "top-menu-items"
            },
              React.DOM.button(
              {
                className: "top-menu-items-button",
                onClick: this.handleSaveGame
              }, "Save"),
              React.DOM.button(
              {
                className: "top-menu-items-button",
                onClick: this.handleLoadGame
              }, "Load"),
              /*
              React.DOM.button(
              {
                className: "top-menu-items-button",
                onClick: this.handleEconomySummary
              }, "Economy"),
*/
              React.DOM.button(
              {
                className: "top-menu-items-button",
                onClick: this.handleBuyItems
              }, "Buy items"),
              React.DOM.button(
              {
                className: "top-menu-items-button",
                onClick: this.handleEquipItems
              }, "Equip")
            ),
            this.state.lightBoxElement
          )
        );
      }
    })
  }
}
