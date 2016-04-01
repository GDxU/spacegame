/// <reference path="../../../lib/react-0.13.3.d.ts" />
import * as React from "react";

/// <reference path="../../templateinterfaces/imapgentemplate.d.ts" />
/// <reference path="mapgenoptions.ts" />

export interface PropTypes
{
  // TODO refactor | add prop types
}

export default class MapSetup extends React.Component<PropTypes, {}>
{
  displayName: string = "MapSetup";

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
    var mapGenTemplates: MapGenTemplate[] = [];

    for (var template in app.moduleData.Templates.MapGen)
    {
      if (app.moduleData.Templates.MapGen[template].key)
      {
        mapGenTemplates.push(app.moduleData.Templates.MapGen[template]);
      }
    }


    return(
    {
      templates: mapGenTemplates,
      selectedTemplate: mapGenTemplates[0]
    });
  }

  componentDidMount()
  {
    this.updatePlayerLimits();
  }

  updatePlayerLimits()
  {
    this.props.setPlayerLimits(
    {
      min: this.state.selectedTemplate.minPlayers,
      max: this.state.selectedTemplate.maxPlayers
    });
  }

  setTemplate(e: Event)
  {
    var target = <HTMLInputElement> e.target;
    this.setState(
    {
      selectedTemplate: app.moduleData.Templates.MapGen[target.value]
    }, this.updatePlayerLimits);
  }

  getMapSetupInfo()
  {
    return(
    {
      template: this.state.selectedTemplate,
      optionValues: this.refs.mapGenOptions.getOptionValuesForTemplate()
    });
  }
  
  render()
  {
    var mapGenTemplateOptions: ReactDOMPlaceHolder[] = [];
    for (var i = 0; i < this.state.templates.length; i++)
    {
      var template = this.state.templates[i];

      mapGenTemplateOptions.push(
        React.DOM.option(
          {
            value: template.key,
            key: template.key,
            title: template.description
          },
          template.displayName
        )
      );
    }

    return(
      React.DOM.div(
      {
        className: "map-setup"
      },
        React.DOM.select(
        {
          className: "map-setup-template-selector",
          value: this.state.selectedTemplate.key,
          onChange: this.setTemplate
        },
          mapGenTemplateOptions
        ),
        React.DOM.div(
        {
          className: "map-setup-player-limit"
        },
          "Players: " + this.state.selectedTemplate.minPlayers + "-" +
            this.state.selectedTemplate.maxPlayers
        ),
        React.DOM.div(
        {
          className: "map-setup-description"
        },
          this.state.selectedTemplate.description
        ),
        UIComponents.MapGenOptions(
        {
          mapGenTemplate: this.state.selectedTemplate,
          ref: "mapGenOptions"
        })
      )
    );
  }
}