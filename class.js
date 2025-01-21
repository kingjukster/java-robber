// Programmer: Terrell Heredia 
// Date: 1/20/25  
// File: main.js  
// Assignment: FUN  
// Purpose: This file contains a cops vs robbers functions

class City {
    constructor(cityGrid, jewelCount) { 
        if (!cityGrid) {
            cityGrid = new Array(10);
            for (var i = 0; i < cityGrid.length; i++) {
                cityGrid[i] = new Array(10);
            }
        }
        this.cityGrid = cityGrid;
        this.jewelCount = jewelCount;
    }
    populateGrid(){//not finished
        options = ["J", "R", "P"];
        for ( var x = 0; x < 10; x++) {
            for ( var y = 0; y < 10; y++) {
                choice = options[Math.floor(Math.random() * 3)];
                this.cityGrid[x][y] = choice;

            }
        }
    }
}

class Jewel {
    constructor(jewelCoord) {
        this.jewelValue = jewelCoord.x + jewelCoord.y;
        this.jewelCoord =  jewelCoord;
    }
}

class Robber {
    constructor(robberId, robberCoord, lootBag, isActive, robberType) {
        this.robberId = robberId;
        this.robberCoord = robberCoord;
        this.lootBag = lootBag;
        this.totalLootWorth= 0;
        this.isActive = isActive;
        this.robberType = robberType;
        this.maxCap = 17;
        this.consecutiveMoves = 0;
    }
    checkBag() {
        for (var i = 0; i < this.maxCap; i++) {
            if (this.lootBag[i] == null){
                return i;
            }
        }
        return -1;
    }
    personalWorth(){
        worth = 0;
        for (var i = 0; i < this.maxCap; i++) {
            worth += this.lootBag[i];
        }
        return worth;
    }
    pickUpLoot(jewel) {
        nextSpot = this.checkBag();
        if (nextSpot != -1) {
            this.lootBag[nextSpot] = jewel;
            this.totalLootWorth += jewel.jewelValue;
        }
    }
    move() {
        if (cityGrid[this.robberCoord.x][this.robberCoord.y] == "J") {
            jewel = cityGrid[this.robberCoord.x][this.robberCoord.y]
            cityGrid[this.robberCoord.x][this.robberCoord.y] = null;
            this.pickUpLoot(jewel);
            if (this.robberType == "greedy" && jewel.jewelValue % 2 == 0) {
                if (this.consecutiveMoves < 3) {
                    this.performMove();
                    this.consecutiveMoves++
                }
            }else {
                this.performMove();
                this.consecutiveMoves = 0;
            }
        }else if (cityGrid[this.robberCoord.x][this.robberCoord.y] == "P") {
            police.arrestRobber();
            worth = this.personalWorth();
            this.totalLootWorth -= worth;
            this.isActive = false
        }else if(cityGrid[this.robberCoord.x][this.robberCoord.y] == "R") {
            if (this.robberType == "greedy") {
                if (this.checkBag() == -1) {
                    loss = Math.floor(this.maxCap / 2);
                }else {
                    loss = Math.floor(this.checkBag / 2);
                }
                for (loss; loss != 0; loss--) {
                    this.totalLootWorth -= this.lootBag[loss].jewelValue;
                    this.lootBag[loss] = null;
                }
            }
        }
    }
    performMove() {
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
        this.lootWorth += robber.totalLootWorth;
        this.robbersCaught += 1;
    }
    move() {
        this.performMove();
        if (cityGrid[this.policeCoord.x][this.policeCoord.y] == "R") {
            robber = cityGrid[this.policeCoord.x][this.policeCoord.y]
            cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
            this.arrestRobber(robber);
        }else if (cityGrid[this.policeCoord.x][this.policeCoord.y] == "J") {
            jewel = cityGrid[this.policeCoord.x][this.policeCoord.y]
            cityGrid[this.policeCoord.x][this.policeCoord.y] = null;
            this.lootWorth += jewel.jewelValue;
        }
    }
    performMove() {
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