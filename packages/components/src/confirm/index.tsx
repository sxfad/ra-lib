import React from 'react';
import { Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

/**
 * promise confirm
 * @param options
 * @returns {Promise<unknown>}
 */
export default async function confirm(options) {
    if (typeof options === 'string') {
        options = {
            content: options,
        };
    }
    const {
        title = '温馨提示',
        content,
        color = 'red',
        ...others
    } = options;

    return new Promise<void>((resolve, reject) => {
        Modal.confirm({
            icon: <QuestionCircleOutlined/>,
            title,
            content: <div style={{ marginTop: 8, fontSize: 14, color }}>{content}</div>,
            okText: '确定',
            cancelText: '取消',
            onOk: () => resolve(),
            onCancel: () => reject('confirm cancel'),
            ...others,
        });
    });
}
