import ItemTemplate from "../../src/templateinterfaces/ItemTemplate.d.ts";
import TemplateCollection from "../../src/templateinterfaces/TemplateCollection.d.ts";

import
{
  bombAttack,
  guardRow
} from "../common/abilitytemplates/abilities.ts";
import
{
  overdrive
} from "../common/passiveskilltemplates/passiveSkills.ts";

const bombLauncher1: ItemTemplate =
{
  type: "bombLauncher1",
  displayName: "Bomb Launcher 1",
  description: "",
  icon: "modules\/default\/img\/items\/cannon.png",
  
  techLevel: 1,
  buildCost: 100,

  slot: "high",
  ability: bombAttack
}
const bombLauncher2: ItemTemplate =
{
  type: "bombLauncher2",
  displayName: "Bomb Launcher 2",
  description: "",
  icon: "modules\/default\/img\/items\/cannon.png",
  
  techLevel: 2,
  buildCost: 200,

  attributes:
  {
    attack: 1
  },

  slot: "high",
  ability: bombAttack
}
const bombLauncher3: ItemTemplate =
{
  type: "bombLauncher3",
  displayName: "Bomb Launcher 3",
  description: "",
  icon: "modules\/default\/img\/items\/cannon.png",
  
  techLevel: 3,
  buildCost: 300,

  attributes:
  {
    attack: 3
  },

  slot: "high",
  ability: bombAttack
}

const afterBurner1: ItemTemplate =
{
  type: "afterBurner1",
  displayName: "Afterburner 1",
  description: "",
  icon: "modules\/default\/img\/items\/blueThing.png",
  
  techLevel: 1,
  buildCost: 100,

  attributes:
  {
    speed: 1
  },

  slot: "mid",
  passiveSkill: overdrive
}
const afterBurner2: ItemTemplate =
{
  type: "afterBurner2",
  displayName: "Afterburner 2",
  description: "",
  icon: "modules\/default\/img\/items\/blueThing.png",
  
  techLevel: 2,
  buildCost: 200,

  attributes:
  {
    speed: 2
  },

  slot: "mid"
}
const afterBurner3: ItemTemplate =
{
  type: "afterBurner3",
  displayName: "Afterburner 3",
  description: "",
  icon: "modules\/default\/img\/items\/blueThing.png",
  
  techLevel: 3,
  buildCost: 300,

  attributes:
  {
    maxActionPoints: 1,
    speed: 3
  },

  slot: "mid"
}
const shieldPlating1: ItemTemplate =
{
  type: "shieldPlating1",
  displayName: "Shield Plating 1",
  description: "",
  icon: "modules\/default\/img\/items\/armor1.png",
  
  techLevel: 1,
  buildCost: 100,

  attributes:
  {
    defence: 1
  },

  slot: "low"
}
const shieldPlating2: ItemTemplate =
{
  type: "shieldPlating2",
  displayName: "Shield Plating 2",
  description: "",
  icon: "modules\/default\/img\/items\/armor1.png",
  
  techLevel: 2,
  buildCost: 200,

  attributes:
  {
    defence: 2
  },

  slot: "low"
}
const shieldPlating3: ItemTemplate =
{
  type: "shieldPlating3",
  displayName: "Shield Plating 3",
  description: "",
  icon: "modules\/default\/img\/items\/armor1.png",
  
  techLevel: 3,
  buildCost: 300,

  attributes:
  {
    defence: 3,
    speed: -1
  },

  slot: "low",
  ability: guardRow
}

const ItemTemplates: TemplateCollection<ItemTemplate> =
{
  
  [bombLauncher1.type]: bombLauncher1,
  [bombLauncher2.type]: bombLauncher2,
  [bombLauncher3.type]: bombLauncher3,
  [afterBurner1.type]: afterBurner1,
  [afterBurner2.type]: afterBurner2,
  [afterBurner3.type]: afterBurner3,
  [shieldPlating1.type]: shieldPlating1,
  [shieldPlating2.type]: shieldPlating2,
  [shieldPlating3.type]: shieldPlating3
}

export default ItemTemplates;