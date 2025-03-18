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
    this.robberGoal = 200;
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
    const robbers = this.city.cityGrid
      .flat()
      .filter((cell) => cell instanceof Robber);
    const totalLoot = robbers.reduce((sum, r) => sum + r.totalLootWorth, 0);

    if (totalLoot >= this.robberGoal) {
      console.log("Robbers win by collecting enough loot!");
      return "Robbers Win!";
    }
    if (robbers.every((r) => !r.isActive)) {
      console.log("Police win by catching all robbers!");
      return "Police Win!";
    }
    if (this.maxTurns == this.turns) {
      console.log("Police win by turn limit!");
      return "Police Win!";
    }
    return false; // Game continues
  }

  //junk code
  start() {
    this.populateGrid();
    while (this.turns < this.maxTurns && !this.isGameOver()) {
      this.playTurn();
    }

    console.log("Game Over");
    if (this.isGameOver()) {
      console.log("Robbers win by collecting enough loot!");
    } else {
      console.log("Police win by catching all robbers!");
    }
  }
}

module.exports = { Game };
