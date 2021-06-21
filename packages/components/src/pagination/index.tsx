import { Pagination, PaginationProps } from 'antd';
import React, { useContext } from 'react';
import ComponentContext from '../component-context';

export interface RAPaginationProps extends PaginationProps {
    disabled?: boolean,
    total?: number,
    pageNum?: number,
    pageSize?: number,
    pageSizeOptions?: [],
    onPageNumChange?: (pageNum: number) => void,
    onPageSizeChange: (pageSize: number) => void,
    onChange: (pageNum: number, pageSize: number) => void,
    showSizeChanger?: boolean,
    showQuickJumper?: boolean,
}

function RAPagination(props: RAPaginationProps) {
    const context = useContext(ComponentContext);
    const {
        total,
        pageNum = 1,
        pageSize = 10,
        onPageNumChange = pageNum => void 0,
        onPageSizeChange = pageSize => void 0,
        onChange = (pageNum, pageSize) => void 0,
        style = {},

        ...others
    } = props;

    const { isMobile } = context;

    function handleChange(num, size) {
        onChange(num, size);

        if (size === pageSize) return onPageNumChange(num);

        onPageSizeChange(size);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
                size={isMobile ? 'small' : 'default'}
                style={{ marginTop: 8, ...style }}
                total={total}
                showTotal={total => `共${total}条数据`}
                showSizeChanger
                showQuickJumper
                current={pageNum}
                pageSize={pageSize}
                onChange={handleChange}
                {...others}
            />
        </div>
    );
}

export default RAPagination;
