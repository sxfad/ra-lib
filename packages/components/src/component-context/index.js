import React, {useContext} from 'react';
import PropTypes from 'prop-types';

// components公用context，用于设置一些默认值
// 以变量形式提供配置，很容易时间国际化

// 配置参数默认值
const initialValue = {
    loadingTip: '加载中......',
    prefixCls: 'ra-lib',
    okText: '确定',
    cancelText: '取消',
    layoutPageOtherHeight: 0,
};

export const ComponentContext = React.createContext(initialValue);
export default ComponentContext;

// 以props形式，接受各个配置
export function ComponentProvider(props) {
    const {children, ...others} = props;
    // ComponentProvider 嵌套使用时，获取父级的数据
    const parentContext = useContext(ComponentContext);

    return (
        <ComponentContext.Provider value={{...initialValue, ...parentContext, ...others}}>
            {children}
        </ComponentContext.Provider>
    );
}

// 配置参数说明
ComponentProvider.propTypes = {
    // 加载中提示
    loadingTip: PropTypes.any,
    // 样式类前缀，要与less文件中 @ra-lib-prefix 值变量相同
    prefixCls: PropTypes.string,
    // 确定按钮文案
    okText: PropTypes.any,
    // 取消按钮文案
    cancelText: PropTypes.any,
    // PageContent组件 fitHeight 时，计算高度所用到的额外高度值
    layoutPageOtherHeight: PropTypes.number,
};

export const ComponentConsumer = ComponentContext.Consumer;

