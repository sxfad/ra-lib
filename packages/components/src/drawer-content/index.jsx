import React, {useEffect, useState, forwardRef, useContext} from 'react';
import PropTypes from 'prop-types';
import {Button, Spin, ConfigProvider} from 'antd';
import ComponentContext from '../component-context';

function DrawerContent(props, ref) {
    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();

    let {
        children,
        style,
        bodyStyle,
        loading,
        loadingTip = context.loadingTip,
        prefixCls = context.prefixCls,
        fullScreen,
        footer,
        okHtmlType,
        okText = context.okText,
        cancelText = context.cancelText,
        onOk,
        onCancel,
        ...others
    } = props;

    // 延迟加载内容，解决 内部 input autoFocus 不生效问题
    const [inMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => setIsMounted(true));
    }, []);
    if (!inMounted) return null;

    const outerStyle = {
        display: 'flex',
        flexDirection: 'column',
        ...style,
    };

    return (
        <>
            <Spin spinning={loading} tip={loadingTip}>
                <div
                    className={`${prefixCls}-drawer-content`}
                    ref={ref}
                    style={outerStyle}
                    {...others}
                >
                    <div
                        className={`${prefixCls}-drawer-content-inner`}
                        style={{flex: 1, padding: 16, ...bodyStyle}}
                    >
                        {children}
                        {/* footer 站位 */}
                        <div style={footer !== false ? {height: 53} : null}/>
                    </div>
                </div>
            </Spin>
            {footer !== false ? (
                <div
                    className={`${antdPrefixCls}-modal-footer`}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        background: '#fff',
                    }}
                >
                    {footer ? footer : (
                        <>
                            <Button type="primary" onClick={onOk} htmlType={okHtmlType}>{okText}</Button>
                            <Button onClick={onCancel}>{cancelText}</Button>
                        </>
                    )}
                </div>
            ) : null}
        </>
    );
}

DrawerContent.propTypes = {
    // 是否全屏
    fullScreen: PropTypes.bool,
    // 是否加载中
    loading: PropTypes.bool,
    // 加载中提示文案
    loadingTip: PropTypes.any,
    // 底部 默认 确定、取消
    footer: PropTypes.any,
    // 确定按钮类型
    okHtmlType: PropTypes.any,
    // 确定按钮文案
    okText: PropTypes.any,
    // 确定事件
    onOk: PropTypes.func,
    // 取消按钮文案
    cancelText: PropTypes.any,
    // 取消事件
    onCancel: PropTypes.func,
    // 最外层容器样式
    style: PropTypes.object,
    // 内容容器样式
    bodyStyle: PropTypes.object,
};

DrawerContent.defaultProps = {
    loading: false,
    style: {},
    bodyStyle: {},
    okHtmlType: '',
    onOk: () => void 0,
    onCancel: () => void 0,
};

export default forwardRef(DrawerContent);
