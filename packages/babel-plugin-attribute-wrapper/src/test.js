const assert = require('assert');
const transform = require('@babel/core').transform;
const plugin = require('./');

transform(`
<div>
    <div>包裹classnames</div>
    <div className={[styles.title, {[styles.disabled]: disabled}]}/>
    <div className="title"/>

    <div>三元操作</div>
    <div r-code/>
    <div r-code="ADD_USER"/>
    <div r-code={a.code}/>

    <div>替换为disabled属性</div>
    <div d-code="ADD"/>
    <div d-code>只写r-code属性，缺省值，默认true</div>

    <div>劫持onClick</div>
    <div r-report={reportToServer}></div>
    <div r-report="用户保存" onClick={this.handleClick}></div>
    <div r-report={a && b} onClick={handleClick}></div>
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
                negation: true,
            },
            'permission-disabled',
        ],
        [plugin,
            { // r-report="用户保存" onClick={this.handleClick} => onClick={_method("用户保存", this.handleClick)}
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
        console.error(err);
        throw err;
    }
    console.log(result.code);
    assert.strictEqual(
        result.code,
        `
import { report as _method4 } from "src/commons";
import { hasPermission as _method3 } from "src/commons";
import { hasPermission as _method2 } from "src/commons";
import _method from "classnames";
<div>
    <div>包裹classnames</div>
    <div className={_method([styles.title, {
    [styles.disabled]: disabled
  }])} />
    <div className={_method("title")} />

    <div>三元操作</div>
    _method2(true) ? <div /> : null
    _method2("ADD_USER") ? <div /> : null
    _method2(a.code) ? <div /> : null

    <div>替换为disabled属性</div>
    <div disabled={!_method3("ADD")} />
    <div disabled={!_method3(true)}>只写r-code属性，缺省值，默认true</div>

    <div>劫持onClick</div>
    <div onClick={_method4(reportToServer)}></div>
    <div onClick={_method4("用户保存", this.handleClick)}></div>
    <div onClick={_method4(a && b, handleClick)}></div>
    <div onClick={_method4(true, e => handleCLick(e, 12))}></div>
</div>;
    `.trim(),
    );
});
