import {useRef, useCallback} from 'react';

export default (validator, deps, wait = 500) => {
    const timer = useRef(0);

    return useCallback((rule, value) => {
        return new Promise((resolve, reject) => {
            clearTimeout(timer.current);
            timer.current = setTimeout(async () => {
                try {
                    await validator(rule, value);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, wait);
        });
    }, deps);
}
