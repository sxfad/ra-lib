import { useState, useCallback, useEffect } from 'react';
import { checkSameField, convertToTree, queryParse, sort, Storage } from '@ra-lib/util';
// @ts-ignore
import appPackage from 'root/package.json';

/**
 * 不含有当前项目任何依赖的工具方法！！！
 * 不要引入项目中文件，防止循环引入问题！！！
 * */

const PACKAGE_NAME = appPackage.name;
const LOGIN_USER_STORAGE_KEY = `${PACKAGE_NAME}_login_user`;
const LOGIN_USER_ID_STORAGE_KEY = `${PACKAGE_NAME}_login_user_id`;
const LOGIN_USER_TOKEN_STORAGE_KEY = `${PACKAGE_NAME}_login_user_token`;
const MAIN_APP_KEY = `${PACKAGE_NAME}_main_app`;

const userId = window.sessionStorage.getItem(LOGIN_USER_ID_STORAGE_KEY);
const STORAGE_PREFIX = `${PACKAGE_NAME}_${userId || ''}_`;

export interface loginUser {
    // 用户id
    id: string | number;
    // 用户名
    name: string;
    // 用户头像
    avatar?: string;
    // 用户token
    token?: string;
    // 用户权限
    permissions?: string[];

    // 其他字段
    [key: string]: any;
}

export interface menu {
    id: string | number;
    parentId?: string | number;
    title?: string;
    path?: string;
    order?: number;
    type?: number;

    // 其他字段
    [key: string]: any;
}

/**
 * 前端存储对象 storage.local storage.session storage.global
 * storage.local.setItem(key, value) storage.local.getItem(key, value)
 * @type {Storage}
 */
export const storage = new Storage({ prefix: STORAGE_PREFIX });

/**
 * localStorage hook封装
 * @param key
 * @param defaultValue
 */
export function useLocalStorage(key: string, defaultValue?: any) {
    return useCreateStorageHook(storage.local, key, defaultValue);
}

/**
 * sessionStorage hook封装
 * @param key
 * @param defaultValue
 */
export function useSessionStorage(key: string, defaultValue?: any) {
    return useCreateStorageHook(storage.session, key, defaultValue);
}

function useCreateStorageHook(storageInstance, key, defaultValue) {
    let initState = storageInstance.getItem(key);
    if (initState === undefined) initState = defaultValue;

    const [ state, setInnerState ] = useState(initState);

    const setState = useCallback((value) => {
        setInnerState(value);
        storageInstance.setItem(key, value);
    }, [ key, storageInstance ]);

    return [ state, setState ];
}

/**
 * 存储token到sessionStorage及loginUser中
 * @param token
 */
export function setToken(token): void {
    window.sessionStorage.setItem(LOGIN_USER_TOKEN_STORAGE_KEY, token);
}

/**
 * 获取token
 * token来源: queryString > sessionStorage > loginUser
 */
export function getToken(): string {
    const query: any = queryParse();
    if (query?.token) setToken(query.token);
    return query?.token
        || window.sessionStorage.getItem(LOGIN_USER_TOKEN_STORAGE_KEY);
}

/**
 * 设置当前用户信息
 * @param loginUser 当前登录用户信息
 */
export function setLoginUser(loginUser: any = {}): void {
    if (!loginUser) return;
    // 必须字段
    [
        'id',
        'name',
        // 'token',
        // 'permissions',
    ].forEach(field => {
        if (!loginUser[field]) throw Error(`loginUser must has ${field} property!`);
    });

    // 将用户属性在这里展开，方便查看系统都用到了那些用户属性
    const userStr = JSON.stringify({
        id: loginUser.id,                   // 用户id 必须
        name: loginUser.name,               // 用户名 必须
        avatar: loginUser.avatar,           // 用头像 非必须
        token: loginUser.token,             // 登录凭证 非必须 ajax请求有可能会用到，也许是cookie
        permissions: loginUser.permissions, // 用户权限 如果控制权限，必传
        ...loginUser,
    });

    window.sessionStorage.setItem(LOGIN_USER_STORAGE_KEY, userStr);
    window.sessionStorage.setItem(LOGIN_USER_ID_STORAGE_KEY, loginUser.id);
    setToken(loginUser.token);
}

/**
 * 获取当前用户信息
 * @returns {any}
 */
export function getLoginUser(): loginUser {
    const loginUser = window.sessionStorage.getItem(LOGIN_USER_STORAGE_KEY);

    return loginUser ? JSON.parse(loginUser) : undefined;
}

/**
 * 判断是否有权限
 * @param code
 */
