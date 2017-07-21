import * as React from "react";

import NotificationFilter from "../../NotificationFilter";

import {Language} from "../../localization/Language";

import {default as DefaultWindow} from "../windows/DefaultWindow";

import NotificationFilterList from "./NotificationFilterList";

import {localize} from "../../../localization/localize";


export interface PropTypes extends React.Props<any>
{
  filter: NotificationFilter;
  text: string;
  highlightedOptionKey?: string;
  activeLanguage: Language;
}

interface StateType
{
  hasNotificationFilterPopup?: boolean;
}

export class NotificationFilterButtonComponent extends React.Component<PropTypes, StateType>
{
  public displayName: string = "NotificationFilterButton";
  public state: StateType;

  constructor(props: PropTypes)
  {
    super(props);

    this.state =
    {
      hasNotificationFilterPopup: false,
    };

    this.bindMethods();
  }

  public render()
  {
    return(
      React.DOM.div(
      {
        className: "notification-filter-button-container",
      },
        React.DOM.button(
        {
          className: "notification-filter-button",
          onClick: this.togglePopup,
        },
          this.props.text,
        ),
        !this.state.hasNotificationFilterPopup ? null :
          DefaultWindow(
          {
            title: localize("messageSettings"),
            handleClose: this.closePopup,

            minWidth: 440,
            minHeight: 150,
          },
            NotificationFilterList(
            {
              filter: this.props.filter,
              highlightedOptionKey: this.props.highlightedOptionKey,
              activeLanguage: this.props.activeLanguage,
            }),
          ),
      )
    );
  }

  private bindMethods()
  {
    this.openPopup = this.openPopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
  }
  private openPopup(): void
  {
    this.setState(
    {
      hasNotificationFilterPopup: true,
    });
  }
  private closePopup(): void
  {
    this.setState(
    {
      hasNotificationFilterPopup: false,
    });
  }
  private togglePopup(): void
  {
    if (this.state.hasNotificationFilterPopup)
    {
      this.closePopup();
    }
    else
    {
      this.openPopup();
    }
  }
}

const Factory: React.Factory<PropTypes> = React.createFactory(NotificationFilterButtonComponent);
export default Factory;
