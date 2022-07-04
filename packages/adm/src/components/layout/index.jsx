import { useState } from 'react';
import Header from './Header';
import Aside from './Aside';
import c from 'classnames';
import s from './style.module.less';

export default function Layout(props) {
    const { layout, menus, keepMenuOpen = true, proxyVisible, Logo, onLogout, proxyConfig } = props;
    const [collapsed, setCollapsed] = useState(false);

    if (!layout) return props.children;

    return (
        <div className={s.root}>
            <Header
                style={{ display: layout ? 'block' : 'none' }}
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
                proxyVisible={proxyVisible}
                Logo={Logo}
                onLogout={onLogout}
                proxyConfig={proxyConfig}
            />

            <Aside
                style={{ display: layout ? 'block' : 'none' }}
                menus={menus}
                collapsed={collapsed}
                keepMenuOpen={keepMenuOpen}
            />
            <main
                className={c(s.main, collapsed && s.collapsed)}
                style={layout ? {} : { paddingLeft: 0, paddingTop: 0 }}
            >
                {props.children}
            </main>
        </div>
    );
}
