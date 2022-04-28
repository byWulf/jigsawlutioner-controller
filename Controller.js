import BrickPiManager from './BrickPiManager.js';
import BrickPi from 'brickpi3';
import OnOff from 'onoff';
import Express from 'express';

export default class Controller {
    app;
    blocked;

    requestIndex = 0;

    constructor(serverPort) {
        this.blocked = false;

        this.app = Express();

        this.app.listen(serverPort, () => {
            console.log(`Listening at http://localhost:${serverPort}`)
        });

        this.app.get('/up', (request, response) => {
            response.status(201);
            response.end();
        });
    }

    createEndpoint(path, callback) {
        const url = '/' + path;
        this.app.get(url, async (request, response) => {
            const thisRequestIndex = this.requestIndex++;
            console.log('#' + thisRequestIndex + ' - Got request for ' + url + ' with parameters ',request.query);

            await this.aquireBlock();

            let ended = false;
            try {
                await callback(request.query, (responseContent, responseType) => {
                    if (typeof responseType !== 'undefined') {
                        response.contentType(responseType);
                    }
                    response.end(responseContent);
                    ended = true;

                    console.log('#' + thisRequestIndex + ' - Sent response.');
                });
            } catch (error) {
                response.status(500);
                response.send(error.message);

                console.log('#' + thisRequestIndex + ' - Request failed: ', error);
            }

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
    async getMotor(parameters, motorName) {
        const motorParameters = parameters[motorName];

        if (typeof motorParameters === 'undefined' || typeof motorParameters.port === 'undefined') {
            throw new Error('Parameter "' + motorName + '[port]" was missing from the call.');
        }

        const BP = await BrickPiManager.getBrickPi(motorParameters.address);

        return BrickPi.utils.getMotor(BP, BP['PORT_' + motorParameters.port]);
    }

    /**
     * @returns {Promise<Gpio>}
     */
    async getSensor(parameters, sensorName) {
        const sensorParameters = parameters[sensorName];

        if (typeof sensorParameters === 'undefined' || typeof sensorParameters.pin === 'undefined') {
            throw new Error('Parameter "' + sensorName + '[pin]" was missing from the call.');
        }

        return new OnOff.Gpio(sensorParameters.pin, 'in', 'both', {debounceTimeout: 10});
    }

    /**
     * @returns {Promise<Gpio>}
     */
    async getOutputPin(parameters, outputName) {
        const sensorParameters = parameters[outputName];

        if (typeof sensorParameters === 'undefined' || typeof sensorParameters.pin === 'undefined') {
            throw new Error('Parameter "' + outputName + '[pin]" was missing from the call.');
        }

        return new OnOff.Gpio(sensorParameters.pin, 'out',);
    }

    async resetMotor(motor, direction, power) {
        for (let i = 0; i < 3; i++) {
            await BrickPi.utils.resetMotorEncoder(motor.BP, motor.port, direction, 0, 10, 20000, power);
        }
        await motor.setPower(0);
    }
}
