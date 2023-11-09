import Base from '../../lib/Base.js';
import util from '../../lib/util.js';


export default class CoreConfig extends Base {

    processes = 0;
    executable = '';
    startupTimeout = 0;
    idleTimeout = 0;
    liveTimeout = 0;
    singleProcess = false;
    showPaintRects = false;
    headless = false;
    pipe = false;
    renderer = '';
    useGPU = false;
    gpuLog = false;
    debug = false;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            processes: v => Number(util.defaultTo(v, 5)),
            executable: v => util.defaultTo(v, "chrome"),
            startupTimeout: v => Number(util.defaultTo(v, 30000)),
            idleTimeout: v => Number(util.defaultTo(v, 120000)),
            liveTimeout: v => Number(util.defaultTo(v, 3600000)),
            singleProcess: v => util.defaultTo(v, util.isLinux()),
            showPaintRects: v => util.defaultTo(v, false),
            headless: v => util.defaultTo(v, true),
            pipe: v => util.defaultTo(v, true),
            renderer: v => util.defaultTo(v, "angle"),
            useGPU: v => util.defaultTo(v, false),
            gpuLog: v => util.defaultTo(v, false),
            debug: v => util.defaultTo(v, false)
        }, {
            processes: util.isFinite,
            executable: util.isString,
            startupTimeout: util.isFinite,
            idleTimeout: util.isFinite,
            liveTimeout: util.isFinite,
            singleProcess: util.isBoolean,
            showPaintRects: util.isBoolean,
            headless: v => util.isBoolean(v) || util.isString(v),
            pipe: util.isBoolean,
            renderer: util.isString,
            useGPU: util.isBoolean,
            gpuLog: util.isBoolean,
            debug: util.isBoolean
        });
    }

    static create(value) {
        if (util.isUndefined(value)) return value;
        return CoreConfig.isInstance(value) ? value : new CoreConfig(value);
    }

    static isInstance(value) {
        return value instanceof CoreConfig;
    }

}