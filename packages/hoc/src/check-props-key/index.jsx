import React, {Component} from 'react';

/**
 * 检测props中属性是否被使用，为某些高阶组件保留props关键字
 * @param options
 * @returns {function(*): *}
 */
export default (options) => WrappedComponent => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class ModalComponent extends Component {
        static displayName = `WithCheckPropsKey(${componentName})`;

        constructor(props) {
            super(props);
            const {keys = [], usedBy} = options;
            keys.forEach(key => {
                if (key in props) throw Error(`${componentName}'s props field name [${key}] usedBy ${usedBy}, please change an another name!`);
            });
        }

        render() {
            return (
                <WrappedComponent {...this.props}/>
            );
        }
    };
};
