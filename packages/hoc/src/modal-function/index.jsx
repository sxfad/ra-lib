import { ConfigProvider } from 'antd';
import { ComponentProvider } from '@ra-lib/component';
import ReactDOM from 'react-dom';

export default (options = {}) => WrappedComponent => {
    const {
        antPrefix = 'ant',
        raLibPrefix = 'ra-lib',
        commonProps: _commonProps = {},
        destroyFns = [],
    } = options;
    /**
     * config 为用户调用弹框函数时，传递的参数
     */
    return (config = {}) => {
        const container = document.createDocumentFragment();
        let currentConfig = {
            ...config,
            onCancel,
            close,
            visible: true,
        };

        /**
         * 渲染弹框
         * @param props
         */
        function render(props) {
            setTimeout(() => {
                // 公共属性
                const commonProps = {
                    // width: 1000,
                    // bodyStyle: { padding: 0 },
                    // style: { top: 50 },
                    maskClosable: false,
                    ..._commonProps,
                    onCancel: props.onCancel,
                    visible: props.visible,
                };

                ReactDOM.render(
                    <ConfigProvider prefixCls={antPrefix}>
                        <ComponentProvider prefixCls={raLibPrefix}>
                            <WrappedComponent {...props} commonProps={commonProps} />
                        </ComponentProvider>
                    </ConfigProvider>,
                    container,
                );
            });
        }

        /**
         * 销毁，不会等待动画，直接销毁
         * @param args
         */
        function destroy(...args) {
            ReactDOM.unmountComponentAtNode(container);
            const triggerCancel = args.some(param => param && param.triggerCancel);
            if (config.onCancel && triggerCancel) {
                config.onCancel(...args);
            }

            for (let i = 0; i < destroyFns.length; i++) {
                const fn = destroyFns[i];

                if (fn === close) {
                    destroyFns.splice(i, 1);
                    break;
                }
            }
        }

        /**
         * 触发用户传递的onCancel -> close -> destroy
         * @param args
         */
        function onCancel(...args) {
            // 用户没有传递onCancel函数，直接关闭
            if (!config.onCancel) return close(...args);

            // 调用用户传递的onCancel函数
            const res = config.onCancel(...args);

            // 如果是promise，成功之后才关闭，失败不关闭
            if (res?.then) {
                res.then(() => close(...args));
            } else {
                // 不是promise，直接关闭
                close(...args);
            }
        }

        /**
         *  关闭，等待动画结束之后，再销毁
         * @param args
         */
        function close(...args) {
            currentConfig = {
                ...currentConfig,
                visible: false,
                afterClose: () => {
                    if (typeof config.afterClose === 'function') {
                        config.afterClose();
                    }
                    destroy.apply(this, args);
                },
            };
            render(currentConfig);
        }

        /**
         * 根据新的参数，更新弹框渲染
         * @param configUpdate
         */
        function update(configUpdate) {
            if (typeof configUpdate === 'function') {
                currentConfig = configUpdate(currentConfig);
            } else {
                currentConfig = {
                    ...currentConfig,
                    ...configUpdate,
                };
            }
            render(currentConfig);
        }

        render(currentConfig);

        destroyFns.push(close);

        // webpack热更新之后，销毁当前弹框
        if (process.env.NODE_ENV === 'development') {
            const socket = new WebSocket(`ws://${window.location.host}/ws`);
            socket.onmessage = event => event.data === '{"type":"invalid"}' && destroy();
        }

        return {
            close,
            destroy,
            update,
        };
    };
}
