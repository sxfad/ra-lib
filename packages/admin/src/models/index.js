import {createStoreByModels} from '@ra-lib/model';
import handleSuccess from '../commons/handle-success';
import handleError from '../commons/handle-error';
import {storage} from '../commons/util';
import models from 'src/models';

const result = createStoreByModels(models, {
    // middlewares: [
    //     thunk,
    // ],
    // enhancers: [], // 与 middlewares 进行compose运算的方法： const enhancer = compose(applyMiddleware(...middlewares), ...enhancers);
    // reducers: {todos}, // 额外的reducers
    // localStorage: window.localStorage,
    // sessionStorage: window.sessionStorage,
    // serialize: JSON.stringify,
    // deserialize: JSON.parse,
    localStorage: storage.local,
    sessionStorage: storage.session,
    serialize: data => data,
    deserialize: data => data,
    onError: handleError,
    onSuccess: handleSuccess,
});

export const store = result.store;
export const connect = result.connect;
export const actions = result.actions;
