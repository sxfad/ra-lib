import React, { forwardRef, ReactChildren } from 'react';
import { Form } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { getFormElement, getPlaceholder, getRules } from './util';

export interface ItemProps extends FormItemProps {
    // 类型
    maxLength?: number, // 允许输入最大字符数
    minLength?: number, // 允许输入最小字符数
    // type: PropTypes.oneOf(formElementTypes.map(item => item.type)),
    type?: string,
    children?: ReactChildren,
    noSpace?: boolean,

    // 其他为Element 属性
    style?: object,
    placeholder?: any,
    options?: [],
    treeData?: [],
    onChange?: () => void,
    onSelect?: () => void,
    onCheck?: () => void,
    onClick?: () => void,
    onFocus?: () => void,
    onBlur?: () => void,
    autoFocus?: boolean,
    allowClear?: boolean,
    showSearch?: boolean,
}

const { Item } = Form;
const FormItem = forwardRef<any, ItemProps>((props, ref) => {
    let {
        // 类型
        maxLength,
        minLength,
        type = 'input',
        children,
        noSpace,

        // Form.Item属性
        colon,
        dependencies,
        extra,
        getValueFromEvent,
        getValueProps,
        hasFeedback,
        help,
        hidden,
        htmlFor,
        initialValue,
        label,
        labelAlign,
        labelCol,
        messageVariables,
        name,
        normalize,
        noStyle,
        preserve,
        required,
        shouldUpdate,
        tooltip,
        trigger,
        validateFirst,
        validateStatus,
        validateTrigger,
        valuePropName,
        wrapperCol,
        // 其他为Element 属性
        style,
        ...others
    } = props;

    // 容错处理，如果编写了options，默认type为select
    if (others.options && type === 'input') type = 'select';

    if (!style) style = {};
    // @ts-ignore
    if (!('width' in style)) style.width = '100%';

    // 处理 placeholder
    const placeholder = getPlaceholder(props);

    // 处理校验规则
    const rules = getRules({ ...props, placeholder });

    const element = getFormElement({
        ref,
        type,
        children,
        style,
        placeholder,
        ...others,
    });

    return (
        <Item
            colon={colon}
            dependencies={dependencies}
            extra={extra}
            getValueFromEvent={getValueFromEvent}
            getValueProps={getValueProps}
            hasFeedback={hasFeedback}
            help={help}
            hidden={hidden}
            htmlFor={htmlFor}
            initialValue={initialValue}
            label={label}
            labelAlign={labelAlign}
            labelCol={labelCol}
            messageVariables={messageVariables}
            name={name}
            normalize={normalize}
            noStyle={noStyle}
            preserve={preserve}
            required={required}
            rules={rules}
            shouldUpdate={shouldUpdate}
            tooltip={tooltip}
            trigger={trigger}
            validateFirst={validateFirst}
            validateStatus={validateStatus}
            validateTrigger={validateTrigger}
            valuePropName={valuePropName}
            wrapperCol={wrapperCol}
        >
            {element}
        </Item>
    );

});

export default FormItem;
