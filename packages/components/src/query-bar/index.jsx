import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import {DoubleRightOutlined, DoubleLeftOutlined} from '@ant-design/icons';
import classNames from 'classnames';
import ComponentContext from '../component-context';
import './style.less';

function QueryBar(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        defaultCollapsed,
        collapsedTips,
        children,
        ...others
    } = props;

    const [collapsed, setCollapsed] = useState(defaultCollapsed);


    prefixCls = `${prefixCls}-query-bar`;
    const rootClass = classNames(prefixCls, className);
    const collapsedBarClass = `${prefixCls}-collapsed-bar`;
    const tipClass = `${prefixCls}-tip`;

    const childrenIsFunction = typeof children === 'function';

    return (
        <div {...others} className={rootClass}>
            {childrenIsFunction ? children(collapsed) : children}
            {childrenIsFunction ? (
                <div className={collapsedBarClass} onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <DoubleRightOutlined rotate={90}/> : <DoubleLeftOutlined rotate={90}/>}
                    <span className={tipClass}>{collapsedTips[collapsed ? 0 : 1]}</span>
                </div>
            ) : null}
        </div>
    );
}

QueryBar.propTypes = {
    // class 类
    className: PropTypes.string,
    // class 类前缀
    prefixCls: PropTypes.string,
    // 默认折叠方式
    defaultCollapsed: PropTypes.bool,
    // 展开收起提示
    collapsedTips: PropTypes.array,
    // 子组件，如果需要展开收起功能，使用 render-props 方式，即：children 为函数：collapsed => {...}
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

QueryBar.defaultProps = {
    defaultCollapsed: true,
    collapsedTips: ['展开更多', '收起更多'],
};

export default QueryBar;
