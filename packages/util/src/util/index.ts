import qs from 'qs';
import { convertToTree } from '../tree';
import moment from 'moment';

/**
 * 遍历对象
 * @param obj
 * @param run
 * @returns {*}
 */
export function loopObject(obj, run = (ob, key, value) => value) {
    const loop = record => {
        if (!record) return;
        if (typeof record !== 'object') return;
        // @ts-ignore
        if (Array.isArray(record)) return record.forEach(item => loop(item, run));

        Object.entries(record)
            .forEach(([ key, value ]) => {
                if (typeof value === 'object') return loop(value);

                run(record, key, value);
            });
    };

    loop(obj);

    return obj;
}

/**
 * 检测是否有重复字段
 * @param dataSource
 * @param field
 * @returns {boolean|*}
 */
export function checkSameField(dataSource, field = 'id') {
    if (!dataSource || dataSource.length <= 1) return false;

    const allFields = dataSource.map(item => item[field]);
    const fields = [];

    // eslint-disable-next-line no-restricted-syntax
    for (let f of allFields) {
        if (fields.includes(f)) return f;
        fields.push(f);
    }
    return false;
}

/**
 * 数组排序方法，Array.prototype.sort() 方法有兼容性问题，不同浏览器表现不同
 * @param arr
 * @param orderBy
 * @returns {*[]|*}
 */
export function sort(arr, orderBy = (a, b) => a - b) {
    const { length } = arr;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length - 1; i++) {
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < length - i - 1; j++) {
            if (orderBy(arr[j], arr[j + 1]) > 0) {
                // eslint-disable-next-line no-param-reassign,prefer-destructuring
                arr[j] = [ arr[j + 1], arr[j + 1] = arr[j] ][0];
            }
        }
    }
    return arr;
}

/**
 * 获取地址栏参数，转为对象
 * @param str
 * @returns {{}}
 */
export function getQuery(str = '') {
    const query = {};

    const search = str || window.location.href.split('?')[1];
    const urlSearchParams = new URLSearchParams(search);

    // eslint-disable-next-line no-restricted-syntax
    for (let key of urlSearchParams.keys()) {
        query[key] = urlSearchParams.get(key);
    }

    return query;
}

export const queryParse = getQuery;

/**
 * 对象转 query string
 * @param obj
 * @returns {string}
 */
export function toQuery(obj) {
    return qs.stringify(obj, { encode: false });
}

export const queryStringify = toQuery;

/**
 * 获取一个元素距离浏览器顶部高度
 * @param element
 * @returns {number | Requireable<number>}
 */
export function getElementTop(element) {
    if (!element) return 0;
    let actualTop = element.offsetTop;
    let current = element.offsetParent;

    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }

    return actualTop;
}

/**
 * 获取浏览器滚动条宽度
 * @returns {number}
 */
export function getScrollBarWidth() {
    let scrollDiv = document.createElement('div');
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    scrollDiv.style.width = '50px';
    scrollDiv.style.height = '50px';
    scrollDiv.style.overflow = 'scroll';
    document.body.appendChild(scrollDiv);
    let scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    window.document.body.removeChild(scrollDiv);
    return scrollBarWidth;
}

/**
 * 判断是否有滚动条
 * @param element
 * @param direction
 * @returns {boolean}
 */
export function hasScrollBar(element, direction = 'vertical') {
    if (direction === 'vertical') {
        return element.scrollHeight > element.clientHeight;
    }
    if (direction === 'horizontal') {
        return element.scrollWidth > element.clientWidth;
    }
}

/**
 * 判断元素是否在可视窗口内
 * @param element
 * @param containerEle
 * @returns {{}|{containerHeight: number, visible: boolean, containerScrollTop: (*|number|number), elementTop: *, containerShownHeight: *, elementBottom: *}}
 */
export function elementIsVisible(element, containerEle = document.documentElement) {
    if (!element) return {};

    const containerHeight = containerEle.clientHeight;
    const containerScrollTop = containerEle.scrollTop;
    const elementRect = element.getBoundingClientRect();
    const containerRect = containerEle.getBoundingClientRect();

    const elementTop = elementRect.top - containerRect.top + containerScrollTop;
    const elementBottom = elementTop + elementRect.height;
    const containerShownHeight = containerScrollTop + containerHeight;

    // 可见
    const visible = !(elementTop > containerShownHeight
        || elementBottom < containerScrollTop);

    return {
        visible,
        elementTop,
        elementBottom,
        containerHeight,
        containerScrollTop,
        containerShownHeight,
    };
}

/**
 * 元素滚动
 * @param element 需要滚动的元素
 * @param containerEle 元素父级，默认浏览器窗口
 * @param toTop 是否滚动到顶部，默认false：滚动到中间位置
 * @param force 无论是否可见，都进行滚动，默认false：不可见才滚动
 * @param offset 滚动额外的偏移量，默认0
 */
export function scrollElement(
    {
        element,
        containerEle = document.documentElement,
        toTop = false,
        force = false,
        offset = 0,
    },
) {
    if (!element) return;

    const {
        visible,
        elementTop,
        containerHeight,
    } = elementIsVisible(element, containerEle);

    const scroll = () => {
        // 顶部 : 中间
        const scrollTop = toTop ? elementTop : elementTop - containerHeight / 2;
        // eslint-disable-next-line no-param-reassign
        containerEle.scrollTop = scrollTop + offset;

        return true;
    };

    // 强制滚动
    if (force) return scroll();

    // 非可见 才滚动
    if (!visible) return scroll();
}


