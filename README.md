# jigsawlutioner-controller

## Create controller

```javascript
import Controller from 'jigsawlutioner-controller/Controller.js';

const controller = new Controller(3000);

controller.createEndpoint('foobar', async(parameters, resolve) => {
    await sleep(parameters.sleep1);
    
    resolve();
    
    await sleep(parameters.sleep2);
});
```