import { withRouter } from 'react-router-dom';
import {
    createConfigHoc,
    modal as modalHoc,
    drawer as drawerHoc,
    // @ts-ignore
} from '@ra-lib/hoc';
import { ajaxHoc } from './ajax';
import { connect as reduxConnect } from '../models';
import { CONFIG_HOC } from '../config';
import { layoutHoc } from '../components/layout';
import commonHoc from './common-hoc';
import { ReactElement } from "react";

// config 所有可用参数，以及默认值
export interface configOptions {
    // 路由地址
    path?: string,
    // 是否需要登录
    auth?: boolean,
    // 是否显示布局框架
    layout?: boolean,
    // 是否显示顶部
    header?: boolean,
    // 是否显示标签
    tab?: boolean,
    // 是否显示页面头部
    pageHeader?: boolean,
    // 是否显示侧边栏
    side?: boolean,
    // 侧边栏是否收起
    sideCollapsed?: boolean,
    // 设置选中菜单，默认基于 window.location选中 用于设置非菜单的子页面，菜单选中状态
    selectedMenuPath?: string,
    // 设置页面、tab标题，默认基于选中菜单，也可以通过query string 设置 /xxx?title=页面标题
    title?: string,
    // 自定义面包屑导航，默认基于选中菜单，false：不显示，[{icon, title, path}, ...]
    breadcrumb?: [],
    // 基于菜单，追加面包屑导航
    appendBreadcrumb?: []
    // 页面保持，不销毁，需要设置config.KEEP_PAGE_ALIVE === true 才生效
    keepAlive?: boolean,
    // 是否添加withRouter高级组件
    router?: boolean,
    // props是否注入ajax
    ajax?: boolean
    // 连接models，扩展 props.action
    connect?: (state: object) => object
    // 弹框高阶组件
    modal?: (props?: any) => string | {
        fullScreen?: boolean,
        top?: number | string,
        title?: (props?: any) => string,
        width?: number | string,
    },
    // 抽屉高级组件
    drawer?: (props?: any) => string | {
        fullScreen?: boolean,
        top?: number | string,
        title?: (props?: any) => string,
        width?: number | string,
    },
}

export interface WrappedComponentProps {
    visible?: boolean,
    onOk?: () => void,
    onCancel?: () => void,
    fullScreen?: boolean,
    record?: any,
    width?: number | string,
    top?: number | string,
    isEdit?: boolean,
    isDetail?: boolean,
    value?: any,
    onChange?: any,
}

export default function configHoc(options: configOptions = {}): () => ReactElement<WrappedComponentProps> {
    let {
        path,
        auth,
        layout,
        header,
        tab,
        pageHeader,
        side,
        sideCollapsed,
        selectedMenuPath,
        title,
        breadcrumb,
        appendBreadcrumb,
        keepAlive,
        router = true,
        ajax = CONFIG_HOC.ajax,
        connect = CONFIG_HOC.connect,
        modal,
        drawer,
        ...others
    } = options;

    // config 传递 参数校验
    if (modal && drawer) throw Error('[config hoc] modal and drawer config can not be used together!');

    const hoc = [];

    hoc.push(commonHoc(options));
    if (modal) hoc.push(modalHoc(modal));
    if (drawer) hoc.push(drawerHoc(drawer));
    if (connect === true) hoc.push(reduxConnect());
    if (typeof connect === 'function') hoc.push(reduxConnect(connect));
    if (ajax) hoc.push(ajaxHoc());
    if (router) hoc.push(withRouter);

    // 放到最后，一些函数式配置，可以获取到更多的props数据
    hoc.push(layoutHoc(options));

    return createConfigHoc({
        hoc,
        onConstructor: () => void 0,
        onDidMount: () => void 0,
        onUnmount: () => void 0,
    })({ ...options, ...others });
};
