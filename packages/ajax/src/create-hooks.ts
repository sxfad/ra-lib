import { useState, useEffect, useRef, useCallback } from 'react';
import useDebounceEffect from './useDebounceEffect';


const isObject = value => value && typeof value === 'object' && !Array.isArray(value);

/**
 * ajax hooks
 * 1. 提供 {run, loading, data, error}数据
 * 2. 自动清除未完成请求
 *
 */
export default function createHooks(ajax) {
    const create = (method) => (...args) => {
        let [ url, initParams, refreshDeps, initOptions = {} ] = args;
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

        const formatParams = a => a;
        let formatResult = a => a;
        let formatError = a => a;
        let trigger = (a?: any) => a;

        if (typeof initOptions === 'object') {
            formatResult = initOptions.formatResult || formatResult;
            formatError = initOptions.formatError || formatError;
            trigger = initOptions.trigger || trigger;
        }

        if (typeof initOptions === 'function') {
            formatResult = initOptions;
            initOptions = {};
        }

        const { debounce = true } = initOptions;

        const mountFire = !('mountFire' in initOptions) ? true : !!initOptions.mountFire;

        // 用于取消ajax
        const ajaxHandler = useRef(null);

        // 合并成一个对象，一次性进行setState，减少render次数
        const [ result, setResult ] = useState({
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
        const run = useCallback((params?: any, options?: any) => {
                let myParams = formatParams(params);
                // 对象参数合并
                if (!myParams) myParams = initParams;
                if (
                    isObject(myParams)
                    && isObject(initParams)
                    && !(myParams instanceof FormData)
                ) {
                    myParams = { ...initParams, ...myParams };
                }

                // 处理url中的参数 「:id」或「{id}」
                // 将params中对应key的数据拼接到url上
                const urls = url.split('/');
                const _url = urls
                    .map((item) => {
                        if (!item.startsWith(':') && !item.startsWith('{')) return item;

                        const key = item.replace(':', '').replace('{', '').replace('}', '');

                        // 如果参数不是object 直接将params作为value
                        if (typeof myParams !== 'object') {
                            const value = myParams;
                            myParams = null;

                            return value;
                        }

                        if (!(key in myParams)) throw Error(`缺少「${key}」参数`);

                        return myParams[key];
                    })
                    .join('/');

                const mergedOptions = { ...initOptions, ...options };

                // eslint-disable-next-line @typescript-eslint/no-shadow
                setResult(result => ({ ...result, loading: true, error: null }));

                // 此处真正发起的ajax请求，ajaxToken 是一个promise
                ajaxHandler.current = ajax[method](_url, myParams, { reject: true, ...mergedOptions });
                const ajaxToken = ajaxHandler.current;

                ajaxToken
                    .then((res) => {
                        const data = formatResult(res);

                        setResult({ data, loading: false, error: null });

                        return data;
                    })
                    .catch((res) => {
                        const error = formatError(res);

                        setResult({ data: undefined, error, loading: false });

                        throw error;
                    })
                    .finally(() => {
                        // 结束时清除token
                        ajaxHandler.current = null;
                    });
                return ajaxToken;
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [
                url,
                // eslint-disable-next-line react-hooks/exhaustive-deps
                JSON.stringify(initParams),
                // eslint-disable-next-line react-hooks/exhaustive-deps
                JSON.stringify(initOptions),
            ],
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
            // 依赖不存在，不触发
            if (!refreshDeps) return;
            // trigger 函数返回false，不触发
            if (trigger() === false) return;
            run();
        }, refreshDeps || [], mountFire, debounce);

        return { run, ...result };
    };

    return {
        useGet: create('get'),
        usePost: create('post'),
        usePut: create('put'),
        useDel: create('del'),
        usePatch: create('patch'),
        useDownload: create('download'),
    };
}
