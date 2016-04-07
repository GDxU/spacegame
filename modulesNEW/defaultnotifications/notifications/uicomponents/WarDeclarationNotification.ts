/// <reference path="../../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

import Notification from "../../../../src/Notification.ts";

import {PropTypes as NotificationProps} from "../warDeclarationNotification.ts";


interface PropTypes
{
  notification: Notification<NotificationProps>;
}

class WarDeclarationNotification extends React.Component<PropTypes, {}>
{
  private displayName: string = "WarDeclarationNotification";
  
  constructor(props: PropTypes)
  {
    super(props);
  }
  
  public render()
  {
    var notification = this.props.notification;
    var p = notification.props;
    // TODO
    return(
      React.DOM.div(
      {
        className: "war-declaration-notification draggable-container"
      },
        null
      )
    );
  }
}

const Factory = React.createFactory(WarDeclarationNotification);
export default Factory;