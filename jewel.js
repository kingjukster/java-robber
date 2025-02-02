class Jewel {
    constructor(jewelCoord) {
        this.jewelValue = jewelCoord.x + jewelCoord.y;
        this.jewelCoord = jewelCoord;
    }
}

module.exports = {Jewel}