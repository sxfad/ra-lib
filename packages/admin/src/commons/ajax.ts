import Ajax, { createHooks, createHoc } from '@ra-lib/ajax';
import { AJAX } from '../config';

const {
    onResponse = res => res,
    onRequest = req => req,
    ...others
} = AJAX;

// 创建Ajax实例，设置默认值
const ajax = new Ajax(others);

// 响应拦截
ajax.instance.interceptors.response.use(onResponse, error => Promise.reject(error));

// 请求拦截
ajax.instance.interceptors.request.use(onRequest, error => Promise.reject(error));

const hooks = createHooks(ajax);
const hoc = createHoc(ajax);

export default ajax;

export const ajaxHoc = hoc;

export const get = ajax.get;
export const post = ajax.post;
export const put = ajax.put;
export const del = ajax.del;
export const patch = ajax.patch;
export const download = ajax.download;

export const useGet = hooks.useGet;
export const usePost = hooks.usePost;
export const usePut = hooks.usePut;
export const useDel = hooks.useDel;
export const usePatch = hooks.usePatch;
export const useDownload = hooks.useDownload;

