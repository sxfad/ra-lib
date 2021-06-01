import React, {
    useRef,
    useEffect,
    useContext,
    useReducer,
    forwardRef,
    useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {getTreeData, findNode, findParentNodes} from '@ra-lib/util';
import ComponentContext from '../component-context';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Tab from './Tab';
import PageHeader from './PageHeader';
import Side from './Side';
import LAYOUT_TYPE from './layout-type';
import KeepPageAlive from './KeepPageAlive';
import logo from './logo.png';
import './style.less';

function reducer(state, action) {
    const {type, payload} = action;
    switch (type) {
        case 'setState': {
            if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                return {...state, ...payload};
            }
            return {...state};
        }
        case 'toggleSide': {
            return {...state, sideCollapsed: !state.sideCollapsed};
        }
        default:
            throw new Error(`no such action type [${type}]`);
    }
}

const Layout = forwardRef((props, ref) => {
    const context = useContext(ComponentContext);

    const initialState = {
        prefixCls: context.prefixCls,

        logo: props.logo,
        title: props.title,
        hashRouter: props.hashRouter,
        baseName: props.baseName,
        isMobile: context.isMobile,
        headerTheme: props.headerTheme,
        headerHeight: props.headerHeight,
        sideMaxWidth: props.sideMaxWidth,
        sideMinWidth: props.sideMinWidth,
        sideCollapsed: props.sideCollapsed,
        showSearchMenu: props.showSearchMenu,
        searchMenuPlaceholder: props.searchMenuPlaceholder,
        renderSide: props.renderSide,
        showSide: props.showSide,
        sideTheme: props.sideTheme,
        logoTheme: props.logoTheme,
        keepMenuOpen: props.keepMenuOpen,
        showHeader: props.showHeader,
        showHeaderSideToggle: props.showHeaderSideToggle,
        showPageHeader: props.showPageHeader,
        pageHeaderHeight: props.pageHeaderHeight,
        showTab: props.showTab,
        persistTab: props.persistTab,
        tabHeight: props.tabHeight,
        layoutType: props.layoutType,
        keepPageAlive: props.keepPageAlive,
        showTabHeaderExtra: props.showTabHeaderExtra,
        showTabSideToggle: props.showTabSideToggle,

        menuTreeData: void 0,
        selectedMenu: null,
        selectedMenuParents: void 0, // 初始化不能设置为[] 会产生死循环
    };

    // 初始之后还可变数据，不存到state中
    const {
        children,
        className,
        menus,
        headerExtra,
        routes,
        render404,
    } = props;

    const [state, dispatch] = useReducer(reducer, {...initialState});

    const layoutAction = {
        state,
        setState: payload => dispatch({type: 'setState', payload}),
        toggleSide: () => dispatch({type: 'toggleSide'}),
    };

    // 通过ref将一系列方法、数据返回给调用者使用
    useImperativeHandle(ref, () => layoutAction);

    let {
        prefixCls,
        layoutType,
        keepPageAlive,
        hashRouter,
        baseName,
        isMobile,

        // Tab页属性
        showTab,
        tabHeight,
        showTabHeaderExtra,
        showTabSideToggle,
        persistTab,

        // 头部属性
        showHeader,
        headerTheme,
        headerHeight,
        logo,
        title,
        showHeaderSideToggle,

        // 侧边栏属性
        sideMaxWidth,
        sideMinWidth,
        showSearchMenu,
        searchMenuPlaceholder,
        renderSide,
        sideCollapsed,
        selectedMenuPath,
        showSide,
        sideTheme,
        logoTheme,
        menuTreeData = [],
        keepMenuOpen,
        selectedMenu,
        selectedMenuParents = [],

        // 页面头部
        showPageHeader,
        pageHeaderHeight,
        pageTitle,

        // 面包屑
        breadcrumb,
        appendBreadcrumb,
    } = state;

    prefixCls = `${prefixCls}-layout`;

    let sideWidth = sideCollapsed ? sideMinWidth : sideMaxWidth;

    pageHeaderHeight = showPageHeader ? pageHeaderHeight : 0;

    if (layoutType === LAYOUT_TYPE.TOP_MENU) showSide = false;

    selectedMenuPath = selectedMenuPath || (hashRouter ? window.location.hash.replace('#', '').split('?')[0] : window.location.pathname);

    const keepAlivePagesRef = useRef(null);
    const tabsRef = useRef(persistTab && JSON.parse(window.localStorage.getItem('layout-tabs')) || []);

    useEffect(() => {
        // 延迟触发window 的 resize事件调整布局
        setTimeout(() => window.dispatchEvent(new Event('resize')));
    }, [
        sideCollapsed,
        showSide,
        sideWidth,
        showHeader,
        headerHeight,
        showTab,
        tabHeight,
        showPageHeader,
        pageHeaderHeight,
    ]);

    // body添加padding站位
    useEffect(() => {
        const bodyEle = document.querySelector('body');
        let height = 0;

        if (showHeader) height += headerHeight;
        if (showPageHeader) height += pageHeaderHeight;
        if (showTab) height += tabHeight;

        bodyEle.style.paddingTop = `${height}px`;
        bodyEle.style.paddingLeft = `${showSide ? sideWidth : 0}px`;
        bodyEle.style.transition = showSide ? `padding-left ${showSide ? '0s' : '0s'} cubic-bezier(0.2, 0, 0, 1)` : 'none';

        return () => {
            bodyEle.style.paddingTop = `${0}px`;
            bodyEle.style.paddingLeft = `${0}px`;
        };
    }, [
        sideWidth,
        showSide,
        showPageHeader,
        pageHeaderHeight,
        showHeader,
        headerHeight,
        showTab,
        tabHeight,
    ]);

    // 菜单转树状结构
    useEffect(() => layoutAction.setState({menuTreeData: getTreeData(menus)}), [menus]);

    // 菜单选中状态
    useEffect(() => {
        const selectedMenu = findNode(menuTreeData, selectedMenuPath, 'path');
        const selectedMenuParents = findParentNodes(menuTreeData, selectedMenuPath, 'path');

        layoutAction.setState({
            selectedMenu,
            selectedMenuParents,
        });
    }, [menuTreeData, selectedMenuPath]);

    function handleTabClose(key, reload) {
        // tab关闭，keepAlivePages对应删除
        deleteKeepAlivePages(key, reload);
    }

    function deleteKeepAlivePages(keys, reload) {
        if (!keys) return;
        if (!keepAlivePagesRef.current) return;
        if (!keepAlivePagesRef.current.pages) return;
        if (!Array.isArray(keys)) keys = [keys];

        const {pages} = keepAlivePagesRef.current;

        keys.forEach(key => {
            const index = pages.findIndex(item => item.key === key);
            pages.splice(index, 1);
        });
        keepAlivePagesRef.current.refresh(reload);
    }

    const rootClass = classNames(prefixCls, className);
    pageTitle = pageTitle || selectedMenu?.title;

    const side = (
        <Side
            headerHeight={showHeader ? headerHeight : showTab ? tabHeight : 0}
            sideWidth={sideWidth}
            sideMinWidth={sideMinWidth}
            sideCollapsed={sideCollapsed}
            showSearchMenu={showSearchMenu}
            selectedMenuPath={selectedMenuPath}
            searchMenuPlaceholder={searchMenuPlaceholder}
            renderSide={renderSide}
            menuTreeData={menuTreeData}
            keepMenuOpen={keepMenuOpen}
            layoutType={layoutType}
            selectedMenuParents={selectedMenuParents}
            theme={sideTheme}
        />
    );

    if (isMobile) {

        return (
            <MobileHeader
                logo={logo}
                title={title}
                sideWidth={sideWidth}
                pageTitle={pageTitle}
                height={headerHeight}
                selectedMenuPath={selectedMenuPath}
                extra={headerExtra}
                theme={headerTheme}
                sideTheme={sideTheme}
                logoTheme={logoTheme}
            >
                {side}
            </MobileHeader>
        );
    }
    return (
        <>
            <div className={rootClass}>
                {showHeader ? (
                    <Header
                        theme={headerTheme}
                        sideTheme={sideTheme}
                        logoTheme={logoTheme}
                        height={headerHeight}
                        logo={logo}
                        title={title}
                        sideWidth={sideWidth}
                        sideCollapsed={sideCollapsed}
                        showSide={showSide}
                        showToggle={showHeaderSideToggle}
                        onToggleSide={() => layoutAction.toggleSide()}
                        selectedMenuPath={selectedMenuPath}
                        layoutType={layoutType}
                        menuTreeData={menuTreeData}
                        extra={headerExtra}
                    />
                ) : null}
                {showTab ? (
                    <Tab
                        logoTheme={logoTheme}
                        routes={routes}
                        tabs={tabsRef.current}
                        pageTitle={pageTitle}
                        onClose={handleTabClose}
                        tabHeight={tabHeight}
                        showHeader={showHeader}
                        headerHeight={showHeader ? headerHeight : 0}
                        sideWidth={showSide ? sideWidth : 0}
                        showSide={showSide}
                        headerExtra={showTabHeaderExtra ? headerExtra : null}
                        showToggle={showTabSideToggle}
                        sideCollapsed={sideCollapsed}
                        onToggleSide={() => layoutAction.toggleSide()}
                        logo={logo}
                        title={title}
                        persistTab={persistTab}
                        keepPageAlive={keepPageAlive}
                        hashRouter={hashRouter}
                    />
                ) : null}
                {showPageHeader ? (
                    <PageHeader
                        pageTitle={pageTitle}
                        selectedMenu={selectedMenu}
                        selectedMenuParents={selectedMenuParents}
                        pageHeaderHeight={pageHeaderHeight}
                        tabHeight={showTab ? tabHeight : 0}
                        headerHeight={showHeader ? headerHeight : 0}
                        sideWidth={showSide ? sideWidth : 0}
                        breadcrumb={breadcrumb}
                        appendBreadcrumb={appendBreadcrumb}
                    />
                ) : null}
                {showSide ? side : null}

                {children ? (
                    <main>{children}</main>
                ) : null}
            </div>
            {keepPageAlive ? (
                <KeepPageAlive
                    ref={keepAlivePagesRef}
                    routes={routes}
                    render404={render404}
                    hashRouter={hashRouter}
                    baseName={baseName}
                />
            ) : null}
        </>
    );
});

