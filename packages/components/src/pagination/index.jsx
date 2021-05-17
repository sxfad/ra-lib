import PropTypes from 'prop-types';
import {Pagination} from 'antd';

function RAPagination(props) {
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

    function handleChange(num, size) {
        onChange(num, size);

        if (size === pageSize) return onPageNumChange(num);

        onPageSizeChange(size);
    }

    return (
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Pagination
                style={{marginTop: 8, ...style}}
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

RAPagination.propTypes = {
    disabled: PropTypes.bool,
    size: PropTypes.string,
    total: PropTypes.number,
    pageNum: PropTypes.number,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.array,
    onPageNumChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onChange: PropTypes.func,
    showSizeChanger: PropTypes.bool,
    showQuickJumper: PropTypes.bool,
};

export default RAPagination;
