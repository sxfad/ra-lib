import {toLogin} from './commons';
import {getLoginUser, getToken, isLoginPage, getContainerId, isActiveApp} from './commons/util';
import {CONFIG_HOC} from './config';
import ajax from './commons/ajax';
import {checkSameField, convertToTree, sort} from '@ra-lib/util';
import {Icon} from 'src/components';

/**
 * 获取菜单数据
 *
 * @returns {Promise<*>}
 */
export async function getMenus() {
    // 启用mock时，getMenuData，会早于mock生效前调用，这里做个延迟
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK) {
        await new Promise(resolve => setTimeout(resolve));
    }

    const serverMenus = await getMenuData();
    const menus = serverMenus.filter(item => !item.type || item.type === 1);

    return formatMenus(menus);
}

export async function getCollectedMenus() {
    // 登录页面，不加载
    if (isLoginPage()) return [];

    const loginUser = getLoginUser();
    const collectedMenus = await ajax.get('/authority/queryUserCollectedMenus', {userId: loginUser?.id});
    collectedMenus.forEach(item => item.isCollectedMenu = true);
    return formatMenus(collectedMenus);
}

export async function getPermissions() {
    const serverMenus = await getMenuData();
    return serverMenus.filter(item => item.type === 2)
        .map(item => item.code);
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

    // 从菜单数据中获取需要注册的乾坤子项目
    const menuTreeData = await getMenus() || [];
    let result = [];
    const loop = nodes => nodes.forEach(node => {
        const {_target, children} = node;
        if (_target === 'qiankun') {
            const {title, name, entry} = node;
            result.push({
                title,
                name,
                entry,
                activeRule: !CONFIG_HOC.keepAlive ? `/${name}` : () => {
                    // 当前路径是子应用，或者 子应用容器存在
                    return isActiveApp({name}) || !!document.getElementById(getContainerId(name));
                },
                container: `#${getContainerId(name)}`,
                props,
            });
        }
        if (children?.length) loop(children);
    });
    loop(menuTreeData);

    return result;
}

async function getMenuData() {
    // 登录页面，不加载
    if (isLoginPage()) return [];

    // 获取服务端数据，并做缓存，防止多次调用接口
    return getMenuData.__CACHE = getMenuData.__CACHE
        || ajax.get('/authority/queryUserMenus', {userId: getLoginUser()?.id})
            .then(res => res.map(item => ({...item, order: item.order || item.ord || item.sort})));

    // 前端硬编码菜单
    // return [
    //     {id: 'system', title: '系统管理', order: 900, type: 1},
    //     {id: 'user', parentId: 'system', title: '用户管理', path: '/users', order: 900, type: 1},
    //     {id: 'role', parentId: 'system', title: '角色管理', path: '/roles', order: 900, type: 1},
    //     {id: 'menus', parentId: 'system', title: '菜单管理', path: '/menus', order: 900, type: 1},
    // ];
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
