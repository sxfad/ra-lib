import {useState, useEffect} from 'react';
import {getElementTop} from '@ra-lib/util';

export default function useHeight(domRef, otherHeight = 0, deps = []) {
    const [height, setHeight] = useState(document.documentElement.clientHeight - otherHeight);

    // 窗口大小改变事件
    const handleWindowResize = () => {
        const eleTop = domRef?.current ? getElementTop(domRef?.current) : 0;
        let marginBottom = domRef?.current ? window.getComputedStyle(domRef?.current).getPropertyValue('margin-bottom') : 0;
        marginBottom = window.parseInt(marginBottom, 10) || 0;

        const oHeight = otherHeight + marginBottom + eleTop;
        const windowHeight = document.documentElement.clientHeight;
        const nextHeight = windowHeight - oHeight;
        setHeight(nextHeight);
    };

    useEffect(() => {
        handleWindowResize();
    }, [domRef?.current, ...deps]);

    // 组件加载完成
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [otherHeight]);

    return [height, setHeight];
}
