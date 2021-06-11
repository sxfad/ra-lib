# babel-plugin-attribute-wrapper

jsx 属性包装babel插件 

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| importName | 非必须，引入名称，importName存在 import { [importName] as method} from packageName; 不存在：import method from packageName | `string` | `-` |
| importName | 必须，引入的报名 | `string` | `-` |
| attributeName | 必须，要处理的属性名称，比如 r-code、className等 | `string` | `-` |
| methodName | 非必须，处理函数名称 | `string` | `method` |
| conditional | 非必须，是否使用三元操作 | `boolean` | `false` |
| replaceAttributeName | 非必须，需要替换的属性名称 | `string` | `conditional===true` ? `null` : `wrapperAttributedName 丨丨 attributeName`; |
| wrapperAttributedName | 非必须，值需要包裹的属性名称，[attributeName]={xxx} onClick={handleClick} => onClick={method(xxx, handleClick)} | `string` | `-` |
| negation | 非必须，取反 disabled={!_method(xxx)} | `boolean` | `false` |

## 示例

### className={xxx} 转 className={_method(xxx)}

babel配置：

```js
{
    plugins: [
        [
            'babel-plugin-attribute-wrapper',
            {
                packageName: 'classnames',
                attributeName: 'className',
            },
            'className',
        ]
    ]
}
```

jsx源码：

```jsx
<div>
    <div>包裹classnames</div>
    <div className={[styles.title, {[styles.disabled]: disabled}]}/>
    <div className="title"/>
</div>
```

转换为：

```jsx
import _method from "classnames";

<div>
    <div>包裹classnames</div>
    <div className={_method([styles.title, {[styles.disabled]: disabled}])}/>
    <div className={_method("title")}/>
</div>
```

### 三元运算_method(xxx) ? <div> : null

babel配置：

```js
{
    plugins: [
        [
            'babel-plugin-attribute-wrapper',
            {
                importName: 'hasPermission',
                packageName: 'src/commons',
                attributeName: 'r-code',
                conditional: true,
            },
            'permission-remove',
        ]
    ]
}
```

jsx源码：

```jsx
<div>
    <div>三元操作</div>
    <div r-code/>
    <div r-code="ADD_USER"/>
    <div r-code={a.code}/>
</div>
```

转换为：

```jsx
import {hasPermission as _method} from "src/commons";

<div>
    <div>三元操作</div>
    {_method(true) ? <div/> : null}
    {_method("ADD_USER") ? <div/> : null}
    {_method(a.code) ? <div/> : null}
</div>
```

### 添加disabled={_method(xxx)}属性

babel配置：

```js
{
    plugins: [
        [
            'babel-plugin-attribute-wrapper',
            {
                importName: 'hasPermission',
                packageName: 'src/commons',
                attributeName: 'd-code',
                replaceAttributeName: 'disabled',
                negation: true,
            },
            'permission-disabled',
        ]
    ]
}
```

jsx源码：

```jsx
<div>
    <div>替换为disabled属性</div>
    <div d-code="ADD"/>
    <div d-code>只写r-code属性，缺省值，默认true</div>
</div>
```

转换为：

```jsx
import {hasPermission as _method} from "src/commons";

<div>
    <div>替换为disabled属性</div>
    <div disabled={!_method("ADD")}/>
    <div disabled={!_method(true)}>只写r-code属性，缺省值，默认true</div>
</div>
```

### r-report="用户保存" onClick={this.handleClick} => onClick={_method("用户保存", this.handleClick)}

babel配置：

```js
{
    plugins: [
        [
            'babel-plugin-attribute-wrapper',
            {
                importName: 'report',
                packageName: 'src/commons',
                attributeName: 'r-report',
                wrapperAttributedName: 'onClick',
            },
            'wrapper',
        ]
    ]
}
```

jsx源码：

```jsx
<div>
    <div>劫持onClick</div>
    <div r-report={reportToServer}></div>
    <div r-report="用户保存" onClick={this.handleClick}></div>
    <div r-report={a && b} onClick={handleClick}></div>
    <div r-report={true} onClick={(e) => handleCLick(e, 12)}></div>
</div>
```

转换为：

```jsx
import {report as _method} from "src/commons";

<div>劫持onClick</div>
<div onClick={_method(reportToServer)}></div>
<div onClick={_method("用户保存", this.handleClick)}></div>
<div onClick={_method(a && b, handleClick)}></div>
<div onClick={_method(true, e => handleCLick(e, 12))}></div>
```
