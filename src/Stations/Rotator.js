import AbstractStation from '../AbstractStation.js';
import BrickPi from 'brickpi3';

export default class Rotator extends AbstractStation {
    getPrefix() {
        return 'rotator';
    }

    async configureEndpoints() {
        this.createEndpoint('reset', async (parameters, resolve) => {
            const motor = await this.getMotor(parameters.pushMotor);

            for (let i = 0; i < 3; i++) {
                await BrickPi.utils.resetMotorEncoder(motor.BP, motor.port, BrickPi.utils.RESET_MOTOR_LIMIT.BACKWARD_LIMIT, -50, 10, 10000, 30);
            }
            await motor.setPower(0);
        });

        this.createEndpoint('rotate', async (parameters, resolve) => {
            let rotateConversion = 60/12;
            let extraRotate = 2;

            let degree = parseInt(parameters.degree, 10);

            while (degree > 180) degree -= 360;
            while (degree < -180) degree += 360;

            if (degree < 0) degree -= extraRotate;
            if (degree > 0) degree += extraRotate;

            const pushMotor = await this.getMotor(parameters.pushMotor);
            const rotateMotor = await this.getMotor(parameters.rotateMotor);

            await pushMotor.setPosition(270);
            await rotateMotor.setPosition(degree * rotateConversion);

            await pushMotor.setPosition(150);
            await pushMotor.setPower(0);

            resolve();

            await rotateMotor.setPosition(0);
            await rotateMotor.setPower(0);
        });
    }
}
