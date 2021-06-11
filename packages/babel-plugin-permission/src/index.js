/*
PS：变量不用记忆，只是react组件在AST中的称呼。需要手撸babel插件时打开https://astexplorer.net/ 对照即可。
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
                    state.methodUidIdentifier = path.scope.generateUidIdentifier('hasPermission');
                },
                exit(path, state) {
                    // 文件中有使用自定义属性，并做了转换了
                    if (state.hasAttr) {
                        // import 模块名称，如果存在：import { importName as _method} from packageName
                        // 如果不存在：import _method from packageName
                        const importName = state.opts.importName || 'hasPermission';

                        const importDeclaration = t.importDeclaration(
                            [
                                importName
                                    ? t.importSpecifier(state.methodUidIdentifier, t.identifier(importName))
                                    : t.importDefaultSpecifier(state.methodUidIdentifier),
                            ],
                            // from 的库名字 import xxx from packageName
                            t.stringLiteral(state.opts.packageName || 'src/commons'),
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

                // 遍历 JSXElement 上所有的属性并找出带r-code的元素
                let rCodeAttr = node.openingElement.attributes
                    .find(({type, name}) => type === 'JSXAttribute' && name.name === 'r-code');
                if (rCodeAttr == null) { // 如果rCodeAttr为undefined则表示该组件没有r-code，则停止访问
                    return;
                }
                // 如果rCodeAttr不为undefined则表示该组件有r-code。下一步是创建新的组件替换之

                /*
                给大家解释一下什么是起始标签 什么是结束标签
                <div r-code="true"> 起始部位
                </div> 结束部位
                */


                // t.JSXOpeningElement表示创建一个组件（或者html标签）的起始部位，参数分别为：标签的类型，属性
                // 这里我创建了一个组件的起始部位，再将原有的属性赋给新的组件
                let jsxOpeningElement = t.JSXOpeningElement(
                    node.openingElement.name,
                    // 删除 r-code属性
                    node.openingElement.attributes
                        ? node.openingElement.attributes.filter((attr) => attr !== rCodeAttr)
                        : null,
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

                // t.conditionalExpression 创建一个三元表达式 ，参数分别为：条件，为真时执行，为假时执行
                // 等于：expression = r-code === true? <div></div> : null
                const valueExpression = (() => {
                    // <div r-code/> 情况，值默认为true
                    if (!rCodeAttr.value) return t.BooleanLiteral(true);

                    // <div r-code="ADD" /> 情况，值为字符串
                    if (t.isStringLiteral(rCodeAttr.value)) return rCodeAttr.value;

                    // <div r-code={'ADD'} /> 情况，写了花括号，为表达式
                    if (rCodeAttr.value.expression) return rCodeAttr.value.expression;
                })();

                if (!valueExpression) return;

                const rCodeCallExpression = t.callExpression(state.methodUidIdentifier, [valueExpression]);

                let expression = t.conditionalExpression(
                    rCodeCallExpression, // r-code=“true”
                    jsxElement, // 创建好的react组件
                    t.nullLiteral(), // 这个方法会返回一个 null
                );
                //  replaceWith 方法为替换方法
                path.replaceWith(expression);

                state.hasAttr = true;
            },
        },
    };
}

exports = module.exports = babelPlugin;
exports.default = babelPlugin;
Object.defineProperty(exports, '__esModule', {
    value: true,
});
