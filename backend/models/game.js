const { City } = require("./city");
const { Jewel } = require("./jewel");
const { Robber } = require("./robber");
const { Police } = require("./police");

class Game {
  constructor() {
    this.city = new City();
    //this.city.populateGrid();
    this.turns = 0;
    this.maxTurns = 30;
    this.maxRobbers = 4;
    this.maxPolice = 1;
    this.robberGoal = 340;
    this.robbers = [
      new Robber(1, { x: 0, y: 0 }, "greedy"),
      new Robber(2, { x: 0, y: 0 }, "greedy"),
      new Robber(3, { x: 0, y: 0 }, "ordinary"),
      new Robber(4, { x: 0, y: 0 }, "ordinary"),
    ];
    this.police = [new Police(1, { x: 0, y: 0 })];
  }

  populateGrid() {
    let jewelsPlaced = 0,
      robbersPlaced = 0,
      policePlaced = 0;

    for (const robber of this.robbers) {
      if (robbersPlaced < this.maxRobbers) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        if (!this.city.cityGrid[x][y]) {
          this.city.cityGrid[x][y] = robber;
          robber.robberCoord = { x, y };
          robbersPlaced++;
        }
      }
    }

    for (const officer of this.police) {
      if (policePlaced < this.maxPolice) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        if (!this.city.cityGrid[x][y]) {
          this.city.cityGrid[x][y] = officer;
          officer.policeCoord = { x, y };
          policePlaced++;
        }
      }
    }

    while (jewelsPlaced < this.city.maxJewels) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);

      if (!this.city.cityGrid[x][y]) {
        if (jewelsPlaced < this.city.maxJewels) {
          this.city.cityGrid[x][y] = new Jewel({ x, y });
          jewelsPlaced++;
        }
      }
    }
    this.city.totalJewelValue = this.city.calculateTotalJewelValue();
  }

  playTurn() {
    for (const officer of this.police) {
      officer.move(this.city);
    }

    for (const robber of this.robbers) {
      if (robber.isActive) {
        robber.move(this.city);
      }
    }

    this.turns++;
  }

  isGameOver() {
    const totalLoot = this.robbers.reduce((sum, r) => sum + r.totalLootWorth, 0);
    const allCaught = this.robbers.every((r) => !r.isActive);
  
    if (totalLoot >= this.robberGoal) {
      return "Robbers Win!";
    }
    if (allCaught) {
      return "Police Win!";
    }
    if (this.turns >= this.maxTurns) {
      return "Police Win!";
    }
    return false;
  }
  }

module.exports = { Game };
