const { expect } = require("chai");
const sinon = require("sinon");

// Ensure Robber is defined globally for the instanceof checks in Police.move.
global.Robber = require("../../backend/models/robber").Robber;

const { Police } = require("../../backend/models/police");
const { Jewel } = require("../../backend/models/jewel");

// Create a dummy city object for testing advanced movement.
function createDummyCity() {
  const cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
  let jewelCount = 10;
  function getValidDirections(coord) {
    const directions = [
      { x: coord.x - 1, y: coord.y },
      { x: coord.x + 1, y: coord.y },
      { x: coord.x, y: coord.y - 1 },
      { x: coord.x, y: coord.y + 1 },
    ];
    return directions.filter(
      (pos) => pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10
    );
  }
  return { cityGrid, jewelCount, getValidDirections };
}

describe("Police Advanced Movement Algorithm", () => {
  it("should move one step along the computed path toward the nearest active robber", () => {
    const city = createDummyCity();
    // Create police at (0,0)
    const police = new Police(1, { x: 0, y: 0 });
    city.cityGrid[0][0] = police;
    // Place an active robber at (2,3)
    const robber = new global.Robber(1, { x: 2, y: 3 }, "ordinary");
    robber.isActive = true;
    robber.totalLootWorth = 0;
    city.cityGrid[2][3] = robber;

    // Our simplified findPath increments x until it matches, so from {0,0} to {2,3} the first step is {1,0}
    police.move(city);
    expect(police.policeCoord).to.deep.equal({ x: 1, y: 0 });
    expect(city.cityGrid[0][0]).to.be.null;
    expect(city.cityGrid[1][0]).to.equal(police);
  });

  it("should eventually reach the robber if move is called repeatedly", () => {
    const city = createDummyCity();
    // Create police at (0,0)
    const police = new Police(1, { x: 0, y: 0 });
    city.cityGrid[0][0] = police;
    // Place an active robber at (4,4)
    const robber = new global.Robber(1, { x: 4, y: 4 }, "ordinary");
    robber.isActive = true;
    robber.totalLootWorth = 0;
    city.cityGrid[4][4] = robber;
    
    // Call move repeatedly until the police is adjacent to the robber or a maximum number of moves is reached
    let moves = 0;
    const maxMoves = 20;
    while (robber.isActive && moves < maxMoves) {
      police.move(city);
      moves++;
    }
    
    // Now police should be adjacent or have arrested the robber
    const adjacent = city.getValidDirections(police.policeCoord)
      .some(coord => coord.x === robber.robberCoord.x && coord.y === robber.robberCoord.y);
    
    expect(adjacent || police.policeCoord.x === robber.robberCoord.x && police.policeCoord.y === robber.robberCoord.y)
      .to.be.true;
    if (adjacent) {
      // If police is adjacent, one more move should arrest the robber.
      police.move(city);
      expect(robber.isActive).to.be.false;
    }
  });
  

  it("should arrest a robber if adjacent", () => {
    const city = createDummyCity();
    // Place police at (1,1)
    const police = new Police(1, { x: 1, y: 1 });
    city.cityGrid[1][1] = police;
    // Place an active robber at an adjacent cell (1,2)
    const robber = new global.Robber(2, { x: 1, y: 2 }, "ordinary");
    robber.isActive = true;
    robber.totalLootWorth = 40;
    city.cityGrid[1][2] = robber;

    // When move is called, the police should detect the adjacent robber and arrest him.
    police.move(city);
    expect(police.policeCoord).to.deep.equal({ x: 1, y: 2 });
    expect(city.cityGrid[1][2]).to.equal(police);
    expect(robber.isActive).to.be.false;
    expect(police.lootWorth).to.equal(40);
  });

  it("should pick up a jewel along the computed path if encountered", () => {
    const city = createDummyCity();
    // Place police at (0,0)
    const police = new Police(1, { x: 0, y: 0 });
    city.cityGrid[0][0] = police;
    // For a robber at {2,3}, our findPath returns the first step as {1,0}.
    // Place a Jewel at (1,0)
    const jewel = new Jewel({ x: 1, y: 0 });
    city.cityGrid[1][0] = jewel;
    const initialJewelCount = city.jewelCount;
    // Place an active robber at (2,3)
    const robber = new global.Robber(1, { x: 2, y: 3 }, "ordinary");
    robber.isActive = true;
    city.cityGrid[2][3] = robber;

    police.move(city);
    // Expect police to have moved to {1,0}, picked up the jewel, and updated jewel count.
    expect(police.policeCoord).to.deep.equal({ x: 1, y: 0 });
    expect(police.lootWorth).to.equal(jewel.jewelValue);
    expect(city.jewelCount).to.equal(initialJewelCount - 1);
    expect(city.cityGrid[0][0]).to.be.null;
    expect(city.cityGrid[1][0]).to.equal(police);
  });
});
