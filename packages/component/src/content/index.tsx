import React, { useRef, useState, useEffect, useContext, forwardRef, ReactNode, CSSProperties } from 'react';
import { Spin } from 'antd';
import classNames from 'classnames';
// @ts-ignore
import { useHeight } from '@ra-lib/hooks';
import ComponentContext from '../component-context';
import './style.less';

export interface ContentProps {
    // 样式类名
    className?: string,
    // 适应窗口高度，内容过长，Content会产生滚动条 默认 false
    fitHeight?: boolean,
    // 计算高度时，额外的高度，默认0，content会撑满全屏
    otherHeight?: number,
    // 计算之后，再做偏移的高度
    offsetHeight?: number,
    // 样式对象
    style?: CSSProperties,
    // 显示loading 默认 false
    loading?: boolean,
    // loading的提示文字 默认 context.loadingTip
    loadingTip?: any,
    // 样式前缀 默认 context.prefixCls
    prefixCls?: string,
    // 是否是页面容器
    isRoot?: boolean,
    children?: ReactNode,
}

const Content = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
    const context = useContext(ComponentContext);

    let {
        prefixCls = context.prefixCls,
        fitHeight = false,
        className = '',
        style = {},
        loading: propsLoading = false,
        isRoot = false,
        offsetHeight = 0,
        children,
        otherHeight = context.layoutPageOtherHeight,
        loadingTip = context.loadingTip,
        ...others
    } = props;

    if (context.isMobile) fitHeight = false;

    prefixCls = `${prefixCls}-content`;

    const rootRef = useRef(null);
    let [ height ] = useHeight(rootRef, otherHeight || 0);
    const [ loadingStyle, setLoadingStyle ] = useState({});
    const [ loading, setLoading ] = useState(propsLoading);
    height -= offsetHeight;

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

    useEffect(() => {
        handleSetLoadingStyle();
    }, [ loading, height ]);

    // 计算loading的样式，无论是否出现滚动，loading始终覆盖PageContent可视区域
    function handleSetLoadingStyle() {
        if (!loading) {
            setLoadingStyle({ display: 'none' });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        let { left, top, width, height } = rootRef.current.getBoundingClientRect();

        // margin部分也遮住
        const computedStyle = window.getComputedStyle(rootRef.current);
        const marginLeft = window.parseInt(computedStyle.getPropertyValue('margin-left') || '0px', 10);
        const marginTop = window.parseInt(computedStyle.getPropertyValue('margin-top') || '0px', 10);
        const marginRight = window.parseInt(computedStyle.getPropertyValue('margin-right') || '0px', 10);
        const marginBottom = window.parseInt(computedStyle.getPropertyValue('margin-bottom') || '0px', 10);
        left -= marginLeft;
        width = width + marginLeft + marginRight;
        top -= marginTop;
        height = height + marginTop + marginBottom;

        // body如果有滚动，算上body滚动偏移量
        top += (document.documentElement.scrollTop || document.body.scrollTop || 0);

        // 如果PageContent高度超过了窗口，只遮住可视范围
        const windowHeight = document.documentElement.clientHeight;
        let bottom: number | string = 'auto';
        if (height > windowHeight) {
            bottom = 0;
            height = 'auto';
        }

        setLoadingStyle({
            top,
            left,
            bottom,
            display: 'flex',
            width,
            height,
        });
    }

    return (
        <>
            <div className={`${prefixCls}-loading`} style={loadingStyle}>
                <Spin spinning={loading} tip={loadingTip} />
            </div>
            <div
                ref={rootDom => {
                    rootRef.current = rootDom;
                    // @ts-ignore
                    // eslint-disable-next-line no-param-reassign
                    if (ref) ref.current = rootDom;
                }}
                className={classNames(prefixCls, className)}
                style={{
                    height: fitHeight ? height : '',
                    minHeight: isRoot ? height : '',
                    ...style,
                }}
                {...others}
            >
                {children}
            </div>
        </>
    );
});

export default Content;
