import React, { CSSProperties, forwardRef, ReactChildren, ReactNode } from 'react';
import { Form } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { getPlaceholder, getRules } from './util';
import Element from './Element';

const tuple = <T extends string[]>(...args: T) => args;
const ItemTypes = tuple(
    'image-code',
    'message-code',
    'input',
    'hidden',
    'number',
    'textarea',
    'password',
    'mobile',
    'email',
    'select',
    'select-tree',
    'checkbox',
    'checkbox-group',
    'radio',
    'radio-button',
    'radio-group',
    'switch',
    'date',
    'week',
    'month',
    'quarter',
    'year',
    'date-range',
    'week-range',
    'month-range',
    'quarter-range',
    'year-range',
    'time',
    'time-range',
    'date-time',
    'date-time-range',
    'cascader',
    'transfer',
);
export type ItemType = typeof ItemTypes[number];

// 需要符合 recognized RFC2822 or ISO format
const dateFormatTypes = tuple(
    'YYYY-MM-DD',
    'YYYY-MM-DD HH:mm:ss',
    'YYYYMMDD',
    'YYYY-MM',
    'YYYYMM',
    'timestamp',
);
export type dateFormatType = typeof dateFormatTypes[number];

export interface ItemProps extends FormItemProps {
    // 类型
    maxLength?: number, // 允许输入最大字符数
    minLength?: number, // 允许输入最小字符数
    // type: PropTypes.oneOf(formElementTypes.map(item => item.type)),
    type?: ItemType,
    children?: ReactChildren,
    noSpace?: boolean,
    dateFormat?: dateFormatType,

    // 其他为Element 属性
    style?: CSSProperties,
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
    disabled?: boolean,
    loading?: boolean,

    // switch
    checkedChildren?: ReactNode,
    unCheckedChildren?: ReactNode,
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
        dateFormat,

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
        fieldKey,
        // 其他为Element 属性
        style,
        ...others
    } = props;

    // 容错处理，如果编写了options，默认type为select
    if (others.options && type === 'input') type = 'select';

    if (!style) style = {};
    // @ts-ignore
    if (!('width' in style)) style.width = type === 'switch' ? 'auto' : '100%';

    // 处理 placeholder
    const placeholder = getPlaceholder({ type, ...props });

    // 处理校验规则
    const rules = getRules({ type, ...props, placeholder });

    if (type === 'switch' && !valuePropName) valuePropName = 'checked';

    const elementProps = {
        type,
        style,
        placeholder,
        dateFormat,
        ...others,
    };

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
            fieldKey={fieldKey}
        >
            {children || <Element {...elementProps} forwardRef={ref} />}
        </Item>
    );
});

export { formElementTypes } from './util';
export default FormItem;