export function hasPermission(code): boolean {
    if (typeof code === 'boolean') return code;

    if (!code) return true;

    const loginUser = getLoginUser();

    if (typeof code === 'string') {
        return loginUser?.permissions?.includes(code);
    }

    if (Array.isArray(code)) {
        return code.some(c => loginUser?.permissions?.includes(c));
    }
}

/**
 * 判断用户是否登录 前端简单通过登录用户或token是否存在来判断
 * @returns {boolean}
 */
export function isLogin(): boolean {
    // 前端判断是否登录，基于不同项目，可能需要调整
    return !!(
        getLoginUser()
        || getToken()
        || getMainApp()?.token
    );
}

/**
 * 判断当前页面是否是登录页面
 * @param path
 * @returns {string|*|boolean}
 */
export function isLoginPage(path = window.location.pathname): boolean {
    return path && path.endsWith('/login') || window.location.href.includes('/#/login');
}

/**
 * 设置乾坤主应用实例
 * @param mainApp
 */
export function setMainApp(mainApp) {
    storage.global.setItem(MAIN_APP_KEY, mainApp);
    setLoginUser(mainApp?.loginUser);
    setToken(mainApp?.token || mainApp?.loginUser?.token);
}

/**
 * 获取乾坤主应用实例
 */
export function getMainApp() {
    return storage.global.getItem(MAIN_APP_KEY);
}

/**
 * 获取配置
 * @param envConfig
 * @param key
 * @param defaultValue
 * @param parse
 * @returns {string|boolean|*}
 */
export function getConfigValue(envConfig, key, defaultValue, parse) {
    const evnKey = `REACT_APP_${key}`;

    // 命令行参数 优先级最高
    const envValue = process.env[evnKey];
    if (envValue !== undefined) {
        if (parse) return parse(envValue);
        if (envValue === 'true') return true;
        if (envValue === 'false') return false;

        return envValue;
    }

    // 区分环境配置
    const envConfigValue = envConfig[key];
    if (envConfigValue !== undefined) return envConfigValue;

    // 默认配置
    return defaultValue;
}

/**
 * 获取子应用容器id
 * @param name
 * @returns {string}
 */
export function getContainerId(name) {
    return `_sub_app_id__${name}`;
}

/**
 * 根据name判断，是否是激活子项目
 * @param app
 * @param pathname
 * @returns {*}
 */
export function isActiveApp(app, pathname = window.location.pathname): boolean {
    return pathname.startsWith(`/${app.name}`);
}

/**
 * 获取模块名
 * @param filePath
 */
export function getModelName(filePath): string {
    // models/page.js 情况
    let name = filePath.replace('./', '').replace('.js', '');

    const names = filePath.split('/');
    const fileName = names[names.length - 1];
    const folderName = names[names.length - 2];

    // users/model.js 情况
    if (fileName === 'model.js') name = folderName;

    // users/center.model.js 情况
    if (fileName.endsWith('.model.js')) {
        name = fileName.replace('.model.js', '').replace(/\./g, '-');
    }

    return name.replace(/-(\w)/g, (a, b) => b.toUpperCase());
}


/**
 * 处理菜单数据
 * @param menus
 * @returns {*}
 */
export function formatMenus(menus): menu[] {
    // 检测是否有重复id
    const someId = checkSameField(menus, 'id');
    if (someId) throw Error(`菜单中有重复id 「 ${someId} 」`);

    // 排序 order降序， 越大越靠前
    return loopMenus(convertToTree(sort(menus, (a, b) => b.order - a.order)));
}

/**
 * 菜单数据处理函数{}
 * @param menus
 * @param basePath
 */
function loopMenus(menus, basePath = ''): menu[] {
    menus.forEach(item => {
        let { path, target, children } = item;

        // 保存原始target数据
        // eslint-disable-next-line no-underscore-dangle,no-param-reassign
        item._target = target;

        // 树状结构bashPath向下透传
        // eslint-disable-next-line no-param-reassign
        if (basePath && !item.basePath) item.basePath = basePath;

        // 乾坤子项目约定
        // eslint-disable-next-line no-param-reassign
        if (target === 'qiankun') item.basePath = `/${item.name}`;

        const _basePath = item.basePath;

        // 拼接基础路径
        if (_basePath && path && (!path.startsWith('http') || !path.startsWith('//'))) {
            path = `${_basePath}${path}`;
            // eslint-disable-next-line no-param-reassign
            item.path = path;
        }

        // 第三方页面处理，如果target为iframe，内嵌到当前系统中
        if (target === 'iframe') {
            // 页面跳转 : 内嵌iFrame
            // eslint-disable-next-line no-param-reassign
            item.path = `/iframe_page_/${encodeURIComponent(path)}`;
        }

        if (![ '_self', '_blank' ].includes(target)) {
            Reflect.deleteProperty(item, 'target');
        }

        if (children?.length) loopMenus(children, _basePath);
    });

    return menus;
}

