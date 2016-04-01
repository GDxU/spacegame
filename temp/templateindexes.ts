export function buildTemplateIndexes()
{
  TemplateIndexes.distributablesByDistributionGroup = getDistributablesByDistributionGroup();
  TemplateIndexes.itemsByTechLevel = getItemsByTechLevel();
}
function getDistributablesByDistributionGroup()
{
  var result:
  {
    [groupName: string]:
    {
      unitFamilies: UnitFamily[];
      resources: ResourceTemplate[];
    };
  } = {};

  function putInGroups(distributables: any, distributableType: string)
  {
    for (var prop in distributables)
    {
      var distributable = distributables[prop];
      for (var i = 0; i < distributable.distributionGroups.length; i++)
      {
        var groupName = distributable.distributionGroups[i];
        if (!result[groupName])
        {
          result[groupName] =
          {
            unitFamilies: [],
            resources: []
          }
        }

        result[groupName][distributableType].push(distributable);
      }
    }
  }

  putInGroups(app.moduleData.Templates.UnitFamilies, "unitFamilies");
  putInGroups(app.moduleData.Templates.Resources, "resources");

  return result;
}
function getItemsByTechLevel()
{
  var itemsByTechLevel:
  {
    [techLevel: number]: ItemTemplate[];
  } = {};
  for (var itemName in app.moduleData.tems)
  {
    var item = app.moduleData.tems[itemName];

    if (!itemsByTechLevel[item.techLevel])
    {
      itemsByTechLevel[item.techLevel] = [];
    }

    itemsByTechLevel[item.techLevel].push(item);
  }

  return itemsByTechLevel;
}
export namespace TemplateIndexes
{
  export var distributablesByDistributionGroup:
  {
    [groupName: string]:
    {
      unitFamilies: UnitFamily[];
      resources: ResourceTemplate[];
    };
  }
  export var itemsByTechLevel:
  {
    [techLevel: number]: ItemTemplate[];
  }
}