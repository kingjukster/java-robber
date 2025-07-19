const { expect } = require("chai");
const sinon = require("sinon");
const oracledb = require("oracledb");
const { getDynamicRobberGoal } = require("../../backend/services/analyticsService");

describe("Dynamic Robber Goal", () => {
  let connectionStub;

  beforeEach(() => {
    // Stub connection and execute
    connectionStub = {
      execute: sinon.stub(),
      close: sinon.stub().resolves()
    };
    sinon.stub(oracledb, "getConnection").resolves(connectionStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return a value between 250 and 375 based on recent stats", async () => {
    connectionStub.execute
      .onFirstCall()
      .resolves({ rows: [[500, 50, 480, 30]] }); // avg=500, std=50, median=480, count=30
    connectionStub.execute.onSecondCall().resolves({ rows: [[0.6]] }); // win rate = 0.6

    const goal = await getDynamicRobberGoal();

    expect(goal).to.equal(375); // value is clamped at upper bound
  });

  it("should return default 340 if average is null", async () => {
    connectionStub.execute
      .onFirstCall()
      .resolves({ rows: [[null, null, null, 0]] });
    connectionStub.execute.onSecondCall().resolves({ rows: [[0.6]] });

    const goal = await getDynamicRobberGoal();
    expect(goal).to.equal(340);
  });

  it("should return default 340 if connection fails", async () => {
    oracledb.getConnection.restore();
    sinon.stub(oracledb, "getConnection").resolves(null);

    const goal = await getDynamicRobberGoal();
    expect(goal).to.equal(340);
  });
});
