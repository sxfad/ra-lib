import {useContext, useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import {Drawer} from 'antd';
import classNames from 'classnames';
import {ComponentContext} from '../../component-context';
import SideToggle from '../SideToggle';
import Logo from '../Logo';
import './style.less';

function MobileHeader(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        logo,
        title,

        height,
        pageTitle,
        sideWidth,
        selectedMenuPath,
        extra,
        theme = 'default',
        sideTheme,
        logoTheme,
        children,
    } = props;

    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        setCollapsed(true);
    }, [selectedMenuPath]);

    function handleToggle() {
        setCollapsed(!collapsed);
    }

    prefixCls = `${prefixCls}-layout-mobile-header`;
    const rootClass = classNames(prefixCls, className, {dark: theme === 'dark'});
    const contentClass = classNames(`${prefixCls}-content`, {dark: theme === 'dark'});
    const drawerClass = classNames(`${prefixCls}-drawer`, {dark: sideTheme === 'dark'});
    const logoClass = classNames(`${prefixCls}-logo`);
    const menuClass = classNames(`${prefixCls}-menu`);

    return (
        <header
            className={rootClass}
            style={{height}}
        >
            <SideToggle
                sideCollapsed={collapsed}
                onToggleSide={handleToggle}
                theme={theme}
            />
            <Drawer
                className={drawerClass}
                title={null}
                placement="left"
                visible={!collapsed}
                closable={false}
                onClose={handleToggle}
                bodyStyle={{padding: 0}}
                width={sideWidth}
            >
                <div className={logoClass}>
                    <Logo
                        style={{height, borderBottom: 'none'}}
                        logo={logo}
                        title={title}
                        height={height}
                        theme={logoTheme}
                    />
                </div>
                <div className={menuClass}>
                    {children}
                </div>
            </Drawer>
            <div className={contentClass}>
                <h1>{pageTitle}</h1>
                {extra}
            </div>
        </header>
    );
}

export default withRouter(MobileHeader);
