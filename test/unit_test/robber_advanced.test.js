const { expect } = require("chai");
const sinon = require("sinon");

const { Robber } = require("../../backend/models/robber");
const { Jewel } = require("../../backend/models/jewel");
const { Police } = require("../../backend/models/police");

function createDummyCity() {
  const cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
  let jewelCount = 1;

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

describe("Robber Advanced Movement", () => {
  it("should move toward the nearest jewel avoiding police", () => {
    const city = createDummyCity();
    const robber = new Robber(1, { x: 0, y: 0 }, "ordinary");
    const jewel = new Jewel({ x: 2, y: 2 });
    const police = new Police(1, { x: 1, y: 0 });

    city.cityGrid[0][0] = robber;
    city.cityGrid[2][2] = jewel;
    city.cityGrid[1][0] = police;

    robber.move(city);

    // Should not move into (1,0) where police is; expect (0,1) or (1,1) depending on BFS order
    expect(robber.robberCoord).to.not.deep.equal({ x: 1, y: 0 });
  });

  it("should pick a random safe spot if the loot bag is full", () => {
    const city = createDummyCity();
    const robber = new Robber(2, { x: 5, y: 5 }, "ordinary");

    // Fill the loot bag manually
    for (let i = 0; i < 17; i++) {
      robber.lootBag[i] = { dummy: true };
    }

    city.cityGrid[5][5] = robber;
    city.cityGrid[4][5] = new Police(1, { x: 4, y: 5 });

    robber.move(city);

    // Should move to a non-police tile and NOT try to go toward jewels
    expect(robber.robberCoord).to.not.deep.equal({ x: 4, y: 5 });
  });

  it("should get a bonus move if greedy and picks up a jewel", () => {
    const city = createDummyCity();
    const robber = new Robber(3, { x: 1, y: 1 }, "greedy");
    const jewel1 = new Jewel({ x: 1, y: 2 });
    const jewel2 = new Jewel({ x: 1, y: 3 });
    city.cityGrid[1][1] = robber;
    city.cityGrid[1][2] = jewel1;
    city.cityGrid[1][3] = jewel2;

    robber.move(city);

    // Should have moved twice and ended on the second jewel
    expect(robber.robberCoord).to.deep.equal({ x: 1, y: 3 });
    const count = robber.lootBag.filter((x) => x !== null).length;
    expect(count).to.equal(2);
  });
  

  it("should not get more than one bonus move per turn", () => {
    const city = createDummyCity();
    const robber = new Robber(4, { x: 1, y: 1 }, "greedy");
    const jewel1 = new Jewel({ x: 1, y: 2 });
    const jewel2 = new Jewel({ x: 1, y: 3 });
    const jewel3 = new Jewel({ x: 1, y: 4 });

    city.cityGrid[1][1] = robber;
    city.cityGrid[1][2] = jewel1;
    city.cityGrid[1][3] = jewel2;
    city.cityGrid[1][4] = jewel3;

    robber.move(city);

    // Should have moved only once extra and stopped before the third jewel
    expect(robber.robberCoord).to.deep.equal({ x: 1, y: 3 });
    const count = robber.lootBag.filter((x) => x !== null).length;
    expect(count).to.equal(2);
    expect(city.cityGrid[1][4]).to.equal(jewel3); // third jewel untouched
  });

  it("should do nothing if no valid directions exist", () => {
    const city = createDummyCity();
    const robber = new Robber(5, { x: 0, y: 0 }, "ordinary");

    // Block all directions with Police
    city.cityGrid[0][0] = robber;
    city.cityGrid[1][0] = new Police(1, { x: 1, y: 0 });
    city.cityGrid[0][1] = new Police(2, { x: 0, y: 1 });

    robber.move(city);

    // Should remain in same position
    expect(robber.robberCoord).to.deep.equal({ x: 0, y: 0 });
  });
});
