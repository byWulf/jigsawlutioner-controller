import brickPiManager from './brickPiManager.js';
import BrickPi from 'brickpi3';
import OnOff from 'onoff';

export default class AbstractStation {
    app;
    blocked;

    static requestIndex = 0;

    constructor(app) {
        this.app = app;
        this.blocked = false;
    }

    getPrefix() {
        throw new Error('"getPrefix" method must be implemented.');
    }

    configureEndpoints() {
        throw new Error('"configureEndpoints" method must be implemented.');
    }

    createEndpoint(path, callback) {
        const url = '/' + this.getPrefix() + '/' + path;
        this.app.get(url, async (request, response) => {
            const thisRequestIndex = AbstractStation.requestIndex++;
            console.log('#' + thisRequestIndex + ' - Got request for ' + url + ' with parameters ',request.query);

            await this.aquireBlock();

            let ended = false;
            await callback(request.query, (responseContent, responseType) => {
                if (typeof responseType !== 'undefined') {
                    response.contentType(responseType);
                }
                response.end(responseContent);
                ended = true;

                console.log('#' + thisRequestIndex + ' - Sent response.');
            });

            if (!ended) {
                response.end();
            }

            console.log('#' + thisRequestIndex + ' - Finished request.');

            this.releaseBlock();
        });

        console.log(url + ' registered.');
    }

    aquireBlock() {
        return new Promise((resolve) => {
            if (!this.blocked) {
                this.blocked = true;
                resolve();

                return;
            }

            const interval = setInterval(() => {
                if (!this.blocked) {
                    this.blocked = true;
                    clearInterval(interval);
                    resolve();
                }
            }, 25);
        })
    }

    releaseBlock() {
        this.blocked = false;
    }

    /**
     * @return {Promise<Motor>}
     */
    async getMotor(motorParameters) {
        const BP = await brickPiManager.getBrickPi(motorParameters.address);

        return BrickPi.utils.getMotor(BP, BP['PORT_' + motorParameters.port]);
    }

    /**
     * @returns {Promise<Gpio>}
     */
    async getSensor(sensorParameters) {
        return new OnOff.Gpio(sensorParameters.pin, 'in', 'both', {debounceTimeout: 10});
    }

    async resetMotor(motor, direction, power) {
        for (let i = 0; i < 3; i++) {
            await BrickPi.utils.resetMotorEncoder(motor.BP, motor.port, direction, 0, 10, 20000, power);
        }
        await motor.setPower(0);
    }

}
