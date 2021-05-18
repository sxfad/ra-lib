import React, {useRef, useState, useContext, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import {match} from 'path-to-regexp';
import classNames from 'classnames';
import {SyncOutlined, VerticalRightOutlined, VerticalLeftOutlined} from '@ant-design/icons';
import {Tabs, Dropdown, Menu} from 'antd';
import ComponentContext from '../../component-context';
import SideToggle from '../SideToggle';
import Logo from '../Logo';
import './style.less';

export default withRouter(React.memo(function Tab(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        pageTitle,
        tabs,
        onClose,
        tabHeight,
        showSide,
        headerHeight,
        sideWidth,
        routes,
        headerExtra,
        showToggle,
        sideCollapsed,
        onToggleSide,
        logo,
        title,
        persistTab,
        sideTheme,
        keepPageAlive,
        hashRouter,
    } = props;

    let {pathname, search, hash} = window.location;
    const routePath = hashRouter ? hash.replace('#', '').split('?')[0] : pathname;
    const key = hashRouter ? hash.replace('#', '') : `${pathname}${search}${hash}`;

    const [, setRefresh] = useState({});
    const refreshRef = useRef(0);

    useEffect(() => {
        // 防抖处理
        if (refreshRef.current) clearTimeout(refreshRef.current);
        refreshRef.current = setTimeout(() => {
            const route = routes.find(({path}) => match(path, {decode: decodeURIComponent})(routePath));
            if (route && route.tab === false) return;

            let index = -1;
            tabs.forEach((item, i) => {
                if (item.key === key) index = i;
                item.active = false;
            });
            // 未找到并且title存在时新增
            if (index === -1 && pageTitle) {
                tabs.push({
                    key,
                    active: true,
                    title: pageTitle,
                });
            } else {
                // 已存在切换
                const tab = tabs[index] || {};
                tab.active = true;
                tab.title = pageTitle; // 获取到pageTitle的值会延迟，这要重新设置一下
            }

            setRefresh({});
            handlePersistTab();
        }, 10);
    }, [routes, pathname, search, hash, pageTitle]);

    function handlePersistTab() {
        persistTab && window.localStorage.setItem('layout-tabs', JSON.stringify(tabs));
    }

    function handleClick(key) {
        props.history.push(key);
    }


    function handleEdit(targetKey, action) {
        if (action !== 'remove') return;

        onClose(targetKey);

        // 删除tab页
        const index = tabs.findIndex(item => item.key === targetKey);

        const isLast = index === tabs.length - 1;
        const prevIndex = index - 1;
        const nextIndex = index;
        const [tab] = tabs.splice(index, 1);
        handlePersistTab();

        // 删除的不是当前tab，触发刷新
        if (!tab.active) return setRefresh({});

        // 删除的是当前tab，进行跳转跳转
        // 没有了 跳转首页
        if (tabs.length === 0) return props.history.push('/');
        if (tabs.length === 1) return props.history.push(tabs[0].key);
        if (isLast) return props.history.push(tabs[prevIndex].key);

        props.history.push(tabs[nextIndex].key);
    }

    function renderMenu(key) {
        const index = tabs.findIndex(item => item.key === key);
        const tab = tabs[index];
        const disabledRefresh = !tab.active;
        const disabledRight = index === tabs.length - 1;
        const disabledLeft = index === 0;

        return (
            <div onClick={e => e.stopPropagation()}>
                <Menu
                    onClick={({domEvent: e, key: action}) => {
                        handleMenuClick(key, action);
                    }}
                >
                    {keepPageAlive ? <Menu.Item key="refresh" disabled={disabledRefresh} icon={<SyncOutlined/>}>刷新</Menu.Item> : null}
                    <Menu.Item key="closeRight" disabled={disabledRight} icon={<VerticalLeftOutlined/>}>关闭右侧</Menu.Item>
                    <Menu.Item key="closeLeft" disabled={disabledLeft} icon={<VerticalRightOutlined/>}>关闭左侧</Menu.Item>
                </Menu>
            </div>
        );
    }

    function handleMenuClick(key, action) {
        if (action === 'refresh') {
            // 清除对应页面，并不删除tab
            onClose(key, true);
        }

        if (action === 'closeLeft' || action === 'closeRight') {
            const arr = action === 'closeLeft' ? tabs : [...tabs].reverse();
            const keys = [];
            for (let tab of arr) {
                if (tab.key === key) break;
                keys.push(tab.key);
            }

            // 删除tabs
            keys.forEach(k => {
                const index = tabs.findIndex(item => item.key === k);
                tabs.splice(index, 1);
                handlePersistTab();
            });

            // 删除 tabs 对应的页面
            onClose(keys);

            // 非激活页面，进行跳转
            const tab = tabs.find(item => item.key === key);
            if (!tab.active) {
                props.history.push(key);
            }

            // tabs重新渲染
            setRefresh({});
        }
    }

    const showLogo = !headerHeight;

    prefixCls = `${prefixCls}-layout-tab`;
    const rootClass = classNames(prefixCls, className);
    const headerExtraClass = `${prefixCls}-header-extra`;
    const leftClass = `${prefixCls}-left`;
    const logoClass = `${prefixCls}-logo`;
    const sideToggleClass = `${prefixCls}-side-toggle`;
    const borderBottomClass = `${prefixCls}-border-bottom`;
    const menuClass = `${prefixCls}-menu`;

    let paddingLeft = 4;
    if (showToggle) paddingLeft = 40;
    if (showLogo) paddingLeft += sideWidth;

    return (
        <div
            className={rootClass}
            style={{
                top: headerHeight,
                left: showLogo ? 0 : sideWidth,
                height: tabHeight,
                paddingLeft,
            }}
        >
            <div className={borderBottomClass}/>
            <div className={leftClass}>
                {showLogo ? (
                    <Logo
                        theme={sideTheme}
                        className={logoClass}
                        logo={logo}
                        title={title}
                        height={tabHeight}
                        width={sideWidth}
                        sideCollapsed={sideCollapsed}
                        showSide={showSide}
                    />
                ) : null}
                {showToggle ? (
                    <SideToggle
                        className={sideToggleClass}
                        sideCollapsed={sideCollapsed}
                        onToggleSide={onToggleSide}
                    />
                ) : null}
            </div>
            <Tabs
                size="small"
                hideAdd
                activeKey={tabs.find(item => item.active)?.key}
                type="editable-card"
                onTabClick={handleClick}
                onEdit={handleEdit}
            >
                {tabs.map(pane => (
                    <Tabs.TabPane
                        key={pane.key}
                        closable={tabs.length !== 1}
                        tab={(
                            <Dropdown overlay={renderMenu(pane.key)} trigger={['contextMenu']}>
                                <div className={menuClass}>
                                    {pane.title}
                                </div>
                            </Dropdown>
                        )}

                    />
                ))}
            </Tabs>
            {headerExtra ? <div className={headerExtraClass}>{headerExtra}</div> : null}
        </div>
    );
}));
