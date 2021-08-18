import axios from 'axios';
import {stringify} from 'qs';

export default class Ajax {
    /**
     * 构造函数传入的是自定义的一些配置，一级axios相关默认配置
     * @param options 默认配置
     */
    constructor(options = {}) {
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

        Object.entries(defaults).forEach(([key, value]) => {
            const oldValue = this.instance.defaults[key];
            if (typeof value === 'object' && oldValue) {
                if (Array.isArray(value)) {
                    this.instance.defaults[key] = [...oldValue, ...value];
                } else {
                    this.instance.defaults[key] = {...oldValue, ...value};
                }
            } else {
                this.instance.defaults[key] = value;
            }
        });

        this.onSuccess = onSuccess;
        this.onError = onError;
        this.reject = reject;
        this.noEmpty = noEmpty;
        this.trim = trim;
        this.deleteUseBody = deleteUseBody;
    }

    /**
     *
     * @param options
     * @returns {Promise<unknown>}
     */
    ajax(options) {
        let {
            successTip = false, // 默认false，不展示
            errorTip, //  = method === 'get' ? '获取数据失败！' : '操作失败！', // 默认失败提示
            noEmpty = this.noEmpty, // 过滤掉 值为 null、''、undefined三种参数，不传递给后端
            originResponse = false, // 返回原始相应对象
            trim = this.trim, // 前后去空格
            deleteUseBody = this.deleteUseBody, // delete请求，参数已body发送
            reject: _reject = this.reject,
            params,
            data,
            url,
            method = 'get',
            ...otherOptions
        } = options;

        const isDelete = method === 'delete';
        const defaultsContentType =
            this.instance.defaults.headers['Content-Type'] ||
            this.instance.defaults.headers['content-type'] ||
            this.instance.defaults.headers.contentType ||
            '';

        const contentType =
            (otherOptions.headers && otherOptions.headers['Content-Type']) ||
            (otherOptions.headers && otherOptions.headers['content-type']) ||
            (otherOptions.headers && otherOptions.headers.contentType) ||
            '';

        const ct = contentType || defaultsContentType;

        const isFormContentType = ct && ct.indexOf('application/x-www-form-urlencoded') > -1;

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

        const {CancelToken} = axios;
        let cancel;

        const {instance} = this;

        /*
         *
         * Content-Type application/x-www-form-urlencoded 存在问题
         * 参见：https://github.com/axios/axios/issues/362
         *
         * */
        if (isFormContentType) {
            data = data && stringify(data);
        }

        if (isDelete && deleteUseBody) {
            data = params;
            params = undefined;
        }

        // if(!Object.keys(params).length) params = undefined;
        // if(!Object.keys(data).length) data = undefined;

        const ajaxPromise = new Promise((resolve, reject) => {
            instance({
                method,
                url,
                data,
                params,
                // eslint-disable-next-line no-return-assign
                cancelToken: new CancelToken((c) => (cancel = c)),
                ...otherOptions,
            })
                .then((response) => {
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    const data = originResponse ? response : response.data;

                    this.onSuccess({data, tip: successTip, from: 'ajax'});

                    resolve(data);
                })
                .catch((err) => {
                    const isCanceled =
                        err && err.message && err.message.canceled;
                    if (isCanceled) return; // 如果是用户主动cancel，不做任何处理，不会触发任何函数
                    if (errorTip !== false)
                        this.onError({
                            error: err,
                            tip: errorTip,
                            from: 'ajax',
                        });
                    if (_reject) {
                        reject(err);
                    } else {
                        resolve({$type: 'unRejectError', $error: err});
                    }
                });
        });
        ajaxPromise.cancel = () => {
            cancel({
                canceled: true,
            });
        };
        return ajaxPromise;
    }

    /**
     * 发送一个get请求，一般用于查询操作
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据，正常请求会转换成query string 拼接到url后面
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    get(url, params, options) {
        return this.ajax({url, params, method: 'get', ...options});
    }

    /**
     * 发送一个post请求，一般用于添加操作
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    post(url, data, options) {
        return this.ajax({url, data, method: 'post', ...options});
    }

    /**
     * 发送一个put请求，一般用于更新操作
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    put(url, data, options) {
        return this.ajax({url, data, method: 'put', ...options});
    }

    /**
     * 发送一个patch请求，一般用于更新部分数据
     * @param {string} url 请求路径
     * @param {object} [data] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    patch(url, data, options) {
        return this.ajax({url, data, method: 'patch', ...options});
    }

    /**
     * 发送一个delete请求，一般用于删除数据，params会被忽略（http协议中定义的）
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据，拼接在url上，作为query string
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    del(url, params, options) {
        return this.ajax({url, params, method: 'delete', ...options});
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
    download(url, params, options = {}) {
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
        if (['patch', 'post', 'put'].includes(method.toLowerCase())) {
            data = params;
            para = {};
        }

        const ajaxPromise = this.ajax({url, params: para, data, method, originResponse, responseType, ...others});

        ajaxPromise.then(res => {
            // 现在之前，如果返回false，终止下载操作
            if (beforeDownload(res) === false) return;

            const errorMessage = 'download fail';

            if (!res || !res.headers || !res.data) throw Error(errorMessage);

            // eslint-disable-next-line no-const-assign
            fileName = fileName
                || res?.headers.filename
                || res?.headers.fileName
                || res?.headers['file-name']
                || getFileName(res?.headers);

            if (!fileName) throw Error('file name can not be null!');

            const blob = new Blob([res.data], {type: res.headers['content-type']});

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
 * 从headers中获取文件名
 * @param headers
 * @returns {string|null}
 */
function getFileName(headers) {
    if (!headers) return null;

    let fileName = headers['content-disposition'].split(';')[1].split('filename=')[1];
    const fileNameUnicode = headers['content-disposition'].split('filename*=')[1];
    if (fileNameUnicode) { // 当存在 filename* 时，取filename* 并进行解码（为了解决中文乱码问题）
        fileName = decodeURIComponent(fileNameUnicode.split('\'\'')[1]);
    }

    return fileName;
}

/**
 * 删除对象第一层值为 '' null undefined 属性
 * @param data
 * @returns {*}
 */
function empty(data) {
    if (!data) return data;

    if (typeof data !== 'object') return data;

    if (data instanceof FormData) return data;

    if (Array.isArray(data)) return data;

    return Object.entries(data).reduce((prev, curr) => {
        const [key, value] = curr;

        if (value !== null && value !== '' && value !== undefined) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = value;
        }

        return prev;
    }, {});
}

/**
 * 第一层 对象字符串值 去空格
 * @param data
 * @returns {{}|*}
 */
function trimObject(data) {
    if (!data) return data;

    if (typeof data !== 'object') return data;

    if (data instanceof FormData) return data;

    if (Array.isArray(data)) return data;

    return Object.entries(data).reduce((prev, curr) => {
        const [key, value] = curr;

        if (typeof value === 'string') {
            // eslint-disable-next-line no-param-reassign
            prev[key] = value.trim();
        } else {
            // eslint-disable-next-line no-param-reassign
            prev[key] = value;
        }

        return prev;
    }, {});
}
