---
title: FormItem - 表单项

group:

    path: /

---

## 表单项

基于antd Form.Item二次封装，通过type指定表单元素

## 示例

<code src="./demo/basic.jsx"></code>

## API

其他属性参见 [Form.Item](https://ant.design/components/form-cn/#Form.Item)

除了额外属性以及`Form.Item`属性外，其他属性将透传给表单元素

额外属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 表单元素类型，详见[type类型](#type类型) | `string` | `input` |
| noSpace | 不允许输入空格 | `boolean` | - |
| pattern | 正则校验 | `[RegExp, string?]` | - |
| maxLength | 可输入最大字符数 | `number` | - |
| minLength | 可输入最小字符数 | `number` | - |
| dateFormat | 日期字符串与moment对象自动互转 recognized RFC2822 or ISO format | `string` | - |

### type类型

| 类型 | 对应Ant Design组件 |
| --- | --- |
| cascader | Cascader |
| checkbox | Checkbox |
| checkbox-group | Checkbox.Group |
| date | DatePicker |
| date-range | DatePicker.RangePicker |
| date-time | DatePicker |
| email | Input |
| hidden | undefined |
| image-code | ImageCode |
| input | Input |
| message-code | MessageCode |
| mobile | Input |
| number | InputNumber |
| password | Input.Password |
| radio | Radio |
| radio-button | Radio.Group |
| radio-group | Radio.Group |
| select | Select |
| select-tree | TreeSelect |
| switch | Switch |
| textarea | Input.TextArea |
| time | TimePicker |
| time-range | TimePicker |
| transfer | Transfer |
