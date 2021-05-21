import qs from 'qs';

/**
 * 获取地址栏参数，转为对象
 * @returns {{}}
 */
export function getQuery() {
    const query = {};

    const search = window.location.href.split('?')[1];
    const urlSearchParams = new URLSearchParams(search);

    for (let key of urlSearchParams.keys()) {
        query[key] = urlSearchParams.get(key);
    }

    return query;
}

/**
 * 对象转 query string
 * @param obj
 * @returns {string}
 */
export function toQuery(obj) {
    return qs.stringify(obj, {encode: false});
}

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
    } else if (direction === 'horizontal') {
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

    const elementTop = elementRect.y - containerRect.y + containerScrollTop;
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
