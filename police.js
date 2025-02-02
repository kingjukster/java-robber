const { Robber } = require('./robber');

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

module.exports = { Police }