Layout.propTypes = {
    // 头部额外内容
    headerExtra: PropTypes.any,
    // 网站logo图片
    logo: PropTypes.any,
    // 网站标题
    title: PropTypes.any,
    // 头部主题
    headerTheme: PropTypes.oneOf(['dark', 'default']),
    // 头部高度
    headerHeight: PropTypes.number,
    // 侧边栏展开宽度
    sideMaxWidth: PropTypes.number,
    // 侧边栏收起宽度
    sideMinWidth: PropTypes.number,
    // 侧边栏是否收起
    sideCollapsed: PropTypes.bool,
    // 是否显示搜索菜单
    showSearchMenu: PropTypes.bool,
    // 侧边栏搜索菜单提示文案
    searchMenuPlaceholder: PropTypes.string,
    // 侧边栏自定义渲染
    renderSide: PropTypes.func,
    // 是否显示侧边栏
    showSide: PropTypes.bool,
    // 侧边栏主题
    sideTheme: PropTypes.oneOf(['dark', 'default']),
    // logo主题
    logoTheme: PropTypes.oneOf(['dark', 'default']),
    // 是否显示头部
    showHeader: PropTypes.bool,
    // 是否显示头部菜单展开收起按钮
    showHeaderSideToggle: PropTypes.bool,
    // 是否显示页面头部
    showPageHeader: PropTypes.bool,
    // 页面头部高度
    pageHeaderHeight: PropTypes.number,
    // 菜单数据
    menus: PropTypes.array,
    // 保持菜单打开状态
    keepMenuOpen: PropTypes.bool,
    // 布局类型
    layoutType: PropTypes.oneOf(Object.values(LAYOUT_TYPE)),
    // 保持页面状态
    keepPageAlive: PropTypes.bool,
    // 显示Tab页
    showTab: PropTypes.bool,
    // Tab持久化
    persistTab: PropTypes.bool,
    // Tab 页高度
    tabHeight: PropTypes.number,
    // 额外的头部是否显示在tab的右侧
    showTabHeaderExtra: PropTypes.bool,
    // tab左侧是否显示菜单收起展开按钮
    showTabSideToggle: PropTypes.bool,
    // 是否使用hash路由
    hashRouter: PropTypes.bool,
    baseName: PropTypes.string,
};

Layout.defaultProps = {
    logo: logo,
    title: 'React Admin',
    headerTheme: 'dark',
    headerHeight: 50,
    sideMaxWidth: 210,
    sideMinWidth: 50,
    sideCollapsed: false,
    showSearchMenu: true,
    searchMenuPlaceholder: '搜索菜单',
    renderSide: void 0,
    showSide: true,
    sideTheme: 'dark',
    logoTheme: 'dark',
    keepMenuOpen: true,
    showHeader: true,
    showHeaderSideToggle: true,
    showPageHeader: true,
    pageHeaderHeight: 40,
    showTab: false,
    persistTab: true,
    tabHeight: 40,
    menus: [],
    layoutType: LAYOUT_TYPE.SIDE_MENU,
    keepPageAlive: false,
    showTabHeaderExtra: false,
    showTabSideToggle: false,
    hashRouter: false,
    baseName: '',
};

export default Layout;
