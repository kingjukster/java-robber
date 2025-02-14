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
            // Make a random move from valid directions
            newCoord = validDirections[Math.floor(Math.random() * validDirections.length)];
    
            // Ensure newCoord is within bounds
            if (newCoord && newCoord.x >= 0 && newCoord.x < 10 && newCoord.y >= 0 && newCoord.y < 10) {
                // Check if the new position is valid
                if (city.cityGrid[this.policeCoord.x] && city.cityGrid[this.policeCoord.x][this.policeCoord.y]) {
                    city.cityGrid[this.policeCoord.x][this.policeCoord.y] = null;  // Clear the police's original position
                }
    
                this.policeCoord = newCoord;  // Update police position
                city.cityGrid[newCoord.x][newCoord.y] = this;  // Place police at new position
            }
        }
    }
}

module.exports = { Police }