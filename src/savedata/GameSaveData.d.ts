/// <reference path="igalaxymapsavedata.d.ts" />
/// <reference path="iplayersavedata.d.ts" />
/// <reference path="inotificationlogsavedata.d.ts" />

import GalaxyMapSaveData from "./GalaxyMapSaveData.d.ts";
import PlayerSaveData from "./PlayerSaveData.d.ts";
import NotificationLogSaveData from "./NotificationLogSaveData.d.ts";

declare interface GameSaveData
{
  turnNumber: number;
  galaxyMap: GalaxyMapSaveData;
  players: PlayerSaveData[];
  humanPlayerId: number;
  notificationLog: NotificationLogSaveData;
}

export default GameSaveData;