/**
 * title: 展开收起
 * description: children传递函数（render-props），开启展开收起模式
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
            {collapsed => (
                <Form layout="inline" onFinish={handleSearch}>
                    <FormItem
                        label="姓名"
                        name="name"
                    />
                    <FormItem
                        type="number"
                        label="年龄"
                        name="age"
                    />
                    <FormItem
                        hidden={collapsed}
                        type="select"
                        label="工作"
                        name="job"
                        options={[
                            {value: '1', label: 'UI设计师'},
                            {value: '2', label: '前端'},
                            {value: '3', label: '后端'},
                        ]}
                    />
                    <FormItem
                        hidden={collapsed}
                        label="住址"
                        name="address"
                    />
                    <FormItem>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={() => form.resetFields()}>重置</Button>
                        </Space>
                    </FormItem>
                </Form>
            )}
        </QueryBar>
    );
}

