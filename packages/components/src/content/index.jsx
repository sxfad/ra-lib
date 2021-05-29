import {useRef, useState, useEffect, useContext, forwardRef} from 'react';
import {Spin} from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {useHeight} from '@ra-lib/hooks';
import ComponentContext from '../component-context';
import './style.less';

function Content(props, ref) {
    const context = useContext(ComponentContext);

    let {
        children,
        className,
        fitHeight,
        otherHeight = context.layoutPageOtherHeight,
        offsetHeight,
        style,
        loading,
        loadingTip = context.loadingTip,
        prefixCls = context.prefixCls,
        isRoot,
        ...others
    } = props;

    prefixCls = `${prefixCls}-content`;

    const rootRef = useRef(null);
    let [height] = useHeight(rootRef, otherHeight || 0);
    const [loadingStyle, setLoadingStyle] = useState({});
    height = height - offsetHeight;


    useEffect(() => {
        handleSetLoadingStyle();
    }, [loading, height]);

    // 计算loading的样式，无论是否出现滚动，loading始终覆盖PageContent可视区域
    function handleSetLoadingStyle() {
        if (!loading) {
            setLoadingStyle({display: 'none'});
            return;
        }

        let {left, top, width, height} = rootRef.current.getBoundingClientRect();

        // margin部分也遮住
        const computedStyle = window.getComputedStyle(rootRef.current);
        const marginLeft = window.parseInt(computedStyle.getPropertyValue('margin-left') || '0px', 10);
        const marginTop = window.parseInt(computedStyle.getPropertyValue('margin-top') || '0px', 10);
        const marginRight = window.parseInt(computedStyle.getPropertyValue('margin-right') || '0px', 10);
        const marginBottom = window.parseInt(computedStyle.getPropertyValue('margin-bottom') || '0px', 10);
        left = left - marginLeft;
        width = width + marginLeft + marginRight;
        top = top - marginTop;
        height = height + marginTop + marginBottom;

        // body如果有滚动，算上body滚动偏移量
        top = top + (document.documentElement.scrollTop || document.body.srcollTop || 0);

        // 如果PageContent高度超过了窗口，只遮住可视范围
        const windowHeight = document.documentElement.clientHeight;
        let bottom = 'auto';
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
                <Spin spinning={loading} tip={loadingTip}/>
            </div>
            <div
                ref={rootDom => {
                    rootRef.current = rootDom;
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
}

Content.propTypes = {
    // 样式类名
    className: PropTypes.string,
    // 适应窗口高度，内容过长，Content会产生滚动条 默认 false
    fitHeight: PropTypes.bool,
    // 计算高度时，额外的高度，默认0，content会撑满全屏
    otherHeight: PropTypes.number,
    // 计算之后，再做偏移的高度
    offsetHeight: PropTypes.number,
    // 样式对象
    style: PropTypes.object,
    // 显示loading 默认 false
    loading: PropTypes.bool,
    // loading的提示文字 默认 context.loadingTip
    loadingTip: PropTypes.any,
    // 样式前缀 默认 context.prefixCls
    prefixCls: PropTypes.string,
    // 是否是页面容器
    isRoot: PropTypes.bool,
};

Content.defaultProps = {
    className: '',
    fitHeight: false,
    style: {},
    loading: false,
    isRoot: false,
    offsetHeight: 0,
};

export default forwardRef(Content);
