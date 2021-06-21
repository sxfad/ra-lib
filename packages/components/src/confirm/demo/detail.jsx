/**
 * title: 详细用法
 * description: 传递多个参数
 */
import {Button} from 'antd';
// @ts-ignore
import {confirm} from '@ra-lib/components';

export default () => {
    async function handleDelete() {
        await confirm({
            title: '提示',
            content: '您确定删除吗？删除之后不可恢复，请谨慎操作！',
            okText: '恩准',
            cancelText: '容朕想想',
        });

        alert('用户确定了！');
    }

    return (<Button danger onClick={handleDelete}>删除</Button>);
}
