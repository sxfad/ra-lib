const assert = require('assert');
const transform = require('@babel/core').transform;
const plugin = require('./');

transform(`
<div>
    <div>包裹classnames</div>
    <div className={() => 123} className={() => 456}/>
    <div className={asdf && aaa}/>

    <div>三元操作</div>
    <div r-code={true}/>
    <div r-code={a ? b : c}/>
    <div r-code={a}/>
    <p>
        <div r-code={true}>123123</div>
    </p>

    <div>替换为disabled属性</div>
    <div d-code="ADD"/>
    <div d-code>只写r-code属性，缺省值，默认true</div>

    <div>劫持onClick</div>
    <div r-report={hoade}></div>
    <div r-report={true} onClick={this.handleClick}></div>
    <div r-report={true} onClick={handleClick}></div>
    <div r-report={true} onClick={(e) => handleCLick(e, 12)}></div>
</div>
`.trim(), {
    plugins: [
        '@babel/plugin-syntax-jsx',
        [plugin,
            { // className={xxx} 转 className={_method(xxx)}
                packageName: 'classnames',
                attributeName: 'className',
            },
            'className',
        ],
        [plugin,
            { // 三元运算_method(xxx) ? <div> : null
                importName: 'hasPermission',
                packageName: 'src/commons',
                attributeName: 'r-code',
                conditional: true,
            },
            'permission-remove',
        ],
        [plugin,
            { // 添加disabled={_method(xxx)}属性
                importName: 'hasPermission',
                packageName: 'src/commons',
                attributeName: 'd-code',
                replaceAttributeName: 'disabled',
            },
            'permission-disabled',
        ],
        [plugin,
            { // 添加disabled={_method(xxx)}属性
                importName: 'report',
                packageName: 'src/commons',
                attributeName: 'r-report',
                wrapperAttributedName: 'onClick',
            },
            'wrapper',
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
