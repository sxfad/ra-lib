import React from 'react';
import { Result, Button, Space } from 'antd';
import { withRouter } from 'react-router-dom';
import { PageContent } from '@ra-lib/component';
import { History } from 'history';

export interface Error404Props {
    homePath?: string,
    history?: History,
}

function Error404(props: Error404Props) {
    const { homePath = '/', history } = props;
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
                        <Button type='primary' onClick={() => history.replace(homePath)}>返回首页</Button>
                        <Button onClick={() => history.goBack()}>返回上个页面</Button>
                    </Space>
                }
            />
        </PageContent>
    );
}

export default withRouter(Error404);
