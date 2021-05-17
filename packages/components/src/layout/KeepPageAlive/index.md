---
title: KeepPageAlive - 页面保持

group:

    path: /layout
    title: 页面框架

---

# 页面保持

通过div切换实现 页面级别 keep-alive 功能

- 根据config.KEEP_ALIVE_PAGE属性判断是否启用页面保持功能。
- config 高阶组件`keepAlive: false`关闭当前页面保持功能
- config 高阶组件`keepAlive`属性 在`config.KEEP_ALIVE_PAGE === false`时，无效
- 页面会接受到active属性，可以判断当前页面是隐藏的，还是显示的
    - `active === true` 激活
    - `active === false` 隐藏
    - `active === undefined` 页面首次加载 或者 设置了 `keepAlive: false`
    ```jsx | pure
    export default config({
        path: '/some/page',
    })(function SomePage(props) {
        const {active} = props;
        useEffect(() => {
            console.log('page active:', active);
        }, [active]);
    })
    ```
