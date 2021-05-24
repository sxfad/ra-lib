import React, {Component} from 'react';
import {Drawer} from 'antd';

/**
 *  drawer高级组件，确保每次弹框内部组件都是新创建的，牺牲点性能，可有效避免脏数据问题
 *  注：modal装饰器要放到所有其他装饰器上面（最外层）
 *
 * @param options 各种类型说明如下：
 *      string：modal 的 title
 *      function：返回值为 modal 的options
 *      object：Modal组件相关配置，具体配置参考antd Modal组件
 *          title: string | ReactNode | function(props)
 *          fullScreen: boolean 是否全屏显示modal
 *          top: number 距离顶部高度
 *          其他 ant Drawer 属性
 * 弹框调用时，传递属性将覆盖高阶组件定义数据，比如 <EditModal title="标题"/> 将覆盖options.title
 * @param options
 * @returns {function(*): {displayName, new(): ModalComponent, prototype: ModalComponent}}
 */
export default (options) => WrappedComponent => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class ModalComponent extends Component {
        static displayName = `WithModal(${componentName})`;

        render() {
            let opt = options;
            // options 如果是函数，返回值作为参数
            if (typeof options === 'function') opt = options(this.props);

            // options 如果为字符串，直接作为title
            if (typeof opt === 'string') opt = {title: opt};

            let {
                visible,
                onOk = () => void 0,
                onCancel,
                onClose = () => void 0,
                fullScreen,
                top = 0,
                title,
                width = 256,
                ...others
            } = {...opt, ...this.props}; // 组件使用时传递的属性优先级高
            if (!onCancel) onCancel = onClose;

            // 样式合并
            let style = {top, ...(opt.style || {}), ...(this.props.style || {})};

            if (fullScreen) {
                width = '100%';
                style = {
                    ...style,
                    top: 0,
                    maxWidth: '100%',
                    margin: 0,
                    padding: 0,
                };
            }

            // 如果title为函数，返回值作为title
            if (typeof title === 'function') title = title(this.props);

            return (
                <Drawer
                    destroyOnClose
                    width={width}
                    bodyStyle={{padding: 0}}
                    style={style}
                    footer={null}
                    maskClosable={false}
                    title={title}
                    onClose={onCancel}
                    visible={visible}
                    {...getDrawerProps(others)}
                >
                    <WrappedComponent
                        onOk={onOk}
                        onCancel={onCancel}
                        {...this.props}
                    />
                </Drawer>
            );
        }
    };
};

/**
 * 从 props 中 获取Drawer属性，Drawer会把所有额外属性透传给div，会产生警告
 * @param props
 * @returns {*}
 */
function getDrawerProps(props) {
    return [
        'afterVisibleChange',
        'bodyStyle',
        'className',
        'closable',
        'closeIcon',
        'contentWrapperStyle',
        'destroyOnClose',
        'drawerStyle',
        'footer',
        'footerStyle',
        'forceRender',
        'getContainer',
        'headerStyle',
        'height',
        'keyboard',
        'mask',
        'maskClosable',
        'maskStyle',
        'placement',
        'push',
        'style',
        'title',
        'visible',
        'width',
        'zIndex',
        'onClose',
    ].reduce((prev, key) => {
        if (key in props) prev[key] = props[key];
        return prev;
    }, {});
}
