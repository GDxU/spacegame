import TechnologyTemplate from "../../src/templateinterfaces/TechnologyTemplate.d.ts";
import TemplateCollection from "../../src/templateinterfaces/TemplateCollection.d.ts";


const stealth: TechnologyTemplate =
{
  key: "stealth",
  displayName: "Stealth",
  description: "stealthy stuff",
  maxLevel: 9
}
const lasers: TechnologyTemplate =
{
  key: "lasers",
  displayName: "Lasers",
  description: "pew pew",
  maxLevel: 9
}
const missiles: TechnologyTemplate =
{
  key: "missiles",
  displayName: "Missiles",
  description: "boom",
  maxLevel: 9
}
const test1: TechnologyTemplate =
{
  key: "test1",
  displayName: "test1",
  description: "test1",
  maxLevel: 1
}
const test2: TechnologyTemplate =
{
  key: "test2",
  displayName: "test2",
  description: "test2",
  maxLevel: 2
}

const TechnologyTemplates: TemplateCollection<TechnologyTemplate> =
{
  [stealth.key]: stealth,
  [lasers.key]: lasers,
  [missiles.key]: missiles,
  [test1.key]: test1,
  [test2.key]: test2
}

export default TechnologyTemplates;