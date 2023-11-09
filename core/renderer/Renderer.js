import fs from 'fs-extra';
import Base from '../../lib/Base.js';
import RendererConfig from './RendererConfig.js';
import Core from './Core.js';


export default class Renderer extends Base {

    cores = new Map();
    config = {};
    #acquireCallbacks = {};
    #coreIndex = 1;

    constructor(options = {}) {
        super();

        this.optionsInject(options, {
            config: RendererConfig.create
        }, {
            config: RendererConfig.isInstance
        });
    }

    async init() {
        let cores = [];
        let parallel = [];
        const coreCacheDirExists = await fs.pathExists('./tmp/cache')
        for (let groupName in this.config.coreCounts) {
            this.#acquireCallbacks[groupName] = [];
            if (coreCacheDirExists)
                parallel.push(this.createCore(groupName));
            else
                cores.push(await this.createCore(groupName));
        }
        if (coreCacheDirExists)
            cores = await Promise.all(parallel);
        cores.forEach(core => this.pushCore(core));
        this.#dispatch();

    }

    pushCore(core) {
        this.cores.set(core.id, core);
    }

    async createCore(groupName) {
        const core = new Core({
            id: `core@${this.#coreIndex++}`,
            group: groupName,
            config: this.config.core
        });
        await core.init();
        return core;
    }

    getCores(groupName, filter) {
        const cores = [];
        for (let core of this.cores.values()) {
            if (core.group === groupName) {
                if (filter && !filter(core))
                    continue;
                cores.push(core);
            }
        }
        return cores;
    }

    getCoresCount(groupName, filter) {
        let count = 0;
        for (let core of this.cores.values()) {
            if (core.group === groupName) {
                if (filter && !filter(core))
                    continue;
                count++;
            }
        }
        return count;
    }


    #dispatch() {
        (async () => {
            const dispatchPromises = [];
            for (let core of this.cores.values()) {
                dispatchPromises.push((async () => {
                    await core.dispatch();
                    if (core.isUnavailable()) {
                        this.pushCore(await this.createCore(core.group));
                        this.removeCore(core);
                        await core.destory();
                    } else if (core.isIDLETimeout() && this.getCoresCount(core.group, v => v.isIDLE()) > 1) {
                        this.removeCore(core);
                        await core.destory();
                    } else if (core.isIDLE() && core.isLiveTimeout()) {
                        this.pushCore(await this.createCore(core.group));
                        this.removeCore(core);
                        await core.destory();
                    }
                })());
            }
            await Promise.all(dispatchPromises);
            for (let core of this.cores.values()) {
                if (!core.isReady()) continue;
                const callback = this.#acquireCallbacks[core.group].pop();
                callback && callback();
            }
        })()
            .finally(() => setTimeout(this.#dispatch.bind(this), 500))
    }
}