import { useContext, useMemo } from 'react';
import { Badge } from 'antd';
import classNames from 'classnames';
import ComponentContext from '../../component-context';
// @ts-ignore
import { findParentNodes, findGenerationNodes } from '@ra-lib/util';
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
        collectedMenuTitle,
        showSearchMenu,
        renderSide,
        menuTreeData,
        keepMenuOpen,
        sideMinWidth,
        layoutType,
        selectedMenuParents,
        theme,
        collectedMenus = [
            { id: '2', title: '用户管理', path: '/users' },
            { id: '3', title: '角色管理', path: '/roles' },
        ],
        onMenuCollect,
    } = props;

    const collectionMenuId = 'collection-menu';
    const showCollectedMenus = !!collectedMenus;

    const sideMenus = useMemo(() => {
        let sideMenus = [];
        if (LAYOUT_TYPE.SIDE_MENU === layoutType) {
            sideMenus = [...menuTreeData];
        }

        if (LAYOUT_TYPE.TOP_SIDE_MENU === layoutType) {
            const parentNodes = findParentNodes(menuTreeData, selectedMenuPath, 'path');
            if (parentNodes && parentNodes.length) {
                sideMenus = [...(parentNodes[0].children || [])];
            }
        }

        if (!showCollectedMenus) return sideMenus;

        // 添加我的收藏菜单
        const collectionMenu = {
            id: collectionMenuId,
            children: collectedMenus,
        };
        const collectionMenuIds = findGenerationNodes(collectionMenu, collectionMenuId).map(item => `${item.id}`);
        collectionMenu.title = `${collectedMenuTitle}（${collectionMenuIds.length}）`;
        sideMenus.unshift(collectionMenu);

        // 标记是否已收藏
        const loop = nodes => nodes.forEach(node => {
            const { id, children } = node;
            node.isCollected = collectionMenuIds.includes(`${id}`) && id !== collectionMenuId;
            children && loop(children);
        });

        loop(sideMenus);

        return sideMenus;
    }, [menuTreeData, collectedMenus, showCollectedMenus, layoutType, selectedMenuPath]);

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
                            showCollectedMenus={showCollectedMenus}
                            collectionMenuId={collectionMenuId}
                            onMenuCollect={onMenuCollect}
                        />
                    ) : null}
                    <footer className={footerClass}>
                    </footer>
                </>
            )}
        </aside>
    );
}
