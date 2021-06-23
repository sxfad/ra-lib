import React, { forwardRef, useRef, useContext, ReactNode, CSSProperties } from 'react';
import { Button, Spin, ConfigProvider } from 'antd';
import ComponentContext from '../component-context';
// @ts-ignore
import { useHeight } from '@ra-lib/hooks';

export interface ModalContentProps {
    children?: ReactNode,
    prefixCls?: string,
    // 是否全屏
    fullScreen?: boolean,
    // 是否使用屏幕剩余空间
    fitHeight?: boolean,
    // 除了主体内容之外的其他高度，用于计算主体高度；
    otherHeight?: number,
    // 是否加载中
    loading?: boolean,
    // 加载中提示文案
    loadingTip?: any,
    // 底部 默认 确定、取消
    footer?: any,
    // 确定按钮类型
    okHtmlType?: any,
    // 确定按钮文案
    okText?: any,
    // 确定事件
    onOk?: () => void,
    // 取消按钮文案
    cancelText?: any,
    // 取消事件
    onCancel?: () => void,
    // 最外层容器样式
    style?: object,
    // 内容容器样式
    bodyStyle?: object,
}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>((props, ref) => {
    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();

    let {
        children,
        loading = false,
        style = {},
        bodyStyle = {},
        fitHeight = false,
        okHtmlType = '',
        onOk = () => void 0,
        onCancel = () => void 0,
        otherHeight,
        loadingTip = context.loadingTip,
        prefixCls = context.prefixCls,
        fullScreen,
        footer,
        okText = context.okText,
        cancelText = context.cancelText,
        ...others
    } = props;

    if (context.isMobile && fullScreen === undefined) fullScreen = true;

    let defaultOtherHeight = 50;
    if (fullScreen) {
        defaultOtherHeight = 0;
        fitHeight = true;
    }

    const rootRef = useRef(null);
    const [ height ] = useHeight(rootRef, otherHeight || defaultOtherHeight);

    const outerStyle: CSSProperties = {
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
                    // @ts-ignore
                    if (ref) ref.current = rootDom;
                }}
                style={outerStyle}
                {...others}
            >
                <div
                    className={`${prefixCls}-modal-content-inner`}
                    style={{ flex: 1, padding: 16, overflow: (fitHeight || fullScreen) ? 'auto' : '', ...bodyStyle }}
                >
                    {children}
                </div>
                {footer !== false ? (
                    <div className={`${antdPrefixCls}-modal-footer`} style={{ flex: 0 }}>
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


export default ModalContent;
