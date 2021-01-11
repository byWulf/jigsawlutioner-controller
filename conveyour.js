const app = require('express')();
const BrickPi = require('brickpi3');
const Gpio = require('onoff').Gpio;

/**
 * Configuration
 */
const serverPort = 3000;
const brickPiAddress = 'df9e6ac3514d355934202020ff112718';
const motorPort = 'A';
const sensorGpioPort = 4;

(async() => {
    await BrickPi.set_address(1, brickPiAddress)
    const BP = new BrickPi.BrickPi3(1);
    BrickPi.utils.resetAllWhenFinished(BP);

    const motor = BrickPi.utils.getMotor(BP, BP['PORT_' + motorPort]);
    let position = 0;

    const sensor = new Gpio(sensorGpioPort, 'in', 'both', {debounceTimeout: 10});

    app.get('/reset', async (req, res) => {
        console.log('Got request for resetting conveyour...');

        await motor.setPower(-50);

        let wasFree = false;
        sensor.watch(async (err, value) => {
            if (value === 1 && !wasFree) {
                wasFree = true;
            }

            if (value === 0 && wasFree) {
                sensor.unwatch();

                await motor.setPower(0);
                await motor.resetEncoder();
                position = 0;

                res.send();
                console.log('Conveyour resetted!');
            }
        });
    });

    app.get('/move-to-next-plate', async (req, res) => {
        console.log('Got request for moving to next plate...');

        const partsPerRotation = 10;
        const partsPerPlate = 6;

        position += (partsPerPlate / partsPerRotation * 360);

        await motor.setPosition(-position, 50);

        res.send();
        console.log('Moved to next plate!');
    });

    app.listen(serverPort, () => {
        console.log(`Conveyour controller listening at http://localhost:${serverPort}`)
    });
})();
