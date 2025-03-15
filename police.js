const { Jewel } = require('./jewel');

function getRobberClass() {
    return require('./robber').Robber;
}


class Police {
    constructor(policeId, policeCoord) {
        this.policeId = policeId;
        this.policeCoord = policeCoord;
        this.lootWorth = 0;
        this.robbersCaught = 0;
    }

    arrestRobber(robber) {
        const Robber = getRobberClass();  // Import here to break the circular dependency
        if (robber instanceof Robber) {
            this.lootWorth += robber.totalLootWorth;
            robber.totalLootWorth = 0;
            this.robbersCaught++;
            robber.isActive = false;
        }
    }
    

    move(city) {
        const { Robber } = require('./robber');  // Import here to break circular dependency

        // Get valid directions from the police's current position
        const validDirections = city.getValidDirections(this.policeCoord);
        let newCoord = null;
        let turnPlayed = false;
    
        // Prioritize moving towards a robber
        for (const dir of validDirections) {
            if (city.cityGrid[dir.x][dir.y] instanceof Robber && city.cityGrid[dir.x][dir.y].isActive) {
                this.arrestRobber(city.cityGrid[dir.x][dir.y]);
                city.cityGrid[dir.x][dir.y] = this;  // Move police to robber's position
                
                // Clear original position of the police
                if (city.cityGrid[this.policeCoord.x] && city.cityGrid[this.policeCoord.x][this.policeCoord.y]) {
                    city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
                }
    
                this.policeCoord = dir;  // Update police position
                turnPlayed = true;
                return;
            }
        }
    
        // If no robbers were found, make a random move
        if (validDirections.length > 0) {
            const newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
            const targetCell = city.cityGrid[newCoord.x][newCoord.y];
      
            // If there's a jewel at the new position, pick it up
            if (targetCell instanceof Jewel) {
              this.lootWorth += targetCell.jewelValue;
              city.jewelCount--;
              // Remove the jewel from the grid
              city.cityGrid[newCoord.x][newCoord.y] = null;
            }
      
            // Move the police
            city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
            city.cityGrid[newCoord.x][newCoord.y] = this;
            this.policeCoord = newCoord;
            }
        }
    }


module.exports = { Police }