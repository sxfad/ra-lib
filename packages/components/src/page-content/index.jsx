import {forwardRef, useContext} from 'react';
import Content from '../content';
import ComponentContext from '../component-context';
import classNames from 'classnames';
import './style.less';

const PageContent = forwardRef((props, ref) => {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        fitHeight,
        ...others
    } = props;

    prefixCls = `${prefixCls}-content-page`;
    const rootClass = classNames(`${prefixCls}`, className);
    return <Content className={rootClass} fitHeight={fitHeight} {...others} ref={ref}/>;
});

PageContent.propTypes = Content.propTypes;

PageContent.defaultProps = {
    isRoot: true,
};

export default PageContent;
