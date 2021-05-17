import {useContext, useState, useEffect} from 'react';
import classNames from 'classnames';
import ComponentContext from '../../component-context';
import {findParentNodes} from '@ra-lib/util';
import Menu from '../Menu';
import LAYOUT_TYPE from '../layout-type';
import './style.less';

export default function Side(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,

        headerHeight,
        sideWidth,
        sideCollapsed,
        selectedMenuPath,
        searchMenuPlaceholder,
        showSearchMenu,
        renderSide,
        menuTreeData,
        keepMenuOpen,
        sideMinWidth,
        layoutType,
        selectedMenuParents,
        theme,
    } = props;

    const [sideMenus, setSideMenus] = useState(menuTreeData);

    useEffect(() => {
        if (LAYOUT_TYPE.SIDE_MENU === layoutType) {
            setSideMenus(menuTreeData);
        }

        if (LAYOUT_TYPE.TOP_SIDE_MENU === layoutType) {
            const parentNodes = findParentNodes(menuTreeData, selectedMenuPath, 'path');
            if (parentNodes && parentNodes.length) {
                setSideMenus(parentNodes[0].children || []);
            }
        }
    }, [menuTreeData, layoutType, selectedMenuPath]);

    prefixCls = `${prefixCls}-layout-side`;
    const rootClass = classNames(
        prefixCls,
        className,
        {
            dark: theme === 'dark',
            collapsed: sideCollapsed,
        },
    );
    const footerClass = classNames(`${prefixCls}-footer`);

    return (
        <aside
            className={rootClass}
            style={{
                top: headerHeight,
                width: sideWidth,
            }}
        >
            {renderSide ? renderSide({
                menuTreeData,
                Menu,
            }) : (
                <>
                    {[LAYOUT_TYPE.SIDE_MENU, LAYOUT_TYPE.TOP_SIDE_MENU].includes(layoutType) ? (
                        <Menu
                            theme={theme}
                            sideMinWidth={sideMinWidth}
                            keepMenuOpen={keepMenuOpen}
                            selectedMenuPath={selectedMenuPath}
                            sideCollapsed={sideCollapsed}
                            menuTreeData={sideMenus}
                            searchMenuPlaceholder={searchMenuPlaceholder}
                            showSearchMenu={showSearchMenu}
                            selectedMenuParents={selectedMenuParents}
                        />
                    ) : null}
                    <footer className={footerClass}>
                    </footer>
                </>
            )}
        </aside>
    );
}
