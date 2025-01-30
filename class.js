// Programmer: Terrell Heredia 
// Date: 1/20/25  
// File: main.js  
// Assignment: FUN  
// Purpose: This file contains a cops vs robbers game implementation

class City {
    constructor(cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null))) { 
        this.cityGrid = cityGrid;
        this.maxJewels = 47;
        this.jewelCount = this.maxJewels;
        this.maxRobbers = 4;
        this.maxPolice = 1;
        this.robberList = [];
        this.policeList = [];
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
                    this.robberList.push(this.cityGrid[x][y]);
                    robbersPlaced++;
                } else if (choice === "P" && policePlaced < this.maxPolice) {
                    this.cityGrid[x][y] = new Police(policePlaced + 1, { x, y }, 0, 0);
                    this.policeList.push(this.cityGrid[x][y]);
                    policePlaced++;
                }
            }
        }
        
        //console.log(this.cityGrid[0][0]);
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

    getValidDirections(coord) {
        const directions = [
            { x: -1, y: 0 }, // Up
            { x: 1, y: 0 },  // Down
            { x: 0, y: -1 }, // Left
            { x: 0, y: 1 }   // Right
        ];
    
        return directions
            .map(dir => ({ x: coord.x + dir.x, y: coord.y + dir.y }))
            .filter(pos => pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10);
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

    pickUpLoot(jewel, city) {
        const nextSpot = this.checkBag();
        if (nextSpot !== -1) {
            this.lootBag[nextSpot] = jewel;
            this.totalLootWorth += jewel.jewelValue;
            console.log(city.jewelCount)
            city.jewelCount--;
        }
    }

    getValidDirections(city) {
        // Define the possible directions to move (Up, Down, Left, Right)
        const directions = [
            { x: this.robberCoord.x - 1, y: this.robberCoord.y }, // Up
            { x: this.robberCoord.x + 1, y: this.robberCoord.y }, // Down
            { x: this.robberCoord.x, y: this.robberCoord.y - 1 }, // Left
            { x: this.robberCoord.x, y: this.robberCoord.y + 1 }  // Right
        ];
    
        // Create an empty array to store valid directions
        let validDirections = [];
    
        // Loop through each direction and check if it's valid
        for (let i = 0; i < directions.length; i++) {
            let d = directions[i];
    
            // Check if the new position is within bounds and the cell is empty
            // Check if d.x is within bounds
            let isXInBounds = d.x >= 0 && d.x < 10;
            console.log(isXInBounds);

            // Check if d.y is within bounds
            let isYInBounds = d.y >= 0 && d.y < 10;
            
            console.log(isYInBounds);
            // Check if the target position is empty (null)
            
            console.log(city.cityGrid[0][0]);
            let isPositionEmpty = city.cityGrid[d.x][d.y] == null;
            
            console.log(isPositionEmpty);
            // Combine all conditions to check if the direction is valid
            if (isXInBounds && isYInBounds && isPositionEmpty) {
                validDirections.push(d);
            }

        }
    
        // Return the list of valid directions
        return validDirections;
    }
    

    move(city) {
        const validDirections = city.getValidDirections(this.robberCoord);
        if (validDirections.length > 0) {
            const newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
            const targetCell = city.cityGrid[newCoord.x][newCoord.y];
            if (targetCell instanceof Jewel) {
                this.pickUpLoot(targetCell, city);
            }
            city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
            this.robberCoord = newCoord;
            city.cityGrid[newCoord.x][newCoord.y] = this;
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

    getValidDirections(city) {
        const directions = [
            { x: this.policeCoord.x - 1, y: this.policeCoord.y },
            { x: this.policeCoord.x + 1, y: this.policeCoord.y },
            { x: this.policeCoord.x, y: this.policeCoord.y - 1 },
            { x: this.policeCoord.x, y: this.policeCoord.y + 1 }
        ];
        return directions.filter(d =>
            d.x >= 0 && d.x < 10 && d.y >= 0 && d.y < 10 &&
            (city.cityGrid[d.x][d.y] === null || city.cityGrid[d.x][d.y] instanceof Robber)  // Police can't move onto a Jewel or another Police
        );
    }
    

    move(city) {
        const validDirections = city.getValidDirections(this.policeCoord);
        let newCoord = null;
    
        // Prioritize moving towards a robber
        for (const dir of validDirections) {
            if (city.cityGrid[dir.x] && city.cityGrid[dir.x][dir.y] instanceof Robber && city.cityGrid[dir.x][dir.y].isActive) {
                this.arrestRobber(city.cityGrid[dir.x][dir.y]);
                city.cityGrid[dir.x][dir.y] = this;  // Move police to robber's position
                // Clear original position of the police
                if (city.cityGrid[this.policeCoord.x] && city.cityGrid[this.policeCoord.x][this.policeCoord.y] !== undefined) {
                    city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
                }
                this.policeCoord = dir;
                return;
            }
        }
    
        // If no robbers were found, make a random move
        if (validDirections.length > 0) {
            newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
            
            // Ensure newCoord is within bounds
            if (newCoord && newCoord.x >= 0 && newCoord.x < 10 && newCoord.y >= 0 && newCoord.y < 10) {
                // Check if the new position is valid
                if (city.cityGrid[newCoord.x] && city.cityGrid[newCoord.x][newCoord.y] !== undefined) {
                    if (city.cityGrid[this.policeCoord.x] && city.cityGrid[this.policeCoord.x][this.policeCoord.y] !== undefined) {
                        city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
                    }
                    this.policeCoord = newCoord;
                    city.cityGrid[newCoord.x][newCoord.y] = this;
                }
            }
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

        this.city.robberList[0].move();
        this.city.robberList[1].move();
        this.city.robberList[2].move();
        this.city.robberList[3].move();
        this.city.policeList[0].move();
        /*
        this.city.cityGrid.forEach(row => {
            row.forEach(cell => {
                if (cell instanceof Robber && cell.isActive) {
                    this.city.printGrid();
                    console.log(`Robber ${cell.robberId} at (${cell.robberCoord.x}, ${cell.robberCoord.y}) moves.`);
                    cell.move(this.city);
                } else if (cell instanceof Police) {
                    this.city.printGrid();
                    console.log(`Police at (${cell.policeCoord.x}, ${cell.policeCoord.y}) moves.`);
                    cell.move(this.city);
                }
            });
        });*/

        console.log(`Jewels remaining: ${this.city.jewelCount}`);
        this.city.printGrid();
    }

    isGameOver() {
        const robbers = this.city.cityGrid.flat().filter(cell => cell instanceof Robber);
        const totalLoot = robbers.reduce((sum, r) => sum + r.totalLootWorth, 0);
        return totalLoot >= 100 || robbers.every(r => !r.isActive);
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
