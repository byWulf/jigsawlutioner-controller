import BrickPi from 'brickpi3';
import keypress from 'keypress';

let currentBoard = 3;
let BPs = [];
let BP;

function letUserControlMotors() {
    let mapping = [
        {label: 'A', motor: BrickPi.utils.getMotor(BP, BP.PORT_A), power: 0, keyForward: 'q', keyBackward: 'a'},
        {label: 'B', motor: BrickPi.utils.getMotor(BP, BP.PORT_B), power: 0, keyForward: 'w', keyBackward: 's'},
        {label: 'C', motor: BrickPi.utils.getMotor(BP, BP.PORT_C), power: 0, keyForward: 'e', keyBackward: 'd'},
        {label: 'D', motor: BrickPi.utils.getMotor(BP, BP.PORT_D), power: 0, keyForward: 'r', keyBackward: 'f'}
    ];

    keypress(process.stdin);
    process.stdin.on('keypress', async function (ch, key) {
        if (key && key.ctrl && key.name === 'c') {
            process.stdin.pause();
        }

        for (let address in BPs) {
            if (key && key.name === ''+address) {
                BP = BPs[address];

                console.log('Switched to board ' + address);
            }
        }

        for (let i = 0; i < mapping.length; i++) {
            if (key && (key.name === mapping[i].keyForward || key.name === mapping[i].keyBackward)) {
                if (key.name === mapping[i].keyForward) {
                    mapping[i].power += 10;
                    if (mapping[i].power > 100) mapping[i].power = 100;
                }
                if (key.name === mapping[i].keyBackward) {
                    mapping[i].power -= 10;
                    if (mapping[i].power < -100) mapping[i].power = -100;
                }

                await mapping[i].motor.setPower(mapping[i].power);
                if (mapping[i].power === 0) {
                    console.log('Encoder of ' + mapping[i].label + ' now: ', await mapping[i].motor.getEncoder());
                }
            }
        }
    });
    process.stdin.setRawMode(true);
    process.stdin.resume();
}

const boards = {
    3: '09F95596514D32384E202020FF0F272F',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {

    await BrickPi.set_address(1, '09F95596514D32384E202020FF0F272F');
    const bp = new BrickPi.BrickPi3(1);
    BrickPi.utils.resetAllWhenFinished(bp);

    const motor = BrickPi.utils.getMotor(bp, bp.PORT_D);
    const second = BrickPi.utils.getMotor(bp, bp.PORT_C);
    const pusher = BrickPi.utils.getMotor(bp, bp.PORT_B);

    await pusher.setDps(600);

    await Promise.all([
        new Promise(async (resolve) => {
            while (true) {
                await second.setDps(200);
                await wait(500);
                // await second.setDps(0);
                // await wait(1000);
            }
        }),
        new Promise(async (resolve) => {
            while (true) {
                await motor.setDps(200);
                await wait(1000);
                await motor.setDps(0);
                await wait(1000);
            }
        }),
    ])


})();
