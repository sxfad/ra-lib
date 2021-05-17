import {useContext} from 'react';
import {MenuUnfoldOutlined, MenuFoldOutlined} from '@ant-design/icons';
import classNames from 'classnames';
import ComponentContext from '../../component-context';
import './style.less';

export default function SideToggle(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        sideCollapsed,
        onToggleSide,
    } = props;


    prefixCls = `${prefixCls}-layout-toggle-side`;
    const rootClass = classNames(prefixCls, className);

    return (
        <div
            className={rootClass}
            onClick={onToggleSide}
        >
            {sideCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
        </div>
    );
}
