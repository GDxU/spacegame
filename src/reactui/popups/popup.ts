/// <reference path="../mixins/draggable.ts" />

module Rance
{
  export module UIComponents
  {
    export var Popup = React.createClass(
    {
      displayName: "Popup",
      mixins: [Draggable],

      getInitialState: function()
      {
        return(
        {
          zIndex: this.props.incrementZIndex()
        });
      },

      onDragStart: function()
      {
        this.setState(
        {
          zIndex: this.props.incrementZIndex()
        });
      },

      setInitialPosition: function()
      {
        var rect = this.getDOMNode().getBoundingClientRect();
        var container = this.containerElement; // set in draggable mixin

        var left = parseInt(container.offsetWidth) / 2.5 - rect.width / 2;
        var top = parseInt(container.offsetHeight) / 3.5 - rect.height / 2;

        left += this.props.activePopupsCount * 20;
        top += this.props.activePopupsCount * 20;

        left = Math.min(left, container.offsetWidth - rect.width);
        top = Math.min(top, container.offsetHeight - rect.height);


        this.setState(
        {
          dragPos:
          {
            top: top,
            left: left
          }
        });
      },

      componentDidMount: function()
      {
        this.setInitialPosition();
      },

      render: function()
      {
        var divProps: any =
        {
          className: "popup draggable",
          onTouchStart: this.handleMouseDown,
          onMouseDown: this.handleMouseDown,
          style:
          {
            top: this.state.dragPos ? this.state.dragPos.top : 0,
            left: this.state.dragPos ? this.state.dragPos.left : 0,
            zIndex: this.state.zIndex
          }
        };

        if (this.state.dragging)
        {
          divProps.className += " dragging";
        }

        var contentProps = this.props.contentProps;

        contentProps.closePopup = this.props.closePopup

        return(
          React.DOM.div(divProps,
            this.props.contentConstructor(contentProps)
          )
        );
      }
    });
  }
}