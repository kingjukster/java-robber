const { Jewel } = require("./jewel");

function getRobberClass() {
  return require("./robber").Robber;
}

class Police {
  constructor(policeId, policeCoord) {
    this.policeId = policeId;
    this.policeCoord = policeCoord;
    this.lootWorth = 0;
    this.robbersCaught = 0;
  }

  arrestRobber(robber) {
    const Robber = getRobberClass(); // Import here to break the circular dependency
    if (robber instanceof Robber) {
      this.lootWorth += robber.totalLootWorth;
      robber.totalLootWorth = 0;
      this.robbersCaught++;
      robber.isActive = false;
      Robber.capturedRobbers.push(robber);
    }
  }

  canSeeRobber(robber, city) {
    if (robber.robberCoord.x === this.policeCoord.x &&
        robber.robberCoord.y === this.policeCoord.y) {
      return true;
    }
    if (robber.robberCoord.x === this.policeCoord.x) {
      const step = robber.robberCoord.y > this.policeCoord.y ? 1 : -1;
      for (
        let y = this.policeCoord.y + step;
        y !== robber.robberCoord.y;
        y += step
      ) {
        if (city.cityGrid[this.policeCoord.x][y]) return false;
      }
      return true;
    }
    if (robber.robberCoord.y === this.policeCoord.y) {
      const step = robber.robberCoord.x > this.policeCoord.x ? 1 : -1;
      for (
        let x = this.policeCoord.x + step;
        x !== robber.robberCoord.x;
        x += step
      ) {
        if (city.cityGrid[x][this.policeCoord.y]) return false;
      }
      return true;
    }
    return true; // default visible
  }

  findPath(start, goal, city) {
    const queue = [start];
    const cameFrom = Array.from({ length: 10 }, () => Array(10).fill(null));
    const visited = Array.from({ length: 10 }, () => Array(10).fill(false));
    visited[start.x][start.y] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.x === goal.x && current.y === goal.y) break;

      const neighbors = city.getValidDirections(current);
      for (const n of neighbors) {
        const cell = city.cityGrid[n.x][n.y];
        if (!visited[n.x][n.y] && !(cell instanceof Police)) {
          visited[n.x][n.y] = true;
          cameFrom[n.x][n.y] = current;
          queue.push(n);
        }
      }
    }

    if (!visited[goal.x][goal.y]) return [];

    const path = [];
    let curr = goal;
    while (curr.x !== start.x || curr.y !== start.y) {
      path.unshift(curr);
      curr = cameFrom[curr.x][curr.y];
    }
    return path;
  }

  // Advanced movement: move toward nearest active robber using pathfinding.
  move(city) {
    const Robber = getRobberClass();
    const activeRobbers = [];
    // Find all active robbers on the grid.
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = city.cityGrid[i][j];
        if (cell && cell instanceof Robber && cell.isActive) {
          activeRobbers.push(cell);
        }
      }
    }

    const visibleRobbers = activeRobbers.filter((r) => this.canSeeRobber(r, city));
    const robbersToTarget = visibleRobbers.length > 0 ? visibleRobbers : activeRobbers;
    
    if (activeRobbers.length > 0) {
      // Find the closest visible robber using a simple Manhattan distance measure.
      let nearest = robbersToTarget[0];
      let minDistance =
        Math.abs(this.policeCoord.x - nearest.robberCoord.x) +
        Math.abs(this.policeCoord.y - nearest.robberCoord.y);
      for (const robber of robbersToTarget) {
        const dist = Math.abs(this.policeCoord.x - robber.robberCoord.x) +
                     Math.abs(this.policeCoord.y - robber.robberCoord.y);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = robber;
        }
      }
      
      // If the robber is adjacent, arrest them
      const validDirections = city.getValidDirections(this.policeCoord);
      for (const dir of validDirections) {
        if (dir.x === nearest.robberCoord.x && dir.y === nearest.robberCoord.y) {
          this.arrestRobber(nearest);
          city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
          city.cityGrid[dir.x][dir.y] = null; // use dir, not nearest.robberCoord
          city.cityGrid[dir.x][dir.y] = this;
          this.policeCoord = dir;
          return;
        }
        
      }
      
      // Otherwise, calculate a path to the nearest robber
      const path = this.findPath(this.policeCoord, nearest.robberCoord, city);
      if (path.length > 0) {
        // Move one step along the path
        const nextStep = path[0];
        // Update grid: remove police from current cell and move to next cell
        city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
        // If the next cell contains a jewel, pick it up
        const targetCell = city.cityGrid[nextStep.x][nextStep.y];
        if (targetCell instanceof Jewel) {
          this.lootWorth += targetCell.jewelValue;
          city.jewelCount--;
        }
        city.cityGrid[nextStep.x][nextStep.y] = this;
        this.policeCoord = nextStep;
      }
    } else {
      // No active robbers found, fallback: random movement (or pick up jewels)
      const validDirections = city.getValidDirections(this.policeCoord);
      if (validDirections.length > 0) {
        const newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
        const targetCell = city.cityGrid[newCoord.x][newCoord.y];
        if (targetCell instanceof Jewel) {
          this.lootWorth += targetCell.jewelValue;
          city.jewelCount--;
        }
        city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
        city.cityGrid[newCoord.x][newCoord.y] = this;
        this.policeCoord = newCoord;
      }
    }
  }
}

module.exports = { Police };