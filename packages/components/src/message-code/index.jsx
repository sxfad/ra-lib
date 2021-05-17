import React, {useContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Input, Button, Spin} from 'antd';
import classNames from 'classnames';
import ComponentContext from '../component-context';
import './style.less';

export default function MessageCode(props) {
    const context = useContext(ComponentContext);

    let {
        time,
        buttonType,
        onSend,
        wrapperProps,
        buttonProps,
        placeholder,
        className,
        prefixCls = context.prefixCls,

        ...others
    } = props;

    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        try {
            setLoading(true);

            const ok = onSend && await onSend();

            if (ok === true) {
                setCount(time);
            }

        } finally {
            setLoading(false);
        }
    }

    // 开始倒计时
    useEffect(() => {
        const st = setTimeout(() => {
            const nextCount = count - 1;

            if (nextCount < 0) window.clearTimeout(st);

            setCount(nextCount);
        }, 1000);

        return () => clearInterval(st);
    }, [count]);

    prefixCls = `${prefixCls}-message-code`;
    const rootClass = classNames(prefixCls, className);
    const inputClass = classNames({
        [`${prefixCls}-text-input`]: buttonType === 'text',
    });
    const buttonTextClass = classNames({
        [`${prefixCls}-text-button`]: buttonType === 'text',
        [`${prefixCls}-button`]: true,
    });

    // 时间大于 0 发送按钮不可点击
    const disabled = count > 0;

    return (
        <Spin spinning={loading} size="small">
            <div
                className={rootClass}
                style={{...(wrapperProps.style || {})}}
                {...wrapperProps}
            >
                <Input
                    className={inputClass}
                    placeholder={placeholder}
                    {...others}
                />
                <Button
                    className={buttonTextClass}
                    type={buttonType}
                    disabled={disabled}
                    onClick={handleClick}
                    {...buttonProps}
                >
                    {disabled ? `重新发送(${count}s)` : '发送验证码 '}
                </Button>
            </div>
        </Spin>
    );
}

MessageCode.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    time: PropTypes.number,
    buttonType: PropTypes.string,
    onSend: PropTypes.func, // 返回true 或 promise.resolve(true) 则开始倒计时并按钮不可点击 其他不倒计时
    placeholder: PropTypes.string,
    wrapperProps: PropTypes.object,
    buttonProps: PropTypes.object,
};
MessageCode.defaultProps = {
    time: 60,
    buttonType: 'default',
    wrapperProps: {},
    buttonProps: {},
    placeholder: '请输入短信验证码',
};
