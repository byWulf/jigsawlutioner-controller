import AbstractStation from '../AbstractStation.js';
import BrickPi from 'brickpi3';

export default class Sorter extends AbstractStation {

    getPrefix() {
        return 'sorter';
    }

    async configureEndpoints() {
        this.createEndpoint('reset', async (parameters, resolve) => {
            const pushMotor = await this.getMotor(parameters.pushMotor);
            const moveMotor = await this.getMotor(parameters.moveMotor);
            const boxMotor = await this.getMotor(parameters.boxMotor);

            await Promise.all([
                this.resetMotor(pushMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 30),
                this.resetMotor(moveMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 50),
                this.resetMotor(boxMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 70),
            ]);
        });

        this.createEndpoint('move-to-box', async (parameters, resolve) => {
            const pushMotor = await this.getMotor(parameters.pushMotor);
            const moveMotor = await this.getMotor(parameters.moveMotor);
            const boxMotor = await this.getMotor(parameters.boxMotor);

            await Promise.all([
                this.movePieceToCliff(moveMotor, pushMotor, parameters.offset),
                boxMotor.setPosition(parameters.box * -370)
            ]);

            resolve();

            await moveMotor.setPosition(-1300);

            await Promise.all([
                await pushMotor.setPosition(-100),
                await moveMotor.setPosition(-500),
            ])
        });
    }

    async movePieceToCliff(moveMotor, pushMotor, offset) {
        const offsetToMiddle = 270;
        const cmPerTeeth = 3.2 / 10; //https://www.brickowl.com/catalog/lego-gear-rack-4-3743
        const cmPerRotation = cmPerTeeth * 20; //https://www.brickowl.com/catalog/lego-gear-with-20-teeth-and-double-bevel-unreinforced-32269

        let offsetInDegree = offsetToMiddle + 360 * offset * (6/*cm plate height*/ / 2) / cmPerRotation;

        await moveMotor.setPosition(-offsetInDegree);

        await pushMotor.setPosition(-250);

        await moveMotor.setPosition(-1000);
    }
}
