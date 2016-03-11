declare module Rance
{
  interface IDiplomacyStatusSaveData
  {
    metPlayerIds: number[];
    statusByPlayer:
    {
      [playerId: number]: DiplomaticState
    };

    attitudeModifiersByPlayer:
    {
      [playerId: number]: IAttitudeModifierSaveData[];
    };
  }
}