const colors = [
    '#2f54eb',
    'rgb(246,179,7)',
    'rgb(80, 193, 233)',
    'rgb(169, 109, 243)',
    'rgb(245,97,58)',
    'rgb(103, 197, 12)',
    'rgb(80, 193, 233)',
    'rgb(110,58,120)',
];

/**
 * 根据字符串首位获取颜色
 * @param str
 * @returns {string}
 */
export function getColor(str) {
    if (!str) return colors[0];
    return colors[str.charCodeAt(0) % colors.length];
}

/**
 * 基于字符串，获取颜色
 * @param str
 * @param defaultRGB
 */
export function stringToRGB(str, defaultRGB = 'rgb(255, 0, 0)') {
    if (!str?.length) return defaultRGB;

    let hash = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        // eslint-disable-next-line no-bitwise
        hash &= hash;
    }

    const rgb = [ 0, 0, 0 ];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 3; i++) {
        // eslint-disable-next-line no-bitwise
        rgb[i] = (hash >> (i * 8)) & 255;
    }

    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/**
 * 获取约定菜单
 * @param pageConfig 页面配置 config高级组件参数
 * @param conventionalRoutes 获取到的约定路由
 * @param TITLE_MAP 未命名路由映射
 * @returns {*[]|*}
 */
export function getConventionalMenus(pageConfig, conventionalRoutes, TITLE_MAP) {
    const hasTitleConfig = pageConfig.filter(item => item.title);

    const _menus = [];
    const __menus = [];
    if (hasTitleConfig?.length) {
        const loop = nodes => nodes.forEach(node => {
            const menu = hasTitleConfig.find(item => item.filePath === node.absComponent);
            if (menu) {
                const paths = node.path.split('/').filter(Boolean);
                const id = paths.join('/');
                paths.pop();
                const parentId = paths.join('/');

                _menus.push({
                    id,
                    parentId,
                    title: menu.title,
                    order: menu.order || 0,
                    parentTitle: menu.parentTitle,
                    parentOrder: menu.parentOrder || 0,
                    path: node.path,
                    filePath: menu.filePath,
                });
            }
            if (node.children) {
                loop(node.children);
            }
        });

        loop(conventionalRoutes);

        _menus.forEach(item => {
            const { id, parentId, title, order, path, parentTitle, parentOrder, filePath } = item;

            // 添加缺少的父级菜单
            if (
                parentId
                && !_menus.some(it => it.id === parentId)
                && !__menus.some(it => it.id === parentId)
            ) {
                __menus.push({
                    id: parentId,
                    title: TITLE_MAP[parentId] || parentId,
                    order,
                });
            }

            // 要作为父级
            const asParent = _menus.some(it => it.parentId === id);
            if (!asParent) {
                __menus.push(item);
                return;
            }

            // 添加一个父级
            __menus.push({
                id,
                parentId,
                title: parentTitle || TITLE_MAP[id] || id,
                order: parentOrder,
            });

            // 当前菜单作为子菜单
            __menus.push({
                id: `${id}/index`,
                parentId: id,
                title,
                order,
                path,
                filePath,
            });
        });
    }
    __menus.sort((a, b) => {
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;
        if (aOrder === bOrder) return 0;
        if (aOrder < bOrder) return 1;
        return -1;
    });
    return convertToTree(__menus);
}


export function compose(functions) {
    if (functions.length === 0) {
        return arg => arg;
    }

    if (functions.length === 1) {
        return functions[0];
    }

    return functions.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * 渲染日期+时间
 * @param format
 */
export function renderDateTime(format = 'YYYY-MM-DD HH:mm:ss') {
    return (value) => {
        if (!value) return '-';

        return moment(value).format(format);
    };
}

/**
 * 渲染日期
 * @param format
 */
export function renderDate(format = 'YYYY-MM-DD') {
    return (value) => {
        if (!value) return '-';

        return moment(value).format(format);
    };
}

/**
 * 渲染时间
 * @param format
 */
export function renderTime(format = 'HH:mm:ss') {
    return (value) => {
        if (!value) return '-';

        return moment(value).format(format);
    };
}

/**
 * 格式化日期 20220303  153023
 * @param date
 * @param time
 */
export function formatDateTime(date, time) {
    let dateStr = date ? `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6)}` : '';
    let timeStr = time ? `${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4)}` : '';

    if (!dateStr || !timeStr) return '-';

    if (!timeStr) return dateStr;

    return `${dateStr} ${timeStr}`;
}


/**
 * 20220419103519
 * @param format
 */
export function formatStringDate(format = 'YYYY-MM-DD HH:mm:ss') {
    return value => {
        if (!value) return '-';

        // 长度不够，补0
        const timeStr = value.padEnd(14, '0');

        const year = timeStr.substring(0, 4);
        const month = timeStr.substring(4, 6);
        const day = timeStr.substring(6, 8);
        const hour = timeStr.substring(8, 10);
        const minutes = timeStr.substring(10, 12);
        const second = timeStr.substring(12, 14);

        const mDate = moment(`${year}-${month}-${day} ${hour}:${minutes}:${second}`);

        if (mDate.isValid()) return mDate.format(format);

        return '-';
    };
}

/**
 * 加载js文件
 * @param url
 * @returns {Promise<unknown>}
 */
export function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = resolve;
        script.src = url;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * 前端检测URL是否可以访问
 * @param url
 */
export function ping(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const remove = () => script.remove();
        script.src = url;

        script.onload = () => {
            resolve(true);
            remove();
        };
        script.onerror = () => {
            reject();
            remove();
        };
        document.head.appendChild(script);
    });
}
