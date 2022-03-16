import React, { Component } from 'react';
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
const createAjaxHoc = ajax => ({ propName = 'ajax' } = {}) => WrappedComponent => {
    // 将hooks也加入组件props中
    const ajaxHooks = createHooks(ajax);

    return class WithAjax extends Component {
        static displayName = `WithAjax(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        readonly _$ajax;
        readonly _$ajaxTokens;

        constructor(props) {
            super(props);
            this._$ajax = { ...ajaxHooks };
            this._$ajaxTokens = [];
            const methods = [ 'get', 'post', 'put', 'patch', 'del', 'download' ];

            methods.forEach(method => {
                this._$ajax[method] = (url, data, options) => {
                    let _options = options || {};

                    _options.cancelRef = c => {
                        this._$ajaxTokens.push(c);
                    };

                    return ajax[method](url, data, _options);
                };
            });
        }

        componentWillUnmount() {
            this._$ajaxTokens.forEach(cancel => cancel && cancel());
        }

        render() {
            const { props, _$ajax } = this;
            const injectProps = { [propName]: _$ajax };
            return <WrappedComponent {...injectProps} {...props} />;
        }
    };
};

export default createAjaxHoc;
