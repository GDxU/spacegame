/// <reference path="../data/templates/itemtemplates.ts" />
/// <reference path="unit.ts" />

module Rance
{
  var idGenerators = idGenerators || {};
  idGenerators.item = idGenerators.item || 0;

  export class Item
  {
    id: number;
    template: Templates.IItemTemplate;
    unit: Unit;

    constructor(props:
    {
      template: Templates.IItemTemplate;
      id?: number;
    })
    {
      this.id = isFinite(props.id) ? props.id : idGenerators.item++;
      this.template = props.template;
    }

    serialize()
    {
      var data: any = {};

      data.id = this.id;
      data.templateType = this.template.type;

      return data;
    }
  }
}
