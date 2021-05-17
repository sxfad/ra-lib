import {useState, useEffect} from 'react';
import {getElementTop} from '@ra-lib/util';

export default function useHeight(domRef, otherHeight = 0, deps = []) {
    const [height, setHeight] = useState(document.documentElement.clientHeight - otherHeight);

    // 窗口大小改变事件
    const handleWindowResize = () => {
        if (!domRef.current) return;

        const eleTop = getElementTop(domRef.current);
        let marginBottom = window.getComputedStyle(domRef.current).getPropertyValue('margin-bottom');
        marginBottom = window.parseInt(marginBottom, 10);

        const oHeight = otherHeight + marginBottom + eleTop;
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - oHeight;
        setHeight(height);
    };

    useEffect(() => {
        if (!domRef.current) return;

        handleWindowResize();
    }, [domRef.current, ...deps]);

    // 组件加载完成
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [otherHeight]);

    return [height, setHeight];
}
