const { expect } = require("chai");

// Import the Jewel class
const { Jewel } = require("../../backend/models/jewel");

describe("Jewel Class", () => {
  it("should create a Jewel with the correct value and coordinates", () => {
    const coord = { x: 3, y: 4 };
    const jewel = new Jewel(coord);

    // If your Jewel constructor computes the jewelValue based on coordinates,
    // adjust this expected value accordingly. For example, if jewelValue is x+y:
    const expectedValue = coord.x + coord.y;
    
    expect(jewel.jewelCoord).to.deep.equal(coord);
    expect(jewel.jewelValue).to.equal(expectedValue);
  });
});
