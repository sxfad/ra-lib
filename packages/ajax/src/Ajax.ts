import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'qs';

// ajax.get 等方法参数
export interface methodOptions extends AxiosRequestConfig {
    // 自定义参数
    // 过滤掉 值为 null、''、undefined三种参数，不传递给后端
    noEmpty?: boolean;
    // 前后去空格
    trim?: boolean;
    // delete请求，参数使用body发送
    deleteUseBody?: boolean,
    // 失败是否进行reject
    reject?: boolean;
    // 返回完整响应对象，否则返回response.data
    originResponse?: boolean;
    // 默认false，不展示
    successTip?: boolean | string;
    //  = method === 'get' ? '获取数据失败！' : '操作失败！', // 默认失败提示
    errorTip?: boolean | string;
    // 获取cancel方法
    cancelRef?: (c: any) => any;
    // 设置loading函数
    setLoading?: any;
    // 下载文件名
    fileName?: string;
    // 下载之钱回调函数，返回false 不执行下载
    beforeDownload?: (res: AxiosResponse) => boolean;
    // error以弹框形式提示
    errorModal?: any,
    // success 以弹框形式提示
    successModal?: any,
}

// onSuccess 函数参数
export interface successOptions {
    // 成功返回的数据
    data?: any;
    // 提示信息 successTip
    tip?: string | boolean;
    // 来源，这里是 ajax
    from?: string;
    // 调用ajax.get等方法传递的options
    options?: methodOptions;
}

// onError 函数参数
export interface errorOptions {
    // 错误独享
    error?: any;
    // 提示信息 errorTip
    tip?: string | boolean;
    // 来源，这里是 ajax
    from?: string;
    // 调用ajax.get等方法传递的options
    options?: methodOptions;
}

// Ajax 类构造函数参数
export interface AjaxOptions extends AxiosRequestConfig {
    // 成功回调
    onSuccess?: (options: successOptions) => any;
    // 失败回调
    onError?: (options: errorOptions) => any;
    // 失败是否进行reject
    reject?: boolean;
    // 是否去掉请求参数对象中 '' undefined null 的参数
    noEmpty?: boolean;
    // 是否去前后空格
    trim?: boolean;
    // delete方法是否使用body传参，历史遗留问题，可以使用options.data参数：ajax.delete('/url', null, {data: {id}});
    deleteUseBody?: boolean;
}

export default class Ajax {
    public readonly instance: AxiosInstance;
    private onSuccess: (options: successOptions) => any;
    private onError: (options: errorOptions) => any;
    private readonly reject: boolean;
    private readonly noEmpty: boolean;
    private readonly trim: boolean;
    private readonly deleteUseBody: boolean;

    constructor(options: AjaxOptions = {}) {
        const {
            onSuccess = () => undefined,
            onError = () => undefined,
            reject = true,
            noEmpty = true,
            trim = true,
            deleteUseBody = false,
            ...defaults
        } = options;

        this.instance = axios.create();

        // 默认值
        this.instance.defaults.timeout = 1000 * 60;
        this.instance.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8';
        this.instance.defaults.baseURL = '/';
        setDefaults(defaults, this.instance);

        this.onSuccess = onSuccess;
        this.onError = onError;
        this.reject = reject;
        this.noEmpty = noEmpty;
        this.trim = trim;
        this.deleteUseBody = deleteUseBody;
    }

