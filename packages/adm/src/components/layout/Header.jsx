import { useCallback } from 'react';
import { Menu, Dropdown, Avatar } from 'antd';
import { LogoutOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { getLoginUser } from '@ra-lib/admin-util';
import { Proxy } from '../index';
import c from 'classnames';
import s from './style.module.less';

export default function Header(props) {
    const { collapsed, onCollapsedChange, proxyVisible, Logo, onLogout, proxyConfig } = props;
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        if (onLogout) onLogout();
    }, [onLogout]);

    const userName = getLoginUser()?.name || '';

    return (
        <header className={s.header}>
            <div className={c(s.logo, collapsed && s.collapsed)} onClick={() => navigate('/')}>
                <Logo simple={collapsed}/>
            </div>
            <div className={s.headerMain}>
                <div className={s.toggle} onClick={() => onCollapsedChange(!collapsed)}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>
                <div className={s.headerCenter}>
                </div>
                <div className={s.headerRight}>
                    <Proxy visible={proxyVisible} proxyConfig={proxyConfig} />
                    <Dropdown
                        overlay={(
                            <Menu>
                                <Menu.Item key='logout' danger icon={<LogoutOutlined />} onClick={handleLogout}>
                                    退出登录
                                </Menu.Item>
                            </Menu>
                        )}
                    >
                        <div className={s.action}>
                            <Avatar size='small' className={s.avatar}>
                                {(userName[0] || '').toUpperCase()}
                            </Avatar>
                            <span className={s.userName}>{userName}</span>
                            <DownOutlined />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
