/**
 * title: 基本用法
 * description: 最基本的用法
 */
import React from 'react';
import {Form, Space, Button} from 'antd';
// @ts-ignore
import {FormItem} from '@ra-lib/components';

const layout = {
    labelCol: {flex: '80px'},
};

const tailLayout = {
    wrapperCol: {style: {marginLeft: '80px'}},
};

export default function Demo(props) {
    const [form] = Form.useForm();

    function handleSubmit(values) {
        alert(JSON.stringify(values, null, 4));
    }

    return (
        <Form form={form} onFinish={handleSubmit}>
            <FormItem
                {...layout}
                label="姓名"
                name="name"
                required
                minLength={3}
                maxLength={5}
                noSpace
            />
            <FormItem
                {...layout}
                tpe="number"
                label="年龄"
                name="age"
            />
            <FormItem {...tailLayout}>
                <Space>
                    <Button type="primary" htmlType="submit">查询</Button>
                    <Button onClick={() => form.resetFields()}>重置</Button>
                </Space>
            </FormItem>
        </Form>
    );
}

