import Conveyor from './src/Stations/Conveyor.js';
//import Scanner from './src/Stations/Scanner.js';
import Rotator from './src/Stations/Rotator.js';

import Express from 'express';

(async () => {
    const app = Express();

    const stationClasses = [
        Conveyor,
        //Scanner,
        Rotator
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


