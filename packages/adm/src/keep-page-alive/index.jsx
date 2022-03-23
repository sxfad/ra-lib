import React, {useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {match} from 'path-to-regexp';
import {Route, Routes, useLocation} from 'react-router-dom';

function KeepPageAlive(props, ref) {
    const { routes, error404, hashRouter, baseName, ejectProps } = props;
    const location = useLocation();

    const keepPagesRef = useRef([]);
    const [, setRefresh] = useState({});
    const [reload, setReload] = useState({});

    // 需要保持，和不需要保持的路由
    let { keepRoutes, unKeepRoutes } = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const keepRoutes = [];
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const unKeepRoutes = [];
        (routes || []).forEach(item => {
            if (item.keepAlive === false) {
                unKeepRoutes.push(item);
            } else {
                keepRoutes.push(item);
            }
        });
        return { keepRoutes, unKeepRoutes };
    }, [routes]);

    useImperativeHandle(ref, () => ({
        pages: keepPagesRef.current,
        refresh: (isReload) => {
            setRefresh({});
            if (isReload) setReload({});
        },
    }));

    // 获取当前浏览器地址对应的路由地址
    let { pathname, search, hash } = location;
    let routePath = hashRouter ? hash.replace('#', '').split('?')[0] : pathname;
    if (baseName) routePath = routePath.replace(baseName, '');


    useEffect(() => {
        if (!keepRoutes.length) return;
        const key = hashRouter ? hash.replace('#', '') : `${pathname}${search}${hash}`;

        let pageIndex = -1;
        keepPagesRef.current.forEach((item, i) => {
            // eslint-disable-next-line no-param-reassign
            item.active = false;
            if (item.key === key) pageIndex = i;
        });

        // 保持页面的路由
        let keepRoute = keepRoutes.find(({ path }) => match(path, { decode: decodeURIComponent })(routePath));
        // 非保持页面路由
        const unKeepRoute = unKeepRoutes.find(({ path }) => match(path, { decode: decodeURIComponent })(routePath));

        // 未找到已存在页面，添加一个
        if (pageIndex === -1 && keepRoute) {
            keepPagesRef.current.unshift({
                path: keepRoute?.path,
                key,
                Component: keepRoute?.Component,
            });
        }

        if (pageIndex !== -1) {
            // 页面已存在，当前页面标记激活
            const nextPage = keepPagesRef.current[pageIndex];

            // active 初次加载为：undefined，隐藏为：false，再次激活为：true
            nextPage.active = true;
        }

        // 路由不存在，渲染 404 页面
        if (!keepRoute && !unKeepRoute) {
            keepPagesRef.current.unshift({
                path: routePath,
                key,
                Component: () => error404,
            });
        }

        // 触发当前组件更新
        setRefresh({});
    }, [
        reload,
        keepRoutes,
        unKeepRoutes,
        pathname,
        search,
        hash,
        hashRouter,
        routePath,
        error404,
        ejectProps,
    ]);

    // 页面切换，触发窗口resize事件，表格高度、PageContent高度等需要重新计算
    useEffect(() => {
        const st = setTimeout(() => window.dispatchEvent(new Event('resize')));
        return () => clearTimeout(st);
    }, [location]);
    return (
        <>
            {/* 进行 keepAlive 的页面 */}
            {keepPagesRef.current.map((item) => {
                const { key, Component, path, active } = item;
                const display = active !== false ? 'block' : 'none';
                let activeProps = { active };

                // 内嵌iframe 不传递 props，防止更新
                // 页面首次加载，不传递active属性
                if (path === '/iframe_page_/:src') activeProps = {};

                return (
                    <div key={key} style={{ display }}>
                        <Component {...ejectProps} {...activeProps}/>
                    </div>
                );
            })}

            {/* 不参与 keepAlive 的页面 */}
            <Routes>
                {unKeepRoutes.map(item => {
                    const { path, Component } = item;
                    return (<Route key={path} exact path={path} element={<Component {...ejectProps}/>}/>);
                })}
                {/* 防止路由找不到会报提醒 */}
                <Route exact path="*" element={<div/>}/>
            </Routes>
        </>
    );
}

export default React.memo(forwardRef(KeepPageAlive));
