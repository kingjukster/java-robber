const { expect } = require("chai");
const sinon = require("sinon");
const oracledb = require("oracledb");

const jsonStore = require("../../db/jsonStorage");
const gameService = require("../../backend/services/gameService");
const { getDynamicRobberGoal } = require("../../backend/services/analyticsService");

describe("JSON fallback", () => {
  beforeEach(() => {
    sinon.stub(oracledb, "getConnection").resolves(null);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("addGame should store data via jsonStorage when DB unavailable", async () => {
    const addStub = sinon.stub(jsonStore, "addGame").returns(1);

    await gameService.addGame({
      turnCount: 5,
      robberGoal: 300,
      totalJewelValue: 100,
      winner: "Robbers",
    });

    expect(addStub.calledOnce).to.be.true;
    expect(addStub.firstCall.args[0]).to.deep.equal({
      turnCount: 5,
      robberGoal: 300,
      totalJewelValue: 100,
      winner: "Robbers",
    });
  });

  it("addPlayer should store robber and police stats via jsonStorage", async () => {
    sinon
      .stub(jsonStore, "computeStats")
      .returns({ GameStats: [{}], RobberStats: [], PoliceStats: [] });
    const addRobberStub = sinon.stub(jsonStore, "addRobber");
    const addPoliceStub = sinon.stub(jsonStore, "addPolice");

    await gameService.addPlayer({ role: "Robber", lootWorth: 50 });
    await gameService.addPlayer({ role: "Police", lootWorth: 20, robbersCaught: 2 });

    expect(addRobberStub.calledOnceWith({ gameId: 1, jewels_stolen: 50 })).to.be.true;
    expect(
      addPoliceStub.calledOnceWith({ gameId: 1, jewels_recovered: 20, arrests_made: 2 })
    ).to.be.true;
  });

  it("getStats should return values from jsonStorage when DB unavailable", async () => {
    const mockData = {
      GameStats: [{ game_id: 1 }],
      RobberStats: [{ game_id: 1 }],
      PoliceStats: [{ game_id: 1 }],
    };
    sinon.stub(jsonStore, "computeStats").returns(mockData);

    const res = await gameService.getStats();

    expect(res).to.deep.equal({
      games: mockData.GameStats,
      robbers: mockData.RobberStats,
      police: mockData.PoliceStats,
    });
  });

  it("getDynamicRobberGoal should derive goal from JSON stats", async () => {
    const mockData = {
      GameStats: [
        { total_jewel_value: 300, winner: "Robbers" },
        { total_jewel_value: 200, winner: "Police" },
      ],
    };
    sinon.stub(jsonStore, "computeStats").returns(mockData);

    const goal = await getDynamicRobberGoal();

    expect(goal).to.equal(285);
  });
});
