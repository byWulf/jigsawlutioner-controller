import Express from 'express';

export default async function start(stationClass) {
    const app = Express();

    const station = new stationClass(app);
    await station.configureEndpoints();

    const serverPort = 3000;
    app.listen(serverPort, () => {
        console.log(`jigsawlutioner-controller-${station.constructor.name.toLowerCase()} listening at http://localhost:${serverPort}`)
    });
}