import React from 'react';
import {
    Cascader,
    Checkbox,
    DatePicker,
    Input,
    InputNumber,
    Radio,
    Select,
    Switch,
    TimePicker,
    Transfer,
    TreeSelect,
} from 'antd';
import moment from 'moment';

import MessageCode from '../message-code';
import ImageCode from '../image-code';


export const formElementTypes = [
    {
        type: 'image-code',
        Component: ImageCode,
        isInputLike: true,
        componentName: 'ImageCode',
    },
    {
        type: 'message-code',
        Component: MessageCode,
        isInputLike: true,
        componentName: 'MessageCode',
    },
    {
        type: 'input',
        Component: Input,
        isInputLike: true,
        componentName: 'Input',
    },
    {
        type: 'hidden',
        Component: Input,
        isInputLike: true,
    },
    {
        type: 'number',
        Component: InputNumber,
        isInputLike: true,
        componentName: 'InputNumber',
    },
    {
        type: 'textarea',
        Component: Input.TextArea,
        isInputLike: true,
        componentName: 'Input.TextArea',
    },
    {
        type: 'password',
        Component: Input.Password,
        isInputLike: true,
        componentName: 'Input.Password',
    },
    {
        type: 'mobile',
        Component: Input,
        isInputLike: true,
        componentName: 'Input',
    },
    {
        type: 'email',
        Component: Input,
        isInputLike: true,
        componentName: 'Input',
    },
    {
        type: 'select',
        Component: Select,
        componentName: 'Select',
        getComponent: ({commonProps, props}) => {
            return (
                <Select optionFilterProp="label" {...commonProps} {...props}/>
            );
        },
    },
    {
        type: 'select-tree',
        getComponent: ({commonProps, props}) => {
            return (
                <TreeSelect treeNodeFilterProp="title" {...commonProps} {...props} treeData={props.treeData || props.options}/>
            );
        },
        componentName: 'TreeSelect',
    },
    {
        type: 'checkbox',
        Component: Checkbox,
        componentName: 'Checkbox',
    },
    {
        type: 'checkbox-group',
        Component: Checkbox.Group,
        componentName: 'Checkbox.Group',
    },
    {
        type: 'radio',
        Component: Radio,
        componentName: 'Radio',
    },
    {
        type: 'radio-button',
        getComponent: ({commonProps, props}) => {
            const {options = [], ...others} = props;
            return (
                <Radio.Group buttonStyle="solid" {...commonProps} {...others}>
                    {options.map(opt => <Radio.Button key={opt.value} {...opt}>{opt.label}</Radio.Button>)}
                </Radio.Group>
            );
        },
        componentName: 'Radio.Group',
    },
    {
        type: 'radio-group',
        Component: Radio.Group,
        componentName: 'Radio.Group',
    },
    {
        type: 'switch',
        Component: Switch,
        componentName: 'Switch',
    },
    {
        type: 'date',
        Component: DatePicker,
        componentName: 'DatePicker',
    },
    {
        type: 'week',
        getComponent: ({commonProps, props}) => {
            return <DatePicker {...commonProps} picker="week" {...props}/>;
        },
        componentName: 'DatePicker',
    },
    {
        type: 'month',
        getComponent: ({commonProps, props}) => {
            return <DatePicker {...commonProps} picker="month" {...props}/>;
        },
        componentName: 'DatePicker',
    },
    {
        type: 'quarter',
        getComponent: ({commonProps, props}) => {
            return <DatePicker {...commonProps} picker="quarter" {...props}/>;
        },
        componentName: 'DatePicker',
    },
    {
        type: 'year',
        getComponent: ({commonProps, props}) => {
            return <DatePicker {...commonProps} picker="year" {...props}/>;
        },
        componentName: 'DatePicker',
    },
    {
        type: 'date-range',
        Component: DatePicker.RangePicker,
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'week-range',
        getComponent: ({commonProps, props}) => {
            return <DatePicker.RangePicker {...commonProps} picker="week" {...props}/>;
        },
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'month-range',
        getComponent: ({commonProps, props}) => {
            return <DatePicker.RangePicker {...commonProps} picker="month" {...props}/>;
        },
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'quarter-range',
        getComponent: ({commonProps, props}) => {
            return <DatePicker.RangePicker {...commonProps} picker="quarter" {...props}/>;
        },
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'year-range',
        getComponent: ({commonProps, props}) => {
            return <DatePicker.RangePicker {...commonProps} picker="year" {...props}/>;
        },
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'time',
        Component: TimePicker,
        componentName: 'TimePicker',
    },
    {
        type: 'time-range',
        Component: TimePicker.RangePicker,
        componentName: 'TimePicker',
    },
    {
        type: 'date-time',
        getComponent: ({commonProps, props}) => {
            return <DatePicker {...commonProps} showTime {...props}/>;
        },
        componentName: 'DatePicker',
    },
    {
        type: 'date-time-range',
        getComponent: ({commonProps, props}) => {
            return <DatePicker.RangePicker {...commonProps} showTime {...props}/>;
        },
        componentName: 'DatePicker.RangePicker',
    },
    {
        type: 'cascader',
        Component: Cascader,
        componentName: 'Cascader',
    },
    {
        type: 'transfer',
        Component: Transfer,
        componentName: 'Transfer',
    },
];

