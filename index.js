import Renderer from './core/renderer/Renderer.js';
import fstat from 'fs-extra';


(async () => {
    const renderConfig = fstat.readJSONSync('./configs/development/renderer.json');
    const renderer = new Renderer({ config: renderConfig });
    await renderer.init();
})()
    .catch(err => {
        console.error("system error:", err);
        process.exit(1);
    });