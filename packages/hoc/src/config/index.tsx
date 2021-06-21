import React, { Component } from 'react';

import { compose } from '../util';

/**
 * 页面配置高阶组件，整合了多个高阶组件
 * @param createOptions
 */
export default function createConfigHoc(createOptions): any {
    const {
        hoc = [], // 需要额外添加的高阶组件
        onConstructor = () => void 0,// 返回值作为 extendProps
        onDidMount = () => void 0, // 返回值作为 extendProps
        onUnmount = () => void 0,
    } = createOptions;

    // 所有的高阶组件
    const higherOrderComponents = compose(hoc);

    return (options = {}) => {
        return WrappedComponent => {
            const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

            @higherOrderComponents
            class WithConfig extends Component {
                static displayName = `WithConfig(${componentName})`;

                constructor(props) {
                    super(props);
                    this.state.extendProps = onConstructor(options, this.props) || {};
                }

                state = {
                    extendProps: {},
                };

                componentDidMount() {
                    const { extendProps } = this.state;
                    const props = onDidMount(options, this.props);

                    if (props) {
                        this.setState({ extendProps: { ...extendProps, ...props } });
                    }
                }

                componentWillUnmount() {
                    onUnmount(options, this.props);
                }

                render() {
                    const { extendProps } = this.state;

                    // this.props 优先级 高于 extendProps
                    return (
                        <WrappedComponent {...extendProps} {...this.props}/>
                    );
                }
            }

            return WithConfig;
        };
    };
}
