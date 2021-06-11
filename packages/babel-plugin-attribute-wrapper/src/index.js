/*
PS：变量不用记忆，只是react组件在AST中的称呼。需要手撸babel插件时打开https://astexplorer.net/ 对照即可。
types: https://babeljs.io/docs/en/babel-types
*/

// babel部分 对外暴露了一个函数，接受参数types。
function babelPlugin({types: t}) {
    return {
        /*
        功能：可在react jsx中直接使用r-code，进行权限判断

            实现方式依托于babel。babel会将js文件转换成 AST抽象语法树（可以理解为把给人看的转换成给计算机看的）
            我们只需要访问AST语法抽象树并对其遍历找出带 r-code 标签的组件对其修改就ok
            再访问AST中我们最关注的就是 visitor。visitor是AST中的访问者，想访问哪种属性就定义在visitor下即可
            JSXElement是AST抽象后对react的描述，JSXElement === jsx中的组件（或者html标签）
            以下出现的变量均为AST中自带的方法及变量
        */

        // 在babel里称为访问者
        visitor: {
            Program: {
                enter(path, state) {
                    // 生成一个唯一的函数名: _method
                    const methodName = state.opts.methodName || 'method';
                    state.methodUidIdentifier = path.scope.generateUidIdentifier(methodName);
                },
                exit(path, state) {
                    // 文件中有使用自定义属性，并做了转换了
                    if (state.hasAttr) {
                        // import 模块名称，如果存在：import { importName as _method} from packageName
                        // 如果不存在：import _method from packageName
                        const importName = state.opts.importName;

                        const importDeclaration = t.importDeclaration(
                            [
                                importName
                                    ? t.importSpecifier(state.methodUidIdentifier, t.identifier(importName))
                                    : t.importDefaultSpecifier(state.methodUidIdentifier),
                            ],
                            // from 的库名字 import xxx from packageName
                            t.stringLiteral(state.opts.packageName),
                        );

                        // 将 import 语句 放入文件头部
                        path.node.body.unshift(importDeclaration);
                    }
                },
            },
            // JSXElement => jsx中的组件元素
            JSXElement: function(path, state) {
                // path.node 可获取到该节点的AST
                let {node} = path;
                const conditional = state.opts.conditional;
                const negation = state.opts.negation;
                const attributeName = state.opts.attributeName;
                const wrapperAttributedName = state.opts.wrapperAttributedName;
                let replaceAttributeName = state.opts.replaceAttributeName || wrapperAttributedName || attributeName;

                if (conditional) replaceAttributeName = null;

                // 遍历 JSXElement 上所有的属性并找出带r-code的元素
                let rCodeAttr = node.openingElement.attributes
                    .find(({type, name}) => type === 'JSXAttribute' && name.name === attributeName);
                let wrapperAttr = node.openingElement.attributes
                    .find(({type, name}) => type === 'JSXAttribute' && name.name === wrapperAttributedName);

                // 如果rCodeAttr为undefined则表示该组件没有r-code，则停止访问
                if (rCodeAttr == null) {
                    return;
                }

                // 已经处理过了，就不处理了，否则会死循环
                if (
                    attributeName === replaceAttributeName
                    && t.isJSXExpressionContainer(rCodeAttr.value)
                    && t.isCallExpression(rCodeAttr.value.expression)
                    && rCodeAttr.value.expression.callee
                    && rCodeAttr.value.expression.callee.name === state.methodUidIdentifier.name
                ) {
                    return;
                }

                // 如果rCodeAttr不为undefined则表示该组件有r-code。下一步是创建新的组件替换之

                // t.conditionalExpression 创建一个三元表达式 ，参数分别为：条件，为真时执行，为假时执行
                // 等于：expression = r-code === true? <div></div> : null
                const valueExpression = getValueExpression(rCodeAttr, t);
                const wrapperValueExpression = getValueExpression(wrapperAttr, t);

                if (!valueExpression) return;

                let rCodeCallExpression = t.callExpression(
                    state.methodUidIdentifier,
                    [valueExpression, wrapperAttributedName ? wrapperValueExpression : null]
                        .filter(item => !!item),
                );

                if (negation) {
                    rCodeCallExpression = t.unaryExpression('!', rCodeCallExpression);
                }

                /*
                给大家解释一下什么是起始标签 什么是结束标签
                <div r-code="true"> 起始部位
                </div> 结束部位
                */

                // t.JSXOpeningElement表示创建一个组件（或者html标签）的起始部位，参数分别为：标签的类型，属性
                // 这里我创建了一个组件的起始部位，再将原有的属性赋给新的组件
                const attributes = (() => {
                    let nodeAttributes = node.openingElement.attributes;
                    if (!nodeAttributes) return null;

                    // 删除属性
                    const nextNodeAttributes = nodeAttributes.filter((attr) => {
                        return attr !== rCodeAttr
                            && attr !== wrapperAttr;
                    });

                    // 将 attributeName 替换为 replaceAttributeName
                    if (replaceAttributeName) {
                        // 添加新的属性
                        const attr = t.jsxAttribute(t.jsxIdentifier(replaceAttributeName), t.JSXExpressionContainer(rCodeCallExpression));
                        nextNodeAttributes.push(attr);
                    }


                    return nextNodeAttributes;
                })();

                let jsxOpeningElement = t.JSXOpeningElement(
                    node.openingElement.name,
                    // 删除 r-code属性
                    attributes,
                    // 自关闭标签，比如 <div r-code={true} />
                    node.openingElement.selfClosing,
                );
                // console.log('node.closingElement', node.closingElement);
                // t.JSXElement 表示创建一个react组件（或者html标签），参数分别为：开始标签，结束标签，子集
                // 创建新的react组件，并讲上一步创建好的起始部位拿过来
                let jsxElement = t.JSXElement(
                    jsxOpeningElement,
                    node.closingElement,
                    node.children,
                );

                let expression = conditional ? t.conditionalExpression(
                    rCodeCallExpression, // r-code=“true”
                    jsxElement, // 创建好的react组件
                    t.nullLiteral(), // 这个方法会返回一个 null
                ) : jsxElement;
                //  replaceWith 方法为替换方法
                path.replaceWith(expression);

                state.hasAttr = true;
            },
        },
    };
}

function getValueExpression(attr, t) {
    if (!attr) return;
    if (!attr.value) return t.BooleanLiteral(true);

    // <div r-code="ADD" /> 情况，值为字符串
    if (t.isStringLiteral(attr.value)) return attr.value;

    // <div r-code={'ADD'} /> 情况，写了花括号，为表达式
    if (attr.value.expression) return attr.value.expression;
}

exports = module.exports = babelPlugin;
exports.default = babelPlugin;
Object.defineProperty(exports, '__esModule', {
    value: true,
});
