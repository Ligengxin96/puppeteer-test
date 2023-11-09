import Base from './Base.js';
import RendererConfig from '../core/renderer/RendererConfig.js';

class Config extends Base {

    renderer;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            renderer: RendererConfig.create,

        }, {
            renderer: RendererConfig.isInstance,
        });
    }

    load() { }

    update(config = {}) {
        this.renderer.update(config.renderer);
    }

    async save() {
        await this.renderer.save();
    }

}

export default new Config().load();