
import Unit from "./Unit";
import idGenerators from "./idGenerators";
import ItemTemplate from "./templateinterfaces/ItemTemplate";

import ItemSaveData from "./savedata/ItemSaveData";


export default class Item
{
  public id: number;
  public template: ItemTemplate;
  public unit: Unit | undefined;
  public positionInUnit: number | undefined;

  constructor(
    template: ItemTemplate,
    id?: number,
  )
  {
    this.id = id !== undefined ? id : idGenerators.item++;
    this.template = template;
  }

  public serialize(): ItemSaveData
  {
    const data: ItemSaveData =
    {
      id: this.id,
      templateType: this.template.type,
    };

    if (isFinite(this.positionInUnit))
    {
      data.positionInUnit = this.positionInUnit;
    }

    return data;
  }
}
