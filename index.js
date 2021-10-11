import Conveyor from './src/Stations/Conveyor.js';
import Scanner from './src/Stations/Scanner.js';
import Rotator from './src/Stations/Rotator.js';
import Sorter from './src/Stations/Sorter.js';
import Picker from './src/Stations/Picker.js';
import Placer from './src/Stations/Placer.js';
import Motor from './src/Stations/Motor.js';

import Express from 'express';

(async () => {
    const app = Express();

    const stationClasses = [
        Conveyor,
        Scanner,
        Rotator,
        Sorter,
        Picker,
        Placer,
        Motor,
    ];

    for (let i = 0; i < stationClasses.length; i++) {
        const station = new stationClasses[i](app);

        await station.configureEndpoints();
    }

    const serverPort = 3000;
    app.listen(serverPort, () => {
        console.log(`jigsawlutioner-controller listening at http://localhost:${serverPort}`)
    });
})();


