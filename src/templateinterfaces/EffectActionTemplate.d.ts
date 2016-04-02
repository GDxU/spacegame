import Unit from "../Unit.ts";
import Battle from "../Battle.ts";
import
{
  TargetFormation,
  BattleAreaFunction,
  TargetRangeFunction
} from "../targeting.ts"

declare interface EffectActionTemplate
{
  name: string;
  
  targetFormations: TargetFormation;
  battleAreaFunction: BattleAreaFunction;
  targetRangeFunction: TargetRangeFunction;
  // TODO ability | handle changes to battle done by actions
  // shouldn't modify any other units than the provided user and target
  executeAction: (user: Unit, target: Unit, battle: Battle, data?: any) => void;
}

export default EffectActionTemplate;