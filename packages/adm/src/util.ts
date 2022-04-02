import { storage, isLoginPage, getParentOrigin, getMainApp } from '@ra-lib/admin-util';

/**
 * 浏览器跳转，携带baseName hash等
 * @param href
 * @param BASE_NAME
 * @returns {string|*}
 */
export function locationHref(href, BASE_NAME) {
    if (href?.startsWith('http')) return (window.location.href = href);

    // eslint-disable-next-line no-param-reassign
    if (href && BASE_NAME && href.startsWith(BASE_NAME)) href = href.replace(BASE_NAME, '');

    return (window.location.href = `${BASE_NAME}${href}`);
}

/**
 * 进入首页
 */
export const toHome = BASE_NAME => {
    // 跳转页面，优先跳转上次登出页面
    let lastHref = window.sessionStorage.getItem('last-href') || '/';

    locationHref(lastHref, BASE_NAME);
};

/**
 * 跳转到登录页面
 */
export const toLogin = (IS_SUB, BASE_NAME) => {
    const loginPath = '/login';

    // 判断当前页面是否已经是login页面，如果是，直接返回，不进行跳转，防止出现跳转死循环
    if (isLoginPage()) return null;

    // 清除相关数据
    window.sessionStorage.clear();
    window.sessionStorage.setItem('last-href', window.location.href);
    storage.session.clear();

    if (IS_SUB) {
        // 微前端，跳转主应用登录
        const mainToLogin = getMainApp()?.toLogin;
        if (mainToLogin) return mainToLogin();

        // 嵌入iframe中
        const parentOrigin = getParentOrigin();
        if (parentOrigin) return (window.location.href = `${parentOrigin}/error-401.html`);
    }

    locationHref(loginPath, BASE_NAME);

    return null;
};
