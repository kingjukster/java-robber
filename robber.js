const { Jewel } = require('./jewel');

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

module.exports = { Robber }