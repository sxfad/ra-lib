import React, {useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {match} from 'path-to-regexp';
import {Route, Switch} from 'react-router-dom';

export default React.memo(forwardRef(function KeepPageAlive(props, ref) {
    const {routes, render404, hashRouter} = props;

    const keepPagesRef = useRef([]);
    const [, setRefresh] = useState({});
    const [reload, setReload] = useState({});

    let {keepRoutes, unKeepRoutes} = useMemo(() => {
        const keepRoutes = [];
        const unKeepRoutes = [];
        (routes || []).forEach(item => {
            if (item.keepAlive === false) {
                unKeepRoutes.push(item);
            } else {
                keepRoutes.push(item);
            }
        });
        return {keepRoutes, unKeepRoutes};
    }, [routes]);

    useImperativeHandle(ref, () => ({
        pages: keepPagesRef.current,
        refresh: (reload) => {
            setRefresh({});
            if (reload) setReload({});
        },
    }));

    let {pathname, search, hash} = window.location;

    const routePath = hashRouter ? hash.replace('#', '').split('?')[0] : pathname;

    useEffect(() => {
        if (!keepRoutes.length) return;
        const key = hashRouter ? hash.replace('#', '') : `${pathname}${search}${hash}`;
        let index = -1;
        keepPagesRef.current.forEach((item, i) => {
            item.active = false;
            if (item.key === key) index = i;
        });

        // 未找到已存在页面，添加一个
        if (index === -1) {
            const route = keepRoutes.find(({path}) => match(path, {decode: decodeURIComponent})(routePath));

            if (route) {
                // 修复match属性，当前路由是 '/'，无法获取到正确的match
                let routeMatch = {};
                const {params} = match(route.path, {decode: decodeURIComponent})(routePath);
                routeMatch.params = params;
                routeMatch.path = route.path;
                routeMatch.url = pathname;
                routeMatch.isExact = true;

                let Component = route.component;
                keepPagesRef.current.unshift({
                    path: route?.path,
                    key,
                    // 使用 React.memo 保持组件在没有属性变化的情况下不更新
                    Component: React.memo((props) => {
                        return <Component {...props} match={routeMatch}/>;
                    }),
                });
            }
        } else {
            // 页面已存在，当前页面标记激活
            const nextPage = keepPagesRef.current[index];

            // active 初次加载为：undefined，隐藏为：false，再次激活为：true
            nextPage.active = true;

            // 不要移动位置，页面内如果存在iframe会重新加载
            // const [page] = keepPagesRef.current.splice(index, 1);
            // keepPagesRef.current.unshift(page);
        }
        // 触发当前组件更新
        setRefresh({});
    }, [reload, keepRoutes, pathname, search, hash]);
    return (
        <>
            {/* 进行 keepAlive 的页面 */}
            {keepPagesRef.current.map((item/*, index*/) => {
                const {key, Component, path, active} = item;
                const display = active !== false ? 'block' : 'none';
                let activeProps = {active};

                // 内嵌iframe 不传递 props，防止更新
                // 页面首次加载，不传递active属性
                if (path === '/iframe_page_/:src') activeProps = {};
                return (
                    <div key={key} style={{display}}>
                        <Component {...activeProps}/>
                    </div>
                );
            })}

            {/* 不参与 keepAlive 的页面 */}
            <Switch>
                {unKeepRoutes.map(item => {
                    const {path, component} = item;
                    return (<Route key={path} exact path={path} component={component}/>);
                })}
            </Switch>

            {/*404页面*/}
            <Switch>
                {routes.map(item => {
                    const {path} = item;
                    return (<Route key={path} exact path={path} render={() => null}/>);
                })}

                <Route render={render404}/>
            </Switch>
        </>
    );
}));
