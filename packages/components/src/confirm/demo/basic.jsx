/**
 * title: 基本用法
 * description: 最基本的用法
 */
import {Button} from 'antd';
import {confirm} from '@ra-lib/components';

export default () => {
    async function handleDelete() {
        await confirm('您确定吗？');

        alert('用户确定了！');
    }

    return (<Button danger onClick={handleDelete}>删除</Button>);
}
