import React, {useEffect, useState, useRef, useContext} from 'react';
import {Checkbox} from 'antd';
// @ts-ignore
import {findGenerationNodes, findParentNodes} from '@ra-lib/util';
import ComponentContext from '../component-context';
import classNames from 'classnames';
import './style.less';

export default function renderTableCheckbox(WrappedTable) {
    return function WithCheckboxTable(props) {
        const context = useContext(ComponentContext);
        let {
            prefixCls = context.prefixCls,
            dataSource,
            rowSelection = {},
            rowKey = 'key',
            columns,
            checkboxIndex = 0,
            rowCheck = true,
            onRow: propsOnRow = () => ({}),
            rowClassName = () => '',
            ...otherProps
        } = props;

        let onRow;
        if (rowCheck) {
            onRow = (record, index) => {
                const result = propsOnRow(record, index);
                const {onClick = () => null, ...others} = result;
                const nextOnClick = event => {
                    onClick(event);
                    const checkboxProps = getCheckboxProps && getCheckboxProps(record) || {};

                    if (checkboxProps.disabled) return;

                    const _record = getStatusRecord(record);
                    // 当前节点状态
                    const checked = !_record.___checked;

                    const e = {target: {checked}};
                    handleCheck(e, record);
                };

                return {
                    onClick: nextOnClick,
                    ...others,
                };

            };
        }

        const {selectedRowKeys, getCheckboxProps, renderCell: _renderCell, onSelectAll, onChange, ...others} = rowSelection;

        let nextColumns = columns;
        if (checkboxIndex !== false) {
            nextColumns = [...columns];
            const col = {...nextColumns[checkboxIndex]};
            if (!col.render) col.render = value => value;
            const render = (value, record, index) => (
                <>
                    {renderCell(null, record)}
                    <span style={{marginLeft: 8}}>
                        {col.render(value, record, index)}
                    </span>
                </>
            );
            nextColumns.splice(checkboxIndex, 1, {...col, render});
        }


        const [, setRefresh] = useState({});
        const recordStatusRef = useRef({});

        // 基于 selectedRowKeys 推导选中状态
        useEffect(() => {
            recordStatusRef.current = {};

            // 设置当前节点状态
            const loop = nodes => nodes.forEach(record => {
                const key = record[rowKey];
                const _record = getStatusRecord(record);

                _record.___checked = (selectedRowKeys || []).some(id => id === key);

                if (record.children) loop(record.children);
            });

            loop(dataSource);

            // 设置父节点状态
            setParentsCheckStatus();

            // 触发重新render
            setRefresh({});

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedRowKeys, dataSource, rowKey]);

        function getStatusRecord(record) {
            const key = record[rowKey];
            if (!recordStatusRef.current[key]) recordStatusRef.current[key] = {};

            return recordStatusRef.current[key];
        }

        function handleCheck(e, record) {
            const {checked} = e.target;
            const key = record[rowKey];
            const _record = getStatusRecord(record);

            // 当前节点状态
            _record.___checked = checked;

            // 后代节点状态
            const generationNodes = _record.___generationNodes || findGenerationNodes(dataSource, key);
            _record.___generationNodes = generationNodes;

            generationNodes.forEach(node => {
                const _node = getStatusRecord(node);

                _node.___checked = checked;
            });

            // 父节点状态
            setParentsCheckStatus();

            setSelectedKeys(dataSource);
        }

        function setParentsCheckStatus() {
            const loop = nodes => nodes.forEach(record => {
                if (record.children) loop(record.children);

                const key = record[rowKey];
                const _record = getStatusRecord(record);
                const parentNodes = _record.___parentNodes || findParentNodes(dataSource, key) || [];

                _record.___parentNodes = parentNodes;

                // 处理父级半选状态, 从底层向上处理
                [...parentNodes].reverse().forEach(node => {
                    const key = node[rowKey];
                    const _node = getStatusRecord(node);

                    const generationNodes = _node.___generationNodes || findGenerationNodes(dataSource, key);
                    _node.___generationNodes = generationNodes;

                    let allChecked = true;
                    let hasChecked = false;

                    generationNodes.forEach(item => {
                        const _item = getStatusRecord(item);

                        if (!_item.___checked) allChecked = false;
                        if (_item.___checked) hasChecked = true;
                    });

                    _node.___checked = hasChecked;
                    _node.___indeterminate = !allChecked && hasChecked;
                });
            });

            loop(dataSource);
        }

        function renderCell(_checked, record, index, originNode) {
            const _record = getStatusRecord(record);
            const checkboxProps = getCheckboxProps && getCheckboxProps(record) || {};

            return (
                <Checkbox
                    {...checkboxProps}
                    checked={_record.___checked}
                    onChange={e => handleCheck(e, record)}
                    indeterminate={_record.___indeterminate}
                    onClick={e => {
                        e.stopPropagation();
                    }}
                />
            );
        }

        function handleSelectAll(selected, selectedRows, changeRows) {
            const loop = nodes => nodes.forEach(node => {
                const {children} = node;
                const checkboxProps = getCheckboxProps && getCheckboxProps(node) || {};
                if(!checkboxProps.disabled) {
                    const _node = getStatusRecord(node);

                    _node.___checked = selected;
                    _node.___indeterminate = false;
                }

                if (children) loop(children);
            });
            loop(dataSource);
            setSelectedKeys(dataSource);
        }

        function setSelectedKeys(dataSource) {
            const {onChange} = rowSelection;

            const selectedRows = [];
            const selectedRowKeys = [];

            const loop = nodes => nodes.forEach(node => {
                const {children} = node;
                const key = node[rowKey];
                const _node = getStatusRecord(node);

                if (_node.___checked) {
                    selectedRowKeys.push(key);
                    selectedRows.push(node);
                }
                if (children) loop(children);
            });
            loop(dataSource);

            onChange && onChange(selectedRowKeys, selectedRows);
        }

        prefixCls = `${prefixCls}-table`;
        const rowClass = classNames({
            [`${prefixCls}-row-check`]: rowCheck,
        });

        return (
            <WrappedTable
                {...otherProps}
                columns={nextColumns}
                dataSource={dataSource}
                rowKey={rowKey}
                onRow={onRow}
                rowClassName={(record, index) => {
                    const cls = rowClassName(record, index);
                    return classNames(rowClass, cls);
                }}
                rowSelection={{
                    ...others,
                    getCheckboxProps,
                    selectedRowKeys: selectedRowKeys,
                    renderCell: checkboxIndex === false ? renderCell : () => null,
                    onSelectAll: handleSelectAll,
                }}
            />
        );
    };
}
/*

const testDataSource = [
    {id: '1', name: '名称1', remark: '备注1'},
    {id: '11', name: '名称11', remark: '备注11', parentId: '1'},
    {id: '111', name: '名称111', remark: '备注111', parentId: '11'},
    {id: '112', name: '名称112', remark: '备注112', parentId: '11'},
    {id: '113', name: '名称113', remark: '备注113', parentId: '11'},
    {id: '12', name: '名称12', remark: '备注12', parentId: '1'},
    {id: '13', name: '名称13', remark: '备注13', parentId: '1'},
    {id: '14', name: '名称14', remark: '备注14', parentId: '1'},
    {id: '2', name: '名称2', remark: '备注2'},
    {id: '3', name: '名称3', remark: '备注3'},
    {id: '4', name: '名称4', remark: '备注4'},
];

const CheckboxTable = renderTableCheckbox(Table);

@config({
    path: '/table/select',
})
export default class TableSelect extends React.Component {
    state = {
        dataSource: [],
        selectedRowKeys: ['111', '112', '113', '4'],
        selectedRows: [],
    };
    columns = [
        {
            title: '名称', dataIndex: 'name',
            render: (value, record) => value + 2222,
        },
        {title: '备注', dataIndex: 'remark'},
    ];

    componentDidMount() {
        this.setState({dataSource: convertToTree(testDataSource)});
    }

    handleChange = (selectedRowKeys, selectedRows) => {

        this.setState({selectedRowKeys, selectedRows});
    };

    render() {
        const {dataSource, selectedRowKeys} = this.state;

        return (
            <PageContent>
                <CheckboxTable
                    fitHeight
                    rowSelection={{
                        selectedRowKeys,
                        onChange: this.handleChange,
                    }}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={false}
                />
            </PageContent>
        );
    }
}
*/
