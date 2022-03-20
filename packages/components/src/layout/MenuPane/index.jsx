import {useContext, useState, useRef} from 'react';
import {Drawer} from 'antd';
import {AppstoreOutlined} from '@ant-design/icons';
import classNames from 'classnames';
import {ComponentContext} from '../../component-context';
// @ts-ignore
import {useHeight} from '@ra-lib/hooks';

import './style.less';

export default function MenuPane(props) {
    const context = useContext(ComponentContext);

    let {
        className,
        prefixCls = context.prefixCls,
        onToggleSide,
        theme,
    } = props;

    const containerRef = useRef(null);
    const [height] = useHeight(containerRef);

    const [visible, setVisible] = useState(false);


    prefixCls = `${prefixCls}-layout-menu-pane`;
    const rootClass = classNames(prefixCls, className, {dark: theme === 'dark'});
    const drawerContainerClass = `${prefixCls}-container`;

    return (
        <>
            <div
                className={rootClass}
                onClick={onToggleSide}
            >
                <AppstoreOutlined onClick={() => setVisible(!visible)}/>
            </div>
            <div
                ref={containerRef}
                className={drawerContainerClass}
                style={{
                    display: visible ? 'block' : 'none',
                    top: 50,
                    left: 210,
                }}
            >
                <Drawer
                    title="菜单面板"
                    visible={visible}
                    closable
                    placement="top"
                    height={height}
                    onClose={() => setVisible(false)}
                    getContainer={false}
                    style={{position: 'absolute'}}
                >
                    // TODO 展示菜单
                </Drawer>
            </div>
        </>
    );
}
