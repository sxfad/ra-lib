/**
 * globalStorage
 * sessionStorage
 * localStorage
 *
 *  支持前缀区分
 *
 * @module 本地存储
 */

const globalData = {};
const globalStorage = {
    setItem: (key, value) => globalData[key] = value,
    getItem: key => globalData[key],
    removeItem: key => Reflect.deleteProperty(globalData, key),
};
const localStorage = window.localStorage;
const sessionStorage = window.sessionStorage;

export default class Storage {
    constructor({prefix = ''} = {}) {
        this.session = getStorage(prefix, sessionStorage);
        this.local = getStorage(prefix, localStorage);
        this.global = getStorage(prefix, globalStorage);
    }
}

function getStorage(prefix, storage) {
    return {
        /**
         * 存储数据
         * @param {string} key 数据的key
         * @param {*} value 要存储的数据
         */
        setItem(key, value) {
            key = prefix + key;
            value = JSON.stringify(value);
            storage.setItem(key, value);
        },
        /**
         * 获取数据
         * @param {string} key
         * @return {json} key 对应的数据
         */
        getItem(key) {
            key = prefix + key;
            let value = storage.getItem(key);

            if (value === 'undefined') return undefined;

            return JSON.parse(value);
        },

        /**
         * 删除数据
         * @param key
         */
        removeItem(key) {
            key = prefix + key;
            storage.removeItem(key);
        },

        /**
         * 根据prefix清空数据
         */
        clear() {
            const localStorageKeys = Object.keys(storage);
            if (localStorageKeys && localStorageKeys.length) {
                localStorageKeys.forEach(key => {
                    if (key.startsWith(prefix)) {
                        storage.removeItem(key);
                    }
                });
            }
        },

        /**
         * 根据keys 获取一组数据
         * @param {array} keys
         * @returns {{json}}
         */
        multiGet(keys) {
            let values = {};
            keys.forEach(key => values[key] = this.getItem(key));
            return values;
        },

        /**
         * 根据keys 删除一组数据
         * @param {array} keys
         */
        multiRemove(keys) {
            keys.forEach(key => this.removeItem(key));
        },
    };
}
