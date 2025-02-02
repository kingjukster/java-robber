// Programmer: Terrell Heredia 
// Date: 1/20/25  
// File: main.js  
// Assignment: FUN  
// Purpose: This file contains a cops vs robbers game implementation

const fs = require('fs');

class City {
    constructor() { 
        this.cityGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
        this.maxJewels = 47;
        this.jewelCount = this.maxJewels;
    }


    printGrid() {
        const gridString = this.cityGrid.map(row => 
            row.map(cell => {
                if (cell instanceof Jewel) return "J";
                if (cell instanceof Robber) return "R";
                if (cell instanceof Police) return "P";
                return ".";
            }).join(" ") // Join each row's cells with spaces
        ).join("\n"); // Join rows with newlines

        //console.log(gridString); // Still print to console for debugging
        
        // Write to a file
        fs.appendFileSync('city_grid.txt', gridString + '\n\n', 'utf8');
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
    constructor(robberId, robberCoord, robberType) {
        this.robberId = robberId;
        this.robberCoord = robberCoord;
        this.lootBag = Array(17).fill(null)
        this.totalLootWorth = 0;
        this.isActive = true;
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
            city.jewelCount--;
            city.cityGrid[jewel.jewelCoord.x][jewel.jewelCoord.y] = null;
        }
    }

    /*
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
        */
    

    move(city) {
        const validDirections = city.getValidDirections(this.robberCoord);
        let newCoord = null;

        if (this.robberType == "greedy"){
            for (const dir of validDirections) {
            if (city.cityGrid[dir.x] && city.cityGrid[dir.x][dir.y] instanceof Jewel) {
                this.pickUpLoot(city.cityGrid[dir.x][dir.y], city);
                city.cityGrid[dir.x][dir.y] = this;  // Move police to robber's position
                // Clear original position of the police
                if (city.cityGrid[this.robberCoord.x][this.robberCoord.y] !== undefined) {
                    city.cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
                }
                this.robberCoord = dir;
                return;
            }
        }
    }
        


        if (validDirections.length > 0) {
            newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
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
    constructor(policeId, policeCoord) {
        this.policeId = policeId;
        this.policeCoord = policeCoord;
        this.lootWorth = 0;
        this.robbersCaught = 0;
    }

    arrestRobber(robber) {
        this.lootWorth += robber.totalLootWorth;
        this.robbersCaught++;
        robber.isActive = false;
    }

    /*
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
    */

    move(city) {
        const validDirections = city.getValidDirections(this.policeCoord);
        let newCoord = null;
        let turnPlayed = false;
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
                turnPlayed = true;
                return;
            }
        }
    
        // If no robbers were found, make a random move
        if (validDirections.length > 0) {
            if (turnPlayed) {
                console.log("free turn baby")
            }
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
        //this.city.populateGrid();
        this.turns = 0;
        this.maxTurns = 30;
        this.maxRobbers = 4;
        this.maxPolice = 1;
        this.robbers = [
            new Robber(1, { x: 0, y: 0 }, "ordinary"),
            new Robber(2, { x: 0, y: 0 }, "ordinary"),
            new Robber(3, { x: 0, y: 0 }, "ordinary"),
            new Robber(4, { x: 0, y: 0 }, "greedy")
        ];
        this.police = [new Police(1, { x: 0, y: 0 })];
    }

    populateGrid() {
        const options = ["J", "R", "P"];
        let jewelsPlaced = 0, robbersPlaced = 0, policePlaced = 0;
        
        while (jewelsPlaced < this.city.maxJewels || robbersPlaced < this.maxRobbers || policePlaced < this.maxPolice) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            if (!this.city.cityGrid[x][y]) {
                const choice = options[Math.floor(Math.random() * 3)];

                if (choice === "J" && jewelsPlaced < this.city.maxJewels) {
                    this.city.cityGrid[x][y] = new Jewel({ x, y });
                    jewelsPlaced++;
                } else if (choice === "R" && robbersPlaced < this.maxRobbers) {
                    this.city.cityGrid[x][y] = this.robbers[robbersPlaced];
                    this.robbers[robbersPlaced].robberCoord = {x: x, y: y};
                    robbersPlaced++;
                } else if (choice === "P" && policePlaced < this.maxPolice) {
                    this.city.cityGrid[x][y] = this.police[policePlaced];
                    this.police[policePlaced].policeCoord = {x: x, y: y};
                    policePlaced++;
                }
            }
        }
        
        //console.log(this.cityGrid[0][0]);
    }

    playTurn() {
        console.log(`Turn ${this.turns + 1}`);

        for (const robber of this.robbers) {
            if (robber.isActive) {
                robber.move(this.city);
            }
        }

        for (const officer of this.police) {
            officer.move(this.city);
        }

        console.log(`Jewels remaining: ${this.city.jewelCount}`);
        this.city.printGrid();
    }

    isGameOver() {
        const robberz = this.city.cityGrid.flat().filter(cell => cell instanceof Robber);
        const totalLoot = robberz.reduce((sum, r) => sum + r.totalLootWorth, 0);
        console.log(totalLoot);
        return totalLoot >= 200 || robberz.every(r => !r.isActive);
    }

    start() {
        this.populateGrid();
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
