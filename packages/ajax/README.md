## Ajax 库

基于 [axios](https://axios-http.com/) 二次封装

### 基础方法

- get 一般用于获取服务器资源
- post 一般用于保存资源到服务器
- put 一般用于修改服务器资源
- del 一般用于删除服务器上的资源
- patch 一般用于部分修改服务器资源，很少用得到
- download 下载文件，后端要设置headers参考如下：
    ```
    content-disposition: attachment;fileName=xxx.txt
    content-type: application/octet-stream;charset=UTF-8
    ```

所有方法接受三个参数，url,params,options

示例：

```js | pure
import Ajax from '@ra-lib/ajax';

const ajax = new Ajax();

setLoading(true);
ajax.get('/url', params, options)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    })
    .finally(() => {
        setLoading(false);
    });

```

### Ajax构造函数参数

其他参数参见[axios](https://axios-http.com/)

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| onSuccess | 成功回调，一般用于提供统一成功提示 | `function` | `() => void 0` |
| onError | 失败回调，一般用于提供统一错误提示 | `function` | `() => void 0` |
| reject | promise是否进行reject，如果为false，promise将不会reject，出错结果为：`{$type: 'unRejectError', $error: err}` | `boolean` | `true` |
| noEmpty | 是否去掉空参数 `'' null undefined`不发送给后端  | `boolean` | `true` |
| trim | 对象参数第一层数据是否去空格  | `boolean` | `true` |
| deleteUseBody | delete方法使用使用body传递参数，默认query方式  | `boolean` | `false` |

### 具体方法options

其他参数参见[axios](https://axios-http.com/)

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| reject | 同构造函数参数 | `boolean` | `true` |
| noEmpty | 同构造函数参数  | `boolean` | `true` |
| trim | 同构造函数参数  | `boolean` | `true` |
| deleteUseBody | 同构造函数参数  | `boolean` | `false` |
| successTip | 成功提示，默认不触发onSuccess | `string` | `false` |
| errorTip | 失败提示，默认触发onError | `string` | - |
| originResponse | 是否返回相应的原始对象，一般用到完整的响应结果场景会用到 | `boolean` | `false` |

### ajax初始化

一般使用时，会在项目的`src/commons/ajax.js`文件中，对Ajax进行实例化，设置一些默认值等

```js
import Ajax, {createHooks, createHoc} from '@ra-lib/ajax';
import {AJAX_PREFIX, AJAX_TIMEOUT} from 'src/config';
import handleError from './handle-error';
import handleSuccess from './handle-success';
import {getLoginUser} from './index';

// token来源
const token = getLoginUser()?.token || window.sessionStorage.getItem('token');

// 创建Ajax实例，设置默认值
const ajax = new Ajax({
    baseURL: AJAX_PREFIX,
    timeout: AJAX_TIMEOUT,
    headers: {token},
    onError: handleError,
    onSuccess: handleSuccess,
});

const hooks = createHooks(ajax);
const hoc = createHoc(ajax);

const instance = ajax.instance;
// 请求拦截
instance.interceptors.request.use(cfg => {
    // Do something before request is sent
    return cfg;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});

// 响应拦截
instance.interceptors.response.use(res => {
    // Do something before response

    // 后端自定义失败，前端直接抛出，走handleError逻辑
    // if (res?.data?.code !== '00') return Promise.reject(res.data);

    return res;
}, error => {
    // Do something with response error
    return Promise.reject(error);
});


export default ajax;

export const ajaxHoc = hoc;

export const get = ajax.get;
export const post = ajax.post;
export const put = ajax.put;
export const del = ajax.del;
export const patch = ajax.patch;

export const useGet = hooks.useGet;
export const usePost = hooks.usePost;
export const usePut = hooks.usePut;
export const useDel = hooks.useDel;
export const usePatch = hooks.usePatch;

```

### hooks

提供了简单的hooks封装

refreshDeps 和 initOptions为可选参数，可以任意传递一个或多个或不传递

```js
// 返回：ajax调用方法、loading状态、响应数据、响应错误
const {run, loading, data, error} = useGet('/users', initParams, refreshDeps, initOptions);

// 一般情况下，调用时，传递参数即可，run方法返回结果(promise)
const data = await run(params);

// 如果传递options，将与定义时的initOptions合并 {...initOptions, ...options}
// 如果传递 对象 params，将与定义时initParams合并 {...initParams, ...params}
await run(params, options);


// url携带参数的情况
const {run, loading, data, error} = useDel('/users/:id', initParams, refreshDeps, initOptions);

// 单个站位参数，可以直接传递数据，多个要传递对象，key与url中的对应
await run(1);

// key 要与url中的对应
await run({id});

```

### initOptions说明

如果为函数，则等同于 formatResult；

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formatResult | 相应结果处理函数 | `function` | `res => res` |
| formatError | 相应结果错误处理函数 | `function` | `error => error` |
| setLoading | loading状态设置函数，一般用于一个页面多个请求共享一个loading情况 | `function` | - |
| mountFire | 组件初始化，是否触发查询 | `boolean` | `true` |

常用示例：

```js
// 获取角色列表、conditions, pageNum, pageSize 数据改变，自动触发查询
const {
    data: {
        dataSource,
        total,
    },
} = props.ajax.useGet('/roles', params, [conditions, pageNum, pageSize], {
    // mountFire: false, // 初始化不查询
    formatResult: res => {
        return {
            dataSource: res?.list || [],
            total: res?.total || 0,
        };
    },
});
```

```js
// 批量删除，主动调用 batchDelete 方法，触发请求
const {run: batchDelete} = props.ajax.useDel('/roles', null, {successTip: '批量删除成功！'});

async function handleDelete(id) {
    await batchDelete({ids: id}, {successTip: '删除成功！'});
}
```

```js
// ajax下载文件
async function handleDownload() {
    // method 默认 get
    // fileName 默认从响应header中获取
    props.ajax.download('/download', null, {method: 'post', fileName: 'README.md'});
}
```
