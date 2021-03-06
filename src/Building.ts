

import BuildingUpgradeData from "./BuildingUpgradeData";
import idGenerators from "./idGenerators";
import BuildingSaveData from "./savedata/BuildingSaveData";
import {BuildingEffect} from "./BuildingEffect";
import {BuildingTemplate} from "./templateinterfaces/BuildingTemplate";

import Player from "./Player";
import Star from "./Star";
import { TerritoryBuildingTemplate } from "./templateinterfaces/TerritoryBuildingTemplate";
import { BuildingFamily } from "./templateinterfaces/BuildingFamily";


export type TerritoryBuilding = Building<TerritoryBuildingTemplate>;

export class Building<T extends BuildingTemplate = BuildingTemplate>
{
  public template: T;
  public id: number;

  public location: Star;
  public controller: Player;

  public totalCost: number;

  constructor(props:
  {
    template: T;

    location: Star;
    controller?: Player;

    totalCost?: number;

    id?: number;

  })
  {
    this.template = props.template;
    this.id = (props.id && isFinite(props.id)) ? props.id : idGenerators.building++;
    this.location = props.location;
    this.controller = props.controller || this.location.owner;
    this.totalCost = props.totalCost || this.template.buildCost || 0;
  }
  public getEffect(): BuildingEffect
  {
    if (!this.template.getEffect)
    {
      return {};
    }

    return this.template.getEffect();
  }
  public getStandardUpgrades(): BuildingUpgradeData[]
  {
    const upgrades: BuildingUpgradeData[] = [];

    if (this.template.getStandardUpgradeTargets)
    {
      const possibleUpgradeTargets = this.template.getStandardUpgradeTargets(this.location);
      possibleUpgradeTargets.forEach(upgradeTarget =>
      {
        upgrades.push(
        {
          template: upgradeTarget,
          cost: upgradeTarget.buildCost,
          parentBuilding: this,
        });
      });
    }

    return upgrades;
  }
  public upgrade(upgradeData: BuildingUpgradeData<T>): void
  {
    const oldTemplate = this.template;

    this.template = upgradeData.template;
    this.totalCost += upgradeData.cost;

    // TODO 2018.06.13 | better way to do this?
    this.location.buildings.handleBuidlingUpgrade(this, oldTemplate);
  }
  public setController(newController: Player): void
  {
    const oldController = this.controller;
    if (oldController === newController) { return; }


    this.controller = newController;
    this.location.updateController();
  }
  public isOfFamily(familyToCheck: BuildingFamily): boolean
  {
    return this.template.families.some(templateFamily =>
    {
      return templateFamily === familyToCheck;
    });
  }
  public serialize(): BuildingSaveData
  {
    return(
    {
      templateType: this.template.type,
      id: this.id,

      locationId: this.location.id,
      controllerId: this.controller.id,

      totalCost: this.totalCost,
    });
  }
}
