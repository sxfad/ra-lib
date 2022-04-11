import React, { useContext, useEffect } from 'react';
import { getLoginUser } from '@ra-lib/admin-util';
import { compose, queryParse } from '@ra-lib/util';

import { modal2 as modalHoc, modalFunction as modalFunctionHoc } from '@ra-lib/hoc';

const destroyFns = [];

export function modalDestroyAll() {
    destroyFns.forEach(fn => fn());
}

export default function create(_options) {
    const {
        AppContext,
        IS_SUB,
        ajaxHoc,
        theme,
        toLogin,
        ejectProps,
        modalCommonProps,
        drawerCommonProps,
    } = _options;

    // 公共高阶组件，注入一些常用数据，比如 query loginUser等
    function commonHoc(options) {
        const {
            query = true,
            loginUser = true,
            layout = !IS_SUB,
            auth = true,
        } = options;

        return (WrappedComponent) => {
            const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

            const WithEjectProps = (props) => {
                // modalFunction 组件，AppContext是无法获取到的。
                const { setLayout } = useContext(AppContext) || {};
                // 是否显示布局
                useEffect(() => setLayout && setLayout(layout), [setLayout]);

                // 需要登录并且是未登录状态，跳转到登录页面
                if (auth && !getLoginUser()) return toLogin();

                // 默认添加属性到props中的属性
                const _ejectProps = { ...ejectProps };
                if (query) _ejectProps.query = queryParse();
                if (loginUser) _ejectProps.loginUser = getLoginUser();

                return <WrappedComponent {..._ejectProps} {...props} />;
            };

            WithEjectProps.displayName = `WithCommon(${componentName})`;

            return WithEjectProps;
        };
    }

    return function configHoc(options = {}) {
        const {
            // auth, // 是否需要登录
            // layout, // 是否显示框架
            // query = true, // 是否添加query参数
            // loginUser = true, // 是否添加loginUser
            // keepAlive, // 页面是否保持
            ajax = true, // 是否注入ajax
            modal, // 是否是弹框
            modalFunction, // 是否是弹框函数
            drawer, // 是否是抽屉
            drawerFunction, // 是否是抽屉函数
        } = options;

        // config 传递 参数校验
        if (modal && modalFunction) throw Error('[config hoc] modal and modalFunction config can not be used together!');
        if (modal && drawer) throw Error('[config hoc] modal and drawer config can not be used together!');
        if (modal && drawerFunction) throw Error('[config hoc] modal and drawerFunction config can not be used together!');
        if (modalFunction && drawer) throw Error('[config hoc] modalFunction and drawer config can not be used together!');
        if (modalFunction && drawerFunction) throw Error('[config hoc] modalFunction and drawerFunction config can not be used together!');
        if (drawer && drawerFunction) throw Error('[config hoc] drawer and drawerFunction config can not be used together!');

        const hoc = [];
        const commonProps = {
            maskClosable: true,
            width: 800,
            footer: false,
            bodyStyle: { padding: 0 },
            // style: { top: 50 },
            ...(modal || modalFunction ? modalCommonProps : drawerCommonProps),
        };
        const functionOptions = {
            commonProps,
            destroyFns,
            antPrefix: theme.antPrefix,
            raLibPrefix: theme.raLibPrefix,
        };
        // 函数弹框组件
        if (modalFunction) hoc.push(modalFunctionHoc(functionOptions));
        // 弹框高阶组件
        if (modal) hoc.push(modalHoc({ commonProps }));
        // 函数抽屉组件
        if (drawerFunction) hoc.push(modalFunctionHoc(functionOptions));
        // 抽屉高阶组件
        if (drawer) hoc.push(modalHoc({ commonProps }));
        // ajax高阶组件
        if (ajax) hoc.push(ajaxHoc());

        // 公共高阶组件
        hoc.push(commonHoc(options));

        return compose(hoc);
    };
}

