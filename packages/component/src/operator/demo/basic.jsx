/**
 * title: 基本用法
 * description: 最基本的用法
 */
// @ts-ignore
import {Table, Operator} from '@ra-lib/components';

export default () => {
    const dataSource = [
        {name: '张三', age: 25},
        {name: '李四', age: 26},
    ];
    const columns = [
        {title: '姓名', dataIndex: 'name'},
        {title: '年龄', dataIndex: 'age'},
        {
            title: '操作', dataIndex: 'operator',
            render: (value, record) => {
                const items = [
                    {
                        label: '编辑',
                        onClick: () => alert('编辑'),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: '您确定删除吗？',
                            onConfirm: () => alert('删除'),
                        },
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
        />
    );
}
