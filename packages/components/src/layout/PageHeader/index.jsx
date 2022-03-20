import {useContext} from 'react';
import classNames from 'classnames';
import {ComponentContext} from '../../component-context';
import Breadcrumb from '../Breadcrumb';
import './style.less';

export default function PageHeader(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,

        headerHeight,
        tabHeight,
        pageHeaderHeight,
        sideWidth,
        pageTitle,
        selectedMenu,
        selectedMenuParents,
        breadcrumb,
        appendBreadcrumb,
    } = props;

    prefixCls = `${prefixCls}-layout-page-header`;

    const rootClass = classNames(prefixCls, className);
    const titleClass = `${prefixCls}-title`;
    return (
        <header
            className={rootClass}
            style={{
                top: headerHeight + tabHeight,
                left: sideWidth,
                height: pageHeaderHeight,
            }}
        >
            <h2 className={titleClass}>
                {pageTitle}
            </h2>
            <Breadcrumb
                pageTitle={pageTitle}
                selectedMenu={selectedMenu}
                selectedMenuParents={selectedMenuParents}
                breadcrumb={breadcrumb}
                appendBreadcrumb={appendBreadcrumb}
            />

        </header>
    );
}
