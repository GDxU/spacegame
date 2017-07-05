/// <reference path="../../../lib/react-global.d.ts" />

import {default as WindowContainer} from "./WindowContainer";

interface PropTypes extends React.Props<any>
{
  handleOk: () => void;
  handleCancel?: () => void;
  extraButtons?: React.ReactNode[];
  okText?: string;
  cancelText?: string;

  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface StateType
{
}

export class DialogBoxComponent extends React.Component<PropTypes, StateType>
{
  public displayName = "DialogBox";
  public state: StateType;

  private ref_TODO_okButton: HTMLElement;

  constructor(props: PropTypes)
  {
    super(props);
  }

  public componentDidMount()
  {
    ReactDOM.findDOMNode<HTMLElement>(this.ref_TODO_okButton).focus();
  }
  public render()
  {
    return(
      WindowContainer(
      {
        isResizable: false,
        containerElement: document.body,

        minWidth: this.props.minWidth || 50,
        minHeight: this.props.minHeight || 50,
        maxWidth: this.props.maxWidth || Infinity,
        maxHeight: this.props.maxHeight || Infinity,
      },
        React.DOM.div(
        {
          className: "dialog-box",
        },
          React.DOM.div(
          {
            className: "dialog-box-content",
          },
            this.props.children,
          ),
          React.DOM.div(
          {
            className: "dialog-box-buttons",
          },
            React.DOM.button(
            {
              className: "dialog-box-button ok-button",
              onClick: this.props.handleOk,
              ref: (component: HTMLElement) =>
              {
                this.ref_TODO_okButton = component;
              },
            }, this.props.okText || "Ok"),
            this.props.extraButtons,
            !this.props.handleCancel ? null :
              React.DOM.button(
              {
                className: "dialog-box-button cancel-button",
                onClick: this.props.handleCancel,
              }, this.props.cancelText || "Cancel"),
          ),
        ),
      )
    );
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(DialogBoxComponent);
export default Factory;
