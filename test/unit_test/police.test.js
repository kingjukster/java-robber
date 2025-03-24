const { expect } = require("chai");
const sinon = require("sinon");

// Import the Police, Robber, and Jewel classes from the backend folder
const { Police } = require("../../backend/models/police");
const { Robber } = require("../../backend/models/robber");
const { Jewel } = require("../../backend/models/jewel");

// Create a dummy city object for testing
function createDummyCity() {
  const cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
  let jewelCount = 10;
  // A simple implementation of getValidDirections that returns the four orthogonal neighbors.
  // In one test we'll override this to force a specific ordering.
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

describe("Police Class", () => {
  describe("arrestRobber", () => {
    it("should arrest an active robber and update police stats", () => {
      const police = new Police(1, { x: 0, y: 0 });
      const robber = new Robber(1, { x: 1, y: 0 }, "ordinary");
      robber.totalLootWorth = 50;
      robber.isActive = true;

      police.arrestRobber(robber);

      expect(police.lootWorth).to.equal(50);
      expect(police.robbersCaught).to.equal(1);
      expect(robber.totalLootWorth).to.equal(0);
      expect(robber.isActive).to.be.false;
    });
  });

  /*
  describe("move", () => {
    it("should move towards an adjacent active robber and arrest them", () => {
      const city = createDummyCity();
      // Place an active robber at (1,1)
      const robber = new Robber(1, { x: 1, y: 1 }, "ordinary");
      robber.totalLootWorth = 30;
      robber.isActive = true;
      city.cityGrid[1][1] = robber;

      // Place police at (1,0)
      const police = new Police(1, { x: 1, y: 0 });
      city.cityGrid[1][0] = police;

      // Use the dummy city's getValidDirections method
      city.getValidDirections = (coord) => {
        const directions = [
          { x: coord.x, y: coord.y + 1 },
          { x: coord.x, y: coord.y - 1 },
          { x: coord.x + 1, y: coord.y },
          { x: coord.x - 1, y: coord.y },
        ];
        return directions.filter(
          (pos) => pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10
        );
      };

      police.move(city);

      // Expect police to have moved to (1,1) and arrested the robber
      expect(police.policeCoord).to.deep.equal({ x: 1, y: 1 });
      expect(city.cityGrid[1][1]).to.equal(police);
      expect(robber.isActive).to.be.false;
      expect(police.lootWorth).to.equal(30);
    });

    it("should move randomly and pick up a jewel when no adjacent robber exists", () => {
      const city = createDummyCity();
      // Override getValidDirections to force order: desired first element: { x: 2, y: 3 }
      city.getValidDirections = (coord) => {
        return [{ x: 2, y: 3 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 1 }];
      };
      // Place police at (2,2)
      const police = new Police(1, { x: 2, y: 2 });
      city.cityGrid[2][2] = police;
      // Place a Jewel at (2,3)
      const jewel = new Jewel({ x: 2, y: 3 });
      city.cityGrid[2][3] = jewel;
      const initialJewelCount = city.jewelCount;

      // Stub Math.random to force index 0 selection (first valid direction)
      const randomStub = sinon.stub(Math, "random").returns(0);

      police.move(city);

      // Expect police to have moved to (2,3) and picked up the jewel
      expect(police.policeCoord).to.deep.equal({ x: 2, y: 3 });
      expect(police.lootWorth).to.equal(jewel.jewelValue);
      expect(city.jewelCount).to.equal(initialJewelCount - 1);
      expect(city.cityGrid[2][2]).to.be.null;
      expect(city.cityGrid[2][3]).to.equal(police);

      randomStub.restore();
    });

  });
  */
});
