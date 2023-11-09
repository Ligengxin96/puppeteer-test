import 'colors';
import os from 'os';
import lodash from 'lodash';
import { v1 as uuid } from 'uuid';
import uniqid from 'uniqid';
import randomstring from 'randomstring';

const autoIdMap = new Map();

const util = {

    ...lodash,

    uuid: (separator = true) => separator ? uuid() : uuid().replace(/\-/g, ""),

    uniqid,

    autoId: (prefix = "") => {
        let index = autoIdMap.get(prefix);
        if (index > 999999) index = 0;
        autoIdMap.set(prefix, (index || 0) + 1);
        return `${prefix}${index || 1}`;
    },

    generateRandomString(options) {
        return randomstring.generate(options);
    },

    optionsInject(that, options, initializers = {}, checkers = {}) {
        Object.keys(that).forEach(key => {
            if (/^\_/.test(key)) return;
            let value = options[key];
            if (util.isFunction(initializers[key]))
                value = initializers[key](value);
            if (util.isFunction(checkers[key]) && !checkers[key](value))
                throw new Error(`parameter ${key} invalid`);
            if ((!util.isFunction(initializers[key]) && !util.isFunction(checkers[key])) || util.isUndefined(value))
                return;
            if (util.isSymbol(that[key]) && !util.isSymbol(value))
                return;
            that[key] = value;
        });
    },


    isLinux() {
        return os.platform() !== "win32";
    },

    timestamp() {
        return Date.now();
    },
};

export default util;