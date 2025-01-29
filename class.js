// Programmer: Terrell Heredia 
// Date: 1/20/25  
// File: main.js  
// Assignment: FUN  
// Purpose: This file contains a cops vs robbers game implementation

class City {
    constructor(cityGrid, jewelCount) { 
        if (!cityGrid) {
            cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
        }
        this.cityGrid = cityGrid;
        this.jewelCount = jewelCount;
        this.maxJewels = 47;
        this.maxRobbers = 4;
        this.maxPolice = 1;
    }

    populateGrid() {
        const options = ["J", "R", "P"];
        let jewelsPlaced = 0, robbersPlaced = 0, policePlaced = 0;

        while (jewelsPlaced < this.maxJewels || robbersPlaced < this.maxRobbers || policePlaced < this.maxPolice) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            if (!this.cityGrid[x][y]) {
                const choice = options[Math.floor(Math.random() * 3)];

                if (choice === "J" && jewelsPlaced < this.maxJewels) {
                    this.cityGrid[x][y] = new Jewel({ x, y });
                    jewelsPlaced++;
                } else if (choice === "R" && robbersPlaced < this.maxRobbers) {
                    this.cityGrid[x][y] = new Robber(robbersPlaced + 1, { x, y }, Array(17).fill(null), true, "ordinary");
                    robbersPlaced++;
                } else if (choice === "P" && policePlaced < this.maxPolice) {
                    this.cityGrid[x][y] = new Police(policePlaced + 1, { x, y }, 0, 0);
                    policePlaced++;
                }
            }
        }
    }

    printGrid() {
        console.table(
            this.cityGrid.map(row => 
                row.map(cell => {
                    if (cell instanceof Jewel) return "J";
                    if (cell instanceof Robber) return "R";
                    if (cell instanceof Police) return "P";
                    return ".";
                })
            )
        );
    }
}

class Jewel {
    constructor(jewelCoord) {
        this.jewelValue = jewelCoord.x + jewelCoord.y;
        this.jewelCoord = jewelCoord;
    }
}

class Robber {
    constructor(robberId, robberCoord, lootBag, isActive, robberType) {
        this.robberId = robberId;
        this.robberCoord = robberCoord;
        this.lootBag = lootBag;
        this.totalLootWorth = 0;
        this.isActive = isActive;
        this.robberType = robberType;
        this.maxCap = 17;
    }

    checkBag() {
        return this.lootBag.findIndex(item => item === null);
    }

    pickUpLoot(jewel, cityGrid) {
        const nextSpot = this.checkBag();
        if (nextSpot !== -1) {
            this.lootBag[nextSpot] = jewel;
            this.totalLootWorth += jewel.jewelValue;
            cityGrid.jewelCount--;
        }
    }

    getValidDirections(cityGrid) {
        const directions = [
            { x: this.robberCoord.x - 1, y: this.robberCoord.y },
            { x: this.robberCoord.x + 1, y: this.robberCoord.y },
            { x: this.robberCoord.x, y: this.robberCoord.y - 1 },
            { x: this.robberCoord.x, y: this.robberCoord.y + 1 }
        ];
        return directions.filter(d => d.x >= 0 && d.x < 10 && d.y >= 0 && d.y < 10 && !cityGrid[d.x][d.y]);
    }

    move(cityGrid) {
        const validDirections = this.getValidDirections(cityGrid);
        if (validDirections.length > 0) {
            const newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
            cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
            this.robberCoord = newCoord;
            cityGrid[newCoord.x][newCoord.y] = this;
        }
    }
    newMove(cityGrid) {
        // base case: if there are no more jewels
        if (cityGrid.jewelCount == 0) {
            return true;
        }
        
    }
}

class Police {
    constructor(policeId, policeCoord, lootWorth, robbersCaught) {
        this.policeId = policeId;
        this.policeCoord = policeCoord;
        this.lootWorth = lootWorth;
        this.robbersCaught = robbersCaught;
    }

    arrestRobber(robber) {
        this.lootWorth += robber.totalLootWorth;
        this.robbersCaught++;
        robber.isActive = false;
    }

    pickUpLoot(jewel, cityGrid) {
        this.lootWorth += jewel.jewelValue;
        cityGrid.jewelCount--;
    }

    getValidDirections(cityGrid) {
        const directions = [
            { x: this.policeCoord.x - 1, y: this.policeCoord.y },
            { x: this.policeCoord.x + 1, y: this.policeCoord.y },
            { x: this.policeCoord.x, y: this.policeCoord.y - 1 },
            { x: this.policeCoord.x, y: this.policeCoord.y + 1 }
        ];
        return directions.filter(d => d.x >= 0 && d.x < 10 && d.y >= 0 && d.y < 10);
    }

    move(cityGrid) {
        const validDirections = this.getValidDirections(cityGrid);
        if (validDirections.length > 0) {
            const newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
            const targetCell = cityGrid[newCoord.x][newCoord.y];

            if (targetCell instanceof Robber && targetCell.isActive) {
                this.arrestRobber(targetCell);
            }else if (targetCell instanceof Jewel) {
                this.pickUpLoot(targetCell);
            }

            cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
            this.policeCoord = newCoord;
            cityGrid[newCoord.x][newCoord.y] = this;
        }
    }
}

class Game {
    constructor() {
        this.city = new City();
        this.city.populateGrid();
        this.turns = 0;
        this.maxTurns = 30;
    }

    playTurn() {
        console.log(`Turn ${this.turns + 1}`);

        this.city.cityGrid.forEach(row => {
            row.forEach(cell => {
                if (cell instanceof Robber && cell.isActive) {
                    cell.move(this.city.cityGrid);
                } else if (cell instanceof Police) {
                    cell.move(this.city.cityGrid);
                }
            });
        });

        this.city.printGrid();
    }

    isGameOver() {
        const robbers = this.city.cityGrid.flat().filter(cell => cell instanceof Robber);
        const totalLoot = robbers.reduce((sum, r) => sum + r.totalLootWorth, 0);
        return totalLoot >= 438 || robbers.every(r => !r.isActive);
    }

    start() {
        while (this.turns < this.maxTurns && !this.isGameOver()) {
            this.playTurn();
            this.turns++;
        }

        console.log("Game Over");
        if (this.isGameOver()) {
            console.log("Robbers win by collecting enough loot!");
        } else {
            console.log("Police win by catching all robbers!");
        }
    }
}

const game = new Game();
game.start();
