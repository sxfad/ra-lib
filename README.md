# ra-lib

通用工具、组件库

- 多包管理 [lerna](https://github.com/lerna/lerna)
- 打包 [father](https://github.com/umijs/father)
- 文档 [dumi](https://d.umijs.org/zh-CN)

## 快速开始

### 初始化：从新安装依赖 + 打包

```bash
$ npm run init
```

### 安装依赖

```bash
$ npm i # 为项目安装依赖
$ npm run bootstrap # 为所有字包安装依赖
```

### 打包

```bash
$ npm run build
```

### 发布

```bash
$ npm run publish
```

### 打包 + 发布

```bash
$ npm run release
```

### 开发 本地调试

监听文件改变，单独构建对应包。

注意：需要全局安装 father (2.30.1版本可以) `npm i father -g` PACKAGE=ajax father-build 无效，不知为啥。。。

```bash
$ npm run start
```

调试，创建连接

```bash
$ cd packages/ajax
$ yarn link

# cd some/project
$ yarn link @ra-lib/ajax
```

所有包创建连接

```
node scripts/link-all.js
```

## 文档

### 开发环境文档预览

```bash
$ npm dev
```

### 文档打包

```bash
$ npm run docs:build
```

## 单元测试

### 测试框架

- @umijs/test，测试脚本，内置 jest 测试框架
- @testing-library/react，React 组件测试工具
- puppeteer，Headless 浏览器工具，用于 E2E 测试。

### 测试约定

目录规范

```
.
├── package.json
├── packages
│   ├── bs-components
│   │   └── src
│   │       └── YsHeader
│   │           └── __test__
│   │               └── index.test.tsx # 插件测试用例
├── tsconfig.json
├── .fatherrc.ts
└── yarn.lock
```

hooks 测试示例

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import useTest from '../index';

const setUp = (defaultValue?: any) => renderHook(() => useTest(defaultValue));

describe('useTest', () => {
    it('should be defined', () => {
        expect(useTest).toBeDefined();
    });

    it('test on methods', async () => {
        const { result } = setUp(false);
        expect(result.current[0]).toBeFalsy();
        act(() => {
            result.current[1](true);
        });
        expect(result.current[0]).toBeTruthy();
    });
});
```

组件测试示例

```tsx
import * as React from 'react';
import { render } from '@testing-library/react';
import TreeSelect from '../index';

test('TreeSelect test', () => {
    const wrapper = render(<TreeSelect/>);
    const el = wrapper.queryByText('pro-components TreeSelect');
    expect(el).toBeTruthy();
});
```

#### 单元测试资料

1. [testing-library](https://testing-library.com/docs/)
2. [jests](https://www.jestjs.cn/docs/getting-started)
3. [@testing-library/react](https://www.npmjs.com/package/@testing-library/react)
4. [@testing-library/react-hooks](https://www.npmjs.com/package/@testing-library/react-hooks)
5. [学习 Jest——语法篇](https://www.jianshu.com/p/e54218d67628)
