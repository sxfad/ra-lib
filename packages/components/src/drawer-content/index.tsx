import React, { useEffect, useState, forwardRef, useContext, ReactNode, CSSProperties } from 'react';
import { Button, Spin, ConfigProvider } from 'antd';
import { ButtonHTMLType } from 'antd/es/button/button';
import ComponentContext from '../component-context';

export interface DrawerContentProps {
    prefixCls?: string,
    // 是否全屏
    fullScreen?: boolean,
    // 是否加载中
    loading?: boolean,
    // 加载中提示文案
    loadingTip?: string,
    // 底部 默认 确定、取消
    footer?: ReactNode
    // 确定按钮类型
    okHtmlType?: ButtonHTMLType
    // 确定按钮文案
    okText?: ReactNode
    // 确定事件
    onOk?: () => void
    // 取消按钮文案
    cancelText?: any
    // 取消事件
    onCancel?: () => void
    // 最外层容器样式
    style?: CSSProperties
    // 内容容器样式
    bodyStyle?: CSSProperties
}

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>((props, ref) => {
    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();

    const {
        loading: propsLoading = false,
        style = {},
        bodyStyle = {},
        onOk = () => undefined,
        onCancel = () => undefined,
        okHtmlType,
        children,
        loadingTip = context.loadingTip,
        prefixCls = context.prefixCls,
        fullScreen,
        footer,
        okText = context.okText,
        cancelText = context.cancelText,
        ...others
    } = props;

    const [ loading, setLoading ] = useState(propsLoading);

    // 多次连续设置loading时，保值loading不间断显示
    useEffect(() => {
        if (propsLoading) {
            setLoading(true);
            return null;
        }
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [ propsLoading ]);

    // 延迟加载内容，解决 内部 input autoFocus 不生效问题
    const [ inMounted, setIsMounted ] = useState(false);
    useEffect(() => {
        setTimeout(() => setIsMounted(true));
    }, []);
    if (!inMounted) return null;

    const outerStyle: CSSProperties = {
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
                        style={{ flex: 1, padding: 16, ...bodyStyle }}
                    >
                        {children}
                        {/* footer 站位 */}
                        <div style={footer !== false ? { height: 53 } : null} />
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
                    {footer || (
                        <>
                            <Button type='primary' onClick={onOk} htmlType={okHtmlType}>{okText}</Button>
                            <Button onClick={onCancel}>{cancelText}</Button>
                        </>
                    )}
                </div>
            ) : null}
        </>
    );
});

export default DrawerContent;
