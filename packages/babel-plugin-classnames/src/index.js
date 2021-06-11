function babelPluginClassNames({types: t}) {
    const cloneNode = t.cloneNode || t.cloneDeep;
    return {
        name: 'babel-plugin-classnames',
        visitor: {
            Program: {
                enter(path, state) {
                    // 生成一个唯一的函数名: _classNames
                    state.classNamesUidIdentifier = path.scope.generateUidIdentifier('classNames');
                },
                exit(path, state) {
                    // 文件中有使用className，并做了转换了
                    if (state.hasClassNames) {
                        // 声明 import classNames from 'classnames'
                        const importDeclaration = t.importDeclaration(
                            [
                                state.opts.importName
                                    // 如果importName存在，比如：cx  import {cx as _classNames} from 'classnames';
                                    ? t.importSpecifier(state.classNamesUidIdentifier, t.identifier(state.opts.importName))
                                    // importName不存在，导出默认: import _classNames from 'classnames';
                                    : t.importDefaultSpecifier(state.classNamesUidIdentifier),
                            ],
                            // from 的库名字 import xxx from packageName
                            t.stringLiteral(state.opts.packageName || 'classnames'),
                        );

                        // 将 import classNames from 'classnames' 放入文件头部
                        path.node.body.unshift(importDeclaration);
                    }
                },
            },
            JSXAttribute(path, state) {
                if (path.node.name.name !== 'className') {
                    return;
                }

                const value = path.get('value');

                // 非 <div className={xxx}/>情况
                if (!value.isJSXExpressionContainer()) {
                    return;
                }

                const expression = value.get('expression');
                let elements = expression.get('elements');

                if (!Array.isArray(elements)) elements = [elements];

                if (!elements.length) return;

                expression.replaceWith(
                    t.callExpression(
                        cloneNode(state.classNamesUidIdentifier),
                        elements.map(e => cloneNode(e.node || e.container)),
                    ),
                );

                state.hasClassNames = true;
            },
        },
    };
}

exports = module.exports = babelPluginClassNames;
exports.default = babelPluginClassNames;
Object.defineProperty(exports, '__esModule', {
    value: true,
});
