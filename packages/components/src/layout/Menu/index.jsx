import {useContext, useRef, useMemo, useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import {ConfigProvider, Empty, Input, Menu, Popconfirm} from 'antd';
import {HeartOutlined, HeartFilled} from '@ant-design/icons';
import classNames from 'classnames';
// @ts-ignore
import {filterTree, scrollElement} from '@ra-lib/util';
import ComponentContext from '../../component-context';
import './style.less';

export default withRouter(function MenuComponent(props) {
    const context = useContext(ComponentContext);
    const antdContext = useContext(ConfigProvider.ConfigContext);
    const antdPrefixCls = antdContext.getPrefixCls();
    let {
        prefixCls = context.prefixCls,
        menuTreeData,
        sideCollapsed,
        searchMenuPlaceholder,
        showSearchMenu,
        selectedMenuPath,
        keepMenuOpen,
        sideMinWidth,
        mode = 'inline',
        theme = 'dark',
        selectedMenuParents = [],
        showCollectedMenus,
        collectionMenuId,
        onMenuCollect = () => undefined,
    } = props;


    // 当前选中菜单，菜单是用path作为key的
    const [openKeys, setOpenKeys] = useState([]);
    const [treeData, setTreeData] = useState(menuTreeData);
    useEffect(() => setTreeData(menuTreeData), [menuTreeData]);
    const openKeysRef = useRef([]);
    const searchTimeRef = useRef(0);
    const menuContainerRef = useRef(null);
    const nodesRef = useRef({});

    prefixCls = `${prefixCls}-layout-menu`;
    const titleWrapperClass = classNames(`${prefixCls}-title-wrapper`);
    const titleClass = classNames(`${prefixCls}-title`);
    const collectionClass = classNames(`${prefixCls}-collection-icon`);

    // 创建菜单
    const menuItems = useMemo(() => {
        nodesRef.current = {};
        const loop = (nodes) => nodes.map(item => {
            let {id, path, icon, title, children, isCollected, isCollectedMenu} = item;

            const key = isCollectedMenu ? `collectedMenu-${path || id}` : (path || id);

            nodesRef.current[key] = item;

            if (showCollectedMenus && !sideCollapsed && id !== collectionMenuId) {
                const CollectionIcon = isCollected ? HeartFilled : HeartOutlined;
                title = (
                    <div className={titleWrapperClass}>
                        <span className={titleClass}>{title}</span>
                        <span className={collectionClass} onClick={e => e.stopPropagation()}>
                            <Popconfirm
                                title={`您确定${isCollected ? '取消' : '加入'}收藏？`}
                                onConfirm={() => onMenuCollect(item, !isCollected)}
                            >
                                <CollectionIcon/>
                            </Popconfirm>
                        </span>
                    </div>
                );
            }

            if (children && children.length) {
                return (
                    <Menu.SubMenu key={key} title={title} icon={icon} node={item}>
                        {loop(children)}
                    </Menu.SubMenu>
                );
            }
            return (
                <Menu.Item key={key} icon={icon} node={item}>
                    {title}
                </Menu.Item>
            );
        });

        return loop(treeData);
    }, [treeData, sideCollapsed, showCollectedMenus, collectionMenuId]);

    function handleChange(e) {
        // 防抖
        if (searchTimeRef.current) clearTimeout(searchTimeRef.current);

        searchTimeRef.current = setTimeout(() => handleSearch(e.target.value), 300);
    }

    function handleSearch(value) {
        let isAll = true;
        if (value) value = value.toLowerCase();
        const treeData = filterTree(menuTreeData, node => {
            let {title, path} = node;
            title = (title || '').toLowerCase();
            path = (path || '').toLowerCase();

            const result = title.includes(value) || path.includes(value);

            if (!result) isAll = false;
            return result;
        });

        setTreeData(treeData);

        if (isAll) {
            setOpenKeys(openKeysRef.current);
            return;
        }

        // 展开所有查询出的结果
        let openKeys = [];
        const loop = nodes => nodes.forEach(node => {
            const {id, children} = node;
            openKeys.push(id);
            if (children) loop(children);
        });
        loop(treeData);

        setOpenKeys(openKeys);
    }

    function handleOpenChange(openKeys) {
        openKeysRef.current = openKeys;
        setOpenKeys(openKeys);
    }

    function handleClick(info) {
        const {key} = info;
        const node = nodesRef.current[key];

        if (!node) return;

        const {path, target} = node;
        if (target) return window.open(path, target);

        props.history.push(path);
    }

    // 默认展开菜单
    useEffect(() => {
        // 菜单收起、水平菜单，不设置
        if (sideCollapsed || mode === 'horizontal') return;
        // 没父级不设置
        if (!selectedMenuParents || !selectedMenuParents.length) return;

        const parentKeys = selectedMenuParents.map(item => item.key || item.id);
        const openKeys = keepMenuOpen ? Array.from(new Set([...parentKeys, ...openKeysRef.current])) : parentKeys;
        setOpenKeys(openKeys);
        openKeysRef.current = openKeys;
    }, [sideCollapsed, selectedMenuParents, mode]);

    // 菜单改变，滚动到可见区域
    useEffect(() => {
        // 等待菜单选中
        setTimeout(() => {
            if (sideCollapsed || mode === 'horizontal') return;
            if (!menuContainerRef.current) return;

            const cls = `.${antdPrefixCls}-menu-item-selected`;
            const element = menuContainerRef.current.querySelector(cls);
            if (!element) {
                menuContainerRef.current.scrollTop = 0;
                return;
            }

            scrollElement({
                element,
                containerEle: menuContainerRef.current,
            });
        });
    }, [selectedMenuPath, menuContainerRef.current, treeData, sideCollapsed, mode]);

    // 修改菜单收起高度
    useEffect(() => {
        const cls = `.${menuClass} .${antdPrefixCls}-menu-inline${sideCollapsed ? '-collapsed' : ''}`;
        const dom = document.querySelector(cls);
        if (dom) dom.style.width = sideCollapsed ? `${sideMinWidth}px` : '100%';
    }, [treeData, sideCollapsed, sideMinWidth]);

    let menuProps = {};
    if (mode === 'inline') menuProps.inlineCollapsed = sideCollapsed;


    const topClass = classNames(`${prefixCls}-top`);
    const searchClass = `${prefixCls}-search`;
    const menuClass = classNames(`${prefixCls}-menu`);
    const emptyClass = classNames(
        `${prefixCls}-empty`,
        {
            ['dark-menu']: theme === 'dark',
        },
    );

    return (
        <>
            {mode === 'inline' ? (
                <div className={topClass}>
                    {showSearchMenu && !sideCollapsed ? (
                        <div className={searchClass}>
                            <Input.Search
                                placeholder={searchMenuPlaceholder}
                                onSearch={handleSearch}
                                onChange={handleChange}
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}
            <div className={menuClass} ref={menuContainerRef}>
                {mode === 'inline' && (!menuItems || !menuItems.length) ? (
                    <Empty className={emptyClass}/>
                ) : (
                    <Menu
                        mode={mode}
                        theme={theme}
                        selectedKeys={[selectedMenuPath, `collectedMenu-${selectedMenuPath}`]}
                        openKeys={openKeys}
                        onOpenChange={handleOpenChange}
                        onClick={handleClick}
                        {...menuProps}
                    >
                        {menuItems}
                    </Menu>
                )}
            </div>
        </>
    );
});
