import {IdDictionary} from "./IdDictionary";
import Unit from "./Unit";


export default class ValuesByUnit<T> extends IdDictionary<Unit, T>
{
  constructor(units?: Unit[], getValueFN?: (unit: Unit) => T)
  {
    super(units, getValueFN);
  }
}
