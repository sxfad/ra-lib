import { useContext, useMemo } from 'react';
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
        collectedMenus,
        onMenuCollect,
    } = props;

    const collectionMenuId = 'collection-menu';
    const showCollectedMenus = !!collectedMenus;

    const sideMenus = useMemo(() => {
        let nextSideMenus = [];
        if (LAYOUT_TYPE.SIDE_MENU === layoutType) {
            nextSideMenus = [...menuTreeData];
        }

        if (LAYOUT_TYPE.TOP_SIDE_MENU === layoutType) {
            const parentNodes = findParentNodes(menuTreeData, selectedMenuPath, 'path');
            if (parentNodes && parentNodes.length) {
                nextSideMenus = [...(parentNodes[0].children || [])];
            }
        }

        if (!showCollectedMenus) return nextSideMenus;

        // 添加我的收藏菜单
        const collectionMenu = {
            id: collectionMenuId,
            children: collectedMenus,
        };
        const collectionMenuIds = findGenerationNodes(collectionMenu, collectionMenuId).map(item => `${item.id}`);
        collectionMenu.title = `${collectedMenuTitle}（${collectionMenuIds.length}）`;
        nextSideMenus.unshift(collectionMenu);

        // 标记是否已收藏
        const loop = nodes => nodes.forEach(node => {
            const { id, children } = node;
            // eslint-disable-next-line no-param-reassign
            node.isCollected = collectionMenuIds.includes(`${id}`) && id !== collectionMenuId;
            if (children) loop(children);
        });

        loop(nextSideMenus);

        return nextSideMenus;
    }, [collectedMenuTitle, menuTreeData, collectedMenus, showCollectedMenus, layoutType, selectedMenuPath]);

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
