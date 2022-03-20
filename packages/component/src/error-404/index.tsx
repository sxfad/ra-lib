import { Result, Button, Space } from 'antd';
import React from 'react';
import PageContent from '../page-content';

export interface Props {
    onToHome?: any,
    onGoBack?: any,
}

export default function Error404(props: Props) {
    const { onToHome, onGoBack } = props;

    return (
        <PageContent
            fitHeight
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <Result
                status='404'
                title='404'
                subTitle='您访问的页面不存在'
                extra={
                    <Space>
                        <Button type='primary' onClick={onToHome}>返回首页</Button>
                        <Button onClick={onGoBack}>返回上个页面</Button>
                    </Space>
                }
            />
        </PageContent>
    );
}
