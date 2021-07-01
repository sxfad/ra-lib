import React, { useRef, useContext, ReactNode, CSSProperties } from 'react';
import { DownOutlined, LoadingOutlined, CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Popconfirm, Dropdown, DropDownProps, Menu, Tooltip, PopconfirmProps } from 'antd';
import classNames from 'classnames';
import ComponentContext from '../component-context';
import './style.less';


export interface OperatorProps {
    // 操作项
    items: [
        {
            label?: ReactNode,
            icon?: string,
            visible?: boolean,
            disabled?: boolean,
            color?: string,
            loading?: boolean,
            isMore?: boolean,

            onClick?: () => void,
            confirm?: PopconfirmProps,
            statusSwitch?: Record<string, unknown>,
        }
    ],
    // 更多标签文案
    moreText?: ReactNode,
    // 更多标签宽度
    moreContentWidth?: string | number,
    // 显示更多下拉菜单触发方式
    moreTrigger?: DropDownProps['trigger'],
    className?: string,
    prefixCls?: string,
}

function Operator(props: OperatorProps) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        items,
        moreText,
        moreContentWidth,
        moreTrigger,
    } = props;

    prefixCls = `${prefixCls}-operator`;
    const rootClass = classNames(prefixCls, className);
    const dividerClass = `${prefixCls}-divider`;
    const labelClass = `${prefixCls}-label`;

    const labelRef = useRef([]);

    // 获取label
    function getLabel(options, i) {
        let { label, icon, loading, color, disabled } = options;

        if (loading) {
            const labelWidth = labelRef.current[i] ? labelRef.current[i].offsetWidth : 'auto';
            return <a className={labelClass} style={{ display: 'inline-block', width: labelWidth, textAlign: 'center' }}><LoadingOutlined /></a>;
        }

        const labelStyle: CSSProperties = {
            transition: 'all 1ms', // 解决拖拽表格，点击无效问题
        };

        if (color) labelStyle.color = color;

        if (icon) {
            label = <Tooltip placement='bottom' title={label}>{icon}</Tooltip>;
        }

        const cls = classNames(labelClass, {
            disabled,
        });

        // eslint-disable-next-line no-return-assign
        return <a className={cls} style={labelStyle} ref={v => labelRef.current[i] = v}>{label}</a>;
    }

    /*
     * 如果含有confirm属性，即表明是Popconfirm，
     * confirm作为Popconfirm的props
     *
     * 其他元素同理
     * */
    function getConfirm(options, i) {
        let label = getLabel(options, i);
        const { confirm, withKey = true } = options;

        // 配合 alt command ctrl 键使用，不弹出提示
        if (withKey) {
            label = (
                <span onClick={(e) => {
                    if (e) e.stopPropagation();
                    if (e.altKey || e.metaKey || e.ctrlKey) {
                        e.stopPropagation();
                        e.preventDefault();

                        if (confirm && confirm.onConfirm) {
                            confirm.onConfirm(e);
                        }
                    }
                }}>
                    {label}
                </span>
            );
        }
        return (
            <Popconfirm okType='danger' {...confirm}>
                {label}
            </Popconfirm>
        );
    }

    function getStatusSwitch(opt, i) {
        const { statusSwitch, disabled = false } = opt;
        const { status } = statusSwitch;
        const popConfirmProps = { ...statusSwitch };
        const icon = status ? <CheckCircleOutlined /> : <MinusCircleOutlined />;
        const color = status ? 'green' : 'red';

        let label = getLabel({ ...opt, label: icon, color }, i);

        // 如果没有权限，不允许进行操作，只做展示
        if (disabled) return label;

        Reflect.deleteProperty(popConfirmProps, 'status');

        return (
            <Popconfirm {...popConfirmProps}>
                {label}
            </Popconfirm>
        );
    }

    function getText(options, i) {
        let label = getLabel(options, i);
        const { onClick } = options;

        return <span onClick={onClick}>{label}</span>;
    }


    function renderItem(opt, i) {
        const {
            confirm,
            statusSwitch,
            visible = true,
            disabled = false,
        } = opt;

        if (visible) {
            // 因为label特殊，getStatusSwitch 内部自己判断了是否可用
            if (disabled && statusSwitch) return getStatusSwitch(opt, i);

            if (disabled) {
                // eslint-disable-next-line no-param-reassign
                opt.color = '#ccc';
                return getLabel(opt, i);
            }

            if (confirm) return getConfirm(opt, i);

            if (statusSwitch) return getStatusSwitch(opt, i);

            return getText(opt, i);
        }
        return null;
    }


    let operators = [];
    let more = [];

    if (typeof moreTrigger === 'string') {
        moreTrigger = [ moreTrigger ];
    }

    items.forEach((opt, i) => {
        const { isMore } = opt;
        const item = renderItem(opt, i);

        if (item) {
            if (isMore) {
                more.push(item);
            } else {
                operators.push(item);
            }
        }
    });

    if (more && more.length) { // 更多
        const menu = (
            <Menu style={{ width: moreContentWidth }}>
                {
                    more.map((item, index) => <Menu.Item key={item.label || index}>{item}</Menu.Item>)
                }
            </Menu>
        );
        operators.push(
            <Dropdown overlay={menu} trigger={moreTrigger}>
                <a className='operator-label'>
                    {moreText}
                </a>
            </Dropdown>,
        );
    }

    const operatorsLength = operators.length;

    if (!operatorsLength) {
        return null;
    }


    return (
        <div className={rootClass}>
            {operators.map((v, i) => (
                <span key={v.label || `operator-${i}`}>
                    {v}
                    {operatorsLength === i + 1 ? '' : <span className={dividerClass} />}
                </span>
            ))}
        </div>
    );
}

Operator.defaultProps = {
    items: [],
    moreText: <span>更多<DownOutlined /></span>,
    moreContentWidth: 'auto',
    moreTrigger: 'click',
};

export default Operator;
