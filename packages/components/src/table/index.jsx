import {useState, useRef, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import {Table, ConfigProvider} from 'antd';
import {useHeight} from '@ra-lib/hooks';
import ComponentContext from '../component-context';

function RATable(props) {
    let {
        fitHeight,
        scroll = {},
        otherHeight,
        offsetHeight,
        columns,
        serialNumber,
        serialText,
        serialNumberFixed,
        serialNumberWidth,
        pageSize,
        pageNum,
        dataSource,
        ...others
    } = props;

    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();
    const rootRef = useRef(null);
    const [_otherHeight, setOtherHeight] = useState(otherHeight);
    const [hasPagination, setHasPagination] = useState(false);
    const pageContentPadding = 8;
    const pageContentMargin = 8;
    const {isMobile, mobileColumnDefaultWidth} = context;

    let [height] = useHeight(rootRef);
    height = height - (_otherHeight || 0) - (offsetHeight || 0);

    if (scroll.y) fitHeight = false;

    const _scroll = {...scroll};
    if (fitHeight) _scroll.y = height;

    useEffect(() => {
        if (!fitHeight) return;
        const oldOverflowY = window.document.body.style.overflowY || 'auto';
        window.document.body.style.overflowY = 'hidden';

        return () => {
            window.document.body.style.overflowY = oldOverflowY;
        };
    }, []);

    useEffect(() => {
        function _setOtherHeight() {

            if (otherHeight !== undefined) return;

            if (!rootRef.current) return;

            let headHeight = 0;
            let paginationHeight = 0;

            const tableHead = rootRef.current.querySelector(`.${antdPrefixCls}-table-thead`);
            if (tableHead) headHeight = tableHead.getBoundingClientRect().height;

            const pagination = rootRef.current.nextElementSibling;
            if (pagination) {
                setHasPagination(true);
                paginationHeight = pagination.getBoundingClientRect().height;
            }

            setOtherHeight(headHeight + paginationHeight + pageContentPadding + pageContentMargin + 1);
        }

        // 预设值，防止body出现滚动条
        _setOtherHeight();

        // 等待table-thead 渲染完成 再设置，调整表格高度
        setTimeout(() => {
            _setOtherHeight();
        });

        // 窗口改变也设置高度
        window.addEventListener('resize', _setOtherHeight);
        return () => window.removeEventListener('resize', _setOtherHeight);

    }, [otherHeight, dataSource]);

    useEffect(() => {
        if (!fitHeight) return;

        const tableBody = rootRef.current.querySelector(`.${antdPrefixCls}-table-body`);
        const tablePlaceholder = rootRef.current.querySelector(`.${antdPrefixCls}-table-placeholder .${antdPrefixCls}-table-cell`);

        if (!tableBody) return;

        tableBody.style.height = `${height}px`;
        if (tablePlaceholder) {
            tablePlaceholder.style.height = `${height - 40}px`;
            tablePlaceholder.style.border = 'none';
        }

    }, [fitHeight, height, dataSource]);

    if (serialNumber) {
        if (hasPagination) {
            if (!('pageNum' in props)) throw Error('分页表格如果显示序号，需要传递pageNum属性');
            if (!('pageSize' in props)) throw Error('分页表格如果显示序号，需要传递pageSize属性');
        }

        columns = [
            {
                title: serialText,
                width: serialNumberWidth,
                dataIndex: '__num',
                key: '__num',
                fixed: serialNumberFixed ? 'left' : 'none',
                render: (value, record, index) => index + 1 + (hasPagination ? pageSize * (pageNum - 1) : 0),
            },
            ...columns,
        ];
    }

    if (isMobile) {
        columns.forEach(item => {
            if (!('width' in item)) {
                item.width = mobileColumnDefaultWidth;
            }
        });
    }

    return (
        <div ref={rootRef} style={{borderBottom: '1px solid #e8e8e8'}}>
            <Table
                scroll={_scroll}
                columns={columns}
                size="middle"
                dataSource={dataSource}
                {...others}
            />
        </div>
    );
}

RATable.defaultProps = {
    fitHeight: false,
    serialNumber: false,
    serialText: '序号',
    serialNumberWidth: 60,
    serialNumberFixed: false,
    offsetHeight: 0,
    pagination: false,
};

RATable.propTypes = {
    // 是否适应高度
    fitHeight: PropTypes.bool,
    // 是否显示序号
    serialNumber: PropTypes.bool,
    // 序号列是否固定
    serialNumberFixed: PropTypes.bool,
    // 序号列头名称
    serialText: PropTypes.string,
    // 序号列宽
    serialNumberWidth: PropTypes.number,
    // 如果显示序号，需要传递pageSize
    pageSize: PropTypes.number,
    // 如果显示序号，需要传递pageNum
    pageNum: PropTypes.number,
    // 计算高度使用的额外高度
    otherHeight: PropTypes.number,
    // 计算之后，再做偏移的高度
    offsetHeight: PropTypes.number,

    // 其他antd属性列出便于IDE提示
    tableLayout: PropTypes.any,
    bordered: PropTypes.any,
    columns: PropTypes.any,
    components: PropTypes.any,
    dataSource: PropTypes.any,
    expandable: PropTypes.any,
    footer: PropTypes.any,
    loading: PropTypes.any,
    locale: PropTypes.any,
    pagination: PropTypes.any,
    rowClassName: PropTypes.any,
    rowKey: PropTypes.any,
    rowSelection: PropTypes.any,
    scroll: PropTypes.any,
    showHeader: PropTypes.any,
    size: PropTypes.any,
    summary: PropTypes.any,
    title: PropTypes.any,
    onChange: PropTypes.any,
    onHeaderRow: PropTypes.any,
    onRow: PropTypes.any,
    getPopupContainer: PropTypes.any,
    sortDirections: PropTypes.any,
    showSorterTooltip: PropTypes.any,
};

export default RATable;
