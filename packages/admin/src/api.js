import {toLogin} from './commons';
import {getLoginUser, getToken, isLoginPage, getContainerId, isActiveApp} from './commons/util';
import {CONFIG_HOC} from './config';
import {checkSameField, convertToTree, sort} from '@ra-lib/util';
import {Icon} from 'src/components';
import * as api from 'src/api';

/**
 * 获取菜单数据
 *
 * @returns {Promise<*>}
 */
export async function getMenus() {
    // 启用mock时，api.getMenus，会早于mock生效前调用，这里做个延迟
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK) {
        await new Promise(resolve => setTimeout(resolve));
    }

    const menus = await api.getMenus();

    return formatMenus(menus);
}

export async function getCollectedMenus() {
    // 登录页面，不加载
    if (isLoginPage()) return [];

    const collectedMenus = await api.getCollectedMenus();
    return formatMenus(collectedMenus);
}

export async function getPermissions() {
    return await api.getPermissions();
}

/**
 * 获取子应用列表
 */
export async function getSubApps() {
    // 传递给子应用的数据
    const props = {
        mainApp: {
            toLogin,
            loginUser: getLoginUser(),
            token: getToken(),
        },
    };
    const subApps = await api.getSubApps();
    subApps.forEach(item => {
        item.activeRule = !CONFIG_HOC.keepAlive ? `/${name}` : () => {
            // 当前路径是子应用，或者 子应用容器存在
            return isActiveApp({name}) || !!document.getElementById(getContainerId(name));
        };
        item.container = `#${getContainerId(name)}`;
        item.props = props;
    });

    return subApps;
}

/**
 * 处理菜单数据
 * @param menus
 * @returns {*}
 */
function formatMenus(menus) {
    // id转字符串
    menus.forEach(item => {
        item.id = `${item.id}`;
        item.parentId = item.parentId ? `${item.parentId}` : item.parentId;
    });
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
function loopMenus(menus, basePath) {
    menus.forEach(item => {
        let {icon, path, target, children} = item;

        // 保存原始target数据
        item._target = target;

        // 树状结构bashPath向下透传
        if (basePath && !('basePath' in item)) item.basePath = basePath;

        // 乾坤子项目约定
        if (target === 'qiankun') item.basePath = `/${item.name}`;

        // 拼接基础路径
        if (basePath && path && (!path.startsWith('http') || !path.startsWith('//'))) {
            item.path = path = `${basePath}${path}`;
        }

        // 图标处理，数据库中持久换存储的是字符串
        if (icon) item.icon = <Icon type={icon}/>;

        // 第三方页面处理，如果target为iframe，内嵌到当前系统中
        if (target === 'iframe') {
            // 页面跳转 : 内嵌iFrame
            item.path = `/iframe_page_/${encodeURIComponent(path)}`;
        }

        if (!['_self', '_blank'].includes(target)) {
            Reflect.deleteProperty(item, 'target');
        }

        if (children?.length) loopMenus(children, item.basePath);
    });

    return menus;
}
