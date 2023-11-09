import puppeteer from 'puppeteer-core';
import EventBase from '../../lib/EventBase.js';
import CoreConfig from './CoreConfig.js';
import util from '../../lib/util.js';

const RENDERER_ARGS_MAP = {
    "gl": [
        "--use-gl=egl"
    ],
    "angle": [
        "--use-angle=gl-egl"
    ]
};

export default class Core extends EventBase {

    id = '';
    group = '';
    processes = new Map();
    config = {};
    target;
    createTime = 0;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            config: CoreConfig.create,
            idleTime: v => util.defaultTo(v, util.timestamp()),
            createTime: v => util.defaultTo(v, util.timestamp())
        }, {
            id: util.isString,
            group: util.isString,
            config: CoreConfig.isInstance,
        });
    }

    async init() {
        const {
            executable,
            headless,
            pipe,
            startupTimeout,
            debug
        } = this.config;
        let channel, executablePath;
        if (/\/|\\/.test(executable))
            executablePath = executable;
        else
            channel = executable;
        try {
            this.target = await puppeteer.launch({
                channel,
                executablePath,
                headless,
                ignoreHTTPSErrors: true,
                timeout: startupTimeout,
                dumpio: debug,
                pipe,
                userDataDir: './tmp/cache',
                waitForInitialPage: true,
                args: this.#generateArgs()
            });
            const version = await this.target.version();
            console.log(`chrome version: ${version}`);
        } catch (error) {
            console.error(error);
        }
    }

    #generateArgs() {
        const {
            singleProcess,
            showPaintRects,
            headless,
            useGPU,
            gpuLog,
            renderer
        } = this.config;
        return [
            singleProcess && util.isLinux() ? "--single-process" : "--process-per-tab",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--no-zygote",
            "--shm-size=5gb",
            "--hide-scrollbars",
            "--mute-audio",
            "--disable-timeouts-for-profiling",
            "--disable-dinosaur-easter-egg",
            "--disable-web-security",
            "--disable-ipc-flooding-protection",
            "--disable-background-networking",
            "--disable-backgrounding-occluded-windows",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--disable-backing-store-limit",
            "--disable-component-update",
            "--intensive-wake-up-throttling-policy=0",
            "--disable-domain-reliability",
            "--disable-popup-blocking",
            "--disable-sync",
            "--disable-breakpad",
            "--no-pings",
            "--font-render-hinting=none",
            "--no-default-browser-check",
            "--enable-crash-reporter",
            "--block-new-web-contents",
            "--noerrdialogs",
            `--crash-dumps-dir=.tmp/cache/crashpad`,
            "--enable-leak-detection",
            ...(gpuLog ? [
                "--enable-gpu-service-logging",
                "--enable-gpu-driver-debug-logging",
                "--enable-gpu-command-logging",
            ] : []),
            ...(showPaintRects ? [
                "--show-paint-rects"
            ] : []),
            ...(useGPU ? [
                ...(RENDERER_ARGS_MAP[renderer] || []),
                "--enable-unsafe-webgpu",
                "--ignore-gpu-blocklist",
                "--gpu-no-context-lost",
                "--enable-gpu-compositing",
                "--enable-gpu-rasterization",
                "--disable-gpu-driver-bug-workarounds",
                "--enable-native-gpu-memory-buffers",
                "--enable-accelerated-2d-canvas",
                "--enable-accelerated-jpeg-decoding",
                "--enable-accelerated-mjpeg-decode",
                "--enable-accelerated-video-decode",
                "--enable-zero-copy",
                "--enable-oop-rasterization",
                "--enable-gpu-memory-buffer-video-frames",
                "--enable-features=VaapiVideoDecoder,RawDraw,CanvasOopRasterization,PlatformHEVCDecoderSupport"
            ] : [
                "--use-angle=gl-egl",
                "--disable-gpu",
            ]),
            ...(headless ? [
                "--deterministic-mode",
                "--enable-surface-synchronization",
                "--disable-threaded-animation",
                "--disable-threaded-scrolling",
                "--disable-filter-imaging",
                "--disable-new-content-rendering-timeout",
                "--disable-image-animation-resync",

                "--enable-begin-frame-control",
                "--run-all-compositor-stages-before-draw"
            ] : [])
        ];
    }

    async dispatch() { }

    isUnavailable() { }

    isIDLETimeout() { }

    isIDLE() { }

    isReady() { }

    destory() { }
}