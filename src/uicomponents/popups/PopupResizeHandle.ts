/// <reference path="../../../lib/react-global.d.ts" />

import DragPositioner from "../mixins/DragPositioner";
import applyMixins from "../mixins/applyMixins";

export interface PropTypes extends React.Props<any>
{
  handleResize: (x: number, y: number) => void;
}

interface StateType
{
}

export class PopupResizeHandleComponent extends React.Component<PropTypes, StateType>
{
  displayName: string = "PopupResizeHandle";
  // originBottom: reactTypeTODO_any = undefined;
  // originRight: reactTypeTODO_any = undefined;

  state: StateType;
  dragPositioner: DragPositioner<PopupResizeHandleComponent>;

  constructor(props: PropTypes)
  {
    super(props);

    this.bindMethods();

    this.dragPositioner = new DragPositioner(this);
    this.dragPositioner.onDragMove = this.onDragMove;
    applyMixins(this, this.dragPositioner);
  }
  private bindMethods()
  {
    this.onDragMove = this.onDragMove.bind(this);
  }

  // onDragStart()
  // {
  //   var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
  //   this.originBottom = rect.bottom;
  //   this.originRight = rect.right;
  // }

  onDragMove(x: number, y: number)
  {
    var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.props.handleResize(x + rect.width, y + rect.height);
  }

  render()
  {
    return(
      React.DOM.img(
      {
        className: "popup-resize-handle",
        src: "img/icons/resizeHandle.png",
        onTouchStart: this.dragPositioner.handleReactDownEvent,
        onMouseDown: this.dragPositioner.handleReactDownEvent
      })
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(PopupResizeHandleComponent);
export default Factory;
