import {useContext, useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import classNames from 'classnames';
import {getFirstNode, findParentNodes} from '@ra-lib/util';
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

    const [topSelectedMenuPath, setTopSelectedMenuPath] = useState(selectedMenuPath);
    const [topMenus, setTopMenus] = useState(menuTreeData);

    useEffect(() => {
        const parentNodes = findParentNodes(menuTreeData, selectedMenuPath, 'path');
        if (parentNodes && parentNodes.length) {
            const node = topMenus.find(item => item.id === parentNodes[0].id);
            if (node) {
                setTopSelectedMenuPath(node.path);
            }
        }
    }, [topMenus, menuTreeData, selectedMenuPath]);

    useEffect(() => {
        if (layoutType === LAYOUT_TYPE.TOP_MENU) {
            setTopMenus(menuTreeData);
        }

        if (layoutType === LAYOUT_TYPE.TOP_SIDE_MENU) {
            const topMenus = menuTreeData.map(topNode => {
                const {path, url, target} = getFirstNode(topNode, 'path') || {};

                return {...topNode, children: [], path, url, target};
            });

            setTopMenus(topMenus);
        }
    }, [menuTreeData, layoutType]);

    prefixCls = `${prefixCls}-layout-header`;
    const rootClass = classNames(prefixCls, className, {collapsed: sideCollapsed, dark: theme === 'dark'});
    const contentClass = classNames(`${prefixCls}-content`);

    return (
        <header
            className={rootClass}
            style={{height}}
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
                <div>
                    {[LAYOUT_TYPE.TOP_MENU, LAYOUT_TYPE.TOP_SIDE_MENU].includes(layoutType) && topMenus.length ? (
                        <Menu
                            mode="horizontal"
                            theme={theme}
                            keepMenuOpen={false}
                            showSearchMenu={false}
                            menuTreeData={topMenus}
                            selectedMenuPath={topSelectedMenuPath}
                        />
                    ) : null}
                </div>
                {extra}
            </div>
        </header>
    );
}

export default withRouter(Header);
