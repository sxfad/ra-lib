import {useState, useCallback, useRef, useMemo} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {parse, stringify} from 'query-string';

const parseConfig = {
    skipNull: false,
    skipEmptyString: false,
    parseNumbers: false,
    parseBooleans: false,
};

/**
 *  将state与url中的query同步，比如tab页的页面，url要保持与tab页的对应关系等。
 * @param initialState query参数需要是key：value形式，state需要是Object类型
 * @param options
 * @returns {[{[p: string]: string[] | string | null}, ((function(*=): void)|*)]}
 */
export default function useQueryState(initialState, options) {
    const history = useHistory();
    const location = useLocation();

    // history 导航方式
    const {navigateMode = 'push'} = options || {};

    // 初始化state
    const [, update] = useState({});
    const initialStateRef = useRef(typeof initialState === 'function' ? initialState() : initialState || {});

    // url 中的 query参数
    const queryFromUrl = useMemo(() => {
        return parse(location.search, parseConfig);
    }, [location.search]);

    // 目标参数，初始化与url中参数合并的结果
    const targetQuery = useMemo(() => ({
        ...initialStateRef.current,
        ...queryFromUrl,
    }), [queryFromUrl]);

    const setState = useCallback((s) => {
        const newQuery = typeof s === 'function' ? s(targetQuery) : s;

        // 触发react更新
        update({});

        // 修改url中的query参数
        history[navigateMode]({
            hash: location.hash,
            search: stringify({...queryFromUrl, ...newQuery}, parseConfig) || '?',
        });
    }, [targetQuery, history, location.hash, navigateMode, queryFromUrl]);
    return [targetQuery, setState];
}
