const { Jewel } = require("./jewel");
const { Robber } = require("./robber");
const { Police } = require("./police");
const fs = require("fs");

class City {
  constructor() {
    this.cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.maxJewels = 47;
    this.jewelCount = this.maxJewels;
  }

  printGrid() {
    const gridString = this.cityGrid
      .map(
        (row) =>
          row
            .map((cell) => {
              if (cell instanceof Jewel) return "J";
              if (cell instanceof Robber) return "R";
              if (cell instanceof Police) return "P";
              return ".";
            })
            .join(" "), // Join each row's cells with spaces
      )
      .join("\n"); // Join rows with newlines

    //console.log(gridString); // Still print to console for debugging

    // Write to a file
    fs.appendFileSync("city_grid.txt", gridString + "\n\n", "utf8");
  }

  getValidDirections(coord) {
    const directions = [
      { x: -1, y: 0 }, // Up
      { x: 1, y: 0 }, // Down
      { x: 0, y: -1 }, // Left
      { x: 0, y: 1 }, // Right
    ];

    return directions
      .map((dir) => ({ x: coord.x + dir.x, y: coord.y + dir.y }))
      .filter((pos) => pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10);
  }
}

module.exports = { City };
