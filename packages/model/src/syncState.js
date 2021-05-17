import get from 'lodash/get';
import set from 'lodash/set';

function slicerState(paths, state) {
    return paths.reduce((prev, path) => {
        prev[path] = get(state, path);
        return prev;
    }, {});
}

function mergeState(initialState = {}, persistedState) {
    return Object.entries(persistedState || {})
        .reduce((prev, curr) => {
            const [path, value] = curr;
            const p = path.replace('.present', '');
            set(prev, p, value);

            return prev;
        }, {...initialState});
}

export default function syncState(paths, config) {
    const cfg = {
        storage: window.localStorage,
        key: 'redux',
        merge: mergeState,
        slicer: slicerState,
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        ...config,
    };

    const {
        key,
        merge,
        slicer,
        storage,
        serialize,
        deserialize,
    } = cfg;

    return next => (reducer, initialState, enhancer) => {
        if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
            enhancer = initialState;
            initialState = undefined;
        }

        let persistedState;
        let finalInitialState;

        try {
            // 获取存储的数据，恢复到state中
            persistedState = deserialize(storage.getItem(key));
            finalInitialState = merge(initialState, persistedState);
        } catch (e) {
            console.error('Failed to retrieve initialize state from storage:', e);
        }

        const store = next(reducer, finalInitialState, enhancer);

        store.subscribe(function() {
            const state = store.getState();

            // 根据paths，获取数据，存储到storage中
            const subset = slicer(paths, state);

            try {
                storage.setItem(key, serialize(subset));
            } catch (e) {
                console.error('Unable to persist state to storage:', e);
            }
        });

        return store;
    };
}
