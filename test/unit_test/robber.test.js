const { expect } = require("chai");
const sinon = require("sinon");
const { Robber } = require("../../backend/models/robber");
const { Jewel } = require("../../backend/models/jewel");

// Create a dummy city object for testing
function createDummyCity() {
  // Create a 10x10 grid of nulls.
  const cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
  let jewelCount = 10;
  // Define getValidDirections method that returns adjacent cells.
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

describe("Robber Class", () => {
  describe("Constructor & Initialization", () => {
    it("should create a robber with default properties", () => {
      const robber = new Robber(1, { x: 0, y: 0 }, "greedy");
      expect(robber.robberId).to.equal(1);
      expect(robber.robberCoord).to.deep.equal({ x: 0, y: 0 });
      expect(robber.lootBag).to.be.an("array").with.lengthOf(17);
      robber.lootBag.forEach((slot) => expect(slot).to.be.null);
      expect(robber.totalLootWorth).to.equal(0);
      expect(robber.isActive).to.be.true;
      expect(robber.robberType).to.equal("greedy");
    });
  });

  describe("checkBag", () => {
    it("should return the index of the first empty slot", () => {
      const robber = new Robber(1, { x: 0, y: 0 }, "ordinary");
      const idx = robber.checkBag();
      expect(idx).to.equal(0);
      // Fill first slot and then check next index
      robber.lootBag[0] = { dummy: true };
      expect(robber.checkBag()).to.equal(1);
    });
  });

  describe("pickUpLoot", () => {
    it("should pick up a jewel, update loot and modify the city grid", () => {
      const robber = new Robber(1, { x: 0, y: 0 }, "ordinary");
      const city = createDummyCity();

      // Place a Jewel at position (0,1)
      const jewel = new Jewel({ x: 0, y: 1 });
      city.cityGrid[0][1] = jewel;

      // Call pickUpLoot: pass the jewel and city
      robber.pickUpLoot(jewel, city);

      // Check that the robber's loot bag has been updated
      expect(robber.lootBag[0]).to.deep.equal(jewel);
      // Check that total loot is increased as expected (jewelValue equals x+y)
      const expectedValue = 0 + 1;
      expect(robber.totalLootWorth).to.equal(expectedValue);
      // Jewel count should be decremented
      expect(city.jewelCount).to.equal(9);
      // The cell where the jewel was should now be null
      expect(city.cityGrid[0][1]).to.be.null;
    });
  });

  /*
  describe("move (greedy behavior)", () => {
    it("should pick up a jewel from an adjacent cell and move into that cell", () => {
      // Set up a dummy city
      const city = createDummyCity();
      // Place a greedy robber at (5,5)
      const robber = new Robber(1, { x: 5, y: 5 }, "greedy");
      // Place the robber in the grid
      city.cityGrid[5][5] = robber;
      // Place a Jewel adjacent to the robber at (5,6)
      const jewel = new Jewel({ x: 5, y: 6 });
      city.cityGrid[5][6] = jewel;
      // Save current jewel count
      const initialJewelCount = city.jewelCount;

      // Call move; for a greedy robber, it should pick up the jewel
      robber.move(city);

      // After move, the robber should have moved to (5,6)
      expect(robber.robberCoord).to.deep.equal({ x: 5, y: 6 });
      // The grid cell (5,6) should now contain the robber
      expect(city.cityGrid[5][6]).to.equal(robber);
      // The robber's loot should have increased by jewel.jewelValue
      expect(robber.totalLootWorth).to.equal(jewel.jewelValue);
      // Jewel count should be decremented
      expect(city.jewelCount).to.equal(initialJewelCount - 1);
      // The original cell (5,5) should now be null
      expect(city.cityGrid[5][5]).to.be.null;
    });
  });

  describe("move (non-greedy/random movement)", () => {
    it("should move randomly when no adjacent jewel is found", () => {
      const city = createDummyCity();
      // Use an ordinary robber to avoid the greedy jewel pickup logic
      const robber = new Robber(2, { x: 4, y: 4 }, "ordinary");
      city.cityGrid[4][4] = robber;

      // Ensure no jewel is adjacent by keeping the grid empty around (4,4)
      // Also, override Math.random for predictability in test.
      const randomStub = sinon.stub(Math, "random").returns(0);
      
      // Get valid directions for (4,4)
      const validDirs = city.getValidDirections({ x: 4, y: 4 });
      // Call move. With Math.random stubbed, it should pick the first valid direction.
      robber.move(city);

      // The robber's new position should equal validDirs[0]
      expect(robber.robberCoord).to.deep.equal(validDirs[0]);
      // The original cell should be null and new cell should contain the robber
      expect(city.cityGrid[4][4]).to.be.null;
      expect(city.cityGrid[validDirs[0].x][validDirs[0].y]).to.equal(robber);

      randomStub.restore();
    });
  });
  */
 
});