    /**
     * ajax方法
     * @param options
     * @returns {Promise<unknown>}
     */
    ajax(options: methodOptions = {}) {
        let {
            // 自定义参数
            noEmpty = this.noEmpty,
            trim = this.trim,
            deleteUseBody = this.deleteUseBody,
            reject: _reject = this.reject,
            originResponse = false,
            successTip = false,
            errorTip,
            cancelRef = c => c,

            // axios 参数
            params,
            data,
            url,
            method = 'get',
            setLoading = () => undefined,
            ...otherOptions
        } = options;

        const isDelete = method === 'delete';

        if (isDelete && deleteUseBody) {
            data = params;
            params = undefined;
        }

        // 第一层参数值字符串去空格
        if (trim === true) {
            data = trimObject(data);
            params = trimObject(params);
        }

        // 删除 参数对象第一层中为 null '' undefined 的数据，不发送给后端
        if (noEmpty === true) {
            data = empty(data);
            params = empty(params);
        }

        // Content-Type application/x-www-form-urlencoded 存在问题
        // 参见：https://github.com/axios/axios/issues/362
        const contentType = getContentType(otherOptions.headers) || getContentType(this.instance.defaults.headers);
        const isFormContentType = contentType && contentType.indexOf('application/x-www-form-urlencoded') > -1;
        if (isFormContentType) {
            data = data && stringify(data);
        }

        // 用于取消请求的防范
        let cancel;
        const ajaxPromise = new Promise((resolve, reject) => {
            setPublicLoading(setLoading, true);

            const cancelToken = new axios.CancelToken(c => {
                cancel = () => c('canceled');
                cancelRef(cancel);
            });

            this.instance({
                method,
                url,
                data,
                params,
                cancelToken,
                ...otherOptions,
            })
                .then((response: AxiosResponse) => {
                    const responseData = originResponse ? response : response.data;
                    this.onSuccess({ data: responseData, tip: successTip, from: 'ajax', options });
                    resolve(responseData);
                })
                .catch((err: any) => {
                    // 如果是用户主动cancel，不做任何处理，不会触发任何函数
                    if (err?.message === 'canceled') return;

                    // errorTip不等于false，进行提示
                    if (errorTip !== false) {
                        this.onError({
                            options,
                            error: err,
                            tip: errorTip,
                            from: 'ajax',
                        });
                    }

                    // 是否使用reject，如果不是用，promise正常resolve，返回{$type, $error}
                    if (_reject) return reject(err);

                    resolve({ $type: 'unRejectError', $error: err });
                })
                .finally(() => {
                    setPublicLoading(setLoading, false);
                });
        });
        // 第一层 promise添加cancel方法
        // @ts-ignore
        ajaxPromise.cancel = cancel;
        return ajaxPromise;
    }

