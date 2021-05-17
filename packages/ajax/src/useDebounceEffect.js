import {useRef, useEffect} from 'react';

export default function useDebounceEffect(effect, deps, mountFire = true, debounce) {
    const mountRef = useRef(false);

    useEffect(() => {
        if (!mountFire && !mountRef.current) {
            mountRef.current = true;
            return;
        }
        mountRef.current = true;

        // 不使用防抖，直接执行
        if (debounce === false) return effect();

        // 防抖时间，默认 0
        const time = parseInt(debounce) || 0;

        // effect函数返回结果
        let result;
        const handler = setTimeout(() => {
            result = effect();
        }, time);

        return () => {
            if (result && typeof result === 'function') result();

            clearTimeout(handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
