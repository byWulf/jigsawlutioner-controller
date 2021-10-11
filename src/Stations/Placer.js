import AbstractStation from '../AbstractStation.js';
import BrickPi from 'brickpi3';

export default class Placer extends AbstractStation {

    getPrefix() {
        return 'placer';
    }

    async configureEndpoints() {
        this.createEndpoint('reset', async (parameters, resolve) => {
            const pushMotor = await this.getMotor(parameters.pushMotor);
            const moveMotor = await this.getMotor(parameters.moveMotor);
            const boardMotor = await this.getMotor(parameters.boardMotor);
            const plateMotor = await this.getMotor(parameters.plateMotor);

            await Promise.all([
                this.resetMotor(pushMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 30),
                this.resetMotor(moveMotor, BrickPi.utils.RESET_MOTOR_LIMIT.BACKWARD_LIMIT, 50),
                this.resetMotor(boardMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 70),
                this.resetMotor(plateMotor, BrickPi.utils.RESET_MOTOR_LIMIT.FORWARD_LIMIT, 50),
            ]);
        });

        this.createEndpoint('place', async (parameters, resolve) => {
            const pushMotor = await this.getMotor(parameters.pushMotor);
            const moveMotor = await this.getMotor(parameters.moveMotor);
            const boardMotor = await this.getMotor(parameters.boardMotor);
            const plateMotor = await this.getMotor(parameters.plateMotor);

            await Promise.all([
                (async () => {
                    await Promise.all([
                        this.movePieceToCliff(moveMotor, pushMotor, parameters.offset),
                        plateMotor.setPosition(0),
                    ]);
                    await Promise.all([
                        moveMotor.setPosition(900),
                        pushMotor.setPosition(-200),
                    ]);


                    resolve();

                    await Promise.all([
                        moveMotor.setPosition(1500),
                        plateMotor.setPosition(-670)
                    ]);
                })(),
                boardMotor.setPosition(Math.random() * -1000),
            ]);

            await plateMotor.setPosition(0);

            await Promise.all([
                pushMotor.setPosition(0),
                moveMotor.setPosition(500),
            ]);
        });
    }

    async movePieceToCliff(moveMotor, pushMotor, offset) {
        const offsetToMiddle = 270;
        const cmPerTeeth = 3.2 / 10; //https://www.brickowl.com/catalog/lego-gear-rack-4-3743
        const cmPerRotation = cmPerTeeth * 20; //https://www.brickowl.com/catalog/lego-gear-with-20-teeth-and-double-bevel-unreinforced-32269

        let offsetInDegree = offsetToMiddle + 360 * offset * (6/*cm plate height*/ / 2) / cmPerRotation;

        await moveMotor.setPosition(-offsetInDegree);

        await pushMotor.setPosition(-150);

        await moveMotor.setPosition(500);
    }
}
