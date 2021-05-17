import React, {Component} from 'react';
import createHooks from './create-hooks';

/**
 * 创建 ajax 高阶组件
 *
 * 组件卸载时，打断未完成的请求
 * props中注入ajax属性
 *
 * 使用方式：
 * this.props.ajax.get(...)
 *
 * @param ajax
 * @returns {function({propName?: *}=): function(*): WithAjax}
 */
const createAjaxHoc = ajax => ({propName = 'ajax'} = {}) => WrappedComponent => {
    // 将hooks也加入组件props中
    const ajaxHooks = createHooks(ajax);

    class WithAjax extends Component {
        constructor(props) {
            super(props);
            this._$ajax = {
                ...ajaxHooks,
            };
            this._$ajaxTokens = [];
            const methods = ['get', 'post', 'put', 'patch', 'del'];

            for (let method of methods) {
                this._$ajax[method] = (...args) => {
                    const ajaxToken = ajax[method](...args);
                    this._$ajaxTokens.push(ajaxToken);
                    return ajaxToken;
                };
            }
        }

        static displayName = `WithAjax(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

        componentWillUnmount() {
            this._$ajaxTokens.forEach(item => item.cancel());
        }

        render() {
            const injectProps = {
                [propName]: this._$ajax,
            };
            return <WrappedComponent {...injectProps} {...this.props}/>;
        }
    }

    return WithAjax;
};

export default createAjaxHoc;
