import AbstractStation from '../AbstractStation.js';

export default class Conveyor extends AbstractStation {
    getPrefix() {
        return 'conveyor';
    }

    async configureEndpoints() {
        this.createEndpoint('reset', async (parameters, resolve) => {
            const motor = await this.getMotor(parameters.motor);
            const sensor = await this.getSensor(parameters.sensor);

            await motor.setPower(-50);

            await this.waitUntilNextPlate(sensor);

            await motor.setPower(0);

            await motor.resetEncoder();

            if (parameters.additionalForward) {
                await motor.setPosition(-parseInt(parameters.additionalForward, 10), 50);
                await motor.setPower(0);
                await motor.resetEncoder();
            }
        });

        this.createEndpoint('move-to-next-plate', async (parameters, resolve) => {
            const partsPerRotation = 10;
            const partsPerPlate = 6;

            const movement= -(partsPerPlate / partsPerRotation * 360);

            const motor = await this.getMotor(parameters.motor);

            await motor.setPosition(movement, 50);
            await motor.setPower(0);

            await motor.setEncoder(movement);
        });
    }

    async waitUntilNextPlate(sensor) {
        return new Promise((resolve) => {
            let wasFree = false;

            sensor.watch(async (err, value) => {
                if (value === 1 && !wasFree) {
                    wasFree = true;
                }

                if (value === 0 && wasFree) {
                    sensor.unwatch();
                    resolve();
                }
            });
        });
    }
}
