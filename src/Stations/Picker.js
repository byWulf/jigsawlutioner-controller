import AbstractStation from '../AbstractStation.js';

export default class Picker extends AbstractStation {
    getPrefix() {
        return 'picker';
    }

    async configureEndpoints() {


        this.createEndpoint('ruetteln', async (parameters, resolve) => {

            const motor = await this.getMotor(parameters.motor);

            await motor.setPower(-100);
        });
    }
}
