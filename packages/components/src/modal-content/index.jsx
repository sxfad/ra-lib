import React, {forwardRef, useRef, useContext} from 'react';
import PropTypes from 'prop-types';
import {Button, Spin, ConfigProvider} from 'antd';
import ComponentContext from '../component-context';
import {useHeight} from '@ra-lib/hooks';

const ModalContent = forwardRef((props, ref) => {
    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();

    let {
        children,
        fitHeight,
        otherHeight,
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

    let defaultOtherHeight = 50;
    if (fullScreen) {
        defaultOtherHeight = 0;
        fitHeight = true;
    }

    const rootRef = useRef(null);
    const [height] = useHeight(rootRef, otherHeight || defaultOtherHeight);

    const outerStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: fitHeight ? height : 'auto',
        ...style,
    };

    return (
        <Spin spinning={loading} tip={loadingTip}>
            <div
                className={`${prefixCls}-modal-content`}
                ref={rootDom => {
                    rootRef.current = rootDom;
                    if (ref) ref.current = rootDom;
                }}
                style={outerStyle}
                {...others}
            >
                <div
                    className={`${prefixCls}-modal-content-inner`}
                    style={{flex: 1, padding: 16, overflow: (fitHeight || fullScreen) ? 'auto' : '', ...bodyStyle}}
                >
                    {children}
                </div>
                {footer !== false ? (
                    <div className={`${antdPrefixCls}-modal-footer`} style={{flex: 0}}>
                        {footer ? footer : (
                            <>
                                <Button type="primary" onClick={onOk} htmlType={okHtmlType}>{okText}</Button>
                                <Button onClick={onCancel}>{cancelText}</Button>
                            </>
                        )}
                    </div>
                ) : null}
            </div>
        </Spin>
    );
});

ModalContent.propTypes = {
    // 是否全屏
    fullScreen: PropTypes.bool,
    // 是否使用屏幕剩余空间
    fitHeight: PropTypes.bool,
    // 除了主体内容之外的其他高度，用于计算主体高度；
    otherHeight: PropTypes.number,
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

ModalContent.defaultProps = {
    loading: false,
    style: {},
    bodyStyle: {},
    fitHeight: false,
    okHtmlType: '',
    onOk: () => void 0,
    onCancel: () => void 0,
};

export default ModalContent;
