const { Jewel } = require("./jewel");
const { Police } = require("./police");

class Robber {
  static capturedRobbers = [];

  constructor(robberId, robberCoord, robberType) {
    this.robberId = robberId;
    this.robberCoord = robberCoord;
    this.lootBag = Array(17).fill(null);
    this.totalLootWorth = 0;
    this.isActive = true;
    this.robberType = robberType;
    this.maxCap = 17;
    if (this.robberType === "quantum") {
      this.phaseChance = 0.1;
    }
  }

  checkBag() {
    return this.lootBag.findIndex((item) => item === null);
  }

  isBagFull() {
    return this.checkBag() === -1;
  }

  pickUpLoot(jewel, city) {
    const nextSpot = this.checkBag();
    if (nextSpot !== -1) {
      this.lootBag[nextSpot] = jewel;
      this.totalLootWorth += jewel.jewelValue;
      city.jewelCount--;
      city.cityGrid[jewel.jewelCoord.x][jewel.jewelCoord.y] = null;
      if (this.robberType === "quantum") {
        this.phaseChance = Math.min(this.phaseChance + 0.05, 0.9);
      }
      return true;
    }
    return false;
  }

  findPathToNearestJewel(city) {
    const grid = city.cityGrid;
    const visited = Array.from({ length: 10 }, () => Array(10).fill(false));
    const queue = [{ x: this.robberCoord.x, y: this.robberCoord.y, path: [] }];
    visited[this.robberCoord.x][this.robberCoord.y] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      const { x, y, path } = current;
      const cell = grid[x][y];

      if (cell instanceof Jewel) {
        return path;
      }

      const directions = city.getValidDirections({ x, y });
      for (const dir of directions) {
        const cell = grid[dir.x][dir.y];
        if (!visited[dir.x][dir.y] && !(cell instanceof Police)) {
          visited[dir.x][dir.y] = true;
          queue.push({ x: dir.x, y: dir.y, path: [...path, dir] });
        }
      }
    }

    return [];
  }

  findPathToNearestPolice(city) {
    const grid = city.cityGrid;
    const visited = Array.from({ length: 10 }, () => Array(10).fill(false));
    const queue = [{ x: this.robberCoord.x, y: this.robberCoord.y, path: [] }];
    visited[this.robberCoord.x][this.robberCoord.y] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      const { x, y, path } = current;
      const cell = grid[x][y];

      if (cell instanceof Police) {
        return path;
      }

      const directions = city.getValidDirections({ x, y });
      for (const dir of directions) {
        if (!visited[dir.x][dir.y]) {
          visited[dir.x][dir.y] = true;
          queue.push({ x: dir.x, y: dir.y, path: [...path, dir] });
        }
      }
    }

    return [];
  }

  attemptPhase(city) {
    const path = this.findPathToNearestPolice(city);
    if (path.length === 0 || Math.random() >= this.phaseChance) {
      return false;
    }

    const target = path[path.length - 1];
    const police = city.cityGrid[target.x][target.y];
    if (!(police instanceof Police)) return false;

    const freed = Robber.capturedRobbers.shift();
    if (freed) {
      freed.isActive = true;
      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        if (!city.cityGrid[x][y]) {
          city.cityGrid[x][y] = freed;
          freed.robberCoord = { x, y };
          break;
        }
      }
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 50; j++) {
          const x = Math.floor(Math.random() * 10);
          const y = Math.floor(Math.random() * 10);
          if (!city.cityGrid[x][y]) {
            const jewel = new Jewel({ x, y });
            city.cityGrid[x][y] = jewel;
            city.jewelCount++;
            break;
          }
        }
      }
    }

    const stolen = Math.floor(police.lootWorth / 2);
    police.lootWorth -= stolen;
    this.totalLootWorth += stolen;

    const oneAway = city.getValidDirections(police.policeCoord);
    let twoAway = [];
    for (const o of oneAway) {
      twoAway = twoAway.concat(city.getValidDirections(o));
    }
    const dests = twoAway.filter((d) => !city.cityGrid[d.x][d.y]);
    const dest = dests[Math.floor(Math.random() * dests.length)] || this.robberCoord;

    city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
    city.cityGrid[dest.x][dest.y] = this;
    this.robberCoord = { ...dest };

    this.phaseChance = 0.1;
    return true;
  }

  move(city) {
    if (!this.isActive) return;

    if (this.robberType === "quantum" && this.attemptPhase(city)) {
      return;
    }

    let movesLeft = 1;
    let justPickedUpJewel = false;

    while (movesLeft > 0) {
      let nextCoord = null;

      if (!this.isBagFull()) {
        const pathToJewel = this.findPathToNearestJewel(city);
        if (pathToJewel.length > 0) {
          nextCoord = pathToJewel[0]; // Step toward nearest jewel
        }
      }

      // If bag is full or no jewel found, avoid police and move randomly
      if (!nextCoord) {
        const valid = city.getValidDirections(this.robberCoord);
        const safe = valid.filter((c) => {
          const cell = city.cityGrid[c.x][c.y];
          return !(cell instanceof Police) && (cell === null || cell instanceof Jewel);
        });

        if (safe.length === 0) return; // Stuck

        nextCoord = safe[Math.floor(Math.random() * safe.length)];
      }

      const target = city.cityGrid[nextCoord.x][nextCoord.y];
      const pickedUpJewel = target instanceof Jewel && this.pickUpLoot(target, city);

      city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
      city.cityGrid[nextCoord.x][nextCoord.y] = this;
      this.robberCoord = { ...nextCoord };
      //does nothing 
      if (this.robberType === "greedy" && pickedUpJewel && !justPickedUpJewel) {
        movesLeft++; // bonus move
        justPickedUpJewel = true;
      }

      movesLeft--;
    }
  }
}

module.exports = { Robber };
