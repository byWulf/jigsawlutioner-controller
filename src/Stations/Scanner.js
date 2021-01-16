import AbstractStation from '../AbstractStation.js';
import camera from '../camera.js';
import sharp from 'sharp';

export default class Scanner extends AbstractStation {
    getPrefix() {
        return 'scanner';
    }

    async configureEndpoints() {
        this.createEndpoint('take-photo', async (parameters, resolve) => {
            const photo = await camera.takeImage();

            const image = sharp(photo);

            const metadata = await image.metadata();

            let left = Math.floor((parameters.left || 0) / 100 * metadata.width);
            let top = Math.floor((parameters.top || 0) / 100 * metadata.height);
            let width = Math.floor(((parameters.right || 100) - (parameters.left || 0)) / 100 * metadata.width);
            let height = Math.floor(((parameters.bottom || 100) - (parameters.top || 0)) / 100 * metadata.height);

            const resizedPhoto = await image.extract({
                left: left,
                top: top,
                width: width,
                height: height
            }).resize(
                Math.floor((width / height) * (parseInt(parameters.width, 10) || metadata.width)),
                (parseInt(parameters.width, 10) || metadata.width)
            ).toBuffer();

            resolve(resizedPhoto, 'image/jpeg');
        });
    }
}
