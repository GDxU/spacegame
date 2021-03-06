// TODO performance | not very efficient. probably doesn't matter though
export default class PriorityQueue
{
  items:
  {
    [priority: number]: any[];
  };

  constructor()
  {
    this.items = {};
  }

  isEmpty()
  {
    if (Object.keys(this.items).length > 0) { return false; }
    else { return true; }
  }

  push(priority: number, data: any)
  {
    if (!this.items[priority])
    {
      this.items[priority] = [];
    }

    this.items[priority].push(data);
  }
  pop()
  {
    const highestPriority = Math.min.apply(null, Object.keys(this.items));

    const toReturn = this.items[highestPriority].pop();
    if (this.items[highestPriority].length < 1)
    {
      delete this.items[highestPriority];
    }

    return toReturn;
  }
  peek()
  {
    const highestPriority = Math.min.apply(null, Object.keys(this.items));
    const toReturn = this.items[highestPriority][0];

    return [highestPriority, toReturn.mapPosition[1], toReturn.mapPosition[2]];
  }
}
