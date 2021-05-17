import {useContext} from 'react';
import {Breadcrumb} from 'antd';
import {Link} from 'react-router-dom';
import ComponentContext from '../../component-context';
import classNames from 'classnames';
import './style.less';

export default function MyBreadcrumb(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        pageTitle,
        selectedMenu,
        selectedMenuParents,
        breadcrumb,
        appendBreadcrumb,
    } = props;

    if (breadcrumb === false) return null;

    prefixCls = `${prefixCls}-layout-breadcrumb`;
    const rootClass = classNames(prefixCls, className);

    let dataSource = [...selectedMenuParents];

    const current = pageTitle ? {title: pageTitle} : selectedMenu;
    if (current) dataSource.push(current);

    if (breadcrumb) dataSource = breadcrumb;
    if (appendBreadcrumb) {
        if (!Array.isArray(appendBreadcrumb)) appendBreadcrumb = [appendBreadcrumb];
        dataSource = [...dataSource, ...appendBreadcrumb];
    }

    if (!dataSource.length) return null;

    return (
        <Breadcrumb className={rootClass}>
            {dataSource.map((item, index) => {
                let {icon, title, path} = item;
                const isLast = index === dataSource.length - 1;

                title = <span>{icon}{title}</span>;
                if (path && !isLast) title = <Link to={path}>{title}</Link>

                return <Breadcrumb.Item key={title}>{title}</Breadcrumb.Item>
            })}
        </Breadcrumb>
    );
}
