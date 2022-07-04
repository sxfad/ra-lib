import { useCallback, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Menu } from 'antd';
import { findParentNodes } from '@ra-lib/util';
import c from 'classnames';
import s from './style.module.less';

export default function Aside(props) {
    const { layout, menus, keepMenuOpen = true, collapsed } = props;
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const openKeysRef = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();

    const handleMenuItemClick = useCallback((info) => {
        const { key } = info;
        navigate(key);
    }, [navigate]);

    // 页面切换，选中菜单
    useEffect(() => {
        if(!layout) return;
        setSelectedKeys([location.pathname]);
    }, [layout, location]);

    // 计算openKeys
    useEffect(() => {
        const key = selectedKeys?.[0];
        if (!key) return;
        const nodes = findParentNodes(menus, key, 'path');
        const keys = nodes.map(item => item.id);
        const openKeys = keepMenuOpen ? Array.from(new Set([...keys, ...openKeysRef.current])) : keys;
        setOpenKeys(openKeys);
    }, [menus, selectedKeys, keepMenuOpen]);

    useEffect(() => {
        openKeysRef.current = openKeys;
    }, [openKeys]);

    const renderMenu = useCallback(() => {
        const loop = nodes => nodes.map(item => {
            const { id, path, title, children } = item;
            if (children?.length) {
                // 使二级菜单排在最后
                children.sort((a, b) => {
                    const acl = a.children?.length || 0;
                    const bcl = b.children?.length || 0;
                    return acl - bcl;
                });
                return (
                    <Menu.SubMenu key={id} title={title}>
                        {loop(children)}
                    </Menu.SubMenu>
                );
            }
            return (
                <Menu.Item key={path}>
                    {title}
                </Menu.Item>
            );
        });
        return loop(menus);
    }, [menus]);

    return (
        <aside className={c(s.aside, collapsed && s.collapsed)}>
            <Menu
                theme={'dark'}
                mode='inline'
                selectedKeys={selectedKeys}
                onSelect={({ selectedKeys }) => setSelectedKeys(selectedKeys)}
                openKeys={openKeys}
                onOpenChange={openKeys => setOpenKeys(openKeys)}
                inlineCollapsed={collapsed}
                onClick={handleMenuItemClick}
            >
                {renderMenu()}
            </Menu>
        </aside>
    );
}
