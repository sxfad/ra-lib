import React, { useEffect, useState, useRef, useContext } from 'react';
import { Checkbox } from 'antd';
// @ts-ignore
import { findGenerationNodes, findParentNodes } from '@ra-lib/util';
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

        const { selectedRowKeys, getCheckboxProps, renderCell: _renderCell, onSelectAll, onChange, ...others } = rowSelection;

        let onRow;
        if (rowCheck) {
            onRow = (record, index) => {
                const result = propsOnRow(record, index);
                const { onClick = () => null, ...ots } = result;
                const nextOnClick = event => {
                    onClick(event);
                    const checkboxProps = getCheckboxProps && getCheckboxProps(record) || {};

                    if (checkboxProps.disabled) return;

                    const _record = getStatusRecord(record);
                    // 当前节点状态
                    const checked = !_record.___checked;

                    const e = { target: { checked } };
                    handleCheck(e, record);
                };

                return {
                    onClick: nextOnClick,
                    ...ots,
                };

            };
        }


        let nextColumns = columns;
        if (checkboxIndex !== false) {
            nextColumns = [...columns];
            const col = { ...nextColumns[checkboxIndex] };
            if (!col.render) col.render = value => value;
            const render = (value, record, index) => (
                <>
                    {renderCell(null, record)}
                    <span style={{ marginLeft: 8 }}>
                        {col.render(value, record, index)}
                    </span>
                </>
            );
            nextColumns.splice(checkboxIndex, 1, { ...col, render });
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
            const { checked } = e.target;
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
                    const nodeKey = node[rowKey];
                    const _node = getStatusRecord(node);

                    const generationNodes = _node.___generationNodes || findGenerationNodes(dataSource, nodeKey);
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

        function renderCell(_checked, record) {
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

        function handleSelectAll(selected) {
            const loop = nodes => nodes.forEach(node => {
                const { children } = node;
                const checkboxProps = getCheckboxProps && getCheckboxProps(node) || {};
                if (!checkboxProps.disabled) {
                    const _node = getStatusRecord(node);

                    _node.___checked = selected;
                    _node.___indeterminate = false;
                }

                if (children) loop(children);
            });
            loop(dataSource);
            setSelectedKeys(dataSource);
        }

        function setSelectedKeys(ds) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { onChange } = rowSelection;

            const selectedRows = [];
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const selectedRowKeys = [];

            const loop = nodes => nodes.forEach(node => {
                const { children } = node;
                const key = node[rowKey];
                const _node = getStatusRecord(node);

                if (_node.___checked) {
                    selectedRowKeys.push(key);
                    selectedRows.push(node);
                }
                if (children) loop(children);
            });
            loop(ds);

            if (onChange) onChange(selectedRowKeys, selectedRows);
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
                    selectedRowKeys,
                    renderCell: checkboxIndex === false ? renderCell : () => null,
                    onSelectAll: handleSelectAll,
                }}
            />
        );
    };
}
