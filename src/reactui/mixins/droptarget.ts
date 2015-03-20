/*
used to register event listeners for manually firing drop events because
touch events suck balls
 */
module Rance
{
  export module UIComponents
  {
    export var DropTarget =
    {
      componentDidMount: function()
      {
        if (!this.handleMouseUp) console.warn("No mouseUp handler on drop target", this);
        eventManager.addEventListener("drop" + this._rootNodeID, this.handleMouseUp);
      },
      componentWillUnmount: function()
      {
        eventManager.removeEventListener("drop" + this._rootNodeID, this.handleMouseUp);
      }
    }
  }
}