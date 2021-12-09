import { useContext, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
// @ts-ignore
import { getFirstNode, findParentNodes } from '@ra-lib/util';
import ComponentContext from '../../component-context';
import LAYOUT_TYPE from '../layout-type';
import Menu from '../Menu';
import SideToggle from '../SideToggle';
import MenuPane from '../MenuPane';
import Logo from '../Logo';
import './style.less';

function Header(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,

        height,
        sideWidth,
        logo,
        title,
        sideCollapsed,
        showSide,
        onToggleSide,
        selectedMenuPath,
        menuTreeData,
        showToggle = true,
        showMenuPane = false,
        layoutType,
        extra,
        theme = 'default',
        logoTheme,
    } = props;

    const [topMenus, setTopMenus] = useState(menuTreeData);
    const [selectedPath, setSelectedPath] = useState(null);

    useEffect(() => {
        if (layoutType === LAYOUT_TYPE.TOP_MENU) {
            setTopMenus(menuTreeData);
            setSelectedPath(selectedMenuPath);
        }

        if (layoutType === LAYOUT_TYPE.TOP_SIDE_MENU) {
            const menus = menuTreeData.map(topNode => {
                const { path, url, target } = getFirstNode(topNode, 'path') || {};

                return { ...topNode, children: [], path, url, target };
            });

            const parentNodes = findParentNodes(menuTreeData, selectedMenuPath, 'path');

            if (parentNodes && parentNodes.length) {
                const topNode = menus.find(item => item.id === parentNodes[0].id);
                setSelectedPath(topNode?.path);
            }

            setTopMenus(menus);
        }
    }, [menuTreeData, layoutType, selectedMenuPath]);

    prefixCls = `${prefixCls}-layout-header`;
    const rootClass = classNames(prefixCls, className, { collapsed: sideCollapsed, dark: theme === 'dark' });
    const contentClass = classNames(`${prefixCls}-content`);
    const menuWrapperClass = classNames(`${prefixCls}-menu-wrapper`);

    return (
        <header
            className={rootClass}
            style={{ height }}
        >
            <Logo
                logo={logo}
                title={title}
                height={height}
                width={sideWidth}
                sideCollapsed={sideCollapsed}
                showSide={showSide}
                theme={logoTheme}
            />
            {showToggle ? (
                <SideToggle
                    sideCollapsed={sideCollapsed}
                    onToggleSide={onToggleSide}
                    theme={theme}
                />
            ) : null}
            {showMenuPane ? (
                <MenuPane

                />
            ) : null}
            <div className={contentClass}>
                <div className={menuWrapperClass}>
                    {[LAYOUT_TYPE.TOP_MENU, LAYOUT_TYPE.TOP_SIDE_MENU].includes(layoutType) && topMenus.length ? (
                        <Menu
                            mode='horizontal'
                            theme={theme}
                            keepMenuOpen={false}
                            showSearchMenu={false}
                            menuTreeData={topMenus}
                            selectedMenuPath={selectedPath}
                        />
                    ) : null}
                </div>
                {extra}
            </div>
        </header>
    );
}

export default withRouter(Header);
