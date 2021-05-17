import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {connect as _connect} from 'react-redux';
import _undoable, {includeAction, excludeAction} from 'redux-undo';
import thunk from 'redux-thunk';
import syncState from './syncState';

/**
 * 获取需要同步的state jsonpath
 * @param modelName
 * @param sync
 * @param undoable
 * @returns {string[]|*[]|*}
 */
function getSyncPaths(modelName, sync, undoable) {
    if (!sync) return [];

    const root = undoable ? `${modelName}.present` : `${modelName}`;

    if (sync === true) return [root];

    if (Array.isArray(sync)) return sync.filter(item => !!item).map(item => `${root}.${item}`);

    return [];
}

/**
 * 是否显示 成功、失败提示
 * @param tip
 * @param type
 * @param key
 * @returns {boolean|*}
 */
function getShowTip(tip, type, key) {
    if (tip === true) return true;

    if (typeof tip !== 'object') return false;

    if (key in tip) return tip[key];

    return tip[type] === true;
}

/**
 * 获取成功、失败提示内容
 * @param tip
 * @param key
 * @returns {string|*}
 */
function getTip(tip, key) {
    if (typeof tip !== 'object') return '';
    if (!(key in tip)) return '';
    if (typeof tip[key] === 'boolean') return '';

    return tip[key];
}