    /**
     * 发送一个get请求，一般用于查询操作
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据，正常请求会转换成query string 拼接到url后面
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    get(url: string, params?: any, options: methodOptions = {}) {
        return this.ajax({ url, params, method: 'get', ...options });
    }

    /**
     * 发送一个post请求，一般用于添加操作
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    post(url: string, data?: any, options: methodOptions = {}) {
        return this.ajax({ url, data, method: 'post', ...options });
    }

    /**
     * 发送一个put请求，一般用于更新操作
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    put(url: string, data?: any, options: methodOptions = {}) {
        return this.ajax({ url, data, method: 'put', ...options });
    }

    /**
     * 发送一个patch请求，一般用于更新部分数据
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    patch(url: string, data?: any, options: methodOptions = {}) {
        return this.ajax({ url, data, method: 'patch', ...options });
    }

    /**
     * 发送一个delete请求，一般用于删除数据，params会被忽略（http协议中定义的）
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据，拼接在url上，作为query string
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    del(url: string, params?: any, options: methodOptions = {}) {
        return this.ajax({ url, params, method: 'delete', ...options });
    }

    /**
     * ajax 下载文件
     * 后端设置header：
     *  content-disposition: attachment;fileName=xxx.exl
     *  content-type: application/octet-stream;charset=UTF-8
     * @param url
     * @param params
     * @param options
     * @returns {Promise}
     */
    download(url: string, params?: any, options: methodOptions = {}) {
        let {
            fileName,
            method = 'get',
            originResponse = true,
            beforeDownload = () => true,
            responseType = 'blob',
            ...others
        } = options;

        // 区分开方法，进行不同的传参方式
        let data = {};
        let para = params;
        if ([ 'patch', 'post', 'put' ].includes(method.toLowerCase())) {
            data = params;
            para = {};
        }

        const ajaxPromise = this.ajax({
            method,
            url,
            params: para,
            data,
            originResponse,
            responseType,
            ...others,
        });

        ajaxPromise.then((res: AxiosResponse) => {
            // 现在之前，如果返回false，终止下载操作
            if (beforeDownload(res) === false) return;

            const errorMessage = 'download fail';

            if (!res || !res.headers || !res.data) throw Error(errorMessage);

            fileName = fileName || getFileName(res?.headers);

            if (!fileName) throw Error('file name can not be null!');

            // 构造a标签，进行文件下载
            const blob = new Blob([ res.data ], { type: res.headers['content-type'] });
            const link = document.createElement('a');
            link.setAttribute('href', window.URL.createObjectURL(blob));
            link.setAttribute('download', decodeURIComponent(fileName));
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        return ajaxPromise;
    }
}

/**
 * 多个请求共用一个loading状态， 使用 __count 作为哨兵变量
 * @param fn
 * @param loading
 */
function setPublicLoading(fn: any, loading: boolean): void {
    const setLoading = fn;

    if (!setLoading.__count) setLoading.__count = 0;

    // 设置loading为true
    if (loading) {
        setLoading(true);
        setLoading.__count += 1;
        return;
    }

    // 设置loading为false
    setLoading.__count -= 1;
    if (setLoading.__count === 0) setLoading(false);
}

/**
 * 创建ajax实例时，进行默认值设置
 * @param defaults
 * @param instance
 */
function setDefaults(defaults, instance: AxiosInstance) {
    const ajaxInstance = instance;

    Object.entries(defaults).forEach(([ key, value ]) => {
        const oldValue = ajaxInstance.defaults[key];
        if (typeof value === 'object' && oldValue) {
            if (Array.isArray(value)) {
                ajaxInstance.defaults[key] = [ ...oldValue, ...value ];
            } else {
                ajaxInstance.defaults[key] = { ...oldValue, ...value };
            }
        } else {
            ajaxInstance.defaults[key] = value;
        }
    });
}

/**
 * 从headers中获取文件名
 * @param headers
 * @returns {string|null}
 */
function getFileName(headers) {
    if (!headers) return null;

    if (headers.filename) return headers.filename;
    if (headers.fileName) return headers.fileName;
    if (headers['file-name']) return headers['file-name'];

    let fileName = headers['content-disposition']?.split(';')?.[1]?.split('filename=')?.[1];
    const fileNameUnicode = headers['content-disposition']?.split('filename*=')?.[1];

    // 当存在 filename* 时，取filename* 并进行解码（为了解决中文乱码问题）
    if (fileName && fileNameUnicode) {
        return decodeURIComponent(fileNameUnicode.split('\'\'')[1]);
    }

    return null;
}

/**
 * 判断是否是对象
 * @param data
 */
function isObject(data): boolean {
    if (!data) return false;

    if (typeof data !== 'object') return false;

    if (data instanceof FormData) return false;

    return !Array.isArray(data);
}

/**
 * 删除对象第一层值为 '' null undefined 属性
 * @param data
 * @returns {*}
 */
function empty(data) {
    if (!isObject(data)) return data;

    return Object.entries(data)
        .reduce((prev, curr) => {
            const [ key, value ] = curr;

            if ([ '', null, undefined ].includes(value as any)) return prev;

            return {
                ...prev,
                [key]: value,
            };
        }, {});
}

/**
 * 第一层 对象字符串值 去空格
 * @param data
 * @returns {{}|*}
 */
function trimObject(data) {
    if (!isObject(data)) return data;

    return Object.entries(data)
        .reduce((prev, curr) => {
            const [ key, value ] = curr;

            return {
                ...prev,
                [key]: typeof value === 'string' ? value.trim() : value,
            };
        }, {});
}

/**
 * 从headers中获取 contentType
 * @param headers
 * @returns {*}
 */
function getContentType(headers) {
    if (!headers || typeof headers !== 'object') return;

    // content-type 可能多种传参方式，做个兼容
    const contentTypeKeys = [ 'Content-Type', 'content-type', 'contentType' ];
    const key = contentTypeKeys.find(k => !!headers[k]);
    if (key) return headers[key];
}
