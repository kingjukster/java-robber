const { expect } = require("chai");
const sinon = require("sinon");

// Import the Game and Robber classes from the backend folder
const { Game } = require("../../backend/models/game");
const { Robber } = require("../../backend/models/robber");
const { Jewel } = require("../../backend/models/jewel");


describe("Game Class", () => {
  let game;
  
  // A helper to ensure that each robber is placed on the city grid.
  // We'll assign each robber to a unique coordinate.
  function placeRobbersOnGrid(gameInstance) {
    gameInstance.robbers.forEach((robber, index) => {
      // assign each robber a coordinate; for example, row 0, different columns
      const coord = { x: 0, y: index };
      robber.robberCoord = coord;
      gameInstance.city.cityGrid[coord.x][coord.y] = robber;
    });
  }
  
  beforeEach(() => {
    game = new Game();
  });
  
  describe("Initialization", () => {
    it("should initialize with correct default properties", () => {
      expect(game.turns).to.equal(0);
      expect(game.maxTurns).to.equal(30);
      //expect(game.robberGoal).to.equal(200);
      expect(game.robbers).to.be.an("array").with.lengthOf(4);
      expect(game.police).to.be.an("array").with.lengthOf(1);
      expect(game.city).to.exist;
    });

    it("should place exactly 47 jewels on the grid after populateGrid()", () => {
      const game = new Game();
      game.populateGrid();
  
      const jewelCount = game.city.cityGrid
        .flat()
        .filter((cell) => cell instanceof Jewel).length;
  
      expect(jewelCount).to.equal(47);
    });
  });
  
  describe("playTurn", () => {
    it("should increment the turn count when a turn is played", () => {
      const initialTurn = game.turns;
      // (Optionally, place robbers on grid so that move functions have a reference)
      placeRobbersOnGrid(game);
      game.playTurn();
      expect(game.turns).to.equal(initialTurn + 1);
    });
  });
  
  describe("isGameOver", () => {
    beforeEach(() => {
      // Place the robbers on the grid before testing win conditions
      placeRobbersOnGrid(game);
    });
    
    it("should return false if no win conditions are met", () => {
      // All robbers active and total loot below the goal.
      game.robbers.forEach((r) => {
        r.totalLootWorth = 0;
        r.isActive = true;
      });
      // Make sure turn count is less than maxTurns.
      game.turns = 10;
      expect(game.isGameOver()).to.be.false;
    });
  
    it("should return 'Robbers Win!' if total loot reaches or exceeds the robber goal", () => {
      // Distribute loot so that total equals or exceeds the goal.
      const lootPerRobber = game.robberGoal / game.robbers.length;
      game.robbers.forEach((r) => {
        r.totalLootWorth = lootPerRobber;
        r.isActive = true;
      });
      expect(game.isGameOver()).to.equal("Robbers Win!");
    });
  
    it("should return 'Police Win!' if all robbers are inactive", () => {
      // Set all robbers to inactive (caught) and place them on the grid.
      game.robbers.forEach((r) => {
        r.isActive = false;
      });
      expect(game.isGameOver()).to.equal("Police Win!");
    });
  
    it("should return 'Police Win!' if the turn limit is reached", () => {
      // Set turn count to maxTurns.
      game.turns = game.maxTurns;
      expect(game.isGameOver()).to.equal("Police Win!");
    });
  });
});
