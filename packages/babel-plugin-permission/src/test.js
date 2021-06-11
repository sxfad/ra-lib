const assert = require('assert');
const transform = require('@babel/core').transform;
const plugin = require('./');

transform(`
<div r-code={true}/>;
<div r-code="ADD"/>;
<div r-code>只写r-code属性，缺省值，默认true</div>;
<p>
    <div r-code={true}>123123</div>
</p>;

`.trim(), {plugins: ['@babel/plugin-syntax-jsx', plugin]}, (err, result) => {
    if (err) {
        console.error(err);
        throw err;
    }
    console.log(result.code);
    assert.equal(
        result.code,
        `

    `.trim(),
    );
});
