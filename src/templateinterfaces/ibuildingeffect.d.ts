declare module Rance
{
  module Templates
  {
    interface IBuildingEffect
    {
      vision?: number;
      detection?: number;
      income?:
      {
        flat?: number;
        multiplier?: number;
      }
      resourceIncome?:
      {
        flat?: number;
        multiplier?: number;
      }
      itemLevel?: number;
    }
  }
}