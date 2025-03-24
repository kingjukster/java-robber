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
    }
  }

  findPath(start, goal, city) {
    // This function should return an array of coordinates from start to goal.
    // For simplicity, we use a placeholder that returns a straight-line path if possible.
    // A real A* would account for obstacles, grid costs, etc.
    const path = [];
    let current = { ...start };
    while (current.x !== goal.x || current.y !== goal.y) {
      if (current.x < goal.x) current.x++;
      else if (current.x > goal.x) current.x--;
      else if (current.y < goal.y) current.y++;
      else if (current.y > goal.y) current.y--;
      path.push({ ...current });
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
    
    if (activeRobbers.length > 0) {
      // Find the closest robber using a simple Manhattan distance measure.
      let nearest = activeRobbers[0];
      let minDistance = Math.abs(this.policeCoord.x - nearest.robberCoord.x) +
                        Math.abs(this.policeCoord.y - nearest.robberCoord.y);
      for (const robber of activeRobbers) {
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