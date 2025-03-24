const { expect } = require("chai");
const fs = require("fs");
const sinon = require("sinon");

// Import the City class and related models
const { City } = require("../../backend/models/city");
const { Jewel } = require("../../backend/models/jewel");
const { Robber } = require("../../backend/models/robber");
const { Police } = require("../../backend/models/police");

describe("City Class", () => {
  let city;
  let appendFileSyncStub;

  beforeEach(() => {
    city = new City();
    // Stub fs.appendFileSync before each test
    appendFileSyncStub = sinon.stub(fs, "appendFileSync");
  });

  afterEach(() => {
    // Restore the stub after each test
    appendFileSyncStub.restore();
  });

  describe("constructor", () => {
    it("should create a 10x10 grid with all cells null", () => {
      expect(city.cityGrid).to.have.length(10);
      city.cityGrid.forEach((row) => {
        expect(row).to.have.length(10);
        row.forEach((cell) => {
          expect(cell).to.be.null;
        });
      });
    });

    it("should set maxJewels to 47 and jewelCount to 47", () => {
      expect(city.maxJewels).to.equal(47);
      expect(city.jewelCount).to.equal(47);
    });
  });

  describe("getValidDirections", () => {
    it("should return correct valid directions for a middle cell", () => {
      const directions = city.getValidDirections({ x: 5, y: 5 });
      expect(directions).to.deep.members([
        { x: 4, y: 5 },
        { x: 6, y: 5 },
        { x: 5, y: 4 },
        { x: 5, y: 6 },
      ]);
      expect(directions).to.have.length(4);
    });

    it("should return correct valid directions for the top-left cell", () => {
      const directions = city.getValidDirections({ x: 0, y: 0 });
      expect(directions).to.deep.members([
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]);
      expect(directions).to.have.length(2);
    });

    it("should return correct valid directions for the bottom-right cell", () => {
      const directions = city.getValidDirections({ x: 9, y: 9 });
      expect(directions).to.deep.members([
        { x: 8, y: 9 },
        { x: 9, y: 8 },
      ]);
      expect(directions).to.have.length(2);
    });
  });

  describe("printGrid", () => {
    it("should generate a grid string with correct symbols and write to a file", () => {
      // Set up some cells to include different elements
      city.cityGrid[0][0] = new Jewel({ x: 0, y: 0 });
      city.cityGrid[0][1] = new Robber(1, { x: 0, y: 1 }, "ordinary");
      city.cityGrid[0][2] = new Police(1, { x: 0, y: 2 });

      // Call printGrid so that it generates the string and writes to file
      city.printGrid();

      // Verify that appendFileSync was called once
      expect(appendFileSyncStub.calledOnce).to.be.true;

      // Retrieve the grid string passed to appendFileSync
      const gridString = appendFileSyncStub.firstCall.args[1];

      // Check that the string includes symbols for Jewel, Robber, and Police,
      // and includes "." for empty cells.
      expect(gridString).to.include("J");
      expect(gridString).to.include("R");
      expect(gridString).to.include("P");
      expect(gridString).to.include(".");
    });
  });
});
