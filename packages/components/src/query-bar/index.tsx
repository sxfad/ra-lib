import React, { useContext, useState, useEffect, ReactNode } from 'react';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import ComponentContext from '../component-context';
import './style.less';

export interface QueryBarProps {
    // class 类
    className?: string,
    // class 类前缀
    prefixCls?: string,
    // 默认折叠方式
    defaultCollapsed?: boolean,
    // 展开收起提示
    collapsedTips?: [ ReactNode, ReactNode ],
    // 是否显示折叠bar
    showCollapsedBar?: boolean,
    // 子组件，如果需要展开收起功能，使用 render-props 方式，即：children 为函数：collapsed => {...}
    children?: ((collapsed: boolean) => ReactNode) | ReactNode,
}

function QueryBar(props: QueryBarProps) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        defaultCollapsed,
        collapsedTips,
        showCollapsedBar,
        children,
        ...others
    } = props;

    const [ collapsed, setCollapsed ] = useState(defaultCollapsed);

    useEffect(() => {
        // 延迟触发window 的 resize事件调整布局
        setTimeout(() => window.dispatchEvent(new Event('resize')));
    }, [ collapsed ]);

    prefixCls = `${prefixCls}-query-bar`;
    const rootClass = classNames(prefixCls, className);
    const collapsedBarClass = `${prefixCls}-collapsed-bar`;
    const tipClass = `${prefixCls}-tip`;

    return (
        <div {...others} className={rootClass}>
            {typeof children === 'function' ? children(collapsed) : children}
            {showCollapsedBar && typeof children === 'function' ? (
                <div className={collapsedBarClass} onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <DoubleRightOutlined rotate={90}/> : <DoubleLeftOutlined rotate={90}/>}
                    <span className={tipClass}>{collapsedTips[collapsed ? 0 : 1]}</span>
                </div>
            ) : null}
        </div>
    );
}

QueryBar.defaultProps = {
    defaultCollapsed: true,
    showCollapsedBar: true,
    collapsedTips: [ '展开更多', '收起更多' ],
};

export default QueryBar;
