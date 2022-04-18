---
title: WaterMark - 水印组件

group:

    path: /

---

# WaterMark 水印组件

给页面的某个区域加上水印。

## 何时使用

页面需要添加水印标识版权时使用。

## API

### 基础参数

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| width | 水印的宽度 | number | 120 | 2.2.0 |
| height | 水印的高度 | number | 64 | 2.2.0 |
| rotate | 水印绘制时，旋转的角度，单位 ° | number | -22 | 2.2.0 |
| image | 图片源，建议导出 2 倍或 3 倍图，优先使用图片渲染水印 | `string` | - | 2.2.0 |
| zIndex | 追加的水印元素的 z-index | number | 9 | 2.2.0 |
| content | 水印文字内容 | `string` | - | 2.2.0 |
| fontColor | 水印文字颜色 | `string` | `rgba(0,0,0,.15)` | 2.2.0 |
| fontSize | 文字大小 | `string` \| `number` | 16 | 2.2.0 |

### 高级参数

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| markStyle | 水印层的样式 | React.CSSProperties | - | 2.3.0 |
| markClassName | 水印层的类名 | string | - | 2.3.0 |
| gapX | 水印之间的水平间距 | number | 212 | 2.4.0 |
| gapY | 水印之间的垂直间距 | number | 222 | 2.4.0 |
| offsetLeft | 水印在 canvas 画布上绘制的水平偏移量, 正常情况下，水印绘制在中间位置, 即 `offsetTop = gapX / 2` | number | `offsetTop = gapX / 2` | 2.4.0 |
| offsetTop | 水印在 canvas 画布上绘制的垂直偏移量，正常情况下，水印绘制在中间位置, 即 `offsetTop = gapY / 2` | number | `offsetTop = gapY / 2` | 2.4.0 |

### 水印 API 可视化

```jsx | inline
import react from 'react';

export default () => (
    <div>
        <img
            src="https://gw.alipayobjects.com/zos/alicdn/joeXYy8j3/jieping2021-01-11%252520xiawu4.47.15.png"
            width="100%"
        />
    </div>
);
```
