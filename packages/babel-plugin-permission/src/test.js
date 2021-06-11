const assert = require('assert');
const transform = require('@babel/core').transform;
const plugin = require('./');

transform(`
<div className={() => 123} className={() => 456}/>;
<div className={asdf && aaa}/>;
<div r-code={true}/>;
<div r-code="ADD"/>;
<div r-code={a ? b : c}/>;
<div r-code={a}/>;
<div r-code>只写r-code属性，缺省值，默认true</div>;
<p>
    <div r-code={true}>123123</div>
</p>;

`.trim(), {
    plugins: [
        '@babel/plugin-syntax-jsx',
        [plugin,
            { // className={xxx} 转 className={_method(xxx)}
                // importName: 'hasPermission',
                packageName: 'classnames',
                attributeName: 'className',
                conditional: false,
                // replaceAttributeName: 'className',
                // methodName: 'classNames',
            },
            // { // 添加disabled={_method(xxx)}属性
            //     importName: 'hasPermission',
            //     packageName: 'src/commons',
            //     attributeName: 'r-code',
            //     conditional: false,
            //     replaceAttributeName: 'disabled',
            //     // methodName: 'classNames',
            // },
            // { // 三元运算_method(xxx) ? <div> : null
            //     importName: 'hasPermission',
            //     packageName: 'src/commons',
            //     attributeName: 'r-code',
            //     // replaceAttributeName: 'disabled',
            //     // methodName: 'hasPermission',
            // },
            'className',
        ],
        [plugin,
            { // 三元运算_method(xxx) ? <div> : null
                importName: 'hasPermission',
                packageName: 'src/commons',
                attributeName: 'r-code',
                // replaceAttributeName: 'disabled',
                // methodName: 'hasPermission',
            },
            'permission'
        ],
    ],
}, (err, result) => {
    if (err) {
        // console.error(err);
        throw err;
    }
    console.log(result.code);
    assert.equal(
        result.code,
        `

    `.trim(),
    );
});
