import AbstractStation from '../AbstractStation.js';
import BrickPi from "brickpi3";

export default class Motor extends AbstractStation {
    getPrefix() {
        return 'motor';
    }

    async configureEndpoints() {
        this.createEndpoint('reset', async (parameters) => {
            const motor = await this.getMotor(parameters.motor);

            await this.resetMotor(motor, parameters.direction === 'forward' ? BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT : BrickPi.utils.RESET_MOTOR_LIMIT.BACKWARD_LIMIT, parameters.power);
        });

        this.createEndpoint('position', async (parameters) => {
            const motor = await this.getMotor(parameters.motor);

            await motor.setPosition(parameters.position, parameters.power);
        });
    }
}
