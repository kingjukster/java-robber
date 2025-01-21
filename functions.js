// Programmer: Terrell Heredia 
// Date: 1/20/25  
// File: main.js  
// Assignment: FUN  
// Purpose: This file contains a cops vs robbers functions

class City {
    constructor(cityGrid, jewelCount) { 
        cityGrid = new Array(10);
        for (var i = 0; i < cityGrid.length; i++) {
            cityGrid[i] = new Array(10)
        }
        this.cityGrid = cityGrid;
        this.jewelCount = jewelCount;
     }
}

class Jewel {
    constructor(jewelValue, jewelCoord) {
        this.jewelValue = jewelValue;
        this.jewelCoord =  jewelCoord;
    }
}

class Robber {
    constructor(robberId, robberCoord, lootBag, totalLootWorth, isActive, robberType) {
        this.robberId = robberId;
        this.robberCoord = robberCoord;
        this.lootBag = lootBag;
        this.totalLootWorth= totalLootWorth;
        this.isActive = isActive;
        this.robberType = robberType;
    }
    checkBag() {
        const maxCap = 17;
        for (var i = 0; i < maxCap; i++){
            if (this.lootBag[i] == null){
                return i;
            }
        }
        return -1;
    }
    pickUpLoot(jewel) {
        nextSpot = this.checkBag();
        if (nextSpot != -1) {
            this.lootBag[nextSpot] = jewel;
        }
    }
    move() {
        NW = {x : this.robberCoord.x - 1, y : this.robberCoord.y + 1}
        N = {x : this.robberCoord.x, y : this.robberCoord.y + 1}
        NE = {x : this.robberCoord.x + 1, y : this.robberCoord.y + 1}
        W = {x : this.robberCoord.x - 1, y : this.robberCoord.y}
        E = {x : this.robberCoord.x + 1, y : this.robberCoord.y}
        SW = {x : this.robberCoord.x - 1, y : this.robberCoord.y - 1}
        S = {x : this.robberCoord.x, y : this.robberCoord.y - 1}
        SE = {x : this.robberCoord.x + 1, y : this.robberCoord.y - 1}
        directions = [NW, N, NE, W, E, SW, S, SE]
        do{
            direction = directions[Math.floor(Math.random()*8)]
        }while(direction.x < 0 || direction.x >= 10 || direction.y < 0 || direction.y >= 10)
        this.robberCoord.x = direction.x;
        this.robberCoord.y = direction.y;
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
        robber.isActive = false;
        this.lootWorth += robber.totalLootWorth;
        this.robbersCaught += 1;
    }
    move() {
        NW = {x : this.policeCoord.x - 1, y : this.policeCoord.y + 1}
        N = {x : this.policeCoord.x, y : this.policeCoord.y + 1}
        NE = {x : this.policeCoord.x + 1, y : this.policeCoord.y + 1}
        W = {x : this.policeCoord.x - 1, y : this.policeCoord.y}
        E = {x : this.policeCoord.x + 1, y : this.policeCoord.y}
        SW = {x : this.policeCoord.x - 1, y : this.policeCoord.y - 1}
        S = {x : this.policeCoord.x, y : this.policeCoord.y - 1}
        SE = {x : this.policeCoord.x + 1, y : this.policeCoord.y - 1}
        directions = [NW, N, NE, W, E, SW, S, SE]
        do{
            direction = directions[Math.floor(Math.random()*8)]
        }while(direction.x < 0 || direction.x >= 10 || direction.y < 0 || direction.y >= 10)
        this.policeCoord.x = direction.x;
        this.policeCoord.y = direction.y;
    }
}