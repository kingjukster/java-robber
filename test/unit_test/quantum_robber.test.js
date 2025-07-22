const { expect } = require("chai");

const { Robber } = require("../../backend/models/robber");
const { Jewel } = require("../../backend/models/jewel");
const { Police } = require("../../backend/models/police");

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

describe("Quantum Robber", () => {
  it("should increase phase chance when picking up jewels", () => {
    const city = createDummyCity();
    Robber.capturedRobbers = [];
    const robber = new Robber(1, { x: 0, y: 0 }, "quantum");
    const jewel = new Jewel({ x: 0, y: 1 });
    city.cityGrid[0][0] = robber;
    city.cityGrid[0][1] = jewel;

    robber.move(city);

    expect(robber.phaseChance).to.be.above(0.1);
  });

  it("should free captured robber and steal loot when phasing", () => {
    const city = createDummyCity();
    Robber.capturedRobbers = [];
    const quantum = new Robber(1, { x: 0, y: 0 }, "quantum");
    const police = new Police(1, { x: 0, y: 1 });
    city.cityGrid[0][0] = quantum;
    city.cityGrid[0][1] = police;

    const captive = new Robber(2, { x: 1, y: 1 }, "ordinary");
    captive.totalLootWorth = 30;
    police.arrestRobber(captive);

    quantum.phaseChance = 1;
    quantum.move(city);

    expect(police.lootWorth).to.equal(15);
    expect(quantum.totalLootWorth).to.equal(15);
    expect(Robber.capturedRobbers.length).to.equal(0);
    expect(captive.isActive).to.be.true;
  });
});
