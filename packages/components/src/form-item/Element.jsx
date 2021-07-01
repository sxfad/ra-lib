import React from 'react';
import moment from 'moment';
import { formElementTypes, isInputLikeElement } from './util';


export default function Element(props) {
    const {
        type = 'input',
        dateFormat,
        value,
        onChange,
        forwardRef,
        ...others
    } = props;

    const commonProps = {
        ref: forwardRef,
        size: 'default',
    };

    const elementProps = { value, onChange, ...others };

    if (dateFormat) {
        if (value) {
            if (Array.isArray(value)) {
                elementProps.value = value.map(item => moment(item));
            } else {
                elementProps.value = moment(value);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
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

            return null;
        };
    }

    const typeItem = formElementTypes.find(item => item.type === type);

    if (!typeItem) throw new Error(`no such type: ${type}`);

    const { Component, getComponent } = typeItem;

    if (getComponent) return getComponent({ commonProps, props: elementProps });

    // 类似Input组件 添加type
    if (isInputLikeElement(type)) {
        return <Component {...commonProps} type={type} {...elementProps} />;
    }

    return <Component {...commonProps} {...elementProps} />;
}