// type markdown table
// console.log(formElementTypes.sort((a, b) => a.type > b.type ? 1 : -1).map(item => `| ${item.type} | ${item.componentName} |`).join('\n'));

/**
 * 类似 input 元素
 * @param type
 * @returns {boolean}
 */
export function isInputLikeElement(type) {
    const types = formElementTypes.filter(item => item.isInputLike).map(item => item.type);

    return types.includes(type);
}

export function getPlaceholder({type, placeholder, label}) {
    if (placeholder !== undefined) return placeholder;

    if (type === 'time-range') return ['开始时间', '结束时间'];

    if (type && type.endsWith('-range')) return undefined;

    if (isInputLikeElement(type)) return `请输入${label}`;
    return `请选择${label}`;
}

export function getRules(options) {
    let {
        noSpace,
        rules,
        required,
        placeholder,
        maxLength,
        minLength,
    } = options;
    if (!rules) rules = [];

    if (required && !rules.some(item => typeof item === 'object' && 'required' in item)) {
        rules.push({required: true, message: `${placeholder}！`});
    }

    if (noSpace) {
        rules.push({
            validator: (rule, value) => {
                if (value && value.includes(' ')) return Promise.reject('不允许输入空格！');

                return Promise.resolve();
            },
        });
    }

    if (maxLength !== void 0 && !rules.find(item => 'max' in item)) {
        rules.push({max: maxLength, message: `最大长度不能超过 ${maxLength} 个字符！`});
    }

    if (minLength !== void 0 && !rules.find(item => 'min' in item)) {
        rules.push({min: minLength, message: `最小长度不能低于 ${minLength} 个字符！`});
    }

    return rules;
}

export function Element(props) {
    const {
        type = 'input',
        dateFormat,
        children,
        value,
        onChange,
        ...others
    } = props;

    const commonProps = {
        size: 'default',
    };

    const elementProps = {value, onChange, ...others};

    if (dateFormat) {
        if (value) {
            if (Array.isArray(value)) {
                elementProps.value = value.map(item => moment(item));
            } else {
                elementProps.value = moment(value);
            }
        }

        elementProps.onChange = value => {
            if (!value) return onChange(value);

            let val;
            if (Array.isArray(value)) {
                val = value.map(item => {
                    return dateFormat === 'timestamp' ? item.valueOf() : item.format(dateFormat);
                });
            } else {
                val = dateFormat === 'timestamp' ? value.valueOf() : value.format(dateFormat);
            }
            onChange(val);
        };
    }

    // 如果 children 存在，直接返回children
    if (children) return React.cloneElement(children, elementProps);

    const typeItem = formElementTypes.find(item => item.type === type);

    if (!typeItem) throw new Error(`no such type: ${type}`);

    const {Component, getComponent} = typeItem;

    if (getComponent) return getComponent({commonProps, props});

    // 类似Input组件 添加type
    if (isInputLikeElement(type)) {
        return <Component {...commonProps} type={type} {...elementProps}/>;
    }

    return <Component {...commonProps} {...elementProps}/>;
}
