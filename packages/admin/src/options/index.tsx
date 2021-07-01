import React, { useState, useEffect, ReactNode } from 'react';

export interface optionsProps {
    getOption: (value: any) => any,
    getTag: (value: any) => any,
    getLabel: (value: any) => any,
    getMeta: (value: any) => any,
    clearCache: (value: any) => any,
}

export interface itemProps {
    value: any,
    label: any,
    meta?: any,
    tag?: ReactNode,
}

// 异步请求缓存字典
const cacheMap = new Map();

export function useOptions(...args) {
    const [ result, setResult ] = useState(args.map(() => []));
    useEffect(() => {
        (async () => {
            const promises = args.map(item => {
                if (typeof item === 'function') {

                    const res = item();
                    // 异步函数结果
                    if (res.then) return res;

                    // 同步函数结果
                    return Promise.resolve(res);
                }

                if (item && item.then) return item;

                // 不是函数，原样返回
                return Promise.resolve(item);
            });
            Promise.allSettled(promises)
                .then(results => {
                    const options = results.map(item => {
                        if (item.status === 'fulfilled') {
                            return item.value;
                        }
                        // eslint-disable-next-line no-console
                        console.error(item.reason);
                        return [];

                    });

                    // 检测是否只含有 value label meta? 三个参数
                    options.filter(item => !!item).forEach(arr => arr.forEach(obj => {
                        const keys = Object.keys(obj);
                        if (keys.length > 3 || (keys.length === 3 && !keys.includes('meta')))
                            throw Error(`枚举类型数据，只能含有 value,label,meta 三个属性！\n${JSON.stringify(obj, null, 4)}`);

                        if (!keys.includes('value') || !keys.includes('label'))
                            throw Error(`枚举类型数据，必须含有 value,label 属性！\n${JSON.stringify(obj, null, 4)}`);
                    }));

                    setResult(options);
                });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return result.map(item => extendMethod(item));
}

/**
 * 如果函数有参数，不会被缓存！！
 * ！
 * @param options
 * @param cacheTime
 *      false 不缓存
 *      true 浏览器刷新之后失效
 *      number 缓存number毫秒数，可以有效解决同一页面多次加载问题同时一定程度上避免脏数据
 * @returns {*}
 */
export function wrapperOptions(options, cacheTime) {
    // 处理缓存
    if (cacheTime !== false) {
        Object.entries(options)
            .forEach(([ key, item ]) => {
                if (typeof item === 'function') {
                    // eslint-disable-next-line no-param-reassign
                    options[key] = function newItem(...args) {
                        // 如果有参数，不缓存
                        if (args?.length) return item(...args);

                        let cache = cacheMap.get(newItem);
                        if (!cache) {
                            cache = item();
                            cacheMap.set(newItem, cache);

                            if (typeof cacheTime === 'number') {
                                setTimeout(() => cacheMap.delete(newItem), cacheTime);
                            }
                        }
                        return cache;
                    };
                }
            });
    }

    // 添加方法
    // eslint-disable-next-line no-param-reassign
    options.clearCache = () => {
        Object.values(options).forEach(item => cacheMap.delete(item));
    };
    Object.values(options)
        .forEach((item: optionsProps) => {
            extendMethod(item);
        });

    return options;
}

function extendMethod(item) {
    let it = item;
    it.getOption = (value) => getField(it, value);
    it.getTag = (value) => <PromiseChildren>{getField(it, value, 'tag')}</PromiseChildren>;
    it.getLabel = (value) => <PromiseChildren>{getField(it, value, 'label')}</PromiseChildren>;
    it.getMeta = (value) => getField(it, value, 'meta');
    it.clearCache = () => cacheMap.delete(it);

    return it;
}

function getField(item, value, field = undefined): any {
    let opts = item;

    if (typeof item === 'function') {
        opts = cacheMap.get(item) || item();
    }

    if (Array.isArray(opts)) {
        const result = opts.find(i => i.value === value) || {};
        return field ? result[field] : result;
    }
    // 异步结果
    if (opts.then) {
        return opts.then(it => {
            const result = it.find(i => i.value === value) || {};
            return field ? result[field] : result;
        });
    }
    return null;
}

export function PromiseChildren(props) {
    const { children } = props;
    const [ result, setResult ] = useState(null);

    useEffect(() => {
        (async () => {
            if (children.then) {
                const label = await children;

                setResult(label);
            } else {
                setResult(children);
            }

        })();
    }, [ children ]);

    return result || null;
}
