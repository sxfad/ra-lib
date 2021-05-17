/**
 * title: 基本用法
 * description: 最基本的用法
 */
import {Button} from 'antd';
import {batchDeleteConfirm} from '@ra-lib/components';

export default () => {
    async function handleBatchDelete() {
        await batchDeleteConfirm(8);

        alert('用户确定了！');
    }

    return (<Button danger onClick={handleBatchDelete}>删除</Button>);
}
