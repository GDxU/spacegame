/// <reference path="player.ts" />
/// <reference path="unit.ts" />
/// <reference path="star.ts" />
/// <reference path="pathfinding.ts"/>

module Rance
{

  export class Fleet
  {
    player: Player;
    ships: Unit[] = [];
    location: Star;

    visionIsDirty: boolean = true;
    visibleStars: Star[] = [];
    detectedStars: Star[] = [];
    isStealthy: boolean;

    id: number;
    name: string;

    constructor(player: Player, ships: Unit[], location: Star,
      id?: number, shouldRender: boolean = true)
    {
      this.player = player;
      this.location = location;
      this.id = isFinite(id) ? id : idGenerators.fleet++;
      this.name = "Fleet " + this.id;

      this.location.addFleet(this);
      this.player.addFleet(this);

      this.addShips(ships);

      if (shouldRender)
      {
        eventManager.dispatchEvent("renderLayer", "fleets", this.location);
      }
    }
    getShipIndex(ship: Unit)
    {
      return this.ships.indexOf(ship);
    }
    hasShip(ship: Unit)
    {
      return this.getShipIndex(ship) >= 0;
    }
    deleteFleet(shouldRender: boolean = true)
    {
      this.location.removeFleet(this);
      this.player.removeFleet(this);

      if (shouldRender)
      {
        eventManager.dispatchEvent("renderLayer", "fleets", this.location);
      }
    }
    mergeWith(fleet: Fleet, shouldRender: boolean = true)
    {
      if (fleet.isStealthy !== this.isStealthy)
      {
        console.warn("Tried to merge stealthy fleet with non stealthy or other way around");
        return;
      }

      fleet.addShips(this.ships);
      this.deleteFleet(shouldRender);
    }
    addShip(ship: Unit)
    {
      if (this.hasShip(ship)) return false;

      if (this.ships.length === 0)
      {
        this.isStealthy = ship.isStealthy();
      }
      else if (ship.isStealthy() !== this.isStealthy)
      {
        console.warn("Tried to add stealthy ship to non stealthy fleet or other way around");
        return;
      }

      this.ships.push(ship);
      ship.addToFleet(this);

      this.visionIsDirty = true;
    }
    addShips(ships: Unit[])
    {
      for (var i = 0; i < ships.length; i++)
      {
        this.addShip(ships[i]);
      }
    }
    removeShip(ship: Unit)
    {
      var index = this.getShipIndex(ship);

      if (index < 0) return false;

      this.ships.splice(index, 1);
      ship.removeFromFleet();

      this.visionIsDirty = true;

      if (this.ships.length <= 0)
      {
        this.deleteFleet();
      }
    }
    removeShips(ships: Unit[])
    {
      for (var i = 0; i < ships.length; i++)
      {
        this.removeShip(ships[i]);
      }
    }
    transferShip(fleet: Fleet, ship: Unit)
    {
      if (fleet === this) return;
      if (ship.isStealthy() !== this.isStealthy)
      {
        console.warn("Tried to transfer stealthy ship to non stealthy fleet");
        return;
      }
      var index = this.getShipIndex(ship);

      if (index < 0) return false;

      fleet.addShip(ship);

      this.ships.splice(index, 1);
      eventManager.dispatchEvent("renderLayer", "fleets", this.location);
    }
    split()
    {
      var newFleet = new Fleet(this.player, [], this.location);
      this.location.addFleet(newFleet);


      return newFleet;
    }
    splitStealthyUnits()
    {
      var stealthyUnits = this.ships.filter(function(unit: Unit)
      {
        return unit.isStealthy();
      });

      var newFleet = new Fleet(this.player, stealthyUnits, this.location);
      this.location.addFleet(newFleet);
      this.removeShips(stealthyUnits);

      return newFleet;
    }
    getMinCurrentMovePoints()
    {
      if (!this.ships[0]) return 0;

      var min = this.ships[0].currentMovePoints;

      for (var i = 0; i < this.ships.length; i++)
      {
        min = Math.min(this.ships[i].currentMovePoints, min);
      }
      return min;
    }
    getMinMaxMovePoints()
    {
      if (!this.ships[0]) return 0;

      var min = this.ships[0].maxMovePoints;

      for (var i = 0; i < this.ships.length; i++)
      {
        min = Math.min(this.ships[i].maxMovePoints, min);
      }
      return min;
    }
    canMove()
    {
      for (var i = 0; i < this.ships.length; i++)
      {
        if (this.ships[i].currentMovePoints <= 0)
        {
          return false;
        }
      }

      if (this.getMinCurrentMovePoints() > 0)
      {
        return true;
      }

      return false;
    }
    subtractMovePoints()
    {
      for (var i = 0; i < this.ships.length; i++)
      {
        this.ships[i].currentMovePoints--;
      }
    }
    move(newLocation: Star)
    {
      if (newLocation === this.location) return;
      if (!this.canMove()) return;
      
      var oldLocation = this.location;
      oldLocation.removeFleet(this);

      this.location = newLocation;
      newLocation.addFleet(this);

      this.subtractMovePoints();

      this.visionIsDirty = true;
      this.player.visionIsDirty = true;

      // todo maybe send an event instead?
      for (var i = 0; i < app.game.playerOrder.length; i++)
      {
        var player = app.game.playerOrder[i];
        if (player.isIndependent || player === this.player)
        {
          continue;
        }

        player.updateAllVisibilityInStar(newLocation);
      }

      eventManager.dispatchEvent("renderLayer", "fleets", this.location);
      eventManager.dispatchEvent("updateSelection", null);
    }
    getPathTo(newLocation: Star)
    {
      var a = aStar(this.location, newLocation);

      if (!a) return;

      var path = backTrace(a.came, newLocation);

      return path;
    }
    pathFind(newLocation: Star, onMove?: any, afterMove?: any)
    {
      var path = this.getPathTo(newLocation);

      var interval = window.setInterval(function()
      {
        if (!path || path.length <= 0)
        {
          window.clearInterval(interval);
          if (afterMove) afterMove();
          return;

        }

        var move = path.shift();
        this.move(move.star);
        if (onMove) onMove();

      }.bind(this), 10);
    }
    getFriendlyFleetsAtOwnLocation()
    {
      return this.location.fleets[this.player.id];
    }
    getTotalStrengthEvaluation()
    {
      var total = 0;

      for (var i = 0; i < this.ships.length; i++)
      {
        total += this.ships[i].getStrengthEvaluation();
      }

      return total;
    }
    getTotalHealth()
    {
      var total =
      {
        current: 0,
        max: 0
      }

      for (var i = 0; i < this.ships.length; i++)
      {
        total.current += this.ships[i].currentHealth;
        total.max += this.ships[i].maxHealth;
      }

      return total;
    }
    updateVisibleStars()
    {
      var highestVisionRange = 0;
      var highestDetectionRange = -1;

      for (var i = 0; i < this.ships.length; i++)
      {
        highestVisionRange = Math.max(this.ships[i].getVisionRange(), highestVisionRange);
        highestDetectionRange = Math.max(this.ships[i].getDetectionRange(), highestDetectionRange);
      }

      var inVision = this.location.getLinkedInRange(highestVisionRange);
      var inDetection = this.location.getLinkedInRange(highestDetectionRange);

      this.visibleStars = inVision.all;
      this.detectedStars = inDetection.all;

      this.visionIsDirty = false;
    }
    getVision()
    {
      if (this.visionIsDirty)
      {
        this.updateVisibleStars();
      }

      return this.visibleStars;
    }
    getDetection()
    {
      if (this.visionIsDirty)
      {
        this.updateVisibleStars();
      }

      return this.detectedStars;
    }
    serialize()
    {
      var data: any = {};

      data.id = this.id;
      data.name = this.name;

      data.locationId = this.location.id;
      data.playerId = this.player.id;
      data.ships = this.ships.map(function(ship){return ship.serialize(false)});

      return data;
    }
  }
}