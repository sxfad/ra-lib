import {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';

function FullScreen(props) {
    const {
        element,
        placement,
        onFull,
        onExit,
        enterFullTip,
        exitFullTip,
        children,
    } = props;
    const initFullScreen = document.fullscreenElement
        || document.mozFullScreenElement
        || document.webkitFullscreenElement
        || document.fullScreen
        || document.mozFullScreen
        || document.webkitIsFullScreen;

    const [fullScreen, setFullScreen] = useState(initFullScreen);
    const [toolTipVisible, setToolTipVisible] = useState(false);

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
    }, [fullScreen]);


    function handleFullScreen() {
        if (fullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.webkitRequestFullscreen) {
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

FullScreen.propTypes = {
    // Tooltip 提示位置
    placement: PropTypes.any,
    // 需要全屏的dom元素，默认document.documentElement
    element: PropTypes.any,
    // 进入全屏 Tooltip 提示
    enterFullTip: PropTypes.any,
    // 退出全屏 Tooltip 提示
    exitFullTip: PropTypes.any,
    // 全屏后触发事件
    onFull: PropTypes.func,
    // 退出全屏触发事件
    onExit: PropTypes.func,
    // 函数式子元素，可以自定义图标
    children: PropTypes.func,
};

FullScreen.defaultProps = {
    element: document.documentElement,
    enterFullTip: '全屏',
    exitFullTip: '退出全屏',
    onFull: () => void 0,
    onExit: () => void 0,
    placement: 'bottom',
};

export default FullScreen;
