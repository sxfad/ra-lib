---
title: QueryBar - 查询条件容器

group:

    path: /

---

## 查询条件容器

查询条件包裹容器，提供默认样式，以及展开收起功能

## 示例

<code src="./demo/basic.jsx"></code>
<code src="./demo/collapsed.jsx"></code>

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultCollapsed | 默认折叠方式 | `boolean` | `true` |
| collapsedTips | 展开收起提示 | `[string, string]` | `['展开更多', '收起更多']` |
| children | 子组件，如果需要展开收起功能，使用 render-props 方式，即：children 为函数：collapsed => {...} | `function` 或 `ReactNode` | - |

