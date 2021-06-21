import React, { useState, useEffect, ReactNode } from 'react';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Tooltip, TooltipProps } from 'antd';

export interface FullScreenProps {
    // Tooltip 提示位置
    placement?: TooltipProps["placement"],
    // 需要全屏的dom元素，默认document.documentElement
    element?: HTMLElement,
    // 进入全屏 Tooltip 提示
    enterFullTip?: ReactNode,
    // 退出全屏 Tooltip 提示
    exitFullTip?: ReactNode,
    // 全屏后触发事件
    onFull?: () => void,
    // 退出全屏触发事件
    onExit?: () => void,
    // 函数式子元素，可以自定义图标
    children?: (fullScreen?: boolean) => ReactNode
}

export default function FullScreen(props: FullScreenProps) {
    const {
        element = document.documentElement,
        enterFullTip = '全屏',
        exitFullTip = '退出全屏',
        onFull = () => void 0,
        onExit = () => void 0,
        placement = 'bottom',
        children,
    } = props;
    const initFullScreen = document.fullscreenElement
        // @ts-ignore
        || document.mozFullScreenElement
        // @ts-ignore
        || document.webkitFullscreenElement
        // @ts-ignore
        || document.fullScreen
        // @ts-ignore
        || document.mozFullScreen
        // @ts-ignore
        || document.webkitIsFullScreen;

    const [ fullScreen, setFullScreen ] = useState(initFullScreen);
    const [ toolTipVisible, setToolTipVisible ] = useState(false);

    useEffect(() => {
        function handleFullScreenChange() {
            const nextFullScreen = !fullScreen;

            nextFullScreen ? onFull() : onExit();
            setFullScreen(nextFullScreen);
            setToolTipVisible(false);
        }

        window.document.addEventListener('fullscreenchange', handleFullScreenChange);
        window.document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        window.document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        window.document.addEventListener('msfullscreenchange', handleFullScreenChange);

        return () => {
            window.document.removeEventListener('fullscreenchange', handleFullScreenChange);
            window.document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            window.document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            window.document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, [ fullScreen ]);


    function handleFullScreen() {
        if (fullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                // @ts-ignore
            } else if (document.msExitFullscreen) {
                // @ts-ignore
                document.msExitFullscreen();
                // @ts-ignore
            } else if (document.mozCancelFullScreen) {
                // @ts-ignore
                document.mozCancelFullScreen();
                // @ts-ignore
            } else if (document.webkitExitFullscreen) {
                // @ts-ignore
                document.webkitExitFullscreen();
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen();
                // @ts-ignore
            } else if (element.mozRequestFullScreen) {
                // @ts-ignore
                element.mozRequestFullScreen();
                // @ts-ignore
            } else if (element.msRequestFullscreen) {
                // @ts-ignore
                element.msRequestFullscreen();
                // @ts-ignore
            } else if (element.webkitRequestFullscreen) {
                // @ts-ignore
                element.webkitRequestFullScreen();
            }
        }
    }

    const Icon = fullScreen ? FullscreenExitOutlined : FullscreenOutlined;
    const title = fullScreen ? exitFullTip : enterFullTip;
    return (
        <Tooltip visible={toolTipVisible} placement={placement} title={title}>
            <div
                onClick={handleFullScreen}
                onMouseEnter={() => setToolTipVisible(true)}
                onMouseLeave={() => setToolTipVisible(false)}
            >
                {children ? children(fullScreen) : (<Icon/>)}
            </div>
        </Tooltip>
    );
}
