import BrickPi from 'brickpi3';

export default new class BrickPiManager {
    constructor() {
        this.openedBrickPis = {};
        this.brickPiIndex = 1;
    }

    async getBrickPi(brickPiAddress) {
        if (typeof this.openedBrickPis[brickPiAddress] === 'undefined') {
            await BrickPi.set_address(this.brickPiIndex, brickPiAddress)
            this.openedBrickPis[brickPiAddress] = new BrickPi.BrickPi3(this.brickPiIndex);
            BrickPi.utils.resetAllWhenFinished(this.openedBrickPis[brickPiAddress]);

            this.brickPiIndex++;
        }

        return this.openedBrickPis[brickPiAddress];
    }
}
