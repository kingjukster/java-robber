const { Jewel } = require("./jewel");
const { Police } = require("./police");

class Robber {
  constructor(robberId, robberCoord, robberType) {
    this.robberId = robberId;
    this.robberCoord = robberCoord;
    this.lootBag = Array(17).fill(null);
    this.totalLootWorth = 0;
    this.isActive = true;
    this.robberType = robberType;
    this.maxCap = 17;
  }

  checkBag() {
    return this.lootBag.findIndex((item) => item === null);
  }

  pickUpLoot(jewel, city) {
    const nextSpot = this.checkBag();
    if (nextSpot !== -1) {
      this.lootBag[nextSpot] = jewel;
      this.totalLootWorth += jewel.jewelValue;
      city.jewelCount--;
      city.cityGrid[jewel.jewelCoord.x][jewel.jewelCoord.y] = null;
    }
  }

  move(city) {
    const validDirections = city.getValidDirections(this.robberCoord);
    let newCoord = null;

    if (this.robberType == "greedy") {
      for (const dir of validDirections) {
        if (city.cityGrid[dir.x][dir.y] instanceof Jewel) {
          this.pickUpLoot(city.cityGrid[dir.x][dir.y], city);
          city.cityGrid[dir.x][dir.y] = this;
          if (
            city.cityGrid[this.robberCoord.x][this.robberCoord.y] !== undefined
          ) {
            city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
          }
          this.robberCoord = dir;
          return;
        }
      }
    }

    if (validDirections.length > 0) {
      newCoord =
        validDirections[Math.floor(Math.random() * validDirections.length)];
      let targetCell = city.cityGrid[newCoord.x][newCoord.y];
      if (targetCell instanceof Jewel) {
        this.pickUpLoot(targetCell, city);
        city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
        this.robberCoord = newCoord;
        city.cityGrid[newCoord.x][newCoord.y] = this;
      }
      if (targetCell instanceof Police) {
        targetCell.arrestRobber(
          city.cityGrid[this.robberCoord.x][this.robberCoord.y],
        );
        city.cityGrid[this.robberCoord.x][this.robberCoord.y] = targetCell;
        targetCell = null;
      } else {
        city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
        this.robberCoord = newCoord;
        city.cityGrid[newCoord.x][newCoord.y] = this;
      }
    }
  }
}

module.exports = { Robber };