export default function createStoreByModels(models, options) {
    if (!models) {
        console.error('models mast be an object!');
        return;
    }

    const {
        middlewares = [], // 中间件
        enhancers = [], // 与 middlewares 进行compose运算的方法： const enhancer = compose(applyMiddleware(...middlewares), ...enhancers);
        reducers: _reducers, // 通过 combineReducers 方式，额外添加到 redux 中的reducers
        onError = () => void 0, // 错误处理函数
        onSuccess = () => void 0, // 成功处理函数
        localStorage = window.localStorage, // syncLocal 处理函数
        sessionStorage = window.sessionStorage, // syncSession 处理函数
        serialize = JSON.stringify,
        deserialize = JSON.parse,
    } = options;

    // 检测额外添加的reducers是否与models有重名
    if (_reducers) {
        const modelNames = Object.keys(models);
        const existName = Object.keys(_reducers)
            .find(name => modelNames.includes(name));
        if (existName) throw new Error(`model name '${existName}' is existed！`);
    }

    // models转 redux 需要的 actions actionTypes reducers
    const actions = {};
    const actionsTypes = {};
    const reducers = {};

    // 异步调用保存最后一次时间戳，多次连续调用，只保留最后一次结果
    const asyncCallTime = {};
    // 一堆json path
    let syncLocalPaths = [];
    let syncSessionPaths = [];

    Object.entries(models)
        .forEach(([modelName, modelConfig = {}]) => {
            const {
                state: initialState = {},
                errorTip = true,
                successTip = false,
                undoable,
                syncLocal,
                syncSession,
                debounce = true,
            } = modelConfig;
            const modelActions = actions[modelName] = {};
            const modelActionTypes = actionsTypes[modelName] = {};
            const modelReducers = reducers[modelName] = {};
            const includeUndoableActions = [];
            const excludeUndoableActions = [];

            syncLocalPaths = syncLocalPaths.concat(getSyncPaths(modelName, syncLocal, undoable));
            syncSessionPaths = syncSessionPaths.concat(getSyncPaths(modelName, syncSession, undoable));

            Object.entries(modelConfig)
                .forEach(([key, value]) => {
                    if (typeof value === 'function') {
                        const isIncludeUndoable = undoable && undoable.include && undoable.include.includes[key];
                        const isExcludeUndoable = undoable && undoable.exclude && undoable.exclude.includes[key];

                        // 异步方法 async
                        if (Object.prototype.toString.call(value) === '[object AsyncFunction]') {
                            const resolveActionType = `action_${modelName}_${key}_resolve`;
                            const rejectActionType = `action_${modelName}_${key}_reject`;
                            const paddingActionType = `action_${modelName}_${key}_padding`;

                            // 新增连个state数据
                            const rejectStateName = `${key}Error`;
                            const paddingStateName = `${key}Loading`;

                            const showErrorTip = getShowTip(errorTip, 'async', key);
                            const showSuccessTip = getShowTip(successTip, 'async', key);

                            if (isIncludeUndoable) includeUndoableActions.push(resolveActionType);
                            if (isExcludeUndoable) excludeUndoableActions.push(resolveActionType);

                            // 是否使用防抖
                            const isDebounce = debounce === true || (Array.isArray(debounce) && debounce.includes(key));

                            const action = payload => (dispatch, getState) => {
                                const state = getState();
                                const modelState = state[modelName];

                                dispatch({
                                    type: paddingActionType,
                                    payload: true,
                                });
                                const callTime = asyncCallTime[resolveActionType] = Date.now();
                                value(payload, modelState)
                                    .then(result => {
                                        if (isDebounce && asyncCallTime[resolveActionType] !== callTime) return;
                                        if (showSuccessTip) onSuccess({data: result, tip: getTip(successTip, key), from: 'model'});
                                        dispatch({
                                            type: resolveActionType,
                                            payload: result,
                                        });
                                    })
                                    .catch(err => {
                                        if (isDebounce && asyncCallTime[resolveActionType] !== callTime) return;
                                        if (showErrorTip) onError({error: err, tip: getTip(errorTip, key), from: 'model'});

                                        dispatch({
                                            type: rejectActionType,
                                            payload: err,
                                        });
                                    });
                            };

                            const reducer = (state, action) => {
                                const {payload: newState} = action;
                                let nextState = {...state};

                                if (nextState && (typeof nextState !== 'object' || Array.isArray(nextState))) {
                                    console.error(`model method ${modelName}.${key} should return an object! but got ${nextState}.`);
                                    return state;
                                }

                                // 返回了一个对象 进行state合并
                                if (newState && typeof newState === 'object' && !Array.isArray(newState)) {
                                    nextState = {...state, ...newState};
                                }

                                nextState[paddingStateName] = false;
                                nextState[rejectStateName] = null;

                                return nextState;
                            };

                            modelActionTypes[resolveActionType] = resolveActionType;
                            modelActionTypes[rejectActionType] = rejectActionType;
                            modelActionTypes[paddingActionType] = paddingActionType;

                            modelReducers[resolveActionType] = reducer;
                            modelReducers[rejectActionType] = (state, action) => {
                                const {payload} = action;
                                return {...state, [rejectStateName]: payload, [paddingStateName]: false};
                            };
                            modelReducers[paddingActionType] = (state, action) => {
                                const {payload} = action;
                                return {...state, [rejectStateName]: null, [paddingStateName]: payload};
                            };
                            modelActions[key] = action;
                        } else {
                            // 同步方法
                            const showErrorTip = getShowTip(errorTip, 'sync', key);
                            const showSuccessTip = getShowTip(successTip, 'sync', key);

                            const actionType = `action_${modelName}_${key}`;
                            if (isIncludeUndoable) includeUndoableActions.push(actionType);
                            if (isExcludeUndoable) excludeUndoableActions.push(actionType);

                            const action = payload => ({
                                type: actionType,
                                payload,
                            });
                            const reducer = (state, action) => {
                                const {payload} = action;

                                let nextState;
                                try {
                                    nextState = value(payload, state);

                                    if (showSuccessTip) onSuccess({data: nextState, tip: getTip(successTip, key), from: 'model'});
                                } catch (err) {
                                    if (showErrorTip) {
                                        return onError({error: err, tip: getTip(errorTip, key), from: 'model'});
                                    }
                                    throw err;
                                }

                                if (nextState && (typeof nextState !== 'object' || Array.isArray(nextState))) {
                                    console.error(`model method ${modelName}.${key} should return an object! but got ${nextState}.`);
                                    return state;
                                }

                                // 返回了一个对象 进行state合并
                                if (nextState && typeof nextState === 'object' && !Array.isArray(nextState)) {
                                    return {...state, ...nextState};
                                }

                                return state;
                            };

                            modelActionTypes[actionType] = actionType;
                            modelReducers[actionType] = reducer;
                            modelActions[key] = action;
                        }
                    }
                });

            reducers[modelName] = function(state = {...initialState}, action) {
                const type = action.type;
                const func = modelReducers[type];
                if (!func) return state;

                return func(state, action);
            };

            if (undoable) {
                const uOptions = {
                    undoType: `action_${modelName}_undo`,
                    redoType: `action_${modelName}_redo`,
                    jumpType: `action_${modelName}_jump`,
                    jumpToPastType: `action_${modelName}_jump_to_past`,
                    jumpToFutureType: `action_${modelName}_jump_to_future`,
                    clearHistoryType: `action_${modelName}_clear_history`,
                };

                let undoableOptions;
                if (undoable === true) {
                    undoableOptions = {};
                }
                if (typeof undoable === 'object') {
                    const {include, exclude, ...others} = undoable;
                    undoableOptions = others;
                }

                if (excludeUndoableActions && excludeUndoableActions.length) {
                    uOptions.filter = excludeAction(excludeUndoableActions);
                }

                if (includeUndoableActions && includeUndoableActions.length) {
                    uOptions.filter = includeAction(includeUndoableActions);
                }

                let options = {...uOptions, ...undoableOptions};

                reducers[modelName] = _undoable(reducers[modelName], options);

                actions[modelName][`${modelName}Undo`] = () => ({type: options.undoType});
                actions[modelName][`${modelName}Redo`] = () => ({type: options.redoType});
                actions[modelName][`${modelName}Jump`] = () => ({type: options.jumpType});
                actions[modelName][`${modelName}JumpToPast`] = () => ({type: options.jumpToPastType});
                actions[modelName][`${modelName}JumpToFuture`] = () => ({type: options.jumpToFutureType});
                actions[modelName][`${modelName}ClearHistory`] = () => ({type: options.clearHistoryType});
            }
        });

    const mapDispatchToProps = (dispatch) => {
        const action = Object.entries(actions)
            .reduce((prev, curr) => {
                const [modelName, modelActions = {}] = curr;
                prev[modelName] = Object.entries(modelActions)
                    .reduce((p, c) => {
                        const [funcName, func] = c;
                        p[funcName] = (...args) => dispatch(func(...args));
                        return p;
                    }, {});
                return prev;
            }, {});

        return {
            action,
        };
    };

    if (syncLocalPaths.length) enhancers.push(syncState(syncLocalPaths, {
        storage: localStorage,
        serialize,
        deserialize,
    }));

    if (syncSessionPaths.length) enhancers.push(syncState(syncSessionPaths, {
        storage: sessionStorage,
        serialize,
        deserialize,
    }));

    // 异步需要中间件
    middlewares.push(thunk);
    const enhancer = compose(applyMiddleware(...middlewares), ...enhancers);
    const store = createStore(combineReducers({...reducers, ...(_reducers || {})}), enhancer);
    const connect = (_mapStateToProps, _mapDispatchToProps = mapDispatchToProps) => _connect(_mapStateToProps, _mapDispatchToProps);
    const _actions = mapDispatchToProps(store.dispatch).action;

    return {
        store,              // redux store
        actions: _actions,  // action方法，可以给js环境使用
        connect,            // 连接redux的高阶组件
    };
}
