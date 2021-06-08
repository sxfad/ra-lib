import axios from 'axios';

export default class Ajax {
    /**
     * 构造函数传入的是自定义的一些配置，一级axios相关默认配置
     *
     * @param options 默认配置
     */
    constructor(options = {}) {
        const {
            onSuccess = () => void 0,
            onError = () => void 0,
            reject = true,
            noEmpty = true,
            trim = true,
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
            reject: _reject = this.reject,
            noEmpty = this.noEmpty, // 过滤掉 值为 null、''、undefined三种参数，不传递给后端
            originResponse = false, // 返回原始相应对象
            trim = this.trim, // 前后去空格

            url,
            params = {},
            data = {},
            method = 'get',
            ...otherOptions
        } = options;

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

        const CancelToken = axios.CancelToken;
        let cancel;

        let instance = this.instance;

        /*
         *
         * Content-Type application/x-www-form-urlencoded 存在问题
         * 参见：https://github.com/axios/axios/issues/362
         *
         * */
        // const defaultsContentType =
        //     instance.defaults.headers[method]['Content-Type'] ||
        //     instance.defaults.headers[method]['content-type'] ||
        //     instance.defaults.headers[method]['contentType'] ||
        //     '';
        //
        // const contentType =
        //     (otherOptions.headers && otherOptions.headers['Content-Type']) ||
        //     (otherOptions.headers && otherOptions.headers['content-type']) ||
        //     (otherOptions.headers && otherOptions.headers['contentType']) ||
        //     '';
        //
        // const ct = contentType || defaultsContentType;
        //
        // const isFormType = ct.indexOf('application/x-www-form-urlencoded') > -1;
        //
        // console.log(ct, isFormType, data);
        // console.log(instance.defaults.headers);
        // console.log(otherOptions.headers);
        //
        // if (isFormType) {
        //     data = stringify(data);
        // }

        const ajaxPromise = new Promise((resolve, reject) => {
            instance({
                method,
                url,
                data,
                params,
                cancelToken: new CancelToken((c) => (cancel = c)),
                ...otherOptions,
            })
                .then((response) => {
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
                    _reject
                        ? reject(err)
                        : resolve({$type: 'unRejectError', $error: err});
                });
        });
        ajaxPromise.cancel = function() {
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
     * @returns {Promise<minimist.Opts.unknown>}
     */
    download(url, params, options = {}) {
        let {method = 'get', originResponse = true, fileName, ...others} = options;
        return this.ajax({url, params, method, originResponse, ...others})
            .then(res => {
                const errorMessage = 'download fail';

                if (!res || !res.headers || !res.data) throw Error(errorMessage);

                fileName = fileName
                    || res?.headers.filename
                    || res?.headers.fileName
                    || res?.headers['file-name']
                    || res?.headers['content-disposition']?.split('=')[1];

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
    }
}

/**
 * 删除对象第一层值为 '' null undefined 属性
 * @param data
 * @returns {*}
 */
function empty(data) {
    if (!data) return data;

    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) return data;

    return Object.entries(data).reduce((prev, curr) => {
        const [key, value] = curr;

        if (value !== null && value !== '' && value !== void 0) {
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

    if (Array.isArray(data)) return data;

    return Object.entries(data).reduce((prev, curr) => {
        const [key, value] = curr;

        if (typeof value === 'string') {
            prev[key] = value.trim();
        }

        return prev;
    }, {});
}
