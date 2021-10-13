import BrickPiManager from './BrickPiManager.js';
import BrickPi from 'brickpi3';
import OnOff from 'onoff';
import Express from 'express';

export default class Controller {
    app;
    blocked;

    static requestIndex = 0;

    constructor(serverPort) {
        this.blocked = false;

        this.app = Express();

        this.app.listen(serverPort, () => {
            console.log(`Listening at http://localhost:${serverPort}`)
        });
    }

    createEndpoint(path, callback) {
        const url = '/' + path;
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
        const BP = await BrickPiManager.getBrickPi(motorParameters.address);

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
