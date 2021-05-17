import {useState, useEffect, useRef, useCallback} from 'react';
import useDebounceEffect from './useDebounceEffect';

/**
 * ajax hooks
 * 1. 提供 {run, loading, data, error}数据
 * 2. 自动清除未完成请求
 *
 */
export default function createHooks(ajax) {
    const create = (method) => (...args) => {
        let [url, initParams, refreshDeps, initOptions = {}] = args;
        if (!initParams) initParams = {};

        if (args.length === 3) {
            if (
                refreshDeps && typeof refreshDeps === 'object' && !Array.isArray(refreshDeps)
                || typeof refreshDeps === 'function'
            ) {
                initOptions = refreshDeps;
                refreshDeps = null;
            }
        }

        if (!initOptions) initOptions = {};

        let formatParams = args => args;
        let formatResult = args => args;
        let formatError = args => args;
        let setLoading = () => void 0;

        if (typeof initOptions === 'object') {
            formatResult = initOptions.formatResult || formatResult;
            formatError = initOptions.formatError || formatError;
            setLoading = initOptions.setLoading || setLoading;
        }

        if (typeof initOptions === 'function') {
            formatResult = initOptions;
            initOptions = {};
        }

        const {mountFire = true, debounce = true} = initOptions;

        // 用于取消ajax
        const ajaxHandler = useRef(null);

        // 合并成一个对象，一次性进行setState，减少render次数
        const [result, setResult] = useState({
            loading: false,
            data: undefined,
            error: null,
        });

        /**
         * 发起ajax请求的方法
         * @param params
         * @param options
         * @returns {Promise}
         */
        const run = useCallback((params, options = {}) => {
                params = formatParams(params);
                // 对象参数合并
                if (!params) params = initParams;
                if (params && typeof params === 'object' && !Array.isArray(params)) {
                    params = {...initParams, ...params};
                }

                // 处理url中的参数 「:id」或「{id}」
                // 将params中对应key的数据拼接到url上
                const urls = url.split('/');
                const _url = urls
                    .map((item) => {
                        if (!item.startsWith(':') && !item.startsWith('{')) return item;

                        const key = item.replace(':', '').replace('{', '').replace('}', '');

                        // 如果参数不是object 直接将params作为value
                        if (typeof params !== 'object') {
                            const value = params;
                            params = null;

                            return value;
                        }

                        if (!(key in params)) throw Error(`缺少「${key}」参数`);

                        return params[key];

                        // const value = params[key];
                        // Reflect.deleteProperty(params, key);
                        //
                        // return value;
                    })
                    .join('/');

                const mergedOptions = {...initOptions, ...options};

                setResult(result => ({...result, loading: true, error: null}));

                // 多个请求共用一个loading状态， 使用 __count 记录 发起的loading数量，当 __count === 0 时才调用setLoading(false)
                setLoading(true);
                setLoading.__count = (setLoading.__count || 0) + 1;

                // 此处真正发起的ajax请求，ajaxToken 是一个promise
                const ajaxToken = ajaxHandler.current = ajax[method](_url, params, {reject: true, ...mergedOptions});

                ajaxToken
                    .then((res) => {
                        const data = formatResult(res);

                        setResult({data, loading: false, error: null});

                        setLoading.__count = (setLoading.__count || 0) - 1;
                        if (setLoading.__count === 0) setLoading(false);

                        return data;
                    })
                    .catch((res) => {
                        const error = formatError(res);

                        setResult({data: undefined, error, loading: false});

                        setLoading.__count = (setLoading.__count || 0) - 1;
                        if (setLoading.__count === 0) setLoading(false);

                        return error;
                    })
                    .finally(() => {
                        // 结束时清除token
                        ajaxHandler.current = null;
                    });
                return ajaxToken;
            },
            [url, initOptions],
        );

        // 组件被卸载，清除未完成的ajax请求 对于hooks 不清除好像也不会报警告
        useEffect(() => () => {
            if (ajaxHandler.current) {
                ajaxHandler.current.cancel();
                ajaxHandler.current = null;
            }
        }, []);


        // 监听 refreshDeps 自动触发请求
        useDebounceEffect(() => {
            if (!refreshDeps) return;
            run();
        }, refreshDeps || [], mountFire, debounce);

        return {run, ...result};
    };

    return {
        useGet: create('get'),
        usePost: create('post'),
        usePut: create('put'),
        useDel: create('del'),
        usePatch: create('patch'),
    };
}
