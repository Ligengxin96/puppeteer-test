import path from 'path';

import fs from 'fs-extra';
import beautify from 'json-beautify';

import Base from '../../lib/Base.js';
import CoreConfig from './CoreConfig.js';
import util from '../../lib/util.js';


const CONFIG_PATH = path.join(path.resolve(), 'configs/', 'development', "/renderer.json");

export default class RendererConfig extends Base {

    fps = 0;
    videoCodec = '';
    videoFormat = '';
    videoQuality = 0;
    audioCodec = '';
    coverFormat = '';
    frameFormat = '';
    frameQuality = 0;
    pixelFormat = '';
    frameBuffersSize = 0;
    cores = 0;
    core = {};
    process = {};
    transitionMap = {};
    debug = false;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            fps: v => Number(util.defaultTo(v, 60)),
            videoCodec: v => util.defaultTo(v, "libx264"),
            videoFormat: v => util.defaultTo(v, "mp4"),
            videoQuality: v => Number(util.defaultTo(v, 80)),
            audioCodec: v => util.defaultTo(v, "aac"),
            coverFormat: v => util.defaultTo(v, "jpg"),
            frameFormat: v => util.defaultTo(v, "jpeg"),
            frameQuality: v => Number(util.defaultTo(v, 80)),
            pixelFormat: v => util.defaultTo(v, "yuv420p"),
            frameBuffersSize: v => Number(util.defaultTo(v, 10)),
            cores: v => util.isObject(v) ? v : Number(util.defaultTo(v, 5)),
            core: v => CoreConfig.create(util.defaultTo(v, {})),
            transitionMap: v => util.defaultTo(v, {}),
            debug: v => util.defaultTo(v, false)
        }, {
            fps: util.isFinite,
            videoCodec: RendererConfig.isSupportVideoCodec,
            videoFormat: util.isString,
            videoQuality: util.isFinite,
            audioCodec: RendererConfig.isSupportAudioCodec,
            coverFormat: util.isString,
            frameFormat: util.isString,
            frameQuality: util.isFinite,
            pixelFormat: util.isString,
            frameBuffersSize: util.isFinite,
            cores: v => util.isObject(v) || util.isFinite(v),
            core: CoreConfig.isInstance,
            transitionMap: util.isObject,
            debug: util.isBoolean
        });
    }

    update(config = {}) {
        try {
            const _config = new RendererConfig(util.merge({ ...this }, config));
            util.merge(this, _config);
        }
        catch (err) {
            throw new Error("renderer config invalid")
        }
    }

    checkCoreGroupNameSupport(groupName) {
        return util.isString(groupName) && util.isFinite(this.coreCounts[groupName]);
    }

    getFirstCoreGroupName() {
        return this.coreGroupNames[0];
    }

    get coreCounts() {
        let coreCounts = {};
        if (util.isFinite(this.cores))
            coreCounts["default"] = this.cores;
        else if (util.isObject(this.cores))
            coreCounts = this.cores;
        return coreCounts;
    }

    get coreGroupNames() {
        return Object.keys(this.coreCounts);
    }

    async save(filePath) {
        filePath = filePath || CONFIG_PATH;
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, beautify(this, null, 4));
    }

    static load(filePath) {
        filePath = filePath || CONFIG_PATH;
        if (!fs.pathExistsSync(filePath)) return new RendererConfig();
        const data = fs.readJSONSync(filePath);
        return new RendererConfig(data);
    }

    static create(value) {
        if (util.isUndefined(value)) return value;
        return RendererConfig.isInstance(value) ? value : new RendererConfig(value);
    }

    static isInstance(value) {
        return value instanceof RendererConfig;
    }

}