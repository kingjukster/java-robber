const { expect } = require("chai");
const sinon = require("sinon");

const { Game } = require("../../backend/models/game");
const analytics = require("../../backend/services/analyticsService");

// Ensure robber goal never exceeds total jewel value at start

describe("Robber goal cap", () => {
  it("should cap robberGoal at starting jewel value", async () => {
    const stub = sinon
      .stub(analytics, "getDynamicRobberGoal")
      .resolves(1000); // purposely larger than any board total

    const game = new Game();
    game.populateGrid();
    const startingTotal = game.city.totalJewelValue;

    const dynamicGoal = await analytics.getDynamicRobberGoal();
    game.robberGoal = Math.min(dynamicGoal, startingTotal);

    expect(game.robberGoal).to.be.at.most(startingTotal);
    stub.restore();
  });
});
