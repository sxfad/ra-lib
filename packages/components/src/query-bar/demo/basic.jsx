/**
 * title: 基本用法
 * description: 最基本的用法
 */
import React from 'react';
import {Form, Space, Button} from 'antd';
// @ts-ignore
import {QueryBar, FormItem} from '@ra-lib/components';

export default function Demo(props) {
    const [form] = Form.useForm();

    function handleSearch(values) {
        alert(JSON.stringify(values, null, 4));
    }

    return (
        <QueryBar>
            <Form layout="inline" onFinish={handleSearch}>
                <FormItem
                    label="姓名"
                    name="name"
                />
                <FormItem
                    tpe="number"
                    label="年龄"
                    name="age"
                />
                <FormItem>
                    <Space>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button onClick={() => form.resetFields()}>重置</Button>
                    </Space>
                </FormItem>
            </Form>
        </QueryBar>
    );
}