/**
 * 嵌入iframe情况下，获取父级地址
 */
export function getParentOrigin(): string {
    let url = '';
    const { parent } = window;
    if (parent !== window) {
        try {
            url = parent.location.origin;
        } catch (e) {
            url = document.referrer;
        }
    }
    if (url.endsWith('/')) {
        return url.substring(0, url.length - 1);
    }
    return url;
}


// @ts-ignore
if (window.microApp) {
    // @ts-ignore
    const mainApp = window.microApp.getData() || {};
    setMainApp(mainApp);
}

/**
 * 监听组应用数据
 * @param options
 */
export function useMainAppDataListener(options) {
    const { navigate, baseName, keepPageAlive, name } = options;
    const [ keepAlive, setKeepAlive ] = useState(keepPageAlive);
    // 获取主应用数据
    useEffect(() => {
        // 监听主应用下发的数据变化
        const handleMainAppData = (data) => {
            // 当主应用下发跳转指令时进行跳转
            if (data.path) {
                navigate(data.path.replace(baseName, '/'));
            }

            // 更新主应用
            const mainApp = getMainApp() || {};

            setKeepAlive(mainApp.keepAlive);

            setMainApp({
                ...mainApp,
                ...data,
            });
        };

        const handleMessage = e => {
            if (name && e?.data?.data?.name !== name) return;
            if (e?.data?.type !== 'mainApp') return;

            handleMainAppData({
                ...e.data.data,
                // message 无法传递函数，需要通过postMessage触发父级函数
                navigate: (path) => {
                    window.parent.postMessage({
                        type: 'subApp',
                        data: {
                            action: 'navigate',
                            payload: { path },
                        },
                    }, '*');
                },
                toLogin: () => {
                    window.parent.postMessage({
                        type: 'subApp',
                        data: {
                            action: 'toLogin',
                        },
                    }, '*');
                },
            });
        };
        window.addEventListener('message', handleMessage);
        // @ts-ignore
        window.microApp?.addDataListener(handleMainAppData);

        return () => {
            // @ts-ignore
            window.microApp?.removeDataListener(handleMainAppData);
            window.removeEventListener('message', handleMessage);
        };
    }, [baseName, name, navigate]);

    return { keepAlive };
}


/**
 * 监听子应用数据
 * @param options
 */
export function useSubAppDataListener(options) {
    const { toHome, toLogin, navigate } = options;
    // 监听iframe子应用数据
    useEffect(() => {
        const handleSubAppData = e => {
            if (e?.data?.type !== 'subApp') return;
            const data = e.data.data || {};
            const { action, payload = {} } = data;

            if (action === 'navigate') {
                const { path } = payload;
                return navigate(path);
            }

            if (action === 'toLogin') {
                return toLogin();
            }

            if (action === 'toHome') {
                return toHome();
            }
        };

        window.addEventListener('message', handleSubAppData);
        return () => window.removeEventListener('message', handleSubAppData);
    }, [ navigate, toHome, toLogin ]);
}

/**
 * 获取配置
 */
export function getConfig() {
    // 从query参数中，获取部分配置
    // 同步session，防止页面跳转之后，刷新没query了
    const sQuery = storage.session.getItem('query') || {};
    const query = { ...sQuery, ...queryParse() };
    storage.session.setItem('query', query);

    const isIframe = window.self !== window.top;
    // @ts-ignore
    const isMicro = !!window.microApp;

    // 静态文件文件前缀
    // @ts-ignore
    let publicPath = (window.__MICRO_APP_PUBLIC_PATH__ || query.publicPath || '');
    publicPath = publicPath.endsWith('/') ? publicPath.substring(0, publicPath.length - 1) : publicPath;

    // 路由前缀
    // @ts-ignore
    const baseName = window.__MICRO_APP_BASE_ROUTE__ || query.baseName;

    // 是否同源
    let isSameOrigin = query.isSameOrigin === 'true';
    // @ts-ignore
    if (window.__MICRO_APP_PUBLIC_PATH__) {
        // @ts-ignore
        isSameOrigin = new URL(window.__MICRO_APP_PUBLIC_PATH__).origin === window.location.origin;
    }

    return {
        ...query,
        isSameOrigin,
        isIframe,
        isMicro,
        publicPath,
        baseName: isIframe ? '' : baseName,
        name: query.name || baseName,
    };
}
