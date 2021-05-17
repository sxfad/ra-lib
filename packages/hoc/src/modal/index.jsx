import React, { Component } from 'react';
import { Modal } from 'antd';

/**
 *  modal高级组件，确保每次弹框内部组件都是新创建的，牺牲点性能，可有效避免脏数据问题
 *  注：modal装饰器要放到所有其他装饰器上面（最外层）
 *
 * @param options 各种类型说明如下：
 *      string：modal 的 title
 *      function：返回值为 modal 的options
 *      object：Modal组件相关配置，具体配置参考antd Modal组件
 *          title: string | ReactNode | function(props)
 *          fullScreen: boolean 是否全屏显示modal
 *          top: number 距离顶部高度
 *          其他 ant Modal 属性
 * 弹框调用时，传递属性将覆盖高阶组件定义数据，比如 <EditModal title="标题"/> 将覆盖options.title
 * @param options
 * @returns {function(*): {displayName, new(): ModalComponent, prototype: ModalComponent}}
 */
export default (options) => WrappedComponent => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class ModalComponent extends Component {
        static displayName = `WithModal(${componentName})`;

        render() {
            // options 如果是函数，返回值作为参数
            if (typeof options === 'function') options = options(this.props);

            // options 如果为字符串，直接作为title
            if (typeof options === 'string') options = { title: options };

            let {
                visible,
                onOk = () => void 0,
                onCancel = () => void 0,
                fullScreen,
                top = 100,
                title,
                width = 800,
                ...others
            } = { ...options, ...this.props }; // 组件使用时传递的属性优先级高

            // 样式合并
            let style = { top, ...(options.style || {}), ...(this.props.style || {}) };

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
                <Modal
                    destroyOnClose
                    width={width}
                    bodyStyle={{ padding: 0 }}
                    style={style}
                    footer={null}
                    maskClosable={false}
                    title={title}
                    onCancel={onCancel}
                    visible={visible}
                    {...others}
                >
                    <WrappedComponent
                        onOk={onOk}
                        onCancel={onCancel}
                        {...this.props}
                    />
                </Modal>
            );
        }
    };
